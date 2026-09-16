import io, sys, re, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

t = open("src/data/scenarios.js", encoding="utf-8", errors="replace").read()
ids = re.findall(r'id:\s*"([^"]+)"', t)
names = re.findall(r'name:\s*"([^"]+)"', t)
unis = re.findall(r'universe:\s*"([^"]+)"', t)
print("SCENARIOS (arenas UI):", len(ids))
print("Universos distintos:", len(set(unis)))
print("Campos presentes:", [f for f in ["desc","sensory","terrainEffect","gravity","temperature","civilians","hazardZone","initialStates","tagInteractions","counterTags"] if (f + ":") in t])
print()
print("Total DYNAMIC_ARENAS:", len(re.findall(r'id:\s*"arena-', open("src/data/arenasArtifactsBosses.js", encoding="utf-8", errors="replace").read())))
