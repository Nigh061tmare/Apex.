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
            forms.append({
                'idx': int(idx), 'name': name.strip(),
                'ki': parse_ki(ki_str), 'fmt_ki': fmt_ki.strip(),
                'mult': mult_str.strip(), 'tier': tier.strip(),
                'apex': apex.strip() == 'Si' or 'Apex' in apex
            })
        continue
    if in_table and not line.strip().startswith("|"):
        in_table = False

if current_char:
    characters[current_char] = {'tier': base_tier, 'base_ki': base_ki, 'forms': forms}

# Check critical DB characters for missing canonical forms
print("=== REVISION CRITICA: PERSONAJES DB PRINCIPALES ===\n")

checks = {
    # Goku Z/Super
    "son-goku-23-tenkaichi": {
        "required": ["Estado Base", "Sin Ropa Pesada"],
        "check_ki": {"Estado Base": 389, "Sin Ropa Pesada": 505.7}
    },
    "son-goku-llegada-dbz-saga-saiyan-169": {
        "required": ["Estado Base", "Kaioken x2", "Kaioken x3", "Kaioken x4"],
        "check_ki": {"Estado Base": 8400, "Kaioken x2": 16800, "Kaioken x3": 25200, "Kaioken x4": 33600}
    },
    "son-goku-saga-namek-saga-namek-176": {
        "required": ["Estado Base", "Kaioken x10", "Kaioken x20", "Super Saiyajin 1"],
        "check_ki": {"Estado Base": 3150000, "Kaioken x10": 31500000, "Kaioken x20": 63000000, "Super Saiyajin 1": 157500000}
    },
    "son-goku-saga-cell-saga-androides-459": {
        "required": ["Estado Base", "Super Saiyan 1", "Super Saiyan Full Power"],
        "check_ki": {"Estado Base": 150000000, "Super Saiyan 1": 7500000000, "Super Saiyan Full Power": 7500000000}
    },
    "son-goku-saga-buu-saga-buu-646": {
        "required": ["Estado Base", "Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 3"],
        "check_ki": {"Estado Base": 75000000, "Super Saiyan 1": 3750000000, "Super Saiyan 2": 7500000000, "Super Saiyan 3": 30000000000}
    },
    "son-goku-saga-super-dragon-ball-super-732": {
        "required": ["Estado Base", "Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 3", "Super Saiyan God", "Super Saiyan Blue", "SSGSS Kaioken x20", "Ultra Instinto Senal", "Ultra Instinto Dominado"],
        "check_ki": {"Estado Base": 82000000, "Super Saiyan 1": 4100000000, "Super Saiyan 2": 8200000000, "Super Saiyan 3": 32800000000, "Super Saiyan God": 524800000000, "Super Saiyan Blue": 631400000000, "SSGSS Kaioken x20": 1262800000000, "Ultra Instinto Senal": 2460000000000, "Ultra Instinto Dominado": 4920000000000}
    },
    # Vegeta Z/Super
    "vegeta-llegada-a-la-tierra-saga-saiyan-504": {
        "required": ["Estado Base", "Oozaru"],
        "check_ki": {"Estado Base": 18900, "Oozaru": 189000}
    },
    "vegeta-saga-namek-saga-namek-783": {
        "required": ["Estado Base", "Zenkai Elite"],
        "check_ki": {"Estado Base": 404250, "Zenkai Elite": 727650}
    },
    "vegeta-saga-cell-saga-androides-856": {
        "required": ["Estado Base", "Super Saiyajin", "Super Vegeta"],
        "check_ki": {"Estado Base": 160000000, "Super Saiyajin": 8000000000, "Super Vegeta": 10400000000}
    },
    "vegeta-saga-buu-saga-buu-213": {
        "required": ["Estado Base", "Super Saiyan 1", "Super Saiyan 2", "Majin Vegeta"],
        "check_ki": {"Estado Base": 70000000, "Super Saiyan 1": 3500000000, "Super Saiyan 2": 7000000000, "Majin Vegeta": 7000000000}
    },
    "vegeta-saga-super-dragon-ball-super-454": {
        "required": ["Estado Base", "Super Saiyan", "Super Saiyan 2", "Super Saiyan 3", "Super Saiyan God", "Super Saiyan Blue", "Super Saiyan Blue Evolution", "Ultra Ego"],
        "check_ki": {"Estado Base": 80000000, "Super Saiyan": 4000000000, "Super Saiyan 2": 8000000000, "Super Saiyan 3": 32000000000, "Super Saiyan God": 512000000000, "Super Saiyan Blue": 616000000000, "Super Saiyan Blue Evolution": 6160000000000, "Ultra Ego": 8000000000000}
    },
    # Gohan
    "son-gohan-joven-saga-androides-cell-945": {
        "required": ["Estado Base", "Super Saiyajin", "Super Saiyajin 2"],
        "check_ki": {"Estado Base": 12000000, "Super Saiyajin": 600000000, "Super Saiyajin 2": 1200000000}
    },
    "son-gohan-saga-super-dragon-ball-super-39": {
        "required": ["Estado Base", "Super Saiyan", "Super Saiyan 2", "Ultimate Gohan", "Gohan Beast"],
        "check_ki": {"Estado Base": 57000000, "Super Saiyan": 2850000000, "Super Saiyan 2": 5700000000, "Ultimate Gohan": 77000000000, "Gohan Beast": 77000000000000}
    },
    # Piccolo
    "piccolo-saga-saiyan": {
        "required": ["Ropa Pesada", "Sin Ropa Pesada", "Makankosappo", "Rafaga Maxima", "Escudo Sacrificial"],
        "check_ki": {"Ropa Pesada": 3675, "Sin Ropa Pesada": 4961.25, "Makankosappo": 10547.25, "Rafaga Maxima": 12642, "Escudo Sacrificial": 12862.5}
    },
    "piccolo-saga-saiyan-namek-saga-saiyan-967": {
        "required": ["Piccolo Base", "Modo Asimilacion Nail", "Estado Definitivo"],
        "check_ki": {"Piccolo Base": 1365000, "Modo Asimilacion Nail": 4095000, "Estado Definitivo": 13650000}
    },
    "piccolo-saga-cell-buu-saga-androides-946": {
        "required": ["Guerrero Namekiano Base", "Fusion con Nail", "Super Namekiano"],
        "check_ki": {"Guerrero Namekiano Base": 378000000, "Fusion con Nail": 604800000, "Super Namekiano": 18900000000}
    },
    "piccolo-dbs-superhero": {
        "required": ["Estado Base", "Potential Unleashed", "Orange Piccolo", "Giant Orange Piccolo"],
        "check_ki": {"Estado Base": 1400000000, "Potential Unleashed": 1890000000, "Orange Piccolo": 14000000000000, "Giant Orange Piccolo": 14000000000000}
    },
    # Freezer
    "freezer-saga-namek-saga-namek-167": {
        "required": ["1 Forma", "2 Forma", "3 Forma", "Forma Final 50%", "Forma Final 100%"],
        "check_ki": {"1 Forma": 556500, "2 Forma": 1113000, "3 Forma": 2226000, "Forma Final 50%": 66780000, "Forma Final 100%": 66780000}
    },
    "freezer-resurreccion-f": {
        "required": ["1 Forma", "Forma Final", "Golden Freezer"],
        "check_ki": {"1 Forma": 1312500000, "Forma Final": 65625000000, "Golden Freezer": 328125000000}
    },
    "mecha-freezer-saga-androides-514": {
        "required": ["Cuerpo Cibernetico", "Supernova"],
        "check_ki": {"Cuerpo Cibernetico": 163800000, "Supernova": 245700000}
    },
    # Cell
    "cell-saga-androides-98": {
        "required": ["Estado Base", "Cell Imperfecto", "Cell Semi-Perfecto", "Cell Perfecto", "Cell Super Perfecto"],
        "check_ki": {"Estado Base": 1428000000, "Cell Imperfecto": 1927800000, "Cell Semi-Perfecto": 5712000000, "Cell Perfecto": 28560000000, "Cell Super Perfecto": 142800000000}
    },
    # Majin Buu
    "kid-buu-saga-buu-907": {
        "required": ["Estado Base"],
        "check_ki": {"Estado Base": 33600000000}
    },
    "super-buu-saga-buu-69": {
        "required": ["Estado Base", "Buuccolo", "Buutenks", "Buuhan"],
        "check_ki": {"Estado Base": 39900000000, "Buuccolo": 47880000000, "Buutenks": 79800000000, "Buuhan": 99750000000}
    },
    "buuhan-majin-901": {
        "required": ["Estado Base", "Buuhan Poder Verdadero", "Forma Buuhan", "Absorcion Tactica"],
        "check_ki": {"Estado Base": 100800000000, "Buuhan Poder Verdadero": 126000000000, "Forma Buuhan": 136080000000, "Absorcion Tactica": 141120000000}
    },
    "majin-buu-gordo-saga-buu-604": {
        "required": ["Estado Base", "Evil Buu"],
        "check_ki": {"Estado Base": 21000000000, "Evil Buu": 29400000000}
    },
    # Vegetto
    "vegetto-base-saga-buu-120": {
        "required": ["Vegetto Base", "Super Vegetto"],
        "check_ki": {"Vegetto Base": 100000000000, "Super Vegetto": 5000000000000}
    },
    # Gotenks
    "gotenks-base-saga-buu-858": {
        "required": ["Estado Base", "Super Saiyan 3"],
        "check_ki": {"Estado Base": 46200000000, "Super Saiyan 3": 18480000000000}
    },
    # Trunks
    "trunks-futuro-v1-espada-ssj-basico": {
        "required": ["Estado Base", "Super Saiyan"],
        "check_ki": {"Estado Base": 252000000, "Super Saiyan": 12600000000}
    },
    "trunks-futuro-v2-armadura-grados": {
        "required": ["Estado Base", "Super Saiyan", "Super Saiyan Grado 2", "Super Saiyan Grado 3"],
        "check_ki": {"Estado Base": 280000000, "Super Saiyan": 14000000000, "Super Saiyan Grado 2": 18200000000, "Super Saiyan Grado 3": 23800000000}
    },
    "trunks-futuro-v3-saga-buu-ssj2": {
        "required": ["Estado Base", "Super Saiyan 1", "Super Saiyan Perfeccionado", "Super Saiyan 2"],
        "check_ki": {"Estado Base": 15225000, "Super Saiyan 1": 761250000, "Super Saiyan Perfeccionado": 761250000, "Super Saiyan 2": 1522500000}
    },
    "trunks-futuro-v4-manga-super-zamasu": {
        "required": ["Estado Base", "Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 2 Potenciado"],
        "check_ki": {"Estado Base": 42525000000, "Super Saiyan 1": 2126250000000, "Super Saiyan 2": 4252500000000, "Super Saiyan 2 Potenciado": 17010000000000}
    },
}

