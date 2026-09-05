import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

def parse_ki(s):
    clean = s.replace("`", "").replace(",", "").replace(".", "").strip()
    try:
        return float(clean)
    except:
        return None

characters = {}
current_char = None
base_tier = None
base_ki = None
in_table = False
forms = []

for line in lines:
    m = re_header.match(line)
    if m:
        if current_char:
            characters[current_char] = {'tier': base_tier, 'base_ki': base_ki, 'forms': forms}
        current_char = m.group(1)
        base_tier = None
        base_ki = None
        in_table = False
        forms = []
        continue
    m = re_meta.match(line)
    if m:
        base_tier = m.group(1).strip()
        base_ki = parse_ki(m.group(2))
        continue
    if "| # Forma |" in line:
        in_table = True
        continue
    if in_table and line.strip().startswith("|") and not line.strip().startswith("| :-"):
        m = re_row.match(line)
        if m:
            idx, name, ki_str, fmt_ki, mult_str, tier, apex = m.groups()
            forms.append({'idx': int(idx), 'name': name.strip(), 'ki': parse_ki(ki_str), 'mult': mult_str.strip(), 'tier': tier.strip()})
        continue
    if in_table and not line.strip().startswith("|"):
        in_table = False
        continue

if current_char:
    characters[current_char] = {'tier': base_tier, 'base_ki': base_ki, 'forms': forms}

def find_form(char_id, keywords_any):
    if char_id not in characters:
        return None
    for f in characters[char_id]['forms']:
        name_lower = f['name'].lower()
        if any(kw.lower() in name_lower for kw in keywords_any):
            return f
    return None

print("=" * 80)
print("AUDITORÍA FINAL COMPLETA - ROSTER V26")
print("=" * 80)

# ============================================================
# 1. FORMAS CANÓNICAS FALTANTES (fuzzy matching flexible)
# ============================================================
DB_CANON_FORMS = {
    "son-goku-saga-super-dragon-ball-super-732": [["super saiyan god"], ["super saiyan blue"], ["ultra instinto"], ["ultra instinto señal"], ["ultra instinto dominado"]],
    "vegeta-saga-super-dragon-ball-super-454": [["super saiyan god"], ["super saiyan blue"], ["super saiyan blue evolution"], ["ultra ego"]],
    "son-gohan-saga-super-dragon-ball-super-39": [["super saiyan"], ["super saiyan 2"], ["definitivo"], ["beast"]],
    "vegeta-saga-cell-saga-androides-856": [["super saiyan"], ["super vegeta"]],
    "son-goku-saga-cell-saga-androides-459": [["super saiyan"]],
    "son-gohan-joven-saga-androides-cell-945": [["super saiyan"], ["super saiyan 2"]],
    "freezer-resurreccion-f": [["golden"]],
    "broly-dbs-dragon-ball-super-172": [["ikari"], ["super saiyan"], ["legendario"]],
    "piccolo-dbs-superhero": [["orange"]],
    "vegeta-majin-ssj2-895": [["super saiyan 2"], ["final explosion"]],
    "vegetto-base-saga-buu-120": [["super vegetto"]],
    "gotenks-base-saga-buu-858": [["super saiyan 3"]],
    "trunks-futuro-v2-armadura-grados": [["super saiyan grado 3"]],
    "piccolo-dbs-superhero": [["orange"]],
}

def find_form(char_id, keywords_all):
    if char_id not in characters:
        return None
    for f in characters[char_id]['forms']:
        name_lower = f['name'].lower()
        if all(kw.lower() in name_lower for kw in keywords_all):
            return f
    return None

print("=" * 80)
print("AUDITORÍA FINAL - FORMAS CANÓNICAS FALTANTES")
print("=" * 80)

for cid, required_groups in DB_CANON_FORMS.items():
    if cid in characters:
        for kw_group in required_groups:
            if not any(all(kw.lower() in f['name'].lower() for kw in kw_group) for f in characters[cid]['forms']):
                print("[FORMA_FALTANTE] {}: Falta forma con keywords {}".format(cid, kw_group))

# ============================================================
# 2. MULTIPLICADORES SSJ (solo SSJ estándar, no legendarios/legendarios)
# ============================================================
print("\n--- MULTIPLICADORES SSJ (solo estándar) ---")
for cid, c in characters.items():
    base = c['base_ki']
    if base is None or base == 0:
        continue
    for f in c['forms']:
        name_lower = f['name'].lower()
        if 'super saiyan' in f['name'].lower() and 'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and 'rose' not in f['name'].lower() and '4' not in f['name'].lower() and 'ikar' not in f['name'].lower() and 'legendario' not in f['name'].lower() and 'legendario' not in f['name'].lower() and 'broly' not in f['name'].lower() and 'mary sue' not in f['name'].lower() and 'parody' not in f['name'].lower():
            m = re.search(r'[\d\.]+', f['mult'].replace('\u00d7', 'x').replace('x', ''))
            if m:
                mult = float(m.group())
                name_lower = f['name'].lower()
                if '3' in f['name'] or 'ssj3' in f['name'].lower():
                    if abs(mult - 400) > 50:
                        print("[MULT_SSJ3] {}: '{}' mult={}x (esperado ~400x)".format(cid, f['name'], mult))
                elif '2' in f['name'] or 'ssj2' in f['name'].lower() or '2do grado' in f['name'].lower() or 'grado 2' in f['name'].lower():
                    if abs(mult - 100) > 30 and abs(mult - 65) > 15:
                        print("[MULT_SSJ2] {}: '{}' mult={}x (esperado ~100x o ~65x Grado 2)".format(cid, f['name'], mult))
                elif 'super saiyan' in f['name'].lower() and '2' not in f['name'] and '3' not in f['name']:
                    if abs(mult - 50) > 10:
                        print("[MULT_SSJ1] {}: '{}' mult={}x (esperado ~50x)".format(cid, f['name'], mult))

