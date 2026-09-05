import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# GOKU NAMEK POST-ZENKAI - restore missing forms
goku_nz = chars.get('goku-namek-post-zenkai-892')
if goku_nz and 'forms' in goku_nz:
    all_forms = [
        {'name': 'Base Post-Tanque', 'kiNumeric': 243495, 'kiFormatted': '243.495 Unidades', 'multiplier': 'x 1', 'tier': '5-A'},
        {'name': 'Kai-o-ken x2', 'kiNumeric': 486990, 'kiFormatted': '486.990 Unidades', 'multiplier': 'x 2', 'tier': '5-A'},
        {'name': 'Kai-o-ken x10', 'kiNumeric': 2434950, 'kiFormatted': '2.434.950 Unidades', 'multiplier': 'x 10', 'tier': 'High 5-A'},
        {'name': 'Kai-o-ken x20', 'kiNumeric': 4869900, 'kiFormatted': '4.869.900 Unidades', 'multiplier': 'x 20', 'tier': 'Low 4-C'},
        {'name': 'Super Saiyan', 'kiNumeric': 12174750, 'kiFormatted': '12.174.750 Unidades', 'multiplier': 'x 50', 'tier': '4-C'},
    ]
    
    new_forms = []
    for form_data in all_forms:
        new_forms.append({
            'name': form_data['name'],
            'kiNumeric': form_data['kiNumeric'],
            'kiFormatted': form_data['kiFormatted'],
            'multiplier': form_data['multiplier'],
            'tier': form_data['tier'],
            'isApexCustom': False,
            'id': 'form_' + form_data['name'].lower().replace(' ', '_').replace('-', '_').replace('\u014d', 'o').replace('\u00d7', 'x')
        })
    
    goku_nz['forms'] = new_forms
    print("RESTORED: Goku Namek Post-Zenkai - 5 forms restored")

# Save
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'w', encoding='utf-8') as f:
    json.dump({'meta': data.get('meta', {}), 'deprecatedRecords': data.get('deprecatedRecords', []), 'characters': chars}, f, indent=2, ensure_ascii=False)

print("RESTORED: Goku Namek Post-Zenkai - 5 forms")