errors = 0
warnings = 0

for char_id, spec in checks.items():
    char = characters.get(char_id)
    if not char:
        print(f"[FALTANTE] {char_id} - NO EXISTE EN ROSTER")
        errors += 1
        continue
    
    form_names = [f['name'] for f in char['forms']]
    
    def find_form(req, names):
        req_lower = req.lower()
        for n in names:
            n_lower = n.lower()
            if req_lower in n_lower:
                return n
            # Fuzzy: split into keywords
            req_words = req_lower.split()
            if all(w in n_lower for w in req_words):
                return n
        return None
    
    # Check required forms
    for req in spec['required']:
        matched = match_form(req, form_names)
        if not matched:
            print(f"[FALTA] {char_id}: FALTA forma requerida '{req}'")
            errors += 1
    
# Check Ki values
    for req, expected_ki in spec.get('check_ki', {}).items():
        matched = match_form(req, form_names)
        if matched:
            match_form = next(f for f in char['forms'] if f['name'] == matched)
            actual_ki = match_form['ki']
            if abs(actual_ki - expected_ki) > max(1, expected_ki * 0.05):  # 5% tolerance
                print(f"[WARN] {char_id}: '{matched}' Ki={actual_ki:,.0f} (esperado ~{expected_ki:,.0f})")
                warnings += 1
        else:
            print(f"[?] {char_id}: No se encontro forma para '{req}' (esperado Ki={expected_ki:,.0f})")

print(f"\n=== RESUMEN ===")
print(f"Errores (formas faltantes): {errors}")
print(f"Advertencias (Ki discrepante): {warnings}")
print(f"Total personajes revisados: {len(checks)}")