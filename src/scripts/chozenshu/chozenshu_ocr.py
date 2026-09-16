#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""APEX Chozenshu Toolkit :: OCR masivo (RapidOCR/ONNX).
Genera: <out>/<tomo>.txt  (texto plano con separadores de pagina)
        <out>/<tomo>.json (lista de {page, index, text, lines:[{text,score,box}]})
Uso:
  python chozenshu_ocr.py --dir <carpeta_paginas> --tomo t04 --out <carpeta_salida> [--start 0 --end 40 --dpi-scale 1.0]
Reanudable: si el json ya existe, salta las paginas hechas.
"""
import argparse, json, os, sys, time

EXTS = (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff")


def build_pages(root):
    out = []
    for dirpath, _d, filenames in os.walk(root):
        for fn in filenames:
            if os.path.splitext(fn)[1].lower() in EXTS:
                out.append(os.path.join(dirpath, fn))
    out.sort(key=lambda p: os.path.basename(p).lower())
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--tomo", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--end", type=int, default=-1)
    ap.add_argument("--min-score", type=float, default=0.45)
    ap.add_argument("--min-w", type=int, default=1700, help="ancho minimo de trabajo para OCR")
    a = ap.parse_args()

    from rapidocr_onnxruntime import RapidOCR
    import numpy as np
    ocr = RapidOCR()
    pages = build_pages(a.dir)
    end = len(pages) if a.end < 0 else min(a.end + 1, len(pages))
    os.makedirs(a.out, exist_ok=True)
    jpath = os.path.join(a.out, a.tomo + ".json")
    data = {}
    if os.path.exists(jpath):
        try:
            data = {int(k): v for k, v in json.load(open(jpath, encoding="utf-8")).items()}
        except Exception:
            data = {}

    from PIL import Image
    t0 = time.time()
    for i in range(a.start, end):
        if i in data:
            continue
        p = pages[i]
        im = Image.open(p).convert("RGB")
        if im.width < a.min_w:
            r = a.min_w / im.width
            im = im.resize((a.min_w, int(im.height * r)), Image.LANCZOS)
        res, _el = ocr(np.asarray(im))
        lines = []
        if res:
            for item in res:
                box, text, score = item[0], item[1], float(item[2])
                if score >= a.min_score and str(text).strip():
                    lines.append({"text": str(text).strip(), "score": round(score, 4), "box": box})
        data[i] = {"page": os.path.basename(p), "lines": lines}
        txt = "\n".join(l["text"] for l in lines)
        print("[ocr] idx=%d %s lines=%d t=%.1fs" % (i, os.path.basename(p), len(lines), time.time() - t0))
        if (i - a.start) % 5 == 0 or i == end - 1:
            json.dump({str(k): v for k, v in sorted(data.items())}, open(jpath, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
            with open(os.path.join(a.out, a.tomo + ".txt"), "w", encoding="utf-8") as fh:
                for k in sorted(data):
                    fh.write("\n===== [PAGE %d / %s] =====\n" % (k, data[k]["page"]))
                    fh.write("\n".join(l["text"] for l in data[k]["lines"]) + "\n")

    json.dump({str(k): v for k, v in sorted(data.items())}, open(jpath, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    with open(os.path.join(a.out, a.tomo + ".txt"), "w", encoding="utf-8") as fh:
        for k in sorted(data):
            fh.write("\n===== [PAGE %d / %s] =====\n" % (k, data[k]["page"]))
            fh.write("\n".join(l["text"] for l in data[k]["lines"]) + "\n")
    print("DONE %s pages=%d total=%d t=%.1fs" % (a.tomo, end - a.start, len(data), time.time() - t0))
    return 0


if __name__ == "__main__":
    sys.exit(main())
