import json, re
import sys

# Forzar encoding UTF-8
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']
print("=" * 80)
print("AUDITORIA MASIVA COMPLETA - ROSTER V26")
print("=" * 80)
print("Total personajes:", len(chars))

# Verificaciones
issues = []

# 1. Verificar que TODOS los personajes tengan baseKiNumeric > 0
print("\n--- BASE KI INVALIDO ---")
for cid, c in chars.items():
    base_ki = c.get('baseKiNumeric', c.get('baseKi', 0))
    if not base_ki or base_ki <= 0:
        print(f"[BASE KI INVALIDO] {cid}: {c.get('name', cid)} = {base_ki}")

# 2. Verificar que TODOS tengan al menos 1 forma
print("\n--- SIN FORMAS ---")
for cid, c in chars.items():
    forms = c.get('forms', [])
    if not forms or len(forms) == 0:
        print(f"[SIN FORMAS] {cid}: {c.get('name')}")

# 3. Verificar baseTier vs form[0].tier
print("\n--- TIER MISMATCH BASE vs FORM[0] ---")
for cid, c in chars.items():
    base_tier = c.get('baseTier') or c.get('tier')
    forms = c.get('forms', [])
    if forms:
        bt = c.get('baseTier') or c.get('tier')
        ft = forms[0].get('tier')
        if bt != ft:
            print(f"[TIER MISMATCH] {cid}: baseTier={bt} vs form[0].tier={ft}")

# 4. Verificar orden Ki ascendente en formas
print("\n--- ORDEN KI ASCENDENTE ---")
for cid, c in chars.items():
    prev_ki = -1
    for f in c.get('forms', []):
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if ki and ki < prev_ki:
            print(f"[ORDEN KI] {cid}: {f['name']} Ki={ki:,.0f} < anterior {prev_ki:,.0f}")
        prev_ki = ki if ki else prev_ki

# 4. Buscar referencias a "scouter"
print("\n--- REFERENCIAS A SCOUTER ---")
scouter_refs = 0
for cid, c in chars.items():
    for f in c.get('forms', []):
        name = f.get('name', '').lower()
        mult = f.get('multiplier', '').lower()
        if 'scouter' in f.get('name', '').lower() or 'scouter' in f.get('multiplier', '').lower():
            print(f"[SCOUTER] {cid}: {f['name']} | mult={f.get('multiplier')}")
            scouter_refs += 1
print(f"Total referencias a scouter: {scouter_refs}")

# 4. Verificar KI nulo en formas
print("\n--- FORMAS CON KI NULO ---")
null_ki = 0
for cid, c in chars.items():
    for f in c.get('forms', []):
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if ki <= 0:
            print(f"[KI NULO] {cid}: {f['name']} = {ki}")
            null_ki += 1
print(f"Total KI nulo: {null_ki}")

# 5. Verificar formato tier
print("\n--- TIER FORMATO INVALIDO ---")
for cid, c in chars.items():
    bt = c.get('baseTier') or c.get('tier')
    if bt and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', bt):
        print(f"[TIER BASE INVALIDO] {cid}: {bt}")
    for f in c.get('forms', []):
        ft = f.get('tier')
        if ft and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', ft):
            print(f"[TIER FORMA INVALIDO] {cid}: {f['name']} = {ft}")

# 5. Verificar KI nulo en formas
print("\n--- FORMAS CON KI <= 0 ---")
for cid, c in chars.items():
    for f in c.get('forms', []):
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if ki <= 0:
            print(f"[KI <= 0] {cid}: {f['name']} = {ki}")

# 6. Buscar referencias a "scouter" en cualquier campo
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

# 5. Verificar tier format
print("\n--- TIER FORMATO INVALIDO ---")
for cid, c in chars.items():
    bt = c.get('baseTier') or c.get('tier')
    if bt and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', bt):
        print(f"[TIER BASE INVALIDO] {cid}: {bt}")
    for f in c.get('forms', []):
        ft = f.get('tier')
        if ft and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', ft):
            print(f"[TIER FORMA INVALIDO] {cid}: {f['name']} = {ft}")

print("\n" + "="*80)
print("AUDITORIA COMPLETADA")
print("="*80)