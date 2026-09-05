# -*- coding: utf-8 -*-
"""Auditoría: TODOS los tiers de formas y baseTier deben existir en TIER_ORDER oficial."""
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

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
VALID = set(TIER_ORDER)

data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

print('=== TIERS FUERA DEL ESTÁNDAR TIER_ORDER ===')
from collections import Counter
bad_tiers = Counter()
bad_details = []
for cid, c in active.items():
    for i, f in enumerate(c.get('forms', [])):
        t = f.get('tier')
        if t and t not in VALID:
            bad_tiers[t] += 1
            bad_details.append((cid, i, t))
    bt = c.get('baseTier')
    if bt and bt not in VALID:
        bad_tiers[bt] += 1

for t, n in bad_tiers.most_common():
    print('  %-14s x%d' % (repr(t), n))
print('Total fuera de estándar:', sum(bad_tiers.values()))
print()
print('Dónde aparecen (primeros 40):')
for cid, i, t in bad_details[:40]:
    print('  %-46s form[%d] tier=%s' % (cid[:46], i, t))