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

def find_form(char_id, keywords_all):
    if char_id not in characters:
        return None
    for f in characters[char_id]['forms']:
        name_lower = f['name'].lower()
        if all(kw.lower() in name_lower for kw in keywords_all):
            return f
    return None

print("=" * 80)
print("AUDITORÍA FINAL - ROSTER V26")
print("=" * 80)

# ============================================================
# 1. FORMAS CANÓNICAS FALTANTES (fuzzy matching flexible)
# ============================================================
DB_CANON_FORMS = {
    "son-goku-saga-super-dragon-ball-super-732": [["super saiyan god"], ["super saiyan blue"], ["ultra instinto"], ["ultra instinto se\u00f1al"], ["ultra instinto dominado"]],
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
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in name_lower for kw in kw_group):
                    found = True
                    break
            if not found:
                print("[FORMA_FALTANTE] {}: Falta forma con keywords {}".format(cid, kw_group))

# ============================================================
# 2. MULTIPLICADORES SSJ (solo estándar, no legendarios/legendarios)
# ============================================================
print("\n--- MULTIPLICADORES SSJ (solo estándar) ---")
for cid, c in characters.items():
    base = c['base_ki']
    if base is None or base == 0:
        continue
    for f in c['forms']:
        if 'super saiyan' in f['name'].lower() and 'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and 'rose' not in f['name'].lower() and '4' not in f['name'].lower() and 'ikar' not in f['name'].lower() and 'legendario' not in f['name'].lower() and 'broly' not in f['name'].lower() and 'mary sue' not in f['name'].lower() and 'parody' not in f['name'].lower():
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

print("\n=== AUDITORÍA COMPLETADA ===")