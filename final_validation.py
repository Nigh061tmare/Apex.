import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

def parse_ki(s):
    clean = s.replace("`", "").replace(",", "").replace(".", "").strip()
    try: return float(clean)
    except: return None

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

# Fuzzy matching helper
def has_form(char_id, keywords):
    """Verifica si el personaje tiene una forma que contenga TODAS las keywords"""
    if char_id not in characters:
        return False
    for f in characters[char_id]['forms']:
        name_lower = f['name'].lower()
        if all(kw.lower() in name_lower for kw in keywords):
            return True
    return False

def get_form(char_id, keywords):
    if char_id not in characters:
        return None
    for f in characters[char_id]['forms']:
        name_lower = f['name'].lower()
        if all(kw.lower() in name_lower for kw in keywords):
            return f
    return None

# ============================================================
# VERIFICACIONES CRÍTICAS
# ============================================================
print("=" * 80)
print("VERIFICACIÓN FINAL DEL ROSTER V26")
print("=" * 80)

issues = []

# 1. Formas canónicas faltantes (fuzzy matching)
DB_CANON_FORMS = {
    "son-goku-saga-super-dragon-ball-super-732": [["super saiyan god"], ["super saiyan blue"], ["ultra instinto"]],
    "vegeta-saga-super-dragon-ball-super-454": [["super saiyan god"], ["super saiyan blue"], ["ultra ego"]],
    "son-gohan-saga-super-dragon-ball-super-39": [["super saiyan"], ["super saiyan 2"], ["ultimate"], ["beast"]],
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
}

for cid, required_groups in DB_CANON_FORMS.items():
    if cid in characters:
        for kw_group in required_groups:
            if not has_form(cid, kw_group):
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# 2. Power Scaling Cell Games - VERIFICACIONES CRÍTICAS
print("\n--- POWER SCALING CELL GAMES ---")
gohan_cell = characters.get('son-gohan-joven-saga-androides-cell-945')
cell_perfect = characters.get('cell-saga-androides-98')
goku_cell = characters.get('son-goku-saga-cell-saga-androides-459')
vegeta_cell = characters.get('vegeta-saga-cell-saga-androides-856')

if gohan_cell and cell_perfect:
    gohan_ssj1 = get_form('son-gohan-joven-saga-androides-cell-945', ['super saiyan'])
    cell_perfect_form = get_form('cell-saga-androides-98', ['perfecto'])
    if gohan_ssj1 and cell_perfect_form:
        diff = gohan_ssj1['ki'] - cell_perfect_form['ki']
        status = "OK" if diff > 0 else "ERROR"
        print(f"[{status}] Gohan SSJ1 ({gohan_ssj1['ki']:,.0f}) vs Cell Perfecto ({cell_perfect_form['ki']:,.0f}) diff={diff:,.0f}")

    gohan_ssj2 = get_form('son-gohan-joven-saga-androides-cell-945', ['super saiyan 2'])
    cell_sp = get_form('cell-saga-androides-98', ['super perfecto'])
    if gohan_ssj2 and cell_sp:
        diff = gohan_ssj2['ki'] - cell_sp['ki']
        status = "OK" if diff > 0 else "ERROR"
        print(f"[{status}] Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) vs Cell Super Perfecto ({cell_sp['ki']:,.0f}) diff={diff:,.0f}")

