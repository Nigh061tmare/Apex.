import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

# Quick verification of key characters
targets = {
    "son-goku-23-tenkaichi": {"base_ki": 389, "forms": 2},
    "son-goku-llegada-dbz-saga-saiyan-169": {"base_ki": 8400, "forms": 4},
    "son-goku-saga-namek-saga-namek-176": {"base_ki": 3150000, "forms": 4},
    "son-goku-saga-cell-saga-androides-459": {"base_ki": 150000000, "forms": 3},
    "son-goku-saga-buu-saga-buu-646": {"base_ki": 75000000, "forms": 4},
    "son-goku-saga-super-dragon-ball-super-732": {"base_ki": 82000000, "forms": 9},
    "vegeta-llegada-a-la-tierra-saga-saiyan-504": {"base_ki": 18900, "forms": 2},
    "vegeta-saga-namek-saga-namek-783": {"base_ki": 404250, "forms": 2},
    "vegeta-saga-cell-saga-androides-856": {"base_ki": 160000000, "forms": 3},
    "vegeta-saga-buu-saga-buu-213": {"base_ki": 70000000, "forms": 4},
    "vegeta-saga-super-dragon-ball-super-454": {"base_ki": 80000000, "forms": 8},
    "son-gohan-joven-saga-androides-cell-945": {"base_ki": 12000000, "forms": 3},
    "son-gohan-saga-super-dragon-ball-super-39": {"base_ki": 57000000, "forms": 5},
    "piccolo-saga-saiyan": {"base_ki": 3675, "forms": 5},
    "piccolo-saga-saiyan-namek-saga-saiyan-967": {"base_ki": 1365000, "forms": 3},
    "piccolo-saga-cell-buu-saga-androides-946": {"base_ki": 378000000, "forms": 3},
    "piccolo-dbs-superhero": {"base_ki": 1400000000, "forms": 4},
    "freezer-saga-namek-saga-namek-167": {"base_ki": 556500, "forms": 5},
    "freezer-resurreccion-f": {"base_ki": 1312500000, "forms": 3},
    "cell-saga-androides-98": {"base_ki": 1428000000, "forms": 5},
    "kid-buu-saga-buu-907": {"base_ki": 33600000000, "forms": 1},
    "super-buu-saga-buu-69": {"base_ki": 39900000000, "forms": 4},
    "buuhan-majin-901": {"base_ki": 100800000000, "forms": 4},
    "vegetto-base-saga-buu-120": {"base_ki": 100000000000, "forms": 2},
    "gotenks-base-saga-buu-858": {"base_ki": 46200000000, "forms": 2},
    "trunks-futuro-v1-espada-ssj-basico": {"base_ki": 252000000, "forms": 2},
    "trunks-futuro-v2-armadura-grados": {"base_ki": 280000000, "forms": 4},
}

def parse_ki(s):
    clean = s.replace("`", "").replace(",", "").replace(".", "").strip()
    try: return float(clean)
    except: return None

current_char = None
in_table = False
forms = []
base_ki = None
results = {}

for line in lines:
    m = re_header.match(line)
    if m:
        if current_char and current_char in targets:
            results[current_char] = {'base_ki': base_ki, 'forms': forms}
        current_char = m.group(1)
        base_ki = None
        in_table = False
        forms = []
        continue
    if current_char in targets:
        print(f"  [LINE] {current_char}: {line[:80].rstrip()}")
        if "- **Base Tier**" in line:
            m = re.search(r'Base Ki Num[^`]*`([^`]+)`', line)
            if m:
                base_ki = parse_ki(m.group(1))
                print(f"  [MATCH] base_ki={base_ki}")
            else:
                print(f"  [NO MATCH] regex failed on: {line[:80]}")
            continue
        if "| # Forma |" in line:
            in_table = True
            continue
        if in_table and line.strip().startswith("|") and not line.strip().startswith("| :-"):
            m = re_row.match(line)
            if m:
                idx, name, ki_str, fmt_ki, mult_str, tier, apex = m.groups()
                forms.append({'name': name.strip(), 'ki': parse_ki(ki_str)})
        if in_table and not line.strip().startswith("|"):
            in_table = False

# Check last
if current_char and current_char in targets:
    results[current_char] = {'base_ki': base_ki, 'forms': forms}

print("=== VERIFICACION PERSONAJES CLAVE ===")
ok = 0
fail = 0

# Debug
for tid, r in results.items():
    print(f"  DEBUG {tid}: base_ki={r['base_ki']}, forms={len(r['forms'])}")

for tid, spec in targets.items():
    if tid not in results:
        print(f"[FAIL] {tid}: NO ENCONTRADO")
        fail += 1
        continue
    r = results[tid]
    base_ok = abs(r['base_ki'] - spec['base_ki']) < max(1, spec['base_ki'] * 0.02)
    forms_ok = len(r['forms']) >= spec['forms']
    if base_ok and forms_ok:
        print(f"[OK] {tid}: Base Ki={r['base_ki']:,.0f} (expected {spec['base_ki']:,.0f}), Formas={len(r['forms'])} (min {spec['forms']})")
        ok += 1
    else:
        if not base_ok:
            print(f"[FAIL] {tid}: Base Ki={r['base_ki']:,.0f} != expected {spec['base_ki']:,.0f}")
        if not forms_ok:
            print(f"[FAIL] {tid}: Formas={len(r['forms'])} < min {spec['forms']}")
        fail += 1

print(f"\n=== RESUMEN: {ok} OK, {fail} FAIL ===")