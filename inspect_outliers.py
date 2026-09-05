# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']

OUTLIERS = ['martian-manhunter','wonder-woman','zen-buu-dbm-u4','bardock-superviviente-brokoly',
            'xxi-hechicero-dbm-u5','dr-raichi-dbm-u3','pan-ssj-dbm-u16','ribrianne-dragon-ball-super-396',
            'androide-13-base-pel-culas-dbz-toei-646','arqua-torneo-del-otro-mundo-715',
            'maraikoh-torneo-del-otro-mundo-620','mijorin-torneo-del-otro-mundo-618',
            'olibu-torneo-del-otro-mundo-109','scarlet-witch','doctor-strange','hulk','thanos']
for cid in OUTLIERS:
    c = chars.get(cid)
    if not c:
        print('NO EXISTE:', cid); continue
    print('='*100)
    print(cid)
    print('  name=%r | alias=%r | universe=%r | franchise=%r' % (c.get('name'), c.get('alias'), c.get('universe'), c.get('franchise')))
    print('  baseTier=%r | baseKiNumeric=%r | baseKiFormatted=%r' % (c.get('baseTier'), c.get('baseKiNumeric'), c.get('baseKiFormatted')))
    print('  keys:', sorted(c.keys()))
    for f in c.get('forms', []):
        print('    form: id=%r name=%r tier=%r kiNumeric=%r kiFormatted=%r multiplier=%r' % (
            f.get('id'), f.get('name'), f.get('tier'), f.get('kiNumeric'), f.get('kiFormatted'), f.get('multiplier')))

print('='*100)
print('=== 19 MULTIPLICADORES DECORATIVOS ===')
MULT = {
 'broly-dbs-dragon-ball-super-172': 3, 'gohan-dbs-fnf-pre-torneo': 2, 'gohan-ultimate-mystic-897': 1,
 'piccolo-dbs-superhero': [2,3], 'rey-gomah-daima': 1, 'son-bra-dbm-u16': [2,3],
 'son-gohan-dbs-superhero': [1,2], 'son-gohan-joven-saga-androides-cell-945': [1,2],
 'son-gohan-saga-super-dragon-ball-super-39': [3,4], 'son-goku-mini-daima-full': [3,4],
 'son-goku-ultra-instinto-limitado': [2,3], 'vegeta-majin-ssj2-895': 3}
for cid, fi in MULT.items():
    c = chars.get(cid)
    if not c: print('NO EXISTE:', cid); continue
    fs = c.get('forms', [])
    base = fs[0].get('kiNumeric')
    idxs = fi if isinstance(fi, list) else [fi]
    for i in idxs:
        f = fs[i] if i < len(fs) else None
        if f:
            ratio = f.get('kiNumeric', 0) / base if base else 0
            print('%-40s form[%d] %-30r mult=%r ki=%r ratio_real=%.6g' % (cid, i, f.get('name'), f.get('multiplier'), f.get('kiNumeric'), ratio))