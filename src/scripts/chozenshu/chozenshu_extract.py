#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""APEX Chozenshu Toolkit :: Paso 3 - Extractor de datasets canonicos.
Lee el corpus OCR de los 4 tomos + el lexicon curado de tecnicas y emite:
  dragonball_canonical_moves.json     tecnicas con procedencia (tomo/pagina)
  dragonball_battle_powers.json       fuerzas de combate minadas (regex)
  dragonball_timeline_events.json      eventos datados (Ano NNNN)
  dragonball_character_dossier.json    bloques del diccionario de personajes
  dragonball_tech_mentions_raw.json    lineas (T) crudas con contexto
Uso:
  python chozenshu_extract.py --ocr <carpeta_ocr> --lexicon <seed.json> --out <carpeta_salida>
"""
import argparse, json, os, re, sys, unicodedata, collections

MARKERS = ("(T)", "(C)", "(H)", "(L)", "(B)", "(A)", "(N)")
PAGE_RE = re.compile(r"^=====\s*\[PAGE\s+(\d+)\s*/\s*([^\]]+)\]\s*=====\s*$")

# --- Fuerzas de combate ------------------------------------------------
BP_PATTERNS = [
    r"fuerzadecombate(?:esde|erade|de|es|era|similaralade)(\d{1,9})",
    r"fuerzadecombate(?:esde|erade|de|es|era)(\d{1,4})(millones|mil|billones)",
    r"niveldecombate(?:esde|de|es)(\d{1,9})",
    r"poderdecombate(?:esde|de|es)(\d{1,9})",
    r"nivel(?:de)?poder(?:esde|de|es)(\d{1,9})",
]
TIMELINE_RE = re.compile(r"(?:ano|age)(\d{3,4})")
NUMWORD_PREFIX = {"millones": 1000000, "mil": 1000, "billones": 10**12}


def norm(s: str) -> str:
    """Normaliza para matching: minusculas, sin acentos, sin separadores."""
    s = unicodedata.normalize("NFD", s or "")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s.lower())


def load_corpus(ocr_dir):
    tomes = {}
    for fn in sorted(os.listdir(ocr_dir)):
        if not fn.startswith("t") or not fn.endswith(".json"):
            continue
        p = os.path.join(ocr_dir, fn)
        try:
            raw = json.load(open(p, encoding="utf-8"))
        except Exception as e:
            print("[warn] json ilegible", fn, e)
            continue
        pages = {}
        for k, v in raw.items():
            txt = "\n".join(l.get("text", "") for l in v.get("lines", []))
            pages[int(k)] = {"file": v.get("page", ""), "text": txt}
        tomes[fn[:-5]] = pages
        print("[load] %s paginas=%d" % (fn, len(pages)))
    return tomes


def scan_techniques(tomes, lexicon):
    out = []
    index = collections.defaultdict(set)
    for t in lexicon["techniques"]:
        names = [t.get("es"), t.get("romaji"), t.get("id")] + list(t.get("aliases") or [])
        for n in names:
            k = norm(n)
            if len(k) >= 4:
                index[k].add(t["id"])
    byid = {t["id"]: t for t in lexicon["techniques"]}
    hits = collections.defaultdict(lambda: collections.defaultdict(list))
    for tomo, pages in tomes.items():
        for pno, pg in pages.items():
            flat = norm(pg["text"])
            for k, ids in index.items():
                if len(k) < 5:
                    continue
                c = flat.count(k)
                if c:
                    for tid in ids:
                        hits[tid][tomo].append((pno, c))
    for tid, t in byid.items():
        occ = {}
        total = 0
        for tomo, rows in sorted(hits.get(tid, {}).items()):
            rows.sort()
            pg = [r[0] for r in rows]
            occ[tomo] = {"pages": pg, "pagesCount": len(pg), "hits": sum(r[1] for r in rows)}
            total += occ[tomo]["hits"]
        out.append({
            "id": t["id"], "nameEs": t.get("es"), "romaji": t.get("romaji"),
            "type": t.get("type"), "users": t.get("users") or [],
            "description": t.get("desc"), "aliases": t.get("aliases") or [],
            "attestedInChozenshu": total > 0, "totalHits": total,
            "occurrences": occ,
        })
    out.sort(key=lambda x: -x["totalHits"])
    return out


def scan_numeric(tomes, patterns, label, value_key="value"):
    rows, seen = [], set()
    for tomo, pages in sorted(tomes.items()):
        for pno, pg in sorted(pages.items()):
            flat = norm(pg["text"])
            for pat in patterns:
                for m in re.finditer(pat, flat):
                    groups = m.groups()
                    raw = groups[0]
                    try:
                        val = int(raw)
                    except ValueError:
                        continue
                    if len(groups) > 1 and groups[1]:
                        mult = {"mil": 1000, "millones": 1000000, "billones": 10 ** 12}[groups[1]]
                        val *= mult
                    if val < 10:
                        continue
                    key = (val, tomo, pno)
                    if key in seen:
                        continue
                    seen.add(key)
                    ctx = flat[max(0, m.start() - 90): m.end() + 90]
                    rows.append({value_key: val, "raw": m.group(0), "kind": label,
                                 "tomo": tomo, "page": pno, "context": ctx})
    rows.sort(key=lambda r: (r["tomo"], r["page"], -r[value_key]))
    return rows


def scan_timeline(tomes):
    rows = []
    for tomo, pages in sorted(tomes.items()):
        for pno, pg in sorted(pages.items()):
            flat = norm(pg["text"])
            for m in TIMELINE_RE.finditer(flat):
                age = int(m.group(1))
                if not (200 <= age <= 1500):
                    continue
                ctx = flat[max(0, m.start() - 120): m.end() + 160]
                rows.append({"age": age, "tomo": tomo, "page": pno, "context": ctx})
    return rows


def scan_markers(tomes):
    """Extrae bloques del diccionario de personajes (marcadores C/T/L/H/B/A/N)."""
    blocks = []
    for tomo, pages in sorted(tomes.items()):
        for pno, pg in sorted(pages.items()):
            cur = None
            for line in pg["text"].split("\n"):
                s = line.strip()
                mk = next((m for m in MARKERS if s.startswith(m)), None)
                if mk:
                    if cur and len(cur["text"]) > 25:
                        blocks.append(cur)
                    cur = {"tomo": tomo, "page": pno, "marker": mk.strip("()"),
                           "text": s[len(mk):].strip()}
                elif cur is not None and s:
                    cur["text"] += " " + s
                elif cur is not None:
                    if len(cur["text"]) > 25:
                        blocks.append(cur)
                    cur = None
            if cur and len(cur["text"]) > 25:
                blocks.append(cur)
    return blocks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ocr", required=True)
    ap.add_argument("--lexicon", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    tomes = load_corpus(a.ocr)
    lexicon = json.load(open(a.lexicon, encoding="utf-8"))

    moves = scan_techniques(tomes, lexicon)
    bp = scan_numeric(tomes, BP_PATTERNS, "battlePower")
    tl = scan_timeline(tomes)
    dossier = scan_markers(tomes)
    raw_t = [b for b in dossier if b["marker"] == "T"]

    def dump(name, obj):
        p = os.path.join(a.out, name)
        with open(p, "w", encoding="utf-8") as fh:
            json.dump(obj, fh, ensure_ascii=False, indent=1)
        print("[out] %-42s %8.1f KB" % (name, os.path.getsize(p) / 1024))

    dump("dragonball_canonical_moves.json", {
        "_meta": {"generatedBy": "chozenshu_extract.py", "source": "Dragon Ball Compendios (Chozenshu 1-4) OCR",
                  "tomes": {k: len(v) for k, v in sorted(tomes.items())},
                  "count": len(moves),
                  "attested": sum(1 for m in moves if m["attestedInChozenshu"]),
                  "note": "attestedInChozenshu=true => la tecnica aparece literalmente en el corpus OCR."},
        "techniques": moves})
    dump("dragonball_battle_powers.json", {
        "_meta": {"generatedBy": "chozenshu_extract.py", "kind": "regex-mined", "count": len(bp),
                  "warning": "Valores minados por regex sobre OCR; requieren verificacion visual en pagina antes de uso canonico."},
        "battlePowers": bp})
    dump("dragonball_timeline_events.json", {
        "_meta": {"generatedBy": "chozenshu_extract.py", "count": len(tl)},
        "events": tl})
    dump("dragonball_character_dossier.json", {
        "_meta": {"generatedBy": "chozenshu_extract.py", "markers": "C=perfil H=historia/fecha T=tecnicas L=luchas B=torneos A=anecdotas N=referencia",
                  "count": len(dossier), "countT": len(raw_t)},
        "blocks": dossier})
    dump("dragonball_tech_mentions_raw.json", {
        "_meta": {"generatedBy": "chozenshu_extract.py", "count": len(raw_t)},
        "mentions": raw_t})

    print("\nRESUMEN")
    print("  tecnicas en lexicon  :", len(lexicon["techniques"]))
    print("  atestiguadas en tomos:", sum(1 for m in moves if m["attestedInChozenshu"]))
    print("  fuerzas de combate   :", len(bp))
    print("  eventos datados      :", len(tl))
    print("  bloques dossier      :", len(dossier))
    top = [m for m in moves if m["attestedInChozenshu"]][:12]
    print("\n  TOP tecnicas atestiguadas (hits):")
    for m in top:
        print("   - %-34s %5d  %s" % (m["nameEs"][:34], m["totalHits"],
                                      ",".join(sorted(m["occurrences"]))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
