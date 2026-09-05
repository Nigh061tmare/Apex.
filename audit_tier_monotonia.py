# -*- coding: utf-8 -*-
"""
Auditoría de MONOTONICIDAD de Tiers: para cada personaje, toda forma i>=1 debe
tener tier >= tier de la forma anterior (Regla de Oro 2 / TIER_ORDER creciente).
Computa TODOS los descensos (no solo el primero) + el fix sugerido.
"""
import json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

TIER_ORDER = [
  "10-C", "10-B", "10-A", "9-C", "9-B", "9-A",
  "8-C", "High 8-C", "8-B", "8-A",
  "Low 7-C", "7-C", "High 7-C", "Low 7-B", "7-B", "7-A", "High 7-A",
  "6-C", "High 6-C", "Low 6-B", "6-B", "High 6-B", "6-A", "High 6-A",
  "5-C", "Low 5-B", "5-B", "5-A", "High 5-A",
  "Low 4-C", "4-C", "High 4-C", "4-B", "4-A",
  "3-C", "3-B", "3-A", "High 3-A",
  "Low 2-C", "2-C", "2-B", "2-A",
  "Low 1-C", "1-C", "High 1-C", "1-B", "High 1-B",
  "Low 1-A", "1-A", "High 1-A", "0"
]
RANK = {t: i for i, t in enumerate(TIER_ORDER)}

def rank(t):
    if not t: return -1
    return RANK.get(t.strip(), -1)

print('=== TODOS LOS DESCENSOS DE TIER EN CADENAS DE FORMAS ===')
total_chars = 0
total_drops = 0
for cid, c in active.items():
    forms = c.get('forms', [])
    if len(forms) < 2: continue
    drops = []
    for i in range(1, len(forms)):
        prev_r = rank(forms[i-1].get('tier'))
        cur_r = rank(forms[i].get('tier'))
        if cur_r < prev_r:
            drops.append((i, forms[i-1].get('tier'), forms[i].get('tier')))
    if drops:
        total_chars += 1
        total_drops += len(drops)
        print('%-46s' % cid[:46])
        for i, prev_t, cur_t in drops:
            print('    form[%d] tier=%s -> form[%d] tier=%s  (DESCIENDE %s)' % (
                i-1, prev_t, i, cur_t, cur_t))
print()
print('Personajes con descensos: %d | Descensos totales: %d' % (total_chars, total_drops))