# -*- coding: utf-8 -*-
"""
S2.3 CORREGIDO: multiplicador relativo a BASE (modelo APEX correcto).
ki[i] debe ≈ baseKiNumeric * mult[i]. Solo reporta desviación >12% (grosas).
"""
import json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

def parse_mult(m):
    if not m: return 1.0
    mm = re.search(r'[\d\.]+', str(m))
    return float(mm.group(0)) if mm else 1.0

print('=== S2.3 CORREGIDO: ki[i] vs base × mult[i] (desviación >12%) ===')
total = 0
for cid, c in active.items():
    base = c.get('baseKiNumeric')
    if not base: continue
    for i, f in enumerate(c.get('forms', [])):
        claimed = parse_mult(f.get('multiplier'))
        expected = base * claimed
        real = f.get('kiNumeric')
        if not real: continue
        ratio = real / expected if expected else 0
        if ratio < 0.88 or ratio > 1.12:
            total += 1
            print('  %-46s form[%d] mult=%s esperado=%.2f real=%s (x%.2f)' % (
                cid[:46], i, f.get('multiplier'), expected, f.get('kiFormatted'), ratio))
print('Total inconsistencias reales:', total)