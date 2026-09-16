import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

t = open("src/services/simulationEngine.js", encoding="utf-8", errors="replace").read()
mods = sorted(set(re.findall(r"modifiers\.([a-zA-Z_][a-zA-Z0-9_]*)", t)))
print("MODIFICADORES leidos por el motor (%d):" % len(mods))
for m in mods:
    print("  ", m)
