import io, sys, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
simbolos = ["executeCombatSimulation","createCombatSnapshot","validateCombatSnapshot","synthesizeNarrativeFromValidatedLog","combatSimulationCore","combatResolutionEngine","arenasArtifactsBosses","ORACLE_EVENT_CONFIG","COMBAT_RESOLUTION_ORDER","buildCombatLogSnapshot"]
hits = {s: [] for s in simbolos}
for root, dirs, files in os.walk("src"):
    dirs[:] = [d for d in dirs if d not in ("node_modules","backups",".git")]
    for fn in files:
        if not fn.endswith((".js",".jsx",".mjs")): continue
        p = os.path.join(root, fn)
        try:
            t = open(p, encoding="utf-8", errors="replace").read()
        except: continue
        for s in simbolos:
            if s in t:
                hits[s].append(p.replace("\\","/"))
for s in simbolos:
    print("== %s ==" % s)
    for p in hits[s]:
        print("   ", p)
