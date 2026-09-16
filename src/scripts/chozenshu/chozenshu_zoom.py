#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""APEX Chozenshu Toolkit :: zoom/crop de alta resolucion.
Uso:
  python chozenshu_zoom.py --dir <carpeta_paginas> --pages 10 --box 0,0,1,1 --scale 1.0 --out x.png
  python chozenshu_zoom.py --dir <d> --pages 10,11 --box 0,0,1,0.5 --stack h --out x.png
box = x0,y0,x1,y1 en fracciones (0-1) del ancho/alto. --scale multiplica la resolucion final.
--stack h|v concatena varias paginas. --rotate 90 rota antes de recortar.
"""
import argparse, os, sys, time
from PIL import Image

EXTS = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff")


def build_pages(root):
    out = []
    for dirpath, _dirnames, filenames in os.walk(root):
        for fn in filenames:
            if os.path.splitext(fn)[1].lower() in EXTS:
                out.append(os.path.join(dirpath, fn))
    out.sort(key=lambda p: os.path.basename(p).lower())
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--pages", required=True, help="indices 0-based separados por coma, o rango 10-14")
    ap.add_argument("--box", default="0,0,1,1")
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--rotate", type=float, default=0)
    ap.add_argument("--stack", choices=["h", "v"], default=None)
    ap.add_argument("--gap", type=int, default=12)
    ap.add_argument("--maxw", type=int, default=0, help="reescala el resultado si supera este ancho")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    pages = build_pages(a.dir)
    if not pages:
        print("ERROR: sin imagenes en", a.dir)
        return 1
    ids = []
    for part in a.pages.split(","):
        part = part.strip()
        if "-" in part:
            s, e = part.split("-")
            ids.extend(range(int(s), int(e) + 1))
        elif part:
            ids.append(int(part))
    bad = [i for i in ids if i < 0 or i >= len(pages)]
    if bad:
        print("ERROR: indices fuera de rango %s (total %d)" % (bad, len(pages)))
        return 1

    bx = [float(x) for x in a.box.split(",")]
    tiles = []
    for i in ids:
        im = Image.open(pages[i])
        if a.rotate:
            im = im.rotate(a.rotate, expand=True)
        im = im.convert("RGB")
        w, h = im.size
        box = (int(bx[0] * w), int(bx[1] * h), int(bx[2] * w), int(bx[3] * h))
        im = im.crop(box)
        if a.scale != 1.0:
            im = im.resize((max(1, int(im.width * a.scale)), max(1, int(im.height * a.scale))), Image.LANCZOS)
        tiles.append(im)
        print("[tile] idx=%d %s src=%dx%d box=%s -> %dx%d" % (i, os.path.basename(pages[i]), w, h, box, im.width, im.height))

    if len(tiles) == 1:
        out = tiles[0]
    else:
        g = a.gap
        if a.stack == "h" or (a.stack is None and len(tiles) <= 3):
            W = sum(t.width for t in tiles) + g * (len(tiles) - 1)
            H = max(t.height for t in tiles)
            out = Image.new("RGB", (W, H), (255, 255, 255))
            x = 0
            for t in tiles:
                out.paste(t, (x, 0))
                x += t.width + g
        else:
            W = max(t.width for t in tiles)
            H = sum(t.height for t in tiles) + g * (len(tiles) - 1)
            out = Image.new("RGB", (W, H), (255, 255, 255))
            y = 0
            for t in tiles:
                out.paste(t, (0, y))
                y += t.height + g

    if a.maxw and out.width > a.maxw:
        r = a.maxw / out.width
        out = out.resize((a.maxw, max(1, int(out.height * r))), Image.LANCZOS)

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    out.save(a.out, quality=92)
    print("OUT:", a.out, out.size)
    return 0


if __name__ == "__main__":
    sys.exit(main())
