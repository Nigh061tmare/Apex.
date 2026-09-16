#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
APEX Engine - Chozenshu Toolkit :: Paso 1 - Extraccion e Indexado
=================================================================
Extrae un tomo .cbr (Dragon Ball Chozenshu 1-4 / "Compendios" Planeta Comic),
genera un indice JSON por pagina (dimensiones, bytes, ratio de tinta, brillo)
y construye hojas de contacto (contact sheets) para mapear el contenido visual.

Uso:
    python chozenshu_index.py --cbr "RUTA\\Tomo_04.cbr" --work "C:\\temp\\db_t04" \
        --sheets "C:\\temp\\sheets_t04" --cols 6 --rows 5 --thumb 280

Salidas:
    <work>/pages_index.json      -> indice tecnico de paginas
    <sheets>/sheet_XXX_YYYY-ZZZZ.jpg -> hojas de contacto numeradas
    <sheets>/sheets_index.json   -> mapa hoja -> rango de paginas

Requiere: Pillow  +  UnRAR/WinRAR instalado.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit("Falta Pillow. Instala con:  python -m pip install pillow")

# --------------------------------------------------------------------------- #
# Configuracion
# --------------------------------------------------------------------------- #
UNRAR_CANDIDATES = [
    r"C:\Program Files\WinRAR\UnRAR.exe",
    r"C:\Program Files (x86)\WinRAR\UnRAR.exe",
    r"C:\Program Files\WinRAR\WinRAR.exe",
    r"C:\Program Files\7-Zip\7z.exe",
]
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\arialbd.ttf",
    r"C:\Windows\Fonts\segoeuib.ttf",
    r"C:\Windows\Fonts\arial.ttf",
]
PAGE_RE = re.compile(r"(\d+)")


# --------------------------------------------------------------------------- #
# Utilidades
# --------------------------------------------------------------------------- #
def find_binary() -> str:
    for cand in UNRAR_CANDIDATES:
        if os.path.isfile(cand):
            return cand
    found = shutil.which("unrar") or shutil.which("7z") or shutil.which("winrar")
    if not found:
        sys.exit("No se encontro UnRAR/7z/WinRAR. Ajusta UNRAR_CANDIDATES.")
    return found


def load_font(size: int):
    for cand in FONT_CANDIDATES:
        if os.path.isfile(cand):
            try:
                return ImageFont.truetype(cand, size)
            except Exception:  # noqa: BLE001
                continue
    return ImageFont.load_default()


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        **kw,
    )


def list_archive(binary: str, cbr: Path) -> list[str]:
    """Devuelve los nombres de entrada del archivo (solo imagenes, orden natural)."""
    if binary.lower().endswith("7z.exe"):
        res = run([binary, "l", "-ba", "-slt", str(cbr)])
        names = [
            line.split("=", 1)[1].strip()
            for line in res.stdout.splitlines()
            if line.startswith("Path = ")
        ]
        names = [n for n in names if n.lower() != str(cbr)]
    else:
        res = run([binary, "lb", str(cbr)])
        names = [ln.strip() for ln in res.stdout.splitlines() if ln.strip()]
    imgs = [n for n in names if Path(n).suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
    return sorted(imgs, key=natural_key)


def natural_key(name: str):
    stem = Path(name).stem
    nums = PAGE_RE.findall(stem)
    return (int(nums[0]) if nums else 10**9, stem.lower())


def extract(binary: str, cbr: Path, outdir: Path) -> None:
    outdir.mkdir(parents=True, exist_ok=True)
    if binary.lower().endswith("7z.exe"):
        cmd = [binary, "x", "-y", f"-o{outdir}", str(cbr)]
    else:
        cmd = [binary, "x", "-y", "-inul", str(cbr), str(outdir) + os.sep]
    res = run(cmd)
    if res.returncode > 1:
        sys.exit(f"Error extrayendo ({res.returncode}): {res.stderr[:400]}")


def analyse_page(path: Path) -> dict:
    """Metricas ligeras de la pagina para detectar blancos, portadas y densidad."""
    with Image.open(path) as im:
        w, h = im.size
        small = im.convert("L").resize((160, 220))
        px = list(small.getdata())
    total = len(px)
    ink = sum(1 for v in px if v < 170) / total          # cobertura de tinta
    bright = sum(px) / total                              # luminancia media
    return {
        "file": path.name,
        "width": w,
        "height": h,
        "bytes": path.stat().st_size,
        "aspect": round(w / h, 4) if h else 0,
        "inkRatio": round(ink, 4),
        "brightness": round(bright, 2),
        "blank": ink < 0.012,
    }


def build_sheets(
    pages: list[Path],
    sheets_dir: Path,
    cols: int,
    rows: int,
    thumb_w: int,
    quality: int,
    label_prefix: str = "",
) -> list[dict]:
    sheets_dir.mkdir(parents=True, exist_ok=True)
    per_sheet = cols * rows
    font = load_font(max(14, thumb_w // 11))
    pad = 6
    maps: list[dict] = []

    for s_idx, start in enumerate(range(0, len(pages), per_sheet)):
        chunk = pages[start:start + per_sheet]
        with Image.open(chunk[0]) as first:
            ratio = first.size[1] / first.size[0]
        thumb_h = int(thumb_w * ratio)
        cell_w, cell_h = thumb_w, thumb_h + int(font.size * 2.1)

        sheet = Image.new(
            "RGB",
            (cols * (cell_w + pad) + pad, rows * (cell_h + pad) + pad),
            (24, 24, 28),
        )
        draw = ImageDraw.Draw(sheet)

        for i, page in enumerate(chunk):
            r, c = divmod(i, cols)
            x = pad + c * (cell_w + pad)
            y = pad + r * (cell_h + pad)
            try:
                with Image.open(page) as im:
                    thumb = im.convert("RGB").resize((thumb_w, thumb_h), Image.LANCZOS)
            except Exception as exc:  # noqa: BLE001
                draw.rectangle([x, y, x + thumb_w, y + thumb_h], fill=(60, 0, 0))
                draw.text((x + 4, y + 4), f"ERR {page.name}", font=font, fill=(255, 220, 220))
                print(f"  ! {page.name}: {exc}")
                continue
            sheet.paste(thumb, (x, y))
            label = f"{label_prefix}{page.stem}"
            draw.rectangle([x, y + thumb_h, x + thumb_w, y + thumb_h + int(font.size * 2.1)], fill=(10, 10, 12))
            draw.text((x + 4, y + thumb_h + 3), label, font=font, fill=(120, 235, 255))
            draw.rectangle([x - 1, y - 1, x + thumb_w, y + thumb_h], outline=(70, 70, 80), width=1)

        end = start + len(chunk) - 1
        name = f"sheet_{s_idx:03d}_{start:04d}-{end:04d}.jpg"
        sheet.save(sheets_dir / name, quality=quality, optimize=True)
        maps.append(
            {
                "sheet": name,
                "firstIndex": start,
                "lastIndex": end,
                "pages": [p.stem for p in chunk],
                "px": list(sheet.size),
            }
        )
        print(f"  [sheet] {name}  paginas {start}..{end}  ({sheet.size[0]}x{sheet.size[1]})")

    (sheets_dir / "sheets_index.json").write_text(
        json.dumps(maps, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return maps


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main() -> int:
    ap = argparse.ArgumentParser(description="Extrae e indexa un tomo .cbr de los Compendios DB")
    ap.add_argument("--cbr", required=True, help="Ruta al archivo .cbr")
    ap.add_argument("--work", required=True, help="Carpeta destino de las paginas extraidas")
    ap.add_argument("--sheets", default=None, help="Carpeta destino de las hojas de contacto")
    ap.add_argument("--cols", type=int, default=6)
    ap.add_argument("--rows", type=int, default=5)
    ap.add_argument("--thumb", type=int, default=280, help="Ancho de miniatura en px")
    ap.add_argument("--quality", type=int, default=82, help="Calidad JPEG de las hojas")
    ap.add_argument("--skip-extract", action="store_true")
    ap.add_argument("--no-sheets", action="store_true")
    ap.add_argument("--pages", default=None, help="Solo estas paginas, ej: 40-60,120,300")
    args = ap.parse_args()

    t0 = time.time()
    cbr = Path(args.cbr)
    if not cbr.is_file():
        sys.exit(f"No existe: {cbr}")
    work = Path(args.work)
    binary = find_binary()

    print(f"[1/3] Archivo : {cbr.name}")
    names = list_archive(binary, cbr)
    print(f"      Entradas de imagen: {len(names)}")

    if not args.skip_extract:
        print(f"[2/3] Extrayendo a {work} ...")
        extract(binary, cbr, work)
    else:
        print("[2/3] Extraccion omitida")

    pages = [work / n for n in names if (work / n).is_file()]
    pages.sort(key=lambda p: natural_key(p.name))
    if args.pages:
        wanted: set[int] = set()
        for part in args.pages.split(","):
            part = part.strip()
            if "-" in part:
                a, b = part.split("-", 1)
                wanted.update(range(int(a), int(b) + 1))
            elif part:
                wanted.add(int(part))
        pages = [p for p in pages if int(PAGE_RE.findall(p.stem)[0]) in wanted]

    print(f"[3/3] Indexando {len(pages)} paginas ...")
    index = []
    for i, p in enumerate(pages):
        try:
            rec = analyse_page(p)
            rec["index"] = i
            index.append(rec)
        except Exception as exc:  # noqa: BLE001
            print(f"  ! {p.name}: {exc}")

    (work / "pages_index.json").write_text(
        json.dumps(
            {
                "source": str(cbr),
                "archiveEntries": len(names),
                "pagesIndexed": len(index),
                "indexedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
                "blankPages": [r["file"] for r in index if r["blank"]],
                "pages": index,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    print(f"      -> {work / 'pages_index.json'}")

    if not args.no_sheets:
        print("      Construyendo hojas de contacto ...")
        build_sheets(pages, Path(args.sheets or (work.parent / (work.name + "_sheets"))),
                     args.cols, args.rows, args.thumb, args.quality)

    print(f"OK en {time.time() - t0:.1f}s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
