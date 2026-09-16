import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
lines = open("src/services/simulationEngine.js", encoding="utf-8", errors="replace").readlines()
for i, ln in enumerate(lines, 1):
    s = ln.rstrip()
    if s.startswith("    return `") or "const oracleDirective" in s or "const customContextSection" in s or "const engineRules" in s:
        print("%d: %s" % (i, s[:120]))
