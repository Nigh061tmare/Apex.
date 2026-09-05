import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

hakari = data['characters'].get('kinji-hakari')
if hakari:
    print('Hakari Base:', hakari.get('baseKiNumeric'), 'Tier:', hakari.get('baseTier'))
    for f in hakari['forms']:
        ki = f.get('kiNumeric')
        mult = f.get('multiplier')
        print('  ' + f['name'] + ': Ki=' + str(ki) + ' | mult=' + str(f.get('multiplier')) + ' | tier=' + f['tier'])