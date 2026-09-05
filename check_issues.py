import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Check Raichi
raichi = data['characters'].get('dr-raichi-dbm-u3')
if raichi:
    print('Raichi forms:', len(raichi['forms']))
    for f in raichi['forms']:
        print('  {}: tier={}, mult={}, ki={}'.format(f['name'], f['tier'], f['multiplier'], f['kiNumeric']))
else:
    print('Raichi not found')

# Check tier sync issues
print('\nTier sync issues:')
for cid, c in data['characters'].items():
    if c['forms'] and c['baseTier'] != c['forms'][0]['tier']:
        print('Tier mismatch: {} baseTier={} vs form0.tier={}'.format(cid, c['baseTier'], c['forms'][0]['tier']))