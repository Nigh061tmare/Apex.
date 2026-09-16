import argparse, json, os, re, sys, unicodedata

MARK = re.compile(r"\((N|T|P|C|A|S)\)\s*")

def norm(s):
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s).strip()

def page_of(line):
    m = re.search(r"\[PAGE (\d+)\]", line)
    return int(m.group(1)) if m else None


def parse_page(page_no, col_text):
    entries = []
    cur_page = page_no
    parts = MARK.split(col_text)
    i = 1
    while i < len(parts) - 1:
        key = parts[i]
        content = parts[i + 1]
        if key == "N":
            num = re.match(r"\s*(\d+)", content)
            chapter = int(num.group(1)) if num else None
            chunk = content
            rest = []
            j = i + 2
            while j < len(parts) - 1 and parts[j] != "N":
                rest.append((parts[j], parts[j + 1]))
                j += 2
            fields = {}
            for k, v in rest:
                fields.setdefault(k, []).append(v)
            entries.append({
                "chapter": chapter,
                "type": norm(" ".join(fields.get("T", [])))[:160],
                "performer": norm(" ".join(fields.get("P", [])))[:220],
                "description": norm(" ".join(fields.get("C", [])))[:900],
                "origin": "anime" if "anime" in norm(chunk + " " + " ".join(fields.get("A", []))).lower() else "manga",
                "extra": norm(" ".join(fields.get("A", []) + fields.get("S", [])))[:400],
                "tomo": "t04",
                "page": cur_page,
                "source": "layout-columns",
            })
            i = j
        else:
            i += 2
    return entries


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    raw = open(a.text, encoding="utf-8", errors="replace").read()
    all_entries = []
    page_no = None
    buf = []
    for line in raw.splitlines():
        p = page_of(line)
        if p is not None:
            if page_no is not None and buf:
                all_entries += parse_page(page_no, "\n".join(buf))
            page_no = p
            buf = []
            continue
        if line.strip().startswith("--- COLUMNA"):
            continue
        buf.append(line)
    if page_no is not None and buf:
        all_entries += parse_page(page_no, "\n".join(buf))

    seen = set()
    uniq = []
    for e in all_entries:
        k = (e["chapter"], e["performer"][:40])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(e)

    out = {
        "_meta": {
            "name": "Diccionario de Tecnicas (Chozenshu 4, pp.135-176)",
            "source": "Dragon Ball Compendio 4 - Superenciclopedia",
            "extracted": "2026-09-16",
            "method": "OCR + reconstruccion de columnas por coordenadas",
            "fields": {"chapter": "(N) n.o de capitulo del manga", "type": "(T) tipo de tecnica",
                       "performer": "(P) ejecutor", "description": "(C) descripcion",
                       "extra": "(A) anime / (S) spin-off"},
            "total": len(uniq),
        },
        "entries": sorted(uniq, key=lambda e: (e["page"], e["chapter"] or 0)),
    }
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    json.dump(out, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("[out]", a.out)
    print("[stats] entradas =", len(uniq))
    wd = [e for e in uniq if e["description"]]
    wp = [e for e in uniq if e["performer"]]
    wt = [e for e in uniq if e["type"]]
    print("[stats] con descripcion = %d | con ejecutor = %d | con tipo = %d" % (len(wd), len(wp), len(wt)))
    return 0


if __name__ == "__main__":
    sys.exit(main())


