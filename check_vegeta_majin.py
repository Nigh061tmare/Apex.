import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

v = data['characters'].get('vegeta-majin-ssj2-895')
if v:
    for f in v['forms']:
        print('  - ' + f['name'] + ' | tier=' + f['tier'] + ' ki=' + str(f.get('kiNumeric')))