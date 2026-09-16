import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

t = open("src/data/combatResolutionEngine.js", encoding="utf-8", errors="replace").read()
i = t.find("TIER_DIFFERENCE_RULES")
j = t.find("};", i)
print(t[i:j+2][:1200])
