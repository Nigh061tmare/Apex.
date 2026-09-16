import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
for f in ("src/data/combatResolutionEngine.js","src/data/arenasArtifactsBosses.js"):
    t = open(f, encoding="utf-8", errors="replace").read()
    print("===== %s (%d lineas) =====" % (f, len(t.splitlines())))
    for m in re.finditer(r"^export (?:const|function|class|default)?\s*([A-Za-z0-9_]+)", t, re.M):
        print("   export:", m.group(1))
    print("")
