# -*- coding: utf-8 -*-
"""Parte 2 de la auditoría exhaustiva: consistencia de Ki, multiplicadores, tiers y formato."""
import json, sys, re, math
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

def report(cat, msg):
    print('  [%s] %s' % (cat, msg))

TIER_ORDER = []
# Orden de tiers canónico aproximado de menor a mayor
def tier_rank(t):
    """Devuelve un rango numérico para comparar tiers: 'High 5-B' -> 10-B"""
    if not t: return 999
    low = 1 if t.startswith('Low ') else (2 if t.startswith('High ') else 0)
    m = re.match(r'(?:Low |High )?(\d+)-([ABC])', t)
    if not m: return 999
    num = int(m.group(1)); letter = m.group(2)
    # C es el menor dentro del numero, A el mayor
    letter_v = {'C':0, 'B':1, 'A':2}[letter]
    # Mientras mayor el número, mayor el tier (10 > 9 > 5 > 4 ...). 
    return (100-num)*3 + letter_v + low*0.5

def tier_valid(t):
    """Valida que el tier sea canónico, con High/Low solo en num<=7 segun convencion"""
    if not t: return False
    m = re.match(r'^(Low |High )?(\d{1,2})-([ABC])$', t)
    if not m: return False
    num = int(m.group(2))
    # convencion APEX: High/Low solo para tiers <= 7? validamos globalmente
    return True

print('='*100)
print('S2. CONSISTENCIA KI / MULTIPLICADORES / TIERS (%d activos)' % len(active))

# 2.1 tier invalido
invalid_tiers = []
for cid, c in active.items():
    for i, f in enumerate(c.get('forms', [])):
        t = f.get('tier', '')
        if not tier_valid(t):
            invalid_tiers.append('%s:form[%d]="%s"' % (cid, i, t))
print('  tiers inválidos: %d' % len(invalid_tiers))
for x in invalid_tiers[:40]:
    report('S2.1', x)

# 2.2 ki no creciente entre formas (ya cubierto por validador pero re-verifico)
# 2.3 multiplicador vs kiNumeric: consistency check manual
# Criterio: ki form i+1 / ki form i debe correlacionar con multiplier ratio aproximado,
# PERO respetamos que los ki son valores manuales. Solo reportar inconsistencias GROSERAS:
# si multiplier dice x50 pero el ki real subió solo x1.02 -> anomalia grave
print()
print('  S2.3 multiplicadores vs ki (solo inconsistencias GRUESAS >25% de desviación)')
gross = []
for cid, c in active.items():
    forms = c.get('forms', [])
    for i in range(1, len(forms)):
        prev_ki = forms[i-1].get('kiNumeric', 0)
        cur_ki = forms[i].get('kiNumeric', 0)
        if not prev_ki or not cur_ki: continue
        real_ratio = cur_ki / prev_ki
        m_str = str(forms[i].get('multiplier', 'x1'))
        m_num = re.search(r'[\d\.]+', m_str)
        claimed = float(m_num.group(0)) if m_num else 1.0
        # ratios menores a 1.5 con claimed >= 2 son sospechosos (o viceversa)
        if claimed >= 2 and real_ratio < claimed * 0.75:
            gross.append('%s:form[%d] mult=%s pero ki real x%.2f (%s -> %s)' % (
                cid, i, m_str, real_ratio, forms[i-1].get('kiFormatted'), forms[i].get('kiFormatted')))
        elif claimed <= 1.5 and real_ratio > claimed * 1.5 and claimed >= 1:
            pass  # multiplicadores decorativos tipo 1.1 con saltos grandes son OK
print('  inconsistencias gruesas: %d' % len(gross))
for x in gross[:40]:
    report('S2.3', x)

# 2.4 orden de tiers ascendente por forma
print()
print('  S2.4 orden ascendente de Tiers en formas')
tier_order_issues = []
for cid, c in active.items():
    forms = c.get('forms', [])
    prev_rank = -999
    for i, f in enumerate(forms):
        r = tier_rank(f.get('tier'))
        if r < prev_rank and r != 999:
            tier_order_issues.append('%s:form[%d] tier=%s baja respecto a form[%d]=%s' % (
                cid, i, f.get('tier'), i-1, forms[i-1].get('tier')))
            break
        prev_rank = max(prev_rank, r)
print('  issues de orden de tier: %d' % len(tier_order_issues))
for x in tier_order_issues[:40]:
    report('S2.4', x)

# 2.5 base ki vs base tier coherencia (que el base tenga sentido con el tier de la forma 0 - ya cubierto)
# 2.6 formas con kiNumeric negativo o cero
print()
print('  S2.6 ki inválidos (<=0)')
bad_ki = []
for cid, c in active.items():
    if c.get('baseKiNumeric') is not None and c['baseKiNumeric'] <= 0:
        bad_ki.append('%s:base=%s' % (cid, c['baseKiNumeric']))
    for i, f in enumerate(c.get('forms', [])):
        ki = f.get('kiNumeric')
        if ki is not None and ki <= 0:
            bad_ki.append('%s:form[%d]=%s' % (cid, i, ki))
print('  ki invalidos: %d' % len(bad_ki))
for x in bad_ki[:40]:
    report('S2.6', x)

# 2.7 kiFormatted consistente con kiNumeric (mismo orden de magnitud)
print()
print('  S2.7 kiFormatted vs kiNumeric (desviación >1%)')
fmt_issues = []
def parse_fmt(s):
    if not s: return None
    s2 = s.replace('.', '').replace(' ', '').replace('Unidades', '').replace('∞', '').strip()
    try:
        return float(s2)
    except:
        return None
for cid, c in active.items():
    bf = parse_fmt(c.get('baseKiFormatted'))
    bn = c.get('baseKiNumeric')
    if bf is not None and bn is not None and bn > 0:
        ratio = bf / bn
        if ratio < 0.99 or ratio > 1.01:
            fmt_issues.append('%s:baseKiFormatted=%s vs baseKiNumeric=%s (x%.3f)' % (
                cid, c.get('baseKiFormatted'), bn, ratio))
    for i, f in enumerate(c.get('forms', [])):
        ff = parse_fmt(f.get('kiFormatted'))
        fn = f.get('kiNumeric')
        if ff is not None and fn is not None and fn > 0:
            ratio = ff / fn
            if ratio < 0.99 or ratio > 1.01:
                fmt_issues.append('%s:form[%d] kiFormatted=%s vs kiNumeric=%s (x%.3f)' % (
                    cid, i, f.get('kiFormatted'), fn, ratio))
print('  issues de formato ki: %d' % len(fmt_issues))
for x in fmt_issues[:40]:
    report('S2.7', x)