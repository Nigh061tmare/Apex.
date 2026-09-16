import io, sys, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
txt = open("src/services/simulationEngine.js", encoding="utf-8", errors="replace").read()
nombres = ["summarizePassivesForPrompt","resolvePassiveIds","validateCombatSnapshot","executeCombatSimulation","synthesizeNarrativeFromValidatedLog","COMBAT_RESOLUTION_ORDER","HAX_LAYERS_HIERARCHY","VERSE_EQUALIZATION_RULES"]
for n in nombres:
    c = txt.count(n)
    est = "USADO" if c > 1 else "NO USADO"
    print("  %-40s %d  %s" % (n, c, est))
print("")
archivos = ["src/data/arenasArtifactsBosses.js","src/data/combatResolutionEngine.js","src/services/combatSimulationCore.js","src/lib/combatStateResolver.js","src/lib/externalEntityFramework.js","src/lib/biologicalPassives.js"]
for f in archivos:
    if os.path.exists(f):
        n = sum(1 for _ in open(f, encoding="utf-8", errors="replace"))
        print("  %-52s %5d lineas" % (f, n))
    else:
        print("  %-52s NO EXISTE" % f)
