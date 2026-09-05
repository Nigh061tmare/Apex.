# -*- coding: utf-8 -*-
"""
FIX CRUCES DE FRANQUICIA (Pilar 1: Alineación Estricta de Franquicias y Cero Cruces).
Corrige el campo `universe` de 10 personajes que quedaron en el universo equivocado.
Solo toca `universe` — ki, tiers y forms quedan intactos.
"""
import json, sys, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']

FIXES = {
    # id                            -> universo correcto
    'yuta-okkotsu-jjk-peak-yo001':  'JUJUTSU KAISEN',
    'yoshida-hirofumi-csm-p2':      'CHAINSAW MAN',
    'zeno-zoldyck-hxh-ca':          'HUNTER X HUNTER',
    'yoshikage-kira-jojo-diu':      "JOJO'S BIZARRE ADVENTURE",
    'zombieman-opm-ma':             'ONE PUNCH MAN',
    'yujiro-hanma-baki':            'BAKI THE GRAPPLER',
    'zeus-shuumatsu-no-valkyrie':   'SHUUMATSU NO VALKYRIE (RECORD OF RAGNAROK)',
    'wolverine-marvel-616':         'MARVEL COMICS',
    'universa-invincible':          'INVINCIBLE',
    'victoria-neuman-the-boys':     'THE BOYS',
    'twice-mha-mla':                'MY HERO ACADEMIA',
    'zatanna-dc-pcf':               'DC COMICS',
}

ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
bak = 'src/data/BACKUP_ROSTER_V26_ANTES_UNIVERSOS_%s.json' % ts
shutil.copy2(SRC, bak)
print('Backup:', bak)

for cid, expected in FIXES.items():
    c = chars.get(cid)
    if not c:
        print('NO EXISTE:', cid)
        continue
    old = c.get('universe')
    if old != expected:
        c['universe'] = expected
        print('FIX %-36s uni=%s -> %s' % (cid[:36], old, expected))
    else:
        print('OK  %-36s ya en %s' % (cid[:36], expected))

with open(SRC, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('JSON guardado OK')