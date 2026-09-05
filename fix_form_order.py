import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# GOKU NAMEK POST-ZENKAI - fix form ORDER
goku_nz = chars.get('goku-namek-post-zenkai-892')
if goku_nz and 'forms' in goku_nz:
    form_order = ['Base Post-Tanque', 'Kai-o-ken x2', 'Kai-o-ken x10', 'Kai-o-ken x20', 'Super Saiyan']
    form_dict = {f['name']: f for f in goku_nz['forms']}
    goku_nz['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Goku Namek form ORDER")

# BROLY Z
broly = chars.get('broly-dbz-pel-culas-dbz-toei-822')
if broly and 'forms' in broly:
    form_order = ['Broly (Estado Base / Restringido con Tiara)', 'Super Saiyan Tipo A (Pelo Azul / Despertar)', 'Super Saiyan Legendario (LSSJ / Masa Desbordante)']
    form_dict = {f['name']: f for f in broly['forms']}
    broly['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Broly Z form ORDER")

# CELL - verify order
cell = chars.get('cell-saga-androides-98')
if cell and 'forms' in cell:
    form_order = ['Cell Imperfecto', 'Cell Semi-Perfecto', 'Estado Base', 'Cell Perfecto', 'Cell Super Perfecto']
    form_dict = {f['name']: f for f in cell['forms']}
    cell['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Cell form ORDER")

# GOKU NAMEK POST-ZENKAI (Goku Namek post zenkai)
goku_nz = chars.get('goku-namek-post-zenkai-892')
if goku_nz and 'forms' in goku_nz:
    form_order = ['Base Post-Tanque', 'Kai-o-ken x2', 'Kai-o-ken x10', 'Kai-o-ken x20', 'Super Saiyan']
    form_dict = {f['name']: f for f in goku_nz['forms']}
    goku_nz['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Goku Namek order")

# Save
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'w', encoding='utf-8') as f:
    json.dump({'meta': data.get('meta', {}), 'deprecatedRecords': data.get('deprecatedRecords', []), 'characters': chars}, f, indent=2, ensure_ascii=False)

print("FORM ORDERS FIXED AND SAVED")