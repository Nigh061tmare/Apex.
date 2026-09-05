# -*- coding: utf-8 -*-
"""Fix exacto scarlet-witch: kiNumeric = mediana real (MARVEL COMICS 1-C) x firma, redondeo entero exacto."""
import json, sys, math, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

def int_clean_exact(x, sig=4):
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
    return ''.join((ch if not (i and i % 3 == 0) else '.' + ch) for i, ch in enumerate(s[::-1]))[::-1]

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

from collections import defaultdict
groups = defaultdict(list)
for cid, c in active.items():
    groups[(c.get('universe', ''), c.get('baseTier', ''))].append(c.get('baseKiNumeric') or 0)
def median(v):
    v = sorted(v); n = len(v)
    if not n: return 0
    return v[n//2] if n % 2 else (v[n//2-1]+v[n//2])/2.0

cid = 'scarlet-witch'
c = chars.get(cid)
med = median(groups.get((c['universe'], c['baseTier']), [0]))
var = signature(cid, c.get('name',''))
new_base = int_clean_exact(med * var)
old_base = c['baseKiNumeric']

c['baseKiNumeric'] = new_base
c['baseKiFormatted'] = fmt_es(new_base)
factor = new_base / old_base
for i, f in enumerate(c.get('forms', [])):
    oldk = f.get('kiNumeric', 0)
    newk = new_base if i == 0 else int_clean_exact(oldk * factor)
    f['kiNumeric'] = newk
    f['kiFormatted'] = fmt_es(newk)

print('scarlet-witch')
print('  base: %s -> %s' % (fmt_es(old_base), fmt_es(new_base)))
print('  mediana 1-C Marvel = %.6g | firma = %.4f' % (med, var))
for f in c.get('forms', []):
    print('   form: %-40s %s   mult=%s' % (f.get('name'), f.get('kiFormatted'), f.get('multiplier')))

ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
shutil.copy2(SRC, 'src/data/BACKUP_ROSTER_V26_ANTES_SW_%s.json' % ts)
json.dump(data, open(SRC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('Guardado OK.')