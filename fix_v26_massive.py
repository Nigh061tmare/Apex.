import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# 1. FIX CELL ORDER
cell = chars.get('cell-saga-androides-98')
if cell and 'forms' in cell:
    form_order = ['Cell Imperfecto', 'Cell Semi-Perfecto', 'Estado Base', 'Cell Perfecto', 'Cell Super Perfecto']
    form_dict = {f['name']: f for f in cell['forms']}
    cell['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Cell order")

# 2. GOKU NAMEK POST-ZENKAI
goku_nz = chars.get('goku-namek-post-zenkai-892')
if goku_nz and 'forms' in goku_nz:
    form_order = ['Base Post-Tanque', 'Kaiō-ken x2', 'Kaiō-ken x10', 'Kaiō-ken x20', 'Super Saiyan']
    form_dict = {f['name']: f for f in goku_nz['forms']}
    goku_nz['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Goku Namek order")

# 3. BROLY Z
broly_z = chars.get('broly-dbz-pel-culas-dbz-toei-822')
if broly_z and 'forms' in broly_z:
    form_order = ['Broly (Estado Base / Restringido con Tiara)', 'Super Saiyan Tipo A (Pelo Azul / Despertar)', 'Super Saiyan Legendario (LSSJ / Masa Desbordante)']
    form_dict = {f['name']: f for f in broly_z['forms']}
    broly_z['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Broly Z order")

# 4. GOKU NAMEK POST-ZENKAI
goku_nz = chars.get('goku-namek-post-zenkai-892')
if goku_nz and 'forms' in goku_nz:
    form_order = ['Base Post-Tanque', 'Kaiō-ken x2', 'Kaiō-ken x10', 'Kaiō-ken x20', 'Super Saiyan']
    form_dict = {f['name']: f for f in goku_nz['forms']}
    goku_nz['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Goku Namek order")

# 5. BROLY Z
broly_z = chars.get('broly-dbz-pel-culas-dbz-toei-822')
if broly_z and 'forms' in broly_z:
    form_order = ['Broly (Estado Base / Restringido con Tiara)', 'Super Saiyan Tipo A (Pelo Azul / Despertar)', 'Super Saiyan Legendario (LSSJ / Masa Desbordante)']
    form_dict = {f['name']: f for f in broly_z['forms']}
    broly_z['forms'] = [form_dict[name] for name in form_order if name in form_dict]
    print("FIXED: Broly Z order")

# Save
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("GUARDADO")