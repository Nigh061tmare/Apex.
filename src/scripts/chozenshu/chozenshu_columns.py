import argparse, json, sys, os

def load(p):
    return json.load(open(p, encoding="utf-8"))

def lines_of(page):
    out = []
    for ln in page.get("lines", []):
        t = (ln.get("text") or "").strip()
        b = ln.get("box") or []
        if not t or not b:
            continue
        y = sum(pt[1] for pt in b) / len(b)
        x = sum(pt[0] for pt in b) / len(b)
        out.append({"t": t, "x": x, "y": y})
    return out


def split_columns(rows, gap_frac=0.07):
    xs = sorted(r["x"] for r in rows)
    if len(xs) < 8:
        return [rows]
    w = xs[-1] - xs[0]
    if w <= 0:
        return [rows]
    thresh = max(140.0, gap_frac * w)
    cuts = []
    for i in range(len(xs) - 1):
        if xs[i + 1] - xs[i] >= thresh:
            cuts.append((xs[i] + xs[i + 1]) / 2.0)
    if not cuts:
        return [rows]
    segs = []
    prev = None
    for c in cuts:
        seg = [r for r in rows if (prev is None or r["x"] >= prev) and r["x"] < c]
        if seg:
            segs.append(seg)
        prev = c
    seg = [r for r in rows if prev is None or r["x"] >= prev]
    if seg:
        segs.append(seg)
    return segs


def emit(rows, tol=22.0):
    rows = sorted(rows, key=lambda r: r["y"])
    out = []
    for r in rows:
        if out and abs(r["y"] - out[-1][0]) <= tol:
            out[-1][1].append(r)
        else:
            out.append([r["y"], [r]])
    return [" ".join(s["t"] for s in sorted(grp, key=lambda z: z["x"])) for _, grp in out]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", required=True)
    ap.add_argument("--pages", required=True)
    ap.add_argument("--gap", type=float, default=0.07)
    ap.add_argument("--out", default=None)
    a = ap.parse_args()

    data = load(a.json)
    pages = []
    for part in a.pages.split(","):
        part = part.strip()
        if "-" in part:
            s, e = part.split("-")
            pages.extend(range(int(s), int(e) + 1))
        elif part:
            pages.append(int(part))

    blocks = []
    for p in pages:
        pg = data.get(str(p))
        if not pg:
            continue
        rows = lines_of(pg)
        cols = split_columns(rows, a.gap)
        parts = []
        for ci, col in enumerate(cols):
            parts.append("--- COLUMNA %d ---" % (ci + 1))
            parts.extend(emit(col))
        blocks.append("===== [PAGE %d] =====\n%s" % (p, "\n".join(parts)))

    text = "\n\n".join(blocks)
    if a.out:
        os.makedirs(os.path.dirname(a.out), exist_ok=True)
        open(a.out, "w", encoding="utf-8").write(text)
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


