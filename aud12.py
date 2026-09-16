import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
lines = open("src/services/simulationEngine.js", encoding="utf-8", errors="replace").readlines()
for i, ln in enumerate(lines, 1):
    if "buildCombatCoreBlock" in ln or "coreResolutionBlock" in ln or "isBossMode" in ln or "arenaMechanicsBlock =" in ln or "artifactBlock =" in ln or "turnChecklistBlock =" in ln:
        print("%d: %s" % (i, ln.rstrip()[:150]))