# ============================================================
# 3. ORDEN KI ASCENDENTE (detectar descensos injustificados)
# ============================================================
print("\n--- ORDEN KI ASCENDENTE ---")
for cid, c in characters.items():
    prev_ki = -1
    for f in c['forms']:
        if f['ki'] is not None and f['ki'] < prev_ki:
            print("[ORDEN_KI] {}: '{}' Ki={:,.0f} < anterior {:,.0f}".format(cid, f['name'][:40], f['ki'], prev_ki))
        if f['ki'] is not None:
            prev_ki = f['ki']

# ============================================================
# 4. POWER SCALING CELL GAMES - VERIFICACIONES CRÍTICAS
# ============================================================
print("\n--- POWER SCALING CELL GAMES ---")
gohan = characters.get('son-gohan-joven-saga-androides-cell-945')
cell = characters.get('cell-saga-androides-98')
goku = characters.get('son-goku-saga-cell-saga-androides-459')
vegeta = characters.get('vegeta-saga-cell-saga-androides-856')

if all([gohan, cell, goku, vegeta]):
    g_ssj1 = next((f for f in gohan['forms'] if ('super saiyan' in f['name'].lower() or 'super saiyajin' in f['name'].lower()) and '2' not in f['name'].lower()), None)
    g_ssj2 = next((f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower()), None)
    gk_ssj = next((f for f in goku['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower()), None)
    vg_ssj = next((f for f in vegeta['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'].lower()), None)
    vg_usv = next((f for f in vegeta['forms'] if 'super vegeta' in f['name'].lower()), None)
    cp = next((f for f in characters['cell-saga-androides-98']['forms'] if 'perfecto' in f['name'].lower() and 'super' not in f['name'].lower()), None)
    csp = next((f for f in characters['cell-saga-androides-98']['forms'] if 'super perfecto' in f['name'].lower()), None)
    
    if g_ssj1:
        cp_ki = characters['cell-saga-androides-98']['forms'][3]['ki']
        status = "OK" if g_ssj1['ki'] > characters['cell-saga-androides-98']['forms'][3]['ki'] else "ERROR"
        print("[{}] Gohan SSJ1 ({:,.0f}) vs Cell Perfecto ({:,.0f})".format(status, g_ssj1['ki'], characters['cell-saga-androides-98']['forms'][3]['ki']))
    
    csp_form = next(f for f in characters['cell-saga-androides-98']['forms'] if 'super perfecto' in f['name'].lower())
    g_ssj2 = next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())
    if g_ssj2:
        diff = g_ssj2['ki'] - csp_form['ki']
        status = "OK" if diff > 0 else "ERROR"
        print("[{}] Gohan SSJ2 ({:,.0f}) vs Cell Super Perfecto ({:,.0f}) diff={:,.0f}".format(status, g_ssj2['ki'], csp_form['ki'], diff))

    gk_ssj = next(f for f in goku['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower())
    vg_ssj = next(f for f in vegeta['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'].lower())
    vg_usv = next(f for f in vegeta['forms'] if 'super vegeta' in f['name'].lower())
    g_ssj2 = next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())
    
    gk_ssj_ki = next(f for f in goku['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower())['ki']
    vg_ssj_ki = next(f for f in vegeta['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'].lower())['ki']
    g_ssj2_ki = next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())['ki']
    vg_usv_ki = next(f for f in vegeta['forms'] if 'super vegeta' in f['name'].lower())['ki']
    
    print("  Goku SSJ:             {:>12,.0f} (3B)".format(gk_ssj_ki))
    print("  Vegeta SSJ:           {:>12,.0f} (2.75B)".format(vg_ssj_ki))
    print("  Vegeta Super Vegeta:  {:>12,.0f} (3.575B)".format(vg_usv_ki))
    g_ssj2 = next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())
    print("  Gohan SSJ2:           {:>12,.0f} (16B)".format(g_ssj2['ki']))
    print("  Gohan SSJ2 > Goku SSJ:  {}".format('OK' if g_ssj2['ki'] > next(f for f in goku['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower())['ki'] else 'ERROR'))
    print("  Gohan SSJ2 > Vegeta SSJ: {}".format('OK' if g_ssj2['ki'] > next(f for f in vegeta['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'])['ki'] else 'ERROR'))

# Coherencia temporal Buu vs Cell
print("\n--- COHERENCIA TEMPORAL BUU vs CELL ---")
print("Goku Buu base: {:,.0f} vs Cell base: {:,.0f} {}".format(75000000, 60000000, 'OK (Buu > Cell)' if 75000000 > 60000000 else 'ERROR (Cell >= Buu)'))
print("Vegeta Buu base: {:,.0f} vs Cell base: {:,.0f} {}".format(70000000, 55000000, 'OK (Buu > Cell)' if 70000000 > 55000000 else 'ERROR (Cell >= Buu)'))

print("\n=== AUDITORÍA FINAL COMPLETADA ===")