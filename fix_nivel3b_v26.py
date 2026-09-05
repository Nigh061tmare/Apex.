# -*- coding: utf-8 -*-
"""FIXES NIVEL 3B V26 — universe loid-forger + kiFormatted ' Unidades' + campo tier residual"""
import json, sys, re, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
backup = 'src/data/BACKUP_ROSTER_V26_ANTES_NIVEL3B_%s.json' % ts
shutil.copy2(SRC, backup)
print('Backup: %s' % backup)

# 1) Universe loid-forger
if 'loid-forger' in chars:
    old_uni = chars['loid-forger'].get('universe')
    chars['loid-forger']['universe'] = 'SPY X FAMILY'
    print('loid-forger universe: %s -> SPY X FAMILY' % old_uni)

# 2) kiFormatted con ' Unidades' (solo sufijo residual)
pat = re.compile(r'\s+Unidades\s*$', re.I)
fix_uni = 0
for cid, c in active.items():
    for f in c.get('forms', []):
        kf = f.get('kiFormatted', '')
        if pat.search(kf):
            f['kiFormatted'] = pat.sub('', kf).strip()
            fix_uni += 1
print('kiFormatted " Unidades" limpiados: %d' % fix_uni)

# 3) Campo residual 'tier' idéntico a baseTier (formas ya tienen su propio tier)
fix_tier = 0
for cid, c in active.items():
    if 'tier' in c and 'baseTier' in c and c['tier'] == c['baseTier']:
        del c['tier']
        fix_tier += 1
print('Campo tier residual eliminado: %d' % fix_tier)

json.dump(data, open(SRC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('Guardado.')