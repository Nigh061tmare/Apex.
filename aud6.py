import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

t = open("src/services/simulationEngine.js", encoding="utf-8", errors="replace").read()
print("== 'arena' (case-insensitive) ==")
for m in re.finditer(r".{0,60}arena.{0,60}", t, re.I):
    print("  ", m.group(0).replace("\n", " ")[:120])
