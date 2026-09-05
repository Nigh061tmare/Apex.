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

# ============================================================
# VERIFICACIONES CRÍTICAS ESPECÍFICAS
# ============================================================
critical_issues = []

# 1. Verificar formas canónicas faltantes en personajes principales
DB_CANON_FORMS = {
    "son-goku-saga-super-dragon-ball-super-732": ["Super Saiyan God", "Super Saiyan Blue", "Ultra Instinto"],
    "vegeta-saga-super-dragon-ball-super-454": ["Super Saiyan God", "Super Saiyan Blue", "Ultra Ego"],
    "son-gohan-saga-super-dragon-ball-super-39": ["Super Saiyan", "Super Saiyan 2", "Ultimate", "Beast"],
    "vegeta-saga-cell-saga-androides-856": ["Super Saiyan", "Super Vegeta"],
    "son-goku-saga-cell-saga-androides-459": ["Super Saiyan", "Super Saiyan Full Power"],
    "son-gohan-joven-saga-androides-cell-945": ["Super Saiyan", "Super Saiyan 2"],
    "freezer-resurreccion-f": ["Golden Freezer"],
    "broly-dbs-dragon-ball-super-172": ["Ikari", "Super Saiyan", "Legendario"],
    "piccolo-dbs-superhero": ["Orange Piccolo"],
    "vegeta-majin-ssj2-895": ["Super Saiyan 2", "Final Explosion"],
    "vegetto-base-saga-buu-120": ["Super Vegetto"],
    "gotenks-base-saga-buu-858": ["Super Saiyan 3"],
    "trunks-futuro-v2-armadura-grados": ["Super Saiyan Grado 3"],
}

for cid, required in DB_CANON_FORMS.items():
    if cid in characters:
        form_names = [f['name'].lower() for f in characters[cid]['forms']]
        for req in required:
            if not any(req.lower() in n for n in form_names):
                print(f"[FORMA_FALTANTE] {cid}: Falta forma canónica '{req}'")

# 2. Verificar power scaling crítico Cell Games
gohan_cell = characters.get('son-gohan-joven-saga-androides-cell-945')
cell_perfect = characters.get('cell-saga-androides-98')
goku_cell = characters.get('son-goku-saga-cell-saga-androides-459')
vegeta_cell = characters.get('vegeta-saga-cell-saga-androides-856')

if gohan_cell and cell_perfect:
    gohan_ssj1 = next((f for f in gohan_cell['forms'] if 'super saiyan' in f['name'].lower() and '2' not in f['name'].lower()), None)
    cell_perfect_form = next((f for f in cell_perfect['forms'] if 'perfecto' in f['name'].lower() and 'super' not in f['name'].lower()), None)
    if gohan_ssj1 and cell_perfect_form:
        if gohan_ssj1['ki'] > cell_perfect_form['ki']:
            print(f"✅ Gohan SSJ1 ({gohan_ssj1['ki']:,.0f}) > Cell Perfecto ({cell_perfect_form['ki']:,.0f})")
        else:
            print(f"❌ Gohan SSJ1 ({gohan_ssj1['ki']:,.0f}) <= Cell Perfecto ({cell_perfect_form['ki']:,.0f})")

    gohan_ssj2 = next((f for f in gohan_cell['forms'] if '2' in f['name'] or 'ssj2' in f['name'].lower()), None)
    cell_sp = next((f for f in cell_perfect['forms'] if 'super perfecto' in f['name'].lower()), None)
    if gohan_ssj2 and cell_sp:
        if gohan_ssj2['ki'] > cell_sp['ki']:
            print(f"✅ Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) > Cell Super Perfecto ({cell_sp['ki']:,.0f})")
        else:
            print(f"❌ Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) <= Cell Super Perfecto ({cell_sp['ki']:,.0f})")

if gohan_cell and goku_cell and vegeta_cell:
    gohan_ssj2 = next((f for f in gohan_cell['forms'] if '2' in f['name'] or 'ssj2' in f['name'].lower()), None)
    goku_ssj = next((f for f in goku_cell['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower() and 'god' not in f['name'].lower() and 'blue' not in f['name'].lower()), None)
    vegeta_ssj = next((f for f in vegeta_cell['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'].lower()), None)
    if gohan_ssj2 and goku_ssj:
        if gohan_ssj2['ki'] > goku_ssj['ki']:
            print(f"✅ Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) > Goku SSJ ({goku_ssj['ki']:,.0f})")
        else:
            print(f"❌ Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) <= Goku SSJ ({goku_ssj['ki']:,.0f})")
    if gohan_ssj2 and vegeta_ssj:
        if gohan_ssj2['ki'] > vegeta_ssj['ki']:
            print(f"✅ Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) > Vegeta SSJ ({vegeta_ssj['ki']:,.0f})")
        else:
            print(f"❌ Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) <= Vegeta SSJ ({vegeta_ssj['ki']:,.0f})")

# 3. Verificar multiplicadores SSJ consistentes
for cid, c in characters.items():
    base = c['base_ki']
    if base is None or base == 0:
        continue
    ssj_forms = [f for f in c['forms'] if 'super saiyan' in f['name'].lower() and 'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and 'rose' not in f['name'].lower() and '4' not in f['name'].lower() and 'ikar' not in f['name'].lower()]
    for f in c['forms']:
        if 'super saiyan' in f['name'].lower() and 'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and 'rose' not in f['name'].lower() and '4' not in f['name'].lower() and 'ikar' not in f['name'].lower():
            m = re.search(r'[\d\.]+', f['mult'].replace('×', 'x').replace('x', ''))
            if m:
                mult = float(mult_match.group()) if (mult_match := re.search(r'[\d\.]+', f['mult'].replace('×', 'x').replace('x', ''))) else None
                if mult:
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

print("\n✅ Verificaciones completadas")