gohan_cell = characters.get('son-gohan-joven-saga-androides-cell-945')
goku_cell = characters.get('son-goku-saga-cell-saga-androides-459')
vegeta_cell = characters.get('vegeta-saga-cell-saga-androides-856')
if gohan_cell and goku_cell and vegeta_cell:
        gohan_ssj2 = get_form('son-gohan-joven-saga-androides-cell-945', ['super saiyan 2'])
        goku_ssj = get_form('son-goku-saga-cell-saga-androides-459', ['super saiyan'])
        vegeta_ssj = get_form('vegeta-saga-cell-saga-androides-856', ['super saiyan'])
        if gohan_ssj2 and goku_ssj:
            diff = gohan_ssj2['ki'] - goku_ssj['ki']
            status = "OK" if diff > 0 else "ERROR"
            print(f"[{status}] Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) vs Goku SSJ ({goku_ssj['ki']:,.0f}) diff={diff:,.0f}")
        if gohan_ssj2 and vegeta_ssj:
            if 'super vegeta' not in vegeta_ssj['name'].lower():
                diff = gohan_ssj2['ki'] - vegeta_ssj['ki']
                status = "OK" if diff > 0 else "ERROR"
                print(f"[{status}] Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) vs Vegeta SSJ ({vegeta_ssj['ki']:,.0f}) diff={diff:,.0f}")

# 3. Verificar multiplicadores SSJ consistentes
print("\n--- MULTIPLICADORES SSJ ---")
for cid, c in characters.items():
    base = c['base_ki']
    if base is None or base == 0:
        continue
    for f in c['forms']:
        if 'super saiyan' in f['name'].lower() and 'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and 'rose' not in f['name'].lower() and '4' not in f['name'].lower() and 'ikar' not in f['name'].lower():
            m = re.search(r'[\d\.]+', f['mult'].replace('×', 'x').replace('x', ''))
            if m:
                mult = float(m.group())
                name_lower = f['name'].lower()
                if '3' in f['name'] or 'ssj3' in f['name'].lower():
                    if abs(mult - 400) > 50:
                        print(f"[MULT_SSJ3] {cid}: '{f['name']}' mult={mult}x (esperado ~400x)")
                elif '2' in f['name'] or 'ssj2' in f['name'].lower() or '2do grado' in f['name'].lower() or 'grado 2' in f['name'].lower():
                    if abs(mult - 100) > 30 and abs(mult - 65) > 15:
                        print(f"[MULT_SSJ2] {cid}: '{f['name']}' mult={mult}x (esperado ~100x o ~65x Grado 2)")
                elif 'super saiyan' in f['name'].lower() and '2' not in f['name'] and '3' not in f['name']:
                    if abs(mult - 50) > 10:
                        print(f"[MULT_SSJ1] {cid}: '{f['name']}' mult={mult}x (esperado ~50x)")

# 4. Verificar orden de Ki ascendente
print("\n--- ORDEN KI ASCENDENTE ---")
for cid, c in characters.items():
    prev_ki = -1
    for f in c['forms']:
        if f['ki'] is not None and f['ki'] < prev_ki:
            print(f"[ORDEN_KI] {cid}: '{f['name']}' Ki={f['ki']:,.0f} < anterior {prev_ki:,.0f}")
        if f['ki'] is not None:
            prev_ki = f['ki']

# 5. Verificar Goku/Vegeta Buu vs Cell coherencia temporal
print("\n--- COHERENCIA TEMPORAL BUU vs CELL ---")
goku_buu = characters.get('son-goku-saga-buu-saga-buu-646')
goku_cell = characters.get('son-goku-saga-cell-saga-androides-459')
vegeta_buu = characters.get('vegeta-saga-buu-saga-buu-213')
vegeta_cell = characters.get('vegeta-saga-cell-saga-androides-856')

if goku_buu and goku_cell:
    print(f"Goku Buu base: {goku_buu['base_ki']:,.0f} vs Cell base: {goku_cell['base_ki']:,.0f} {'OK (Buu > Cell)' if goku_buu['base_ki'] > goku_cell['base_ki'] else 'ERROR (Cell >= Buu)'}")
if vegeta_buu and vegeta_cell:
    print(f"Vegeta Buu base: {vegeta_buu['base_ki']:,.0f} vs Cell base: {vegeta_cell['base_ki']:,.0f} {'OK (Buu > Cell)' if vegeta_buu['base_ki'] > vegeta_cell['base_ki'] else 'ERROR (Cell >= Buu)'}")

print("\n" + "="*80)
print("VERIFICACIÓN COMPLETADA")