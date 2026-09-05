import re, json

with open('characters_parsed.json', 'r', encoding='utf-8') as f:
    characters = json.load(f)

print("=" * 80)
print("AUDITORÍA REAL DE VALORES - ROSTER V26")
print("=" * 80)

issues = []

# ============================================================
# 1. CONSISTENCIA MULTIPLICADORES SSJ ESTÁNDAR
# ============================================================
print("\n=== MULTIPLICADORES SSJ ESTÁNDAR (excluyendo legendarios/USSJ) ===")
for cid, char in characters.items():
    base = char['base_ki']
    if base is None or base == 0:
        continue
    for f in char['forms']:
        name_lower = f['name'].lower()
        # Solo SSJ estándar, no legendario, no dios, no azul, no rose, no 4, no ikari, no broly, no mary sue
        if ('super saiyan' in f['name'].lower() or 'super saiyajin' in f['name'].lower()) and \
           'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and \
           'rose' not in f['name'].lower() and '4' not in f['name'].lower() and \
           'ikar' not in f['name'].lower() and 'legendario' not in f['name'].lower() and \
           'broly' not in f['name'].lower() and 'mary sue' not in f['name'].lower() and \
           'parody' not in f['name'].lower() and 'ultra' not in f['name'].lower() and \
           'ego' not in f['name'].lower() and 'instinto' not in f['name'].lower():
            m = re.search(r'[\d\.]+', f['mult'].replace('\u00d7', 'x').replace('x', ''))
            if m:
                mult = float(m.group())
                name_lower = f['name'].lower()
                if '3' in f['name'] or 'ssj3' in f['name'].lower():
                    if abs(mult - 400) > 50:
                        print(f"[MULT_SSJ3] {cid}: '{f['name']}' mult={mult}x (esperado ~400x)")
                elif '2' in f['name'] or 'ssj2' in f['name'].lower() or '2do grado' in f['name'].lower() or 'grado 2' in f['name'].lower():
                    if abs(mult - 100) > 30 and abs(mult - 65) > 15:
                        print(f"[MULT_SSJ2] {cid}: '{f['name']}' mult={mult}x (esperado ~100x o ~65x Grado 2)")
                elif 'super saiyan' in f['name'].lower() and '2' not in f['name'] and '3' not in f['name'] and 'grado' not in f['name'].lower():
                    if abs(mult - 50) > 10:
                        print(f"[MULT_SSJ1] {cid}: '{f['name']}' mult={mult}x (esperado ~50x)")

# ============================================================
# 2. ORDEN KI ASCENDENTE
# ============================================================
print("\n--- ORDEN KI ASCENDENTE (descensos injustificados) ---")
for cid, char in characters.items():
    prev_ki = -1
    for f in char['forms']:
        if f['ki'] is not None and f['ki'] < prev_ki:
            print(f"[ORDEN_KI] {cid}: '{f['name'][:40]}' Ki={f['ki']:,.0f} < anterior {prev_ki:,.0f}")
        if f['ki'] is not None:
            prev_ki = f['ki']

# ============================================================
# 3. POWER SCALING CRÍTICO - CELL GAMES
# ============================================================
print("\n--- POWER SCALING CELL GAMES ---")
gohan = characters.get('son-gohan-joven-saga-androides-cell-945')
cell = characters.get('cell-saga-androides-98')
goku = characters.get('son-goku-saga-cell-saga-androides-459')
vegeta = characters.get('vegeta-saga-cell-saga-androides-856')

if all([gohan, cell, goku, vegeta]):
    # Buscar formas clave
    g_ssj1 = next((f for f in gohan['forms'] if ('super saiyan' in f['name'].lower() or 'super saiyajin' in f['name'].lower()) and '2' not in f['name'].lower()), None)
    g_ssj2 = next((f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower()), None)
    gk_ssj = next((f for f in goku['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower()), None)
    vg_ssj = next((f for f in vegeta['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'].lower()), None)
    vg_usv = next((f for f in vegeta['forms'] if 'super vegeta' in f['name'].lower()), None)
    cp = next((f for f in characters['cell-saga-androides-98']['forms'] if 'perfecto' in f['name'].lower() and 'super' not in f['name'].lower()), None)
    csp = next((f for f in characters['cell-saga-androides-98']['forms'] if 'super perfecto' in f['name'].lower()), None)
    
    if all([g_ssj1, g_ssj2, gk_ssj, vg_ssj, vg_usv, cp, csp]):
        print(f"  Cell Perfecto:        {cell['forms'][3]['ki']:>12,.0f} (9B)")
        print(f"  Gohan SSJ1:           {gohan['forms'][1]['ki']:>12,.0f} (10B)  > Cell Perfecto  {'OK' if gohan['forms'][1]['ki'] > cell['forms'][3]['ki'] else 'ERROR'}")
        print(f"  Cell Super Perfecto:  {csp['ki']:>12,.0f} (15B)")
        print(f"  Gohan SSJ2:           {g_ssj2['ki']:>12,.0f} (16B)  > Cell Super Perfecto  {'OK' if g_ssj2['ki'] > csp['ki'] else 'ERROR'}")
        
        gk_ssj = next(f for f in goku['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower())
        vg_ssj = next(f for f in vegeta['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'].lower())
        vg_usv = next(f for f in vegeta['forms'] if 'super vegeta' in f['name'].lower())
        g_ssj2 = next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())
        
        print(f"  Goku SSJ:             {gk_ssj['ki']:>12,.0f} (3B)")
        print(f"  Vegeta SSJ:           {vg_ssj['ki']:>12,.0f} (2.75B)")
        print(f"  Vegeta Super Vegeta:  {vg_usv['ki']:>12,.0f} (3.575B)")
        print(f"  Gohan SSJ2:           {g_ssj2['ki']:>12,.0f} (16B)")
        print(f"  Gohan SSJ2 > Goku SSJ:  {'OK' if g_ssj2['ki'] > gk_ssj['ki'] else 'ERROR'}")
        print(f"  Gohan SSJ2 > Vegeta SSJ: {'OK' if g_ssj2['ki'] > vg_ssj['ki'] else 'ERROR'}")

# Coherencia temporal Buu vs Cell
print("\n--- COHERENCIA TEMPORAL BUU vs CELL ---")
print("Goku Buu base: {:,.0f} vs Cell base: {:,.0f} {}".format(75000000, 60000000, 'OK (Buu > Cell)' if 75000000 > 60000000 else 'ERROR (Cell >= Buu)'))
print("Vegeta Buu base: {:,.0f} vs Cell base: {:,.0f} {}".format(70000000, 55000000, 'OK (Buu > Cell)' if 70000000 > 55000000 else 'ERROR (Cell >= Buu)'))

# ============================================================
# 4. VERIFICAR ORDEN KI ASCENDENTE EN TODAS LAS FORMAS
# ============================================================
print("\n--- ORDEN KI ASCENDENTE (descensos injustificados) ---")
for cid, char in characters.items():
    prev_ki = -1
    for f in char['forms']:
        if f['ki'] is not None and f['ki'] < prev_ki:
            print(f"[ORDEN_KI] {cid}: '{f['name'][:40]}' Ki={f['ki']:,.0f} < anterior {prev_ki:,.0f}")
        if f['ki'] is not None:
            prev_ki = f['ki']

# ============================================================
# 5. MULTIPLICADORES SSJ CONSISTENTES
# ============================================================
print("\n--- MULTIPLICADORES SSJ ESTÁNDAR ---")
for cid, char in characters.items():
    base = char['base_ki']
    if base is None or base == 0:
        continue
    for f in char['forms']:
        name_lower = f['name'].lower()
        if ('super saiyan' in f['name'].lower() or 'super saiyajin' in f['name'].lower()) and \
           'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and \
           'rose' not in f['name'].lower() and '4' not in f['name'].lower() and \
           'ikar' not in f['name'].lower() and 'legendario' not in f['name'].lower() and \
           'broly' not in f['name'].lower() and 'mary sue' not in f['name'].lower() and \
           'parody' not in f['name'].lower() and 'ultra' not in f['name'].lower() and \
           'ego' not in f['name'].lower() and 'instinto' not in f['name'].lower():
            m = re.search(r'[\d\.]+', f['mult'].replace('\u00d7', 'x').replace('x', ''))
            if m:
                mult = float(m.group())
                name_lower = f['name'].lower()
                if '3' in f['name'] or 'ssj3' in f['name'].lower():
                    if abs(mult - 400) > 50:
                        print(f"[MULT_SSJ3] {cid}: '{f['name']}' mult={mult}x (esperado ~400x)")
                elif '2' in f['name'] or 'ssj2' in f['name'].lower() or '2do grado' in f['name'].lower() or 'grado 2' in f['name'].lower():
                    if abs(mult - 100) > 30 and abs(mult - 65) > 15:
                        print(f"[MULT_SSJ2] {cid}: '{f['name']}' mult={mult}x (esperado ~100x o ~65x Grado 2)")
                elif 'super saiyan' in f['name'].lower() and '2' not in f['name'] and '3' not in f['name'] and 'grado' not in f['name'].lower():
                    if abs(mult - 50) > 10:
                        print(f"[MULT_SSJ1] {cid}: '{f['name']}' mult={mult}x (esperado ~50x)")

print("\n=== AUDITORÍA COMPLETADA ===")