# -*- coding: utf-8 -*-
"""AUDITORÍA NIVEL 3 V26:
   A) KiNumeric vs ancla log10 del tier (desviación > ±2.5 órdenes de magnitud = sospechoso)
   B) kiFormatted coherente con kiNumeric (formato humano)
   C) Multiplicador parseado vs ratio real ki[i]/ki[0] (desviación > 15%)
   D) Outliers de ki dentro del mismo tier (misma franquicia)
"""
import json, sys, math, re
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

ANCHORS = {
 "0":200,"10-C":0.5,"10-B":1,"10-A":1.5,"9-C":2,"9-B":2.6,"9-A":3.2,"8-C":4,"High 8-C":4.6,
 "8-B":5.3,"8-A":6,"Low 7-C":6.6,"7-C":7.3,"High 7-C":8,"Low 7-B":8.7,"7-B":9.4,"7-A":10.2,
 "High 7-A":11,"6-C":12,"High 6-C":13,"Low 6-B":14,"6-B":15,"High 6-B":16,"6-A":17,"High 6-A":18,
 "5-C":19.5,"Low 5-B":21,"5-B":22.5,"5-A":24,"High 5-A":25.5,"Low 4-C":27,"4-C":28.5,"High 4-C":30,
 "4-B":32,"4-A":34.5,"3-C":37,"3-B":40,"3-A":43,"High 3-A":46,"Low 2-C":50,"2-C":54,"2-B":58,
 "2-A":62,"Low 1-C":68,"1-C":74,"High 1-C":80,"1-B":90,"High 1-B":100,"Low 1-A":120,"1-A":140,"High 1-A":160
}

def num_to_human(n):
    """Replica el formato del motor: 96 -> '96', 165900000000 -> '165.90 Mil Millones'"""
    if n is None: return None
    n = float(n)
    scales = [(1e30,'Cuatrillones'),(1e27,'Mil Cuatrillones'),(1e24,'Trillones'),(1e21,'Mil Trillones'),
              (1e18,'Quintillones'),(1e15,'Mil Billones'),(1e12,'Billones'),(1e9,'Mil Millones'),
              (1e6,'Millones'),(1e3,'Mil'),(1,'')]
    for val, name in scales:
        if n >= val:
            if name == '':
                return str(int(round(n)))
            v = n / val
            return '%s %s' % (('%d' % v) if abs(v - round(v)) < 1e-9 and abs(v)>=100 else ('%.2f' % v).rstrip('0').rstrip('.'), name)
    return str(int(round(n)))

print('='*100)
print('A) KiNumeric vs ancla log10 del tier (desviación en órdenes de magnitud > ±2.5)')
print('='*100)
flagged_a = []
for cid, c in sorted(active.items()):
    anch = ANCHORS.get(c.get('baseTier'))
    ki = c.get('baseKiNumeric')
    if anch is None or not ki or ki <= 0: continue
    dev = math.log10(ki) - anch
    if abs(dev) > 2.5:
        flagged_a.append((dev, cid, c.get('name'), c.get('baseTier'), ki, '', c.get('universe')))
flagged_a.sort(reverse=True)
for dev, cid, name, tier, ki, _, uni in flagged_a[:60]:
    print('  %+5.1f dev  %-44s %-10s ki=%-14s %s' % (dev, cid[:44], tier, ki, uni))
print('Total sospechosos (ancla): %d' % len(flagged_a))

print()
print('='*100)
print('B) kiFormatted no coherente con kiNumeric')
print('='*100)
bad_b = 0
for cid, c in sorted(active.items()):
    for key, num, txt in [('base', c.get('baseKiNumeric'), c.get('baseKiFormatted'))] + \
        [('form_%d' % i, f.get('kiNumeric'), f.get('kiFormatted')) for i, f in enumerate(c.get('forms', []))]:
        if num is None or txt is None: continue
        if txt.strip('$ ').lower() in ('∞','incalculable','trascendente'): continue
        expected = num_to_human(num)
        # permitir redondeo: '165.90' vs '165.9' o entero
        def norm(s):
            s = s.strip()
            s = re.sub(r'[ _]','',s)
            return s.lower()
        if norm(expected) != norm(txt):
            # reintento con más decimales
            alt = None
            if isinstance(num,(int,float)) and num == int(num) and num >= 1000:
                alt = '%d' % int(num)
            if norm(expected) != norm(txt) and (alt is None or norm(alt) != norm(txt)):
                bad_b += 1
                if bad_b <= 40:
                    print('  %-44s %s: kiNumeric=%s kiFormatted="%s" esperado="%s"' % (cid[:44], key, num, txt, expected))
print('Total incoherentes de formato: %d' % bad_b)

print()
print('='*100)
print('C) Multiplicador declarado vs ratio real ki[i]/ki[base] (desviación > 15%)')
print('='*100)
bad_c = 0
for cid, c in sorted(active.items()):
    base_ki = c.get('baseKiNumeric')
    forms = c.get('forms', [])
    if not forms or not base_ki: continue
    for i, f in enumerate(forms):
        ki = f.get('kiNumeric')
        if not ki or i == 0: continue
        m = f.get('multiplier') or ''
        mm = re.search(r'([\d\.]+)', m)
        if not mm: continue
        mult = float(mm.group(1))
        ratio = ki / base_ki
        if abs(ratio - mult) / max(mult, 1e-9) > 0.15 and ratio > 1.05:
            bad_c += 1
            if bad_c <= 40:
                print('  %-44s form[%d] mult=%s ki=%s ratio_real=%.4g' % (cid[:44], i, mult, ki, ratio))
print('Total desviaciones de multiplicador: %d' % bad_c)

print()
print('='*100)
print('D) Outliers de ki dentro del mismo tier (misma franquicia, desviación > 3 órdenes)')
print('='*100)
tier_uni = defaultdict(list)
for cid, c in active.items():
    ki = c.get('baseKiNumeric')
    if not ki: continue
    tier_uni[(c.get('universe'), c.get('baseTier'))].append((ki, cid, c.get('name')))
shown_d = 0
for (uni, tier), lst in sorted(tier_uni.items()):
    if len(lst) < 3: continue
    kis = sorted([x[0] for x in lst])
    med = kis[len(kis)//2]
    for ki, cid, name in lst:
        if med > 0 and (ki / med > 1000 or med / ki > 1000):
            shown_d += 1
            if shown_d <= 40:
                print('  %-18s %-10s ki=%-15s mediana=%s %-40s' % (uni[:18], tier, ki, med, cid[:40]))
print('Total outliers intra-tier: %d' % shown_d)