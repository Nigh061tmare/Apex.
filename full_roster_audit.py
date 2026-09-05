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

print(f"Total personajes: {len(characters)}")
print(f"Total formas: {sum(len(c['forms']) for c in characters.values())}")

# ============================================================
# REGLAS DE VALIDACIÓN
# ============================================================
issues = []

# 1. Personajes SIN forma base (idx 1 no es "Estado Base" o similar)
for cid, c in characters.items():
    if not c['forms']:
        issues.append(f"[SIN_FORMAS] {cid}: Sin formas definidas")
        continue
    first_form = c['forms'][0]['name']
    base_keywords = ['base', 'estado base', 'base ', 'normal', 'inicial']
    if not any(kw in first_form.lower() for kw in base_keywords):
        issues.append(f"[SIN_BASE] {cid}: Primera forma '{c['forms'][0]['name']}' no parece forma base")

# 2. Formas sin orden ascendente de Ki
for cid, c in characters.items():
    prev_ki = -1
    for f in c['forms']:
        if f['ki'] is not None and f['ki'] < prev_ki:
            issues.append(f"[ORDEN_KI] {cid}: Forma '{f['name']}' Ki={f['ki']:.0f} < anterior {prev_ki:.0f}")
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
        # Extraer multiplicador
        mult_match = re.search(r'[\d\.]+', f['mult'].replace('×', 'x').replace('x', ''))
        if mult_match:
            mult = float(mult_match.group())
            expected = base * mult
            actual = f['ki']
            if expected > 0 and abs(actual - expected) / expected > 0.1:  # 10% tolerancia
                issues.append(f"[MULT_INCONSISTENTE] {cid}: '{f['name']}' base={base:,.0f}×{mult}={expected:,.0f} vs ki={actual:,.0f}")

# 4. Tiers inconsistentes con Ki (usando rangos VS Battles aproximados)
TIER_RANGES = {
    "10-C": (0, 10), "10-B": (10, 100), "10-A": (100, 1000),
    "9-C": (1000, 10000), "9-B": (10000, 100000), "9-A": (100000, 1000000),
    "8-C": (1e6, 1e7), "High 8-C": (1e7, 1e8), "8-B": (1e8, 1e9), "8-A": (1e9, 1e10),
    "Low 7-C": (1e10, 1e11), "7-C": (1e11, 1e12), "High 7-C": (1e12, 1e13),
    "Low 7-B": (1e13, 1e14), "7-B": (1e14, 1e15), "7-A": (1e15, 1e16), "High 7-A": (1e16, 1e17),
    "6-C": (1e17, 1e18), "High 6-C": (1e18, 1e19), "Low 6-B": (1e19, 1e20), "6-B": (1e20, 1e21), "High 6-B": (1e21, 1e22),
    "6-A": (1e22, 1e23), "High 6-A": (1e23, 1e24), "5-C": (1e24, 1e25), "Low 5-B": (1e25, 1e26),
    "5-B": (1e26, 1e27), "5-A": (1e27, 1e28), "High 5-A": (1e28, 1e29),
    "Low 4-C": (1e29, 1e30), "4-C": (1e30, 1e31), "High 4-C": (1e31, 1e32),
    "4-B": (1e32, 1e33), "4-A": (1e33, 1e34), "3-C": (1e34, 1e35), "3-B": (1e35, 1e36), "3-A": (1e36, 1e37),
    "High 3-A": (1e37, 1e38), "Low 2-C": (1e38, 1e39), "2-C": (1e39, 1e40), "2-B": (1e40, 1e41), "2-A": (1e41, 1e42),
    "Low 1-C": (1e42, 1e43), "1-C": (1e43, 1e44),
}

def tier_to_range(tier):
    return TIER_RANGES.get(tier, (0, float('inf')))

for cid, c in characters.items():
    base_ki = c['base_ki']
    tier = c['tier']
    if base_ki and tier in TIER_RANGES:
        lo, hi = TIER_RANGES[tier]
        if not (lo <= base_ki <= hi):
            issues.append(f"[TIER_KI_MISMATCH] {cid}: Base Ki={base_ki:,.0f} fuera de rango tier {tier} [{lo:,.0f}-{hi:,.0f}]")
    for f in c['forms']:
        if f['ki'] and f['tier'] in TIER_RANGES:
            lo, hi = TIER_RANGES[f['tier']]
            if not (lo <= f['ki'] <= hi):
                issues.append(f"[TIER_KI_MISMATCH_FORM] {cid}: '{f['name']}' Ki={f['ki']:,.0f} tier={f['tier']} fuera de rango [{lo:,.0f}-{hi:,.0f}]")

# 5. Personajes DB principales: verificar formas canónicas faltantes
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
}

for cid, required in DB_CANON_FORMS.items():
    if cid in characters:
        form_names = [f['name'].lower() for f in characters[cid]['forms']]
        for req in required:
            if not any(req.lower() in n for n in form_names):
                issues.append(f"[FORMA_FALTANTE] {cid}: Falta forma canónica '{req}'")

# 6. Duplicados de formas (mismo nombre o ki muy similar)
for cid, c in characters.items():
    names_seen = set()
    kis_seen = set()
    for f in c['forms']:
        name_key = f['name'].lower().strip()
        if name_key in names_seen:
            issues.append(f"[DUPLICADO_NOMBRE] {cid}: Forma duplicada '{f['name']}'")
        names_seen.add(name_key)
        if f['ki'] and f['ki'] in kis_seen:
            issues.append(f"[DUPLICADO_KI] {cid}: Ki duplicado {f['ki']:,.0f} en '{f['name']}'")
        if f['ki']:
            kis_seen.add(f['ki'])

# 7. Personajes con tier incoherente entre base y formas
for cid, c in characters.items():
    base_tier = c['tier']
    for f in c['forms']:
        if f['tier'] and f['tier'] != base_tier:
            # Las formas SÍ deben tener tier diferente (es normal)
            pass

# 8. Personajes sin tier o ki en base
for cid, c in characters.items():
    if not c['tier']:
        issues.append(f"[SIN_TIER] {cid}: Sin tier base")
    if c['base_ki'] is None:
        issues.append(f"[SIN_KI] {cid}: Sin base Ki")

# ============================================================
# REPORTAR
# ============================================================
print("=" * 80)
print("REVISIÓN EXHAUSTIVA DEL ROSTER")
print("=" * 80)

by_type = {}
for issue in issues:
    tag = issue.split(']')[0] + ']'
    by_type.setdefault(tag, []).append(issue)

for tag, items in sorted(by_type.items(), key=lambda x: -len(x[1])):
    print(f"\n{tag} ({len(items)}):")
    for item in items[:10]:  # mostrar max 10 por tipo
        print(f"  {item}")
    if len(items) > 10:
        print(f"  ... y {len(items)-10} más")

print(f"\n{'='*80}")
print(f"TOTAL ISSUES: {len(issues)}")
print(f"Personajes: {len(characters)} | Formas totales: {sum(len(c['forms']) for c in characters.values())}")