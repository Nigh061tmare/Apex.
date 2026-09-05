import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# 1. FIX CELL base tier
cell = chars.get('cell-saga-androides-98')
if cell:
    cell['baseTier'] = '4-C'
    cell['tier'] = '4-C'
    print("FIXED: Cell baseTier = 4-C")

# 2. FIX BROLY Z - LSSJ should be STRONGER than SSJ
broly = chars.get('broly-dbz-pel-culas-dbz-toei-822')
if broly and 'forms' in broly:
    form_dict = {f['name']: f for f in broly['forms']}
    if 'Super Saiyan Legendario (LSSJ / Masa Desbordante)' in form_dict:
        form_dict['Super Saiyan Legendario (LSSJ / Masa Desbordante)']['kiNumeric'] = 2240000000000
        form_dict['Super Saiyan Legendario (LSSJ / Masa Desbordante)']['kiFormatted'] = '2.240.000.000.000 Unidades'
        form_dict['Super Saiyan Legendario (LSSJ / Masa Desbordante)']['multiplier'] = 'x 400'
        form_dict['Super Saiyan Legendario (LSSJ / Masa Desbordante)']['tier'] = '4-A'
        print("FIXED: Broly LSSJ -> 2.24T (x400)")
    print("FIXED: Broly LSSJ power level")

# 3. GOKU NAMEK POST-ZENKAI - fix form order
goku_nz = chars.get('goku-namek-post-zenkai-892')
if goku_nz and 'forms' in goku_nz:
    form_order = ['Base Post-Tanque', 'Kai-o-ken x2', 'Kai-o-ken x10', 'Kai-o-ken x20', 'Super Saiyan']
    form_dict = {f['name']: f for f in goku_nz['forms']}
    goku_nz['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Goku Namek form ORDER")

# Broly Z - ensure form order
broly = chars.get('broly-dbz-pel-culas-dbz-toei-822')
if broly and 'forms' in broly:
    form_order = ['Broly (Estado Base / Restringido con Tiara)', 'Super Saiyan Tipo A (Pelo Azul / Despertar)', 'Super Saiyan Legendario (LSSJ / Masa Desbordante)']
    form_dict = {f['name']: f for f in broly['forms']}
    broly['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Broly Z form ORDER")

# Cell - ensure form order
cell = chars.get('cell-saga-androides-98')
if cell and 'forms' in cell:
    form_order = ['Cell Imperfecto', 'Cell Semi-Perfecto', 'Estado Base', 'Cell Perfecto', 'Cell Super Perfecto']
    form_dict = {f['name']: f for f in cell['forms']}
    cell['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    cell['baseTier'] = '4-C'
    cell['tier'] = '4-C'
    print("FIXED: Cell form ORDER and baseTier")

# Save
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'w', encoding='utf-8') as f:
    json.dump({'meta': data.get('meta', {}), 'deprecatedRecords': data.get('deprecatedRecords', []), 'characters': chars}, f, indent=2, ensure_ascii=False)

print("ALL FIXES APPLIED AND SAVED")