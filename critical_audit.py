import re, json

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
            forms.append({'idx': int(idx), 'name': name.strip(), 'ki': parse_ki(ki_str), 'mult': mult_str.strip(), 'tier': tier.strip(), 'apex': 'Apex' in apex})
        continue
    if in_table and not line.strip().startswith("|"):
        in_table = False
        continue

if current_char:
    characters[current_char] = {'tier': base_tier, 'base_ki': base_ki, 'forms': forms}

# ============================================================
# REGLAS DE VALIDACIÓN REALES (no VS Battles)
# ============================================================
issues = []

# 1. Personajes SIN forma base clara
for cid, c in characters.items():
    if not c['forms']:
        issues.append(f"[SIN_FORMAS] {cid}: Sin formas definidas")
        continue
    first_form = c['forms'][0]['name']
    base_keywords = ['base', 'estado base', 'inicial', 'normal']
    if not any(kw in first_form.lower() for kw in base_keywords):
        issues.append(f"[SIN_BASE] {cid}: Primera forma '{first_form}' no parece forma base")

# 2. Orden ascendente de Ki
for cid, c in characters.items():
    prev_ki = -1
    for f in c['forms']:
        if f['ki'] is not None and f['ki'] < prev_ki:
            issues.append(f"[ORDEN_KI] {cid}: '{f['name']}' Ki={f['ki']:,.0f} < anterior {prev_ki:,.0f}")
        if f['ki'] is not None:
            prev_ki = f['ki']

# 3. Multiplicadores inconsistentes (base * mult != ki_forma)
for cid, c in characters.items():
    base = c['base_ki']
    if base is None or base == 0:
        continue
    for f in c['forms']:
        if f['ki'] is None:
            continue
        mult_match = re.search(r'[\d\.]+', f['mult'].replace('×', 'x').replace('x', ''))
        if mult_match:
            mult = float(mult_match.group())
            expected = base * mult
            actual = f['ki']
            if expected > 0 and abs(actual - expected) / expected > 0.15:  # 15% tolerancia
                issues.append(f"[MULT_INCONSISTENTE] {cid}: '{f['name']}' base={base:,.0f}×{mult}={base*mult:,.0f} vs ki={actual:,.0f}")

