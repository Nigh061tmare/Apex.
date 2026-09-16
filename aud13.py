import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

t = open("src/services/simulationEngine.js", encoding="utf-8", errors="replace").read()
print("== matchMode values in engine ==")
for m in re.finditer(r"matchMode\s*===?\s*['\"]([a-z_]+)['\"]", t):
    print("   ===", m.group(1))
for m in re.finditer(r"matchMode\s*[:=]\s*['\"]([a-z_]+)['\"]", t):
    print("   =  ", m.group(1))

print()
print("== 'boss' / 'raid' mentions ==")
for m in re.finditer(r".{0,50}(boss_?raid|raid|bossMode|isBoss).{0,50}", t, re.I):
    print("   ", m.group(0).replace("\n", " ")[:110])

print()
s = open("src/components/ScenarioPanel.jsx", encoding="utf-8", errors="replace").read()
print("== matchMode in ScenarioPanel ==")
for m in re.finditer(r"matchMode\s*[:=]\s*['\"]([a-z_]+)['\"]", s):
    print("   ", m.group(1))
