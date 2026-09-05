import json, re, math
from collections import defaultdict

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']
print("=" * 80)
print("AUDITORÍA MASIVA COMPLETA - ROSTER V26")
print("=" * 80)
print(f"Total personajes: {len(chars)}")

# Estadísticas por universo
universes = defaultdict(lambda: {'count': 0, 'forms': 0, 'chars': []})
for cid, c in chars.items():
    uni = c.get('universe', 'UNKNOWN')
    universes[uni]['count'] += 1
    universes[uni]['forms'] += len(c.get('forms', []))
    universes[uni]['chars'].append(c)

print(f"\n{'='*80}")
print("DISTRIBUCIÓN POR UNIVERSO")
print(f"{'='*80}")
for uni, data in sorted(universes.items(), key=lambda x: -x[1]['count']):
    print(f"  {uni}: {data['count']} chars, {data['forms']} formas")

# Verificaciones críticas
issues = []

# 1. Verificar que TODOS los personajes tengan baseKiNumeric > 0
for cid, c in chars.items():
    base_ki = c.get('baseKiNumeric', c.get('base_ki', 0))
    if not base_ki or base_ki <= 0:
        print(f"[BASE KI INVÁLIDO] {cid}: {c.get('name')} = {base_ki}")

# 2. Verificar que TODOS tengan al menos 1 forma
for cid, c in chars.items():
    forms = c.get('forms', [])
    if not forms or len(forms) == 0:
        print(f"[SIN FORMAS] {cid}: {c.get('name')}")

# 3. Verificar baseTier vs form[0].tier
for cid, c in chars.items():
    base_tier = c.get('baseTier') or c.get('tier')
    forms = c.get('forms', [])
    if forms:
        ft = forms[0].get('tier')
        bt = c.get('baseTier') or c.get('tier')
        if bt != ft:
            print(f"[TIER MISMATCH] {cid}: baseTier={bt} vs form[0].tier={forms[0].get('tier')}")

# 4. Verificar orden Ki ascendente en formas
for cid, c in chars.items():
    forms = c.get('forms', [])
    prev_ki = -1
    for f in c.get('forms', []):
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if ki and ki < prev_ki:
            print(f"[ORDEN KI] {cid}: {f['name']} Ki={ki:,.0f} < anterior {prev_ki:,.0f}")
        prev_ki = ki if ki else prev_ki

# 5. Verificar que no hay referencias a "scouter" en ningún lado
print("\n--- BUSCANDO REFERENCIAS A 'SCOUTER' ---")
scouter_refs = 0
for cid, c in chars.items():
    for f in c.get('forms', []):
        name = f.get('name', '').lower()
        mult = f.get('multiplier', '').lower()
        desc = f.get('description', '').lower() if f.get('description') else ''
        if 'scouter' in name or 'scouter' in mult or 'scouter' in desc:
            print(f"[SCOUTER REF] {cid}: {f['name']} | mult={f.get('multiplier')}")
            scouter_refs += 1
print(f"Total referencias a scouter: {scouter_refs}")

# 6. Verificar que todos los Saiyans tienen transformaciones canónicas
print("\n--- VERIFICANDO TRANSFORMACIONES SAIYANS ---")
saiyans = [cid for cid in chars if any('saiyan' in f.get('name', '').lower() or 'saiyajin' in f.get('name', '').lower() for f in chars[cid].get('forms', []))]
print(f"Personajes con formas Saiyan: {len(saiyans)}")

# 7. Verificar que no hay "ki" nulo en formas
print("\n--- FORMAS CON KI NULO ---")
null_ki_count = 0
for cid, c in chars.items():
    for f in c.get('forms', []):
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if not ki or ki <= 0:
            print(f"[KI NULO] {cid}: {f['name']} = {f.get('kiNumeric')}")
            null_ki_count += 1
print(f"Total formas con KI nulo: {null_ki_count}")

# 8. Verificar formato de tier
print("\n--- FORMATO DE TIER INVÁLIDO ---")
tier_regex = re.compile(r'^(High |Low )?\d{1,2}-[ABC]$')
for cid, c in chars.items():
    bt = c.get('baseTier') or c.get('tier')
    if bt and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', bt):
        print(f"[TIER INVÁLIDO BASE] {cid}: {bt}")
    for f in c.get('forms', []):
        ft = f.get('tier')
        if ft and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', ft):
            print(f"[TIER FORMA INVÁLIDO] {cid}: {f['name']} = {ft}")

print("\n" + "="*80)
print("AUDITORÍA BASE COMPLETADA")
print("="*80)