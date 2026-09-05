# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
chars = data['characters']

todos = [
    'cell-saga-androides-98',
    'beerus-dragon-ball-super-16',
    'beerus-poder-completo',
    'vegeta-saga-namek-saga-namek-783',
    'freezer-saga-namek-saga-namek-167',
    'goku-black-l-nea-temporal-futura-209',
    'broly-dbs-dragon-ball-super-172',
    'broly-dbz-pel-culas-dbz-toei-822',
    'son-goku-ultra-instinto-limitado',
    'jiren-dragon-ball-super-983',
    'goku-janemba-movie12',
    'cell-jr-saga-androides-134',
]

for cid in todos:
    c = chars.get(cid)
    if not c:
        print('== NO EXISTE:', cid)
        continue
    print('==' + c.get('name', '') + ' (' + cid + ') | universe=' + c.get('universe', '?'))
    print('   baseKiNumeric=%s | baseKiFormatted=%s | baseTier=%s' % (c.get('baseKiNumeric'), c.get('baseKiFormatted'), c.get('baseTier')))
    for i, f in enumerate(c.get('forms', [])):
        print('   [%d] %s | ki=%s | mult=%s | tier=%s' % (i, f.get('name'), f.get('kiNumeric'), f.get('multiplier'), f.get('tier')))
    print()