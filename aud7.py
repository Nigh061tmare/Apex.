import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

t = open("src/data/arenasArtifactsBosses.js", encoding="utf-8", errors="replace").read()
lines = t.splitlines()
for i, ln in enumerate(lines, 1):
    if re.match(r"\s*export const", ln) or re.match(r"\s*//\s*\d", ln) or ln.strip().startswith("//"):
        print("%4d: %s" % (i, ln.strip()[:110]))
