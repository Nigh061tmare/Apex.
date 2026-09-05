# -*- coding: utf-8 -*-
"""
AUDITORÍA EXHAUSTIVA TOTAL V26 — estructural + consistencia + formato.
Cubre lo que el validador NO cubre. Reporta todas las anomalías clasificadas.
"""
import json, sys, re, math
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

TOTAL_REPORT = []
def report(cat, msg):
    TOTAL_REPORT.append((cat, msg))

# =====================================================================
# S1. ESTRUCTURA
# =====================================================================
print('='*100)
print('S1. ESTRUCTURA (%d activos, %d registros totales)' % (len(active), len(chars)))

REQUIRED_TOP = ['id', 'name', 'baseTier', 'baseKiNumeric', 'baseKiFormatted', 'universe', 'forms']
REQUIRED_FORM = ['id', 'name', 'kiNumeric', 'multiplier', 'tier']

# IDs duplicados
ids = list(chars.keys())
if len(ids) != len(set(ids)):
    dupes = [i for i in set(ids) if ids.count(i) > 1]
    print('  [DUPLICATE IDS] %s' % dupes)
    report('S1', 'IDs duplicados: %s' % dupes)

missing = []
bad_type = []
for cid, c in active.items():
    for f in REQUIRED_TOP:
        if f not in c:
            missing.append('%s:sin-%s' % (cid, f))
        elif c[f] is None:
            missing.append('%s:%s-null' % (cid, f))
    # tipos numericos
    if not isinstance(c.get('baseKiNumeric'), (int, float)):
        bad_type.append('%s:baseKiNumeric=%s' % (cid, type(c.get('baseKiNumeric')).__name__))
    # forms array
    if not isinstance(c.get('forms'), list) or len(c['forms']) == 0:
        bad_type.append('%s:forms-vacio' % cid)
    else:
        for i, f in enumerate(c['forms']):
            for fld in REQUIRED_FORM:
                if fld not in f:
                    bad_type.append('%s:form[%d]-sin-%s' % (cid, i, fld))
            if not isinstance(f.get('kiNumeric'), (int, float)):
                bad_type.append('%s:form[%d]-kiNumeric=%s' % (cid, i, type(f.get('kiNumeric')).__name__))
            # id forms unico dentro del personaje
            if 'id' in f:
                fids = [x.get('id') for x in c['forms']]
                if len(fids) != len(set(fids)):
                    report('S1', '%s:form ids duplicados dentro del personaje' % cid)

print('  [MISSING REQUIRED] %d' % len(missing))
for m in missing[:30]:
    print('      %s' % m)
print('  [BAD TYPES] %d' % len(bad_type))
for b in bad_type[:30]:
    print('      %s' % b)

# universo invalido (vocabulario cerrado)
VALID_UNIV = {
    'BAKI THE GRAPPLER','CHAINSAW MAN','DC COMICS','DEMON SLAYER (KIMETSU NO YAIBA)',
    'DRAGON BALL (CLÁSICO)','DRAGON BALL (FAN-MANGAS & WHAT-IF)','DRAGON BALL (MULTI-ERA)',
    'DRAGON BALL DAIMA','DRAGON BALL GT','DRAGON BALL MULTIVERSE (FAN-MANGA)','DRAGON BALL SUPER',
    'DRAGON BALL Z','DRAGON BALL Z — PELÍCULAS Y OVAS','HUNTER X HUNTER','INVINCIBLE',
    "JOJO'S BIZARRE ADVENTURE",'JUJUTSU KAISEN','MARVEL COMICS','MY HERO ACADEMIA','ONE PUNCH MAN',
    'SHUUMATSU NO VALKYRIE (RECORD OF RAGNAROK)','SPY X FAMILY','THE BOYS','UNIVERSO HÍBRIDO (APEX ORIGINAL)'
}
for cid, c in active.items():
    u = c.get('universe')
    if u not in VALID_UNIV:
        report('S1', '%s: universo invalido "%s"' % (cid, u))
print('  universos inválidos: %d' % sum(1 for r in TOTAL_REPORT if r[0]=='S1' and 'universo invalido' in r[1]))