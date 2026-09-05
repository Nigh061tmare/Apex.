# -*- coding: utf-8 -*-
"""FIX OUTLIERS + MULTIPLICADORES V26
A) 17 outliers intra-tier: kiNumeric = mediana(tier+universe) x firma deterministica (hash JS),
   redondeo a 4 cifras significativas limpias (cero artefactos flotantes). Formas reescaladas
   por el mismo factor (preserva ratios y monotonicidad). kiFormatted regenerado. Tiers intactos.
B) 19 multiplicadores decorativos: string multiplier alineado al ratio real ki[form]/ki[base].
"""
import json, sys, math, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

# ---------- firma deterministica (replica JS getCharacterSignatureVariance) ----------
def js_hash_mod(s):
    h = 0
    for ch in s:
        h = (h << 5) - h + ord(ch)
        h &= 0xFFFFFFFF
        if h >= 0x80000000:
            h -= 0x100000000
    return abs(h % 1000) / 1000.0

def signature(cid, name):
    s = '%s_%s__' % (cid, name)  # id + name + alias('') + speed('') igual que el motor
    return 0.88 + (js_hash_mod(s) * 0.36)

# ---------- utilidades de redondeo limpio ----------
def round_sig(x, sig=4):
    if x == 0 or not math.isfinite(x):
        return x
    return round(x, -int(math.floor(math.log10(abs(x)))) + (sig - 1))

def int_clean(x):
    return int(round_sig(x))

def fmt_es(x):
    """Formato español con puntos de miles, sin decimales, sin sufijos."""
    if x >= 1e29:
        return '∞ Trascendente Cósmico'
    s = ('%d' % x)
    out = ''
    for i, ch in enumerate(s[::-1]):
        if i and i % 3 == 0:
            out = '.' + out
        out = ch + out
    return out

def fmt_mult(ratio):
    """Formato multiplier al estilo actual $\\times N$ con redondeo limpio."""
    if ratio >= 100:
        r = int_clean(ratio)
        if r < 10:
            r = int(round(ratio))
        return '$\\times %d$' % r
    r = round(ratio, 2)
    if r == int(r):
        return '$\\times %d$' % int(r)
    return '$\\times %g$' % r

# ---------- medianas por (universe, tier) ----------
from collections import defaultdict
groups = defaultdict(list)
for cid, c in active.items():
    groups[(c.get('universe', ''), c.get('baseTier', ''))].append(c.get('baseKiNumeric') or 0)

def median(v):
    v = sorted(v)
    n = len(v)
    if n == 0:
        return 0
    if n % 2:
        return v[n // 2]
    return (v[n // 2 - 1] + v[n // 2]) / 2.0

OUTLIERS = ['martian-manhunter','wonder-woman','zen-buu-dbm-u4','bardock-superviviente-brokoly',
            'xxi-hechicero-dbm-u5','dr-raichi-dbm-u3','pan-ssj-dbm-u16','ribrianne-dragon-ball-super-396',
            'androide-13-base-pel-culas-dbz-toei-646','arqua-torneo-del-otro-mundo-715',
            'maraikoh-torneo-del-otro-mundo-620','mijorin-torneo-del-otro-mundo-618',
            'olibu-torneo-del-otro-mundo-109','scarlet-witch','doctor-strange','hulk','thanos']

MULT_FIX = {  # (cid, [form indices])
 'broly-dbs-dragon-ball-super-172': [3],
 'gohan-dbs-fnf-pre-torneo': [2],
 'gohan-ultimate-mystic-897': [1],
 'piccolo-dbs-superhero': [2, 3],
 'rey-gomah-daima': [1],
 'son-bra-dbm-u16': [2, 3],
 'son-gohan-dbs-superhero': [1, 2],
 'son-gohan-joven-saga-androides-cell-945': [1, 2],
 'son-gohan-saga-super-dragon-ball-super-39': [3, 4],
 'son-goku-mini-daima-full': [3, 4],
 'son-goku-ultra-instinto-limitado': [2, 3],
 'vegeta-majin-ssj2-895': [3],
}

ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
shutil.copy2(SRC, 'src/data/BACKUP_ROSTER_V26_ANTES_OUTLIERS_%s.json' % ts)
print('Backup creado.')

# ============ A) OUTLIERS ============
print('\n=== A) OUTLIERS INTRA-TIER ===')
for cid in OUTLIERS:
    c = chars.get(cid)
    if not c:
        print('  NO EXISTE:', cid); continue
    uni = c.get('universe', '')
    tier = c.get('baseTier', '')
    med = median(groups.get((uni, tier), [0]))
    if med <= 0:
        continue
    old = c.get('baseKiNumeric')
    var = signature(cid, c.get('name', ''))
    nuevo_base = int_clean(med * var)
    if nuevo_base <= 0:
        continue
    factor = nuevo_base / old if old else 1.0
    c['baseKiNumeric'] = nuevo_base
    c['baseKiFormatted'] = fmt_es(nuevo_base)
    forms = c.get('forms', [])
    for i, f in enumerate(forms):
        oldk = f.get('kiNumeric', 0)
        newk = int_clean(oldk * factor)
        if i == 0:
            newk = nuevo_base  # forma 0 = base exacta
        f['kiNumeric'] = newk
        f['kiFormatted'] = fmt_es(newk)
    print('  %-42s %-8s %18s -> %18s  (firma=%.4f x mediana %.6g)' % (cid, tier, fmt_es(old), fmt_es(nuevo_base), var, med))

# ============ B) MULTIPLICADORES ============
print('\n=== B) MULTIPLICADORES DECORATIVOS ===')
for cid, idxs in MULT_FIX.items():
    c = chars.get(cid)
    if not c:
        print('  NO EXISTE:', cid); continue
    fs = c.get('forms', [])
    if not fs:
        continue
    base = fs[0].get('kiNumeric')
    for i in idxs:
        if i < len(fs):
            f = fs[i]
            ratio = f.get('kiNumeric', 0) / base if base else 0
            oldm = f.get('multiplier')
            f['multiplier'] = fmt_mult(ratio)
            print('  %-40s form[%d] %-20r %-12r -> %r' % (cid, i, f.get('name'), oldm, f.get('multiplier')))

json.dump(data, open(SRC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('\nGuardado OK.')