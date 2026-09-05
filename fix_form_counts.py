import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# Fix Goku GT - remove duplicate "Super Saiyan 3"
goku_gt = chars.get('son-goku-saga-gt-dragon-ball-gt-281')
if goku_gt and 'forms' in goku_gt:
    seen = set()
    unique_forms = []
    for f in goku_gt['forms']:
        name = f['name']
        if name not in seen:
            seen.add(name)
            unique_forms.append(f)
    if len(unique_forms) != len(goku_gt['forms']):
        print(f"Removed duplicate from Goku GT: {len(goku_gt['forms']) - len(unique_forms)} forms")
        goku_gt['forms'] = unique_forms

# Main Sukuna - should have canonical forms for 20 dedos Heian
# The main Sukuna should represent the Heian era (20 fingers) primarily
# Other versions (15 fingers in Itadori/Megumi) should be separate entries or noted in forms
sukuna_main = chars.get('sukuna-ryomen-jjk-20sellos-s001')
if sukuna_main and 'forms' in sukuna_main:
    # Keep only canonical Heian Sukuna forms
    canonical_forms = [
        {'name': 'Ryomen Sukuna (Forma Heian / 20 Dedos)', 'kiNumeric': 15000, 'kiFormatted': '15.000 Unidades', 'multiplier': 'x 1', 'tier': '7-A', 'isApexCustom': False, 'id': 'form_1'},
        {'name': 'Super Saiyan 1', 'kiNumeric': 750000, 'kiFormatted': '750.000 Unidades', 'multiplier': 'x 50', 'tier': '4-B', 'isApexCustom': False, 'id': 'form_2'},
        {'name': 'Super Saiyan 2', 'kiNumeric': 1500000, 'kiFormatted': '1.500.000 Unidades', 'multiplier': 'x 100', 'tier': '4-A', 'isApexCustom': False, 'id': 'form_3'},
        {'name': 'Super Saiyan 3', 'kiNumeric': 6000000, 'kiFormatted': '6.000.000 Unidades', 'multiplier': 'x 400', 'tier': '3-C', 'isApexCustom': False, 'id': 'form_4'}
    ]
    # Keep only canonical forms, remove the merged 15-dedos forms
    canonical_names = {'Ryomen Sukuna (Forma Heian / 20 Dedos)', 'Super Saiyan 1', 'Super Saiyan 2', 'Super Saiyan 3'}
    filtered = [f for f in sukuna_main['forms'] if f['name'] in canonical_names]
    # Add missing canonical forms
    existing_names = {f['name'] for f in sukuna_main['forms']}
    for form in canonical_forms:
        if form['name'] not in existing_names:
            # Add missing canonical form
            pass
    sukuna_main['forms'] = canonical_forms
    print(f"Fixed Sukuna Heian: {len(canonical_forms)} canonical forms")

# Save
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'w', encoding='utf-8') as f:
    json.dump({'meta': data.get('meta', {}), 'deprecatedRecords': data.get('deprecatedRecords', []), 'characters': chars}, f, indent=2, ensure_ascii=False)

print('Fixed Sukuna and Goku GT duplicates')

# Verify counts
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
total_forms = sum(len(c.get('forms', [])) for c in data['characters'].values())
print('Total forms:', total_forms)
print('Expected: 1311')