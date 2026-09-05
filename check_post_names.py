# -*- coding: utf-8 -*-
import json, sys
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived','deprecated')}
n = 0
for cid, c in active.items():
    for f in c.get('forms', []):
        if 'Unidades' in f.get('kiFormatted',''):
            n += 1; print(' RESIDUAL Unidades:', cid, f.get('name'), '->', f.get('kiFormatted'))
print('Remanentes Unidades:', n)
rt = [cid for cid, c in active.items() if 'tier' in c and c.get('tier') == c.get('baseTier')]
print('Campo tier residual:', len(rt))
print('loid universe:', chars.get('loid-forger', {}).get('universe'))
byn = defaultdict(list)
for cid, c in active.items():
    byn[c.get('name','').strip()].append(cid)
dups = {nm: v for nm, v in byn.items() if len(v) > 1}
print('total chars:', len(active), '| duplicados de name:', len(dups))
for nm, v in sorted(dups.items()):
    print('  DUP: "%s" -> %s' % (nm, v))