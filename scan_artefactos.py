# -*- coding: utf-8 -*-
"""Correccion exacta de scarlet-witch + scan global de artefactos flotantes en kiFormatted/kiNumeric."""
import json, sys, math, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

def int_clean_exact(x, sig=4):
    """Entero limpio exacto: mantisa entera x 10**exp (sin residuos binarios)."""
    if x <= 0 or not math.isfinite(x):
        return int(round(x))
    e = math.floor(math.log10(x))
    m = x / (10 ** e)
    m_int = int(round(m * 10 ** (sig - 1)))
    k = e - (sig - 1)
    if k >= 0:
        return m_int * (10 ** k)
    return int(round(m_int * (10 ** k)))

def fmt_es(x):
    if x >= 1e29:
        return '∞ Trascendente Cósmico'
    s = str(int(x))
    out = ''
    for i, ch in enumerate(s[::-1]):
        if i and i % 3 == 0:
            out = '.' + out
        out = ch + out
    return out

# 1) Scarlet Witch (la re-mediana real calculada para MARVEL COMICS 1-C era 6.938e27; reaplicar exacto)
# recalcular mediana real
from collections import defaultdict
groups = defaultdict(list)
for cid, c in active.items():
    groups[(c.get('universe', ''), c.get('baseTier', ''))].append(c.get('baseKiNumeric') or 0)
def median(v):
    v = sorted(v); n = len(v)
    if not n: return 0
    return v[n//2] if n % 2 else (v[n//2-1]+v[n//2])/2.0

def js_hash_mod(s):
    h = 0
    for ch in s:
        h = (h << 5) - h + ord(ch)
        h &= 0xFFFFFFFF
        if h >= 0x80000000:
            h -= 0x100000000
    return abs(h % 1000) / 1000.0

def signature(cid, name):
    return 0.88 + (js_hash_mod('%s_%s__' % (cid, name)) * 0.36)

fixes = []
for cid in active:
    c = active[cid]
    uni, tier = c.get('universe',''), c.get('baseTier','')
    med = median(groups.get((uni, tier), [0]))
    base = c.get('baseKiNumeric') or 0
    # solo tratamos los que aún tienen restos binarios > 1e14 de diferencia con su redondeo
    if base <= 0 or med <= 0:
        continue
    var = signature(cid, c.get('name',''))
    tgt = int_clean_exact(med * var)
    # artefacto = el base actual NO es limpio (tiene >6 dígitos de "cola")
    # Consideramos artefacto si |base - tgt| > 0.5*base (fuera por más de 50% del valor esperado) NO;
    # mejor: si el formatted actual contiene cola sucia como '...641.216' (ultimo grupo != 000 y != parcial limpio)
    # Criterio simple: si base sigue siendo != tgt para scarlet-witch y otros con e+ feo.
    if uni == 'MARVEL COMICS' and cid in ('scarlet-witch',):
        fixes.append(cid)

# scan global de kiFormatted sucios (grupo final != '000' o con comas/e+/residuos)
print('=== SCAN kiFormatted sucios ===')
sucios = []
for cid, c in active.items():
    for f in c.get('forms', []):
        kf = f.get('kiFormatted', '')
        if not kf: continue
        if 'e+' in kf or 'E+' in kf or '∞' not in kf and kf.endswith('364') or kf.endswith('216') or kf.endswith('384'):
            ok = True
            # grupo final debe ser 000 si largo
            last = kf.split('.')[-1]
            sucios.append((cid, f.get('name'), kf, last))
print('Posibles sucios:', len(sucios))
for s in sucios[:40]:
    print('  %-40s %-28r %s' % (s[0][:40], s[1], s[2]))