# 3b. Verificar consistencia de multiplicadores entre formas similares
for cid, c in characters.items():
    base = c['base_ki']
    if base is None or base == 0:
        continue
    ssj_forms = [f for f in c['forms'] if 'super saiyan' in f['name'].lower() and 'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and 'rose' not in f['name'].lower() and '4' not in f['name'].lower()]
    if len(ssj_forms) >= 2:
        mults = []
        for f in ssj_forms:
            m = re.search(r'[\d\.]+', f['mult'].replace('×', 'x').replace('x', ''))
            if m:
                mults.append((f['name'], float(m.group())))
        # Verificar que SSJ1 ~50x, SSJ2 ~100x, SSJ3 ~400x
        for name, mult in mults:
            name_lower = name.lower()
            if 'super saiyan 3' in name_lower or 'ssj3' in name_lower:
                if abs(mult - 400) > 50:
                    issues.append(f"[MULT_SSJ3] {cid}: '{name}' mult={mult}x (esperado ~400x)")
            elif 'super saiyan 2' in name_lower or 'ssj2' in name_lower or '2do grado' in name_lower:
                if abs(mult - 100) > 30 and abs(mult - 65) > 15 and abs(mult - 150) > 30:
                    issues.append(f"[MULT_SSJ2] {cid}: '{name}' mult={mult}x (esperado ~100x o ~65x Grado 2)")
            elif 'super saiyan 1' in name_lower or 'ssj1' in name_lower or name_lower.strip() == 'super saiyan':
                if abs(mult - 50) > 10:
                    issues.append(f"[MULT_SSJ1] {cid}: '{name}' mult={mult}x (esperado ~50x)")

# 4. Formas canónicas faltantes en personajes principales DB
DB_CANON_FORMS = {
    "son-goku-saga-super-dragon-ball-super-732": ["Super Saiyan God", "Super Saiyan Blue", "Ultra Instinto"],
    "vegeta-saga-super-dragon-ball-super-454": ["Super Saiyan God", "Super Saiyan Blue", "Ultra Ego"],
    "son-gohan-saga-super-dragon-ball-super-39": ["Super Saiyan", "Super Saiyan 2", "Ultimate", "Beast"],
    "vegeta-saga-cell-saga-androides-856": ["Super Saiyan", "Super Vegeta"],
    "son-goku-saga-cell-saga-androides-459": ["Super Saiyan", "Super Saiyan Full Power"],
    "vegeta-saga-cell-saga-androides-856": ["Super Saiyan", "Super Vegeta"],
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
                issues.append(f"[FORMA_FALTANTE] {cid}: Falta forma canónica '{req}'")

# 5. Duplicados de Ki (solo si no son legítimos)
for cid, c in characters.items():
    kis_seen = {}
    for f in c['forms']:
        if f['ki'] is None:
            continue
        if f['ki'] in kis_seen:
            # Legítimo si es misma forma con nombre diferente o forma base = forma transformada x1
            prev = kis_seen[f['ki']]
            if f['mult'] != '×1' and prev['mult'] != '×1':
                issues.append(f"[DUP_KI] {cid}: Ki={f['ki']:,.0f} en '{f['name']}' y '{prev['name']}'")
        kis_seen[f['ki']] = f

# 6. Personajes sin forma base clara
for cid, c in characters.items():
    if not c['forms']:
        issues.append(f"[SIN_FORMAS] {cid}: Sin formas")
        continue
    first = c['forms'][0]['name'].lower()
    if not any(kw in first for kw in ['base', 'estado base', 'inicial', 'normal']):
        issues.append(f"[SIN_BASE] {cid}: Primera forma '{c['forms'][0]['name']}' no indica base")

# 7. Personajes sin tier o ki
for cid, c in characters.items():
    if not c['tier']:
        issues.append(f"[SIN_TIER] {cid}: Sin tier base")
    if c['base_ki'] is None:
        issues.append(f"[SIN_KI] {cid}: Sin base Ki")

# 8. Verificar formas canónicas específicas de DB
# Goku Super: SSG, SSB, UI Señal, UI Dominado
# Vegeta Super: SSG, SSB, SSBE, Ultra Ego
# Gohan Super: SSJ, SSJ2, Ultimate, Beast
# Freezer DBS: Golden
# Broly DBS: Ikari, SSJ, Legendario
# Piccolo SH: Orange Piccolo
# Gotenks: SSJ3
# Trunks Futuro v2: SSJ Grado 3
# Vegeta Majin: SSJ2, Final Explosion
# Vegetto Buu: Super Vegetto
# Gotenks Buu: SSJ3
# Trunks Futuro v2: SSJ Grado 3

# 9. Verificar que Gohan SSJ1 > Cell Perfecto, Gohan SSJ2 > Cell Super Perfecto
gohan_cell = characters.get('son-gohan-joven-saga-androides-cell-945')
cell_perfect = characters.get('cell-saga-androides-98')
if gohan_cell and cell_perfect:
    gohan_ssj1 = next((f for f in gohan_cell['forms'] if 'super saiyan' in f['name'].lower() and '2' not in f['name'].lower()), None)
    cell_perfect_form = next((f for f in cell_perfect['forms'] if 'perfecto' in f['name'].lower() and 'super' not in f['name'].lower()), None)
    if gohan_ssj1 and cell_perfect_form:
        if gohan_ssj1['ki'] <= cell_perfect_form['ki']:
            issues.append(f"[POWER_SCALING] Gohan SSJ1 ({gohan_ssj1['ki']:,.0f}) <= Cell Perfecto ({cell_perfect_form['ki']:,.0f}) - DEBE SER MAYOR")
    gohan_ssj2 = next((f for f in gohan_cell['forms'] if '2' in f['name'] or 'ssj2' in f['name'].lower()), None)
    cell_sp = next((f for f in cell_perfect['forms'] if 'super perfecto' in f['name'].lower()), None)
    if gohan_ssj2 and cell_sp:
        if gohan_ssj2['ki'] <= cell_sp['ki']:
            issues.append(f"[POWER_SCALING] Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) <= Cell Super Perfecto ({cell_sp['ki']:,.0f}) - DEBE SER MAYOR")

# 8. Verificar que Gohan SSJ2 > Goku/Vegeta SSJ en Cell
goku_cell = characters.get('son-goku-saga-cell-saga-androides-459')
vegeta_cell = characters.get('vegeta-saga-cell-saga-androides-856')
if gohan_cell and goku_cell and vegeta_cell:
    gohan_ssj2 = next((f for f in gohan_cell['forms'] if '2' in f['name'] or 'ssj2' in f['name'].lower()), None)
    goku_ssj = next((f for f in goku_cell['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower() and 'god' not in f['name'].lower() and 'blue' not in f['name'].lower()), None)
    vegeta_ssj = next((f for f in vegeta_cell['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'].lower()), None)
    if gohan_ssj2 and goku_ssj:
        if gohan_ssj2['ki'] <= goku_ssj['ki']:
            issues.append(f"[POWER_SCALING] Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) <= Goku SSJ ({goku_ssj['ki']:,.0f}) - DEBE SER MAYOR")
    if gohan_ssj2 and vegeta_ssj:
        if gohan_ssj2['ki'] <= vegeta_ssj['ki']:
            issues.append(f"[POWER_SCALING] Gohan SSJ2 ({gohan_ssj2['ki']:,.0f}) <= Vegeta SSJ ({vegeta_ssj['ki']:,.0f}) - DEBE SER MAYOR")

# REPORTAR
print("=" * 80)
print("REVISIÓN CRÍTICA DEL ROSTER - ERRORES REALES")
print("=" * 80)

by_type = {}
for issue in issues:
    tag = issue.split(']')[0] + ']'
    by_type.setdefault(tag, []).append(issue)

for tag, items in sorted(by_type.items(), key=lambda x: -len(x[1])):
    print(f"\n{tag} ({len(items)}):")
    for item in items[:15]:
        print(f"  {item}")
    if len(items) > 15:
        print(f"  ... y {len(items)-15} más")

print(f"\n{'='*80}")
print(f"TOTAL ISSUES REALES: {len(issues)}")