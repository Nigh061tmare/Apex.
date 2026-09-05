import json, random, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']
char_ids = list(chars.keys())

# Categorizar por franquicia
franchises = {}
for cid, c in chars.items():
    uni = c.get('universe', 'UNKNOWN')
    if uni not in franchises:
        franchises[uni] = []
    franchises[uni].append(cid)

# Mostrar ejemplos por franquicia
print("=" * 80)
print("EJEMPLOS ALEATORIOS POR FRANQUICIA - V26")
print("=" * 80)

for uni, ids in franchises.items():
    if 'DRAGON BALL' not in uni.upper():
        # Solo No-DB para variar
        sample = random.sample(ids, min(3, len(ids)))
        print(f"\n📂 {uni} ({len(ids)} personajes):")
        for cid in sample:
            c = chars[cid]
            base_ki = c.get('baseKiNumeric', c.get('baseKi', 0))
            forms = c.get('forms', [])
            print(f"  🎭 {c.get('name', cid)}")
            print(f"     Base: {base_ki:,.0f} | Tier: {c.get('baseTier', c.get('tier'))} | Formas: {len(forms)}")
            for f in forms[:3]:
                ki = f.get('kiNumeric') or f.get('ki') or 0
                print(f"     → {f['name']}: {ki:,.0f} ({f.get('tier')}) x{f.get('multiplier', 'x1')}")
            if len(forms) > 3:
                print(f"     ... y {len(forms)-3} formas más")

# También algunos DB aleatorios
db_ids = [cid for cid in chars if 'DRAGON BALL' in chars[cid].get('universe', '').upper()]
sample = random.sample(db_ids, min(5, len(db_ids)))
print(f"\n🐉 DRAGON BALL ({len(db_ids)} personajes):")
for cid in sample:
    c = chars[cid]
    base_ki = c.get('baseKiNumeric', c.get('baseKi', 0))
    forms = c.get('forms', [])
    print(f"  🐉 {c.get('name', cid)}")
    print(f"     Base: {base_ki:,.0f} | Tier: {c.get('baseTier', c.get('tier'))} | Formas: {len(forms)}")
    for f in c.get('forms', [])[:4]:
        ki = f.get('kiNumeric') or f.get('ki') or 0
        print(f"     → {f['name']}: {ki:,.0f} ({f.get('tier')}) x{f.get('multiplier', 'x1')}")

print("\n" + "="*80)
print("EJEMPLOS COMPLETADOS")
print("="*80)