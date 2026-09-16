import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
lines = open("src/services/simulationEngine.js", encoding="utf-8", errors="replace").readlines()
for i, ln in enumerate(lines, 1):
    if any(k in ln for k in ["bossTierInfo", "bossMult", "JEFE SUPREMO", "hasBossMinions", "const boss", "matchMode === 'raid'"]):
        print("%d: %s" % (i, ln.rstrip()[:150]))
