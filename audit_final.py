import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']
print("=" * 80)
print("AUDITORIA COMPLETA V26")
print("=" * 80)
print("Total personajes:", len(chars))

issues_found = 0

# 1. Base Ki > 0
print("\n--- BASE KI INVALIDO ---")
for cid, c in chars.items():
    base_ki = c.get('baseKiNumeric', c.get('baseKi', 0))
    if not base_ki or base_ki <= 0:
        print(f"[BASE KI INVALIDO] {cid}: {c.get('name', cid)} = {base_ki}")

# 2. Sin formas
print("\n--- SIN FORMAS ---")
for cid, c in chars.items():
    if not c.get('forms') or len(c.get('forms', [])) == 0:
        print(f"[SIN FORMAS] {cid}: {c.get('name', cid)}")

# 3. Tier mismatch base vs form[0]
print("\n--- TIER MISMATCH BASE vs FORM[0] ---")
for cid, c in chars.items():
    forms = c.get('forms', [])
    if forms:
        bt = c.get('baseTier') or c.get('tier')
        ft = forms[0].get('tier')
        if bt != ft:
            print(f"[TIER MISMATCH] {cid}: baseTier={bt} vs form[0].tier={ft}")

# 4. Orden Ki ascendente
print("\n--- ORDEN KI ASCENDENTE ---")
for cid, c in chars.items():
    prev = -1
    for f in c.get('forms', []):
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if ki and ki < prev:
            print(f"[ORDEN KI] {cid}: {f['name'][:40]} Ki={ki:,.0f} < anterior {prev:,.0f}")
        if ki: prev = ki

# 5. Referencias a scouter
print("\n--- REFERENCIAS A SCOUTER ---")
scouter_count = 0
for cid, c in chars.items():
    for f in c.get('forms', []):
        name = f.get('name', '').lower()
        mult = f.get('multiplier', '').lower()
        if 'scouter' in name or 'scouter' in mult:
            print(f"[SCOUTER] {cid}: {f['name']} | mult={f.get('multiplier')}")
            scouter_count += 1
print(f"Total scouter refs: {scouter_count}")

# KI nulo en formas
print("\n--- FORMAS CON KI NULO ---")
null_ki = 0
for cid, c in chars.items():
    for f in c.get('forms', []):
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if ki <= 0:
            print(f"[KI NULO] {cid}: {f['name']} = {ki}")
            null_ki += 1
print(f"Total KI nulo: {null_ki}")

# Tier format validation
print("\n--- TIER FORMATO INVALIDO ---")
for cid, c in chars.items():
    bt = c.get('baseTier') or c.get('tier')
    if bt and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', bt):
        print(f"[TIER BASE INVALIDO] {cid}: {bt}")
    for f in c.get('forms', []):
        ft = f.get('tier')
        if ft and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', ft):
            print(f"[TIER FORMA INVALIDO] {cid}: {f['name']} = {ft}")

# Orden Ki ascendente
print("\n--- ORDEN KI ASCENDENTE ---")
for cid, c in chars.items():
    prev = -1
    for f in c.get('forms', []):
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if ki and ki < prev:
            print(f"[ORDEN KI] {cid}: {f['name'][:40]} Ki={ki:,.0f} < anterior {prev:,.0f}")
        if ki: prev = ki

print("\n" + "="*80)
print("AUDITORIA COMPLETADA")
print("="*80)