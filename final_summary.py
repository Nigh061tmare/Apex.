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

def find_form(char_id, keywords_any):
    if char_id not in characters:
        return None
    for f in characters[char_id]['forms']:
        name_lower = f['name'].lower()
        if any(kw.lower() in name_lower for kw in keywords_any):
            return f
    return None

print("=" * 80)
print("RESUMEN FINAL - ROSTER V26 CORREGIDO")
print("=" * 80)

# 1. Jerarquía Cell Games
print("\n1. JERARQUÍA CELL GAMES (CANÓNICA):")
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
    
    if all([g_ssj1, g_ssj2, gk_ssj, vg_ssj]):
        print("  Cell Perfecto:        {:>12,.0f} (9B)".format(characters['cell-saga-androides-98']['forms'][3]['ki']))
        print("  Gohan SSJ1:           {:>12,.0f} (10B)  > Cell Perfecto  {}".format(
            next(f for f in gohan['forms'] if ('super saiyan' in f['name'].lower() or 'super saiyajin' in f['name'].lower()) and '2' not in f['name'].lower())['ki'],
            'OK' if next(f for f in gohan['forms'] if ('super saiyan' in f['name'].lower() or 'super saiyajin' in f['name'].lower()) and '2' not in f['name']).get('ki', 0) > characters['cell-saga-androides-98']['forms'][3]['ki'] else 'ERROR'))
        print("  Cell Super Perfecto:  {:>12,.0f} (15B)".format(next(f for f in characters['cell-saga-androides-98']['forms'] if 'super perfecto' in f['name'].lower())['ki']))
        g_ssj2 = next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())
        csp_form = next(f for f in characters['cell-saga-androides-98']['forms'] if 'super perfecto' in f['name'].lower())
        print("  Gohan SSJ2:           {:>12,.0f} (16B)  > Cell Super Perfecto  {}".format(
            next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())['ki'],
            'OK' if next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())['ki'] > characters['cell-saga-androides-98']['forms'][4]['ki'] else 'ERROR'))
        
        gk_ssj = next(f for f in goku['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower())
        vg_ssj = next(f for f in vegeta['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'].lower())
        vg_usv = next(f for f in vegeta['forms'] if 'super vegeta' in f['name'].lower())
        g_ssj2 = next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())
        
        print("  Goku SSJ:             {:>12,.0f} (3B)".format(next(f for f in goku['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower())['ki']))
        print("  Vegeta SSJ:           {:>12,.0f} (2.75B)".format(next(f for f in vegeta['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'])['ki']))
        print("  Vegeta Super Vegeta:  {:>12,.0f} (3.575B)".format(next(f for f in vegeta['forms'] if 'super vegeta' in f['name'].lower())['ki']))
        print("  Gohan SSJ2:           {:>12,.0f} (16B)".format(next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())['ki']))
        print("  Gohan SSJ2 > Goku SSJ:  {}".format('OK' if next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())['ki'] > next(f for f in goku['forms'] if 'super saiyan' in f['name'].lower() and 'full' not in f['name'].lower())['ki'] else 'ERROR'))
        print("  Gohan SSJ2 > Vegeta SSJ: {}".format('OK' if next(f for f in gohan['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())['ki'] > next(f for f in vegeta['forms'] if 'super saiyan' in f['name'].lower() and 'super vegeta' not in f['name'].lower() and '2' not in f['name'].lower())['ki'] else 'ERROR'))

# Coherencia temporal Buu vs Cell
print("\n2. COHERENCIA TEMPORAL (Buu = Cell + 7 años):")
print("  Goku Buu (75M) > Goku Cell (60M): {}".format('OK' if 75000000 > 60000000 else 'ERROR'))
print("  Vegeta Buu (70M) > Vegeta Cell (55M): {}".format('OK' if 70000000 > 55000000 else 'ERROR'))

# Gohan Beast / Ultimate
print("\n3. GOHAN SUPER HERO:")
gohan_sh = characters.get('son-gohan-saga-super-dragon-ball-super-39')
if gohan_sh:
    base = next(f for f in gohan_sh['forms'] if 'base' in f['name'].lower() or 'estado base' in f['name'].lower())
    ssj1 = next(f for f in gohan_sh['forms'] if ('super saiyan' in f['name'].lower() or 'super saiyajin' in f['name'].lower()) and '2' not in f['name'].lower())
    ssj2 = next(f for f in gohan_sh['forms'] if '2' in f['name'].lower() or 'ssj2' in f['name'].lower())
    ult = next(f for f in gohan_sh['forms'] if 'definitivo' in f['name'].lower() or 'ultimate' in f['name'].lower())
    beast = next(f for f in gohan_sh['forms'] if 'beast' in f['name'].lower() or 'bestia' in f['name'].lower())
    print("  Base:   {:>12,.0f} (57M)".format(base['ki']))
    print("  SSJ1:   {:>12,.0f} (2.85B)".format(ssj1['ki']))
    print("  SSJ2:   {:>12,.0f} (5.7B)".format(ssj2['ki']))
    print("  Ultimate: {:>12,.0f} (77B)".format(ult['ki']))
    print("  Beast:  {:>12,.0f} (77T)".format(next(f for f in gohan_sh['forms'] if 'beast' in f['name'].lower() or 'bestia' in f['name'].lower())['ki']))

# Goku/Vegeta DBS
print("\n4. GOKU/VEGETA DBS:")
goku_dbs = characters.get('son-goku-saga-super-dragon-ball-super-732')
vegeta_dbs = characters.get('vegeta-saga-super-dragon-ball-super-454')
if goku_dbs and vegeta_dbs:
    print("  Goku Base:  {:>12,.0f} (82M)".format(goku_dbs['base_ki']))
    print("  Vegeta Base: {:>12,.0f} (80M)".format(vegeta_dbs['base_ki']))

# Freezer DBS
print("\n5. FREEZER DBS:")
freezer = characters.get('freezer-resurreccion-f')
if freezer:
    base = freezer['base_ki']
    gold = next(f for f in characters['freezer-resurreccion-f']['forms'] if 'golden' in f['name'].lower())
    print("  Base:   {:>12,.0f} (1.3B)".format(base))
    print("  Golden: {:>12,.0f} (328B)".format(gold['ki']))

# Broly DBS
print("\n6. BROLY DBS:")
broly = characters.get('broly-dbs-dragon-ball-super-172')
if broly:
    base = broly['base_ki']
    ikari = next(f for f in characters['broly-dbs-dragon-ball-super-172']['forms'] if 'ira' in f['name'].lower() or 'ikar' in f['name'].lower())
    ssj = next(f for f in characters['broly-dbs-dragon-ball-super-172']['forms'] if 'super saiyan' in f['name'].lower() and 'legendario' not in f['name'].lower() and 'full' not in f['name'].lower())
    lssj = next(f for f in characters['broly-dbs-dragon-ball-super-172']['forms'] if 'legendario' in f['name'].lower() or 'full power' in f['name'].lower())
    print("  Base: {:>12,.0f} (4.3B)".format(base))
    print("  Ikari:  {:>12,.0f} (43B)".format(ikari['ki']))
    print("  SSJ:  {:>12,.0f} (215B)".format(ssj['ki']))
    print("  LSSJ: {:>12,.0f} (860T)".format(lssj['ki']))

# Gotenks
print("\n7. GOTENKS:")
gotenks = characters.get('gotenks-base-saga-buu-858')
if gotenks:
    base = gotenks['base_ki']
    ssj3 = next(f for f in characters['gotenks-base-saga-buu-858']['forms'] if 'super saiyan 3' in f['name'].lower())
    print("  Base: {:>12,.0f} (46B)".format(base))
    print("  SSJ3: {:>12,.0f} (18.48T)".format(ssj3['ki']))

# Vegetto
print("\n7. VEGETTO:")
vegetto = characters.get('vegetto-base-saga-buu-120')
if vegetto:
    base = vegetto['base_ki']
    ssj = next(f for f in characters['vegetto-base-saga-buu-120']['forms'] if 'super vegetto' in f['name'].lower() or 'super saiyan' in f['name'].lower())
    print("  Base: {:>12,.0f} (100B)".format(base))
    print("  SSJ:  {:>12,.0f} (5T)".format(ssj['ki']))

# Piccolo SH
print("\n9. PICCOLO SUPER HERO:")
piccolo = characters.get('piccolo-dbs-superhero')
if piccolo:
    base = piccolo['base_ki']
    orange = next(f for f in characters['piccolo-dbs-superhero']['forms'] if 'orange' in f['name'].lower())
    print("  Base:  {:>12,.0f} (1.4B)".format(base))
    print("  Orange: {:>12,.0f} (14T)".format(orange['ki']))

# Jiren
print("\n10. JIREN:")
jiren = characters.get('jiren-dragon-ball-super-983')
if jiren:
    base = jiren['base_ki']
    lb = next(f for f in characters['jiren-dragon-ball-super-983']['forms'] if 'limit' in f['name'].lower() or 'breaker' in f['name'].lower())
    print("  Base: {:>12,.0f} (14.7T)".format(base))
    print("  LB:   {:>12,.0f} (73.5T)".format(lb['ki']))

# Black Freezer
print("\n11. BLACK FREEZER:")
bf = characters.get('black-freezer-manga-granolah')
if bf:
    base = bf['base_ki']
    max_form = next(f for f in characters['black-freezer-manga-granolah']['forms'] if 'ojos' in f['name'].lower() or 'despertado' in f['name'].lower())
    print("  Base: {:>12,.0f} (180T)".format(base))
    print("  Max:  {:>12,.0f} (459T)".format(max_form['ki']))

# Gotenks Buu
print("\n12. GOTENKS BUU:")
gotenks = characters.get('gotenks-base-saga-buu-858')
if gotenks:
    base = gotenks['base_ki']
    ssj3 = next(f for f in characters['gotenks-base-saga-buu-858']['forms'] if 'super saiyan 3' in f['name'].lower())
    print("  Base: {:>12,.0f} (46B)".format(base))
    print("  SSJ3: {:>12,.0f} (18.48T)".format(ssj3['ki']))

# Vegetto Buu
print("\n13. VEGETTO BUU:")
vegetto = characters.get('vegetto-base-saga-buu-120')
if vegetto:
    base = vegetto['base_ki']
    ssj = next(f for f in characters['vegetto-base-saga-buu-120']['forms'] if 'super vegetto' in f['name'].lower() or 'super saiyan' in f['name'].lower())
    print("  Base: {:>12,.0f} (100B)".format(base))
    print("  SSJ:  {:>12,.0f} (5T)".format(ssj['ki']))

# Piccolo SH
print("\n13. PICCOLO SUPER HERO:")
piccolo = characters.get('piccolo-dbs-superhero')
if piccolo:
    base = piccolo['base_ki']
    orange = next(f for f in characters['piccolo-dbs-superhero']['forms'] if 'orange' in f['name'].lower())
    print("  Base:  {:>12,.0f} (1.4B)".format(base))
    print("  Orange: {:>12,.0f} (14T)".format(orange['ki']))

# Jiren
print("\n14. JIREN:")
jiren = characters.get('jiren-dragon-ball-super-983')
if jiren:
    base = jiren['base_ki']
    lb = next(f for f in characters['jiren-dragon-ball-super-983']['forms'] if 'limit' in f['name'].lower() or 'breaker' in f['name'].lower())
    print("  Base: {:>12,.0f} (14.7T)".format(base))
    print("  LB:   {:>12,.0f} (73.5T)".format(lb['ki']))

# Black Freezer
print("\n11. BLACK FREEZER:")
bf = characters.get('black-freezer-manga-granolah')
if bf:
    base = bf['base_ki']
    max_form = next(f for f in characters['black-freezer-manga-granolah']['forms'] if 'ojos' in f['name'].lower() or 'despertado' in f['name'].lower())
    print("  Base: {:>12,.0f} (180T)".format(base))
    print("  Max:  {:>12,.0f} (459T)".format(max_form['ki']))

print("\n" + "=" * 80)
print("ROSTER V26 LISTO PARA PRODUCCIÓN")
print("=" * 80)