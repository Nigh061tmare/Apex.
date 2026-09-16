import argparse, json, os, re, sys, unicodedata
# APEX Chozenshu :: parser del DICCIONARIO DE TECNICAS (Tomo 04).
# Estructura canonica: (N) capitulo | (T) tipo | (P) ejecutor | (C) descripcion | (A)/(S) origen.
MARK = re.compile(r"\(\s*([NTPCAS])\s*\)")
NPOS = re.compile(r"\(\s*N\s*\)")

def norm(s):
    s = unicodedata.normalize("NFD", s or "")
    return "".join(c for c in s if unicodedata.category(c) != "Mn").lower()

def load_pages(path):
    with open(path, encoding="utf-8") as fh:
        raw = json.load(fh)
    out = {}
    for k, pg in raw.items():
        parts = []
        for ln in (pg.get("lines") or []):
            box = ln.get("box") or [[0, 0]]
            parts.append((float(box[0][1]), float(box[0][0]), str(ln.get("text") or "")))
        parts.sort()
        out[int(k)] = " ".join(p[2] for p in parts)
    return out

def parse_fields(block):
    pos = [(m.start(), m.group(1), m.end()) for m in MARK.finditer(block)]
    fields = {}
    for i, (start, key, end) in enumerate(pos):
        stop = pos[i + 1][0] if i + 1 < len(pos) else len(block)
        val = block[end:stop].strip()
        if key not in fields:
            fields[key] = val
    return fields

def clean(v, cap=700):
    v = re.sub(r"\s+", " ", v or "").strip(" .|-")
    return v[:cap]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", required=True)
    ap.add_argument("--from", dest="pfrom", type=int, default=130)
    ap.add_argument("--to", dest="pto", type=int, default=176)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    pages = load_pages(a.json)
    entries, seen = [], set()
    for pno in range(a.pfrom, a.pto + 1):
        text = pages.get(pno, "")
        if not text:
            continue
        starts = [m.start() for m in NPOS.finditer(text)]
        for idx, s in enumerate(starts):
            e = starts[idx + 1] if idx + 1 < len(starts) else len(text)
            block = text[s:e]
            n = re.search(r"\d{1,4}", block)
            if not n:
                continue
            chapter = int(n.group(0))
            if chapter < 1 or chapter > 9999:
                continue
            f = parse_fields(block)
            t = clean(f.get("T", ""), 160)
            p = clean(f.get("P", ""), 160)
            c = clean(f.get("C", ""))
            if not (t or p or c):
                continue
            origin = "anime" if f.get("A") else ("spinoff" if f.get("S") else "manga")
            sig = (chapter, norm(p)[:40], norm(c)[:60])
            if sig in seen:
                continue
            seen.add(sig)
            entries.append({"chapter": chapter, "type": t, "performer": p,
                            "description": c, "origin": origin, "tomo": "t04", "page": pno})
    out = {
        "_meta": {
            "name": "APEX Dragon Ball - Diccionario Canonico de Tecnicas (Chozenshu 4)",
            "source": "Dragon Ball Compendio 4 - Superenciclopedia, Diccionario de Tecnicas",
            "campos": {
                "N": "Numero del capitulo donde aparece por primera vez",
                "T": "Tipo de tecnica",
                "P": "Personaje que realiza la tecnica",
                "C": "Caracteristicas de la tecnica y escena donde se usa",
                "A": "Elemento original de la animacion",
                "S": "Elemento original de obras derivadas / spin-offs"
            },
            "paginas_ocr": [a.pfrom, a.pto],
            "total": len(entries)
        },
        "entries": entries
    }
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print(f"[out] {a.out}")
    print(f"[stats] entradas={len(entries)}  con_descripcion={sum(1 for x in entries if x['description'])}  con_ejecutor={sum(1 for x in entries if x['performer'])}")
    perf = {}
    for x in entries:
        for name in re.split(r"[,;/]| y ", x["performer"]):
            name = name.strip()
            if 2 < len(name) < 28:
                perf[name] = perf.get(name, 0) + 1
    for k, v in sorted(perf.items(), key=lambda x: -x[1])[:12]:
        print(f"   {k:<32} {v}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
