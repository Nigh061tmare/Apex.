# -*- coding: utf-8 -*-
"""
FIX TIERS V26 (Regla de Oro 2 + estándar TIER_ORDER del motor):
  1) Mapea 16 tiers inválidos (High 5-B / High 4-B / High 8-A / High 7-B / High 4-A)
     al tier estándar más cercano por ordinal y semántica High.
  2) Corrige 26 descensos de tier en cadenas de formas: tier[i] >= tier[i-1]
Solo toca el campo `tier` de formas y `baseTier`/`tier` si eran inválidos.
NO toca kiNumeric, multiplicadores, nombres ni ids.
"""
import json, sys, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']

TIER_ORDER = ['10-C','10-B','10-A','9-C','9-B','9-A','8-C','High 8-C','8-B','8-A',
 'Low 7-C','7-C','High 7-C','Low 7-B','7-B','7-A','High 7-A','6-C','High 6-C','Low 6-B',
 '6-B','High 6-B','6-A','High 6-A','5-C','Low 5-B','5-B','5-A','High 5-A','Low 4-C','4-C',
 'High 4-C','4-B','4-A','3-C','3-B','3-A','High 3-A','Low 2-C','2-C','2-B','2-A',
 'Low 1-C','1-C','High 1-C','1-B','High 1-B','Low 1-A','1-A','High 1-A','0']
RANK = {t: i for i, t in enumerate(TIER_ORDER)}

# Mapeo semántico de tiers inválidos -> estándar (High X-Y => nivel superior real)
MAP_INVALID = {
    'High 5-B': '5-A',
    'High 4-B': '4-A',
    'High 8-A': '8-A',
    'High 7-B': '7-A',
    'High 4-A': '3-C',
}

ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
bak = 'src/data/BACKUP_ROSTER_V26_ANTES_TIERS_%s.json' % ts
shutil.copy2(SRC, bak)
print('Backup:', bak)

n_invalid = 0
n_drops = 0

for cid, c in chars.items():
    if c.get('status') in ('archived', 'deprecated'):
        continue

    # 1) baseTier inválido
    for fld in ('baseTier', 'tier'):
        t = c.get(fld)
        if t and t not in RANK:
            new_t = MAP_INVALID.get(t)
            if new_t and new_t in RANK:
                print('FIX %-40s %s=%s -> %s (inválido)' % (cid[:40], fld, t, new_t))
                c[fld] = new_t
                n_invalid += 1
            else:
                print('WARN %-40s %s=%s SIN MAPEO' % (cid[:40], fld, t))

    # 2) tiers de formas: mapear inválidos
    for f in c.get('forms', []):
        t = f.get('tier')
        if t and t not in RANK:
            new_t = MAP_INVALID.get(t)
            if new_t and new_t in RANK:
                print('FIX %-40s form tier %s -> %s (inválido)' % (cid[:40], t, new_t))
                f['tier'] = new_t
                n_invalid += 1
            else:
                print('WARN %-40s form tier %s SIN MAPEO' % (cid[:40], t))

    # 3) monotonicidad: tier[i] >= tier[i-1]
    forms = c.get('forms', [])
    for i in range(1, len(forms)):
        prev_t = forms[i-1].get('tier')
        cur_t = forms[i].get('tier')
        if prev_t in RANK and cur_t in RANK and RANK[cur_t] < RANK[prev_t]:
            print('FIX %-40s form[%d] tier=%s -> %s (desciende de form[%d]=%s)' % (
                cid[:40], i, cur_t, prev_t, i-1, prev_t))
            forms[i]['tier'] = prev_t
            n_drops += 1

with open(SRC, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print()
print('Tiers inválidos corregidos: %d | Descensos corregidos: %d' % (n_invalid, n_drops))
print('JSON guardado OK')