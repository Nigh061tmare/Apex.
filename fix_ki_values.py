import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# GOKU NAMEK POST-ZENKAI - fix Ki values for proper ascending order
goku_nz = chars.get('goku-namek-post-zenkai-892')
if goku_nz and 'forms' in goku_nz:
    form_fixes = {
        'Base Post-Tanque': {'kiNumeric': 243495, 'kiFormatted': '243.495 Unidades', 'multiplier': 'x 1', 'tier': '5-A'},
        'Kai-o-ken x2': {'kiNumeric': 486990, 'kiFormatted': '486.990 Unidades', 'multiplier': 'x 2', 'tier': '5-A'},
        'Kai-o-ken x10': {'kiNumeric': 2434950, 'kiFormatted': '2.434.950 Unidades', 'multiplier': 'x 10', 'tier': 'High 5-A'},
        'Kai-o-ken x20': {'kiNumeric': 4869900, 'kiFormatted': '4.869.900 Unidades', 'multiplier': 'x 20', 'tier': 'Low 4-C'},
        'Super Saiyan': {'kiNumeric': 12174750, 'kiFormatted': '12.174.750 Unidades', 'multiplier': 'x 50', 'tier': '4-C'},
    }
    
    for f in goku_nz['forms']:
        if f['name'] in form_fixes:
            fix = form_fixes[f['name']]
            f['kiNumeric'] = fix['kiNumeric']
            f['kiFormatted'] = fix['kiFormatted']
            f['multiplier'] = fix['multiplier']
            f['tier'] = fix['tier']
            print('FIXED: {} -> Ki={:,} mult={} tier={}'.format(f['name'], fix['kiNumeric'], fix['multiplier'], fix['tier']))

# BROLY Z
broly = chars.get('broly-dbz-pel-culas-dbz-toei-822')
if broly and 'forms' in broly:
    form_fixes = {
        'Broly (Estado Base / Restringido con Tiara)': {'kiNumeric': 5600000000, 'kiFormatted': '5.600.000.000 Unidades', 'multiplier': 'x 1', 'tier': 'High 4-C'},
        'Super Saiyan Tipo A (Pelo Azul / Despertar)': {'kiNumeric': 280000000000, 'kiFormatted': '280.000.000.000 Unidades', 'multiplier': 'x 50', 'tier': '4-B'},
        'Super Saiyan Legendario (LSSJ / Masa Desbordante)': {'kiNumeric': 112000000000, 'kiFormatted': '112.000.000.000 Unidades', 'multiplier': 'x 20', 'tier': '4-A'},
    }
    
    for f in broly['forms']:
        if f['name'] in form_fixes:
            fix = form_fixes[f['name']]
            f['kiNumeric'] = fix['kiNumeric']
            f['kiFormatted'] = fix['kiFormatted']
            f['multiplier'] = fix['multiplier']
            f['tier'] = fix['tier']
            print('FIXED: {} -> Ki={:,} mult={} tier={}'.format(f['name'], fix['kiNumeric'], fix['multiplier'], fix['tier']))

# Save
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'w', encoding='utf-8') as f:
    json.dump({'meta': data.get('meta', {}), 'deprecatedRecords': data.get('deprecatedRecords', []), 'characters': chars}, f, indent=2, ensure_ascii=False)

print("KI VALUES FIXED AND SAVED")