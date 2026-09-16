import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

for f in ["src/data/combatResolutionEngine.js", "src/data/arenasArtifactsBosses.js"]:
    t = open(f, encoding="utf-8", errors="replace").read()
    print("===== %s =====" % f)
    for m in re.finditer(r"export const ([A-Za-z0-9_]+)", t):
        print("   ", m.group(1))
    print()
