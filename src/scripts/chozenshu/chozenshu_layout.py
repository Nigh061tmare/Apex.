#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""APEX Chozenshu Toolkit :: reconstruccion de layout desde el JSON de OCR.
El OCR devuelve cajas; en infografias/tablas el orden de lectura se pierde.
Este modulo re-agrupa las lineas en FILAS por proximidad vertical y las ordena
por X, reconstruyendo tablas y cuadros de datos.
Uso:
  python chozenshu_layout.py --json <tomo.json> --pages 22-24 [--tol 0.6] [--sep " | "]
  python chozenshu_layout.py --json <tomo.json> --grep "fuerza de combate"
"""
import argparse, json, os, statistics, sys


def load(jpath):
    with open(jpath, encoding="utf-8") as fh:
        raw = json.load(fh)
    return {int(k): v for k, v in raw.items()}


def line_meta(ln):
    box = ln.get("box") or []
    ys = [p[1] for p in box] or [0]
    xs = [p[0] for p in box] or [0]
    h = max(ys) - min(ys) if len(ys) > 1 else 12
    return {"text": ln.get("text", ""), "y": sum(ys) / len(ys), "x": min(xs), "h": max(h, 6)}


def reflow(lines, tol=0.6):
    metas = [line_meta(l) for l in lines]
    if not metas:
        return []
    rows, cur = [], []
    for m in sorted(metas, key=lambda m: (m["y"], m["x"])):
        if not cur:
            cur = [m]
            continue
        ref = statistics.median([c["y"] for c in cur])
        limit = statistics.median([c["h"] for c in cur]) * tol
        if abs(m["y"] - ref) <= limit:
            cur.append(m)
        else:
            rows.append(cur)
            cur = [m]
    if cur:
        rows.append(cur)
    out = []
    for r in rows:
        r.sort(key=lambda m: m["x"])
        gaps = [r[i + 1]["x"] - r[i]["x"] for i in range(len(r) - 1)]
        sep = " | " if gaps and max(gaps) > 240 else " "
        out.append({"y": round(sum(m["y"] for m in r) / len(r)), "text": sep.join(m["text"] for m in r)})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", required=True)
    ap.add_argument("--pages", default="")
    ap.add_argument("--grep", default="")
    ap.add_argument("--tol", type=float, default=0.6)
    ap.add_argument("--out", default="")
    a = ap.parse_args()

    data = load(a.json)
    wanted = []
    if a.pages:
        for chunk in a.pages.split(","):
            if "-" in chunk:
                s, e = chunk.split("-")
                wanted += list(range(int(s), int(e) + 1))
            else:
                wanted.append(int(chunk))
    buf = []
    for idx in (wanted if wanted else sorted(data)):
        if idx not in data:
            continue
        rows = reflow(data[idx]["lines"], a.tol)
        block = "\n===== [PAGE %d / %s] =====\n" % (idx, data[idx]["page"])
        block += "\n".join(r["text"] for r in rows) + "\n"
        if a.grep:
            lines = [t for t in block.split("\n") if a.grep.lower() in t.lower()]
            if not lines:
                continue
            block = "\n===== [PAGE %d / %s] =====\n" % (idx, data[idx]["page"]) + "\n".join(lines) + "\n"
        buf.append(block)
    text = "\n".join(buf)
    if a.out:
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        with open(a.out, "w", encoding="utf-8") as fh:
            fh.write(text)
        print("OUT:", a.out, len(text), "chars")
    else:
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
