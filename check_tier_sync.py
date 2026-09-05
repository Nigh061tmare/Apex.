import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for cid in ['gohan-u16-dbm-espectador', 'son-bra-dbm-u16', 'yamcha-saga-saiyan']:
    char = data['characters'].get(cid)
    if char:
        bt = char.get('baseTier') or char.get('tier')
        ft = char['forms'][0].get('tier') if char['forms'] else None
        match = bt == ft
        print('{}: baseTier={}, form0.tier={}, match={}'.format(cid, char.get('baseTier'), char['forms'][0].get('tier'), match))