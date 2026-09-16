#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""APEX Chozenshu Toolkit :: runner OCR secuencial para los 4 tomos.
Un solo proceso (una sola carga del modelo ONNX) que recorre los tomos en orden
de prioridad. Reanudable: delega en chozenshu_ocr.main() via subprocess.
Uso:  python chozenshu_ocr_all.py --pages-root <carpeta con db_t01..db_t04> --out <carpeta_salida> [--order 04,01,02,03]
"""
import argparse, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
SINGLE = os.path.join(HERE, "chozenshu_ocr.py")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pages-root", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--order", default="04,01,02,03")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    t0 = time.time()
    for tomo in [s.strip() for s in a.order.split(",") if s.strip()]:
        d = os.path.join(a.pages_root, "db_t" + tomo)
        if not os.path.isdir(d):
            print("[skip] no existe", d, flush=True)
            continue
        log = os.path.join(a.out, "t%s.log" % tomo)
        print("[run] tomo %s  dir=%s  t=%.0fs" % (tomo, d, time.time() - t0), flush=True)
        with open(log, "a", encoding="utf-8") as lf:
            p = subprocess.run([sys.executable, SINGLE, "--dir", d, "--tomo", "t" + tomo, "--out", a.out],
                               stdout=lf, stderr=subprocess.STDOUT)
        print("[end] tomo %s rc=%s t=%.0fs" % (tomo, p.returncode, time.time() - t0), flush=True)
    print("[ALL DONE] t=%.0fs" % (time.time() - t0), flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
