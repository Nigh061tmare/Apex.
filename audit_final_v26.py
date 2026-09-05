# -*- coding: utf-8 -*-
"""
AUDITORÍA FINAL V26 - detecta problemas que el validador NO cubre:
  A) baseKiNumeric != forms[0].kiNumeric (medida única rota)
  B) Personajes sin forma base con multiplier 'x 1' en index 0
  C) Tiers textuales / con rango (no cumplen High|Low|N-A|N-B|N-C)
  D) Multiplicador forms[0] != 1
  E) Nombres de personaje que contienen su id numérico (nombres sucios 'X / X')
  F) Caracteres de encoding corrupto (??, Ã±, etc.)
  G) Duplicados potenciales por nombre normalizado
"""
import json, sys, re, unicodedata
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']

TIER_RE = re.compile(r'^(High |Low )?\d{1,2}-[ABC]$')

print('='*100)
print('AUDITORÍA FINAL PROFUNDA — ROSTER V26 (%d personajes)' % len(chars))
print('='*100)

# ---------- A) baseKiNumeric vs forms[0].kiNumeric ----------
print('\n[A] DESALINEACIÓN MEDIDA ÚNICA (baseKiNumeric != forms[0].kiNumeric)')
n_a = 0
for cid, c in chars.items():
    forms = c.get('forms', [])
    if not forms: continue
    base = c.get('baseKiNumeric')
    f0 = forms[0].get('kiNumeric')
    if base is not None and f0 is not None and abs(base - f0) > 0.5:
        n_a += 1
        print('  ❌ %-50s base=%s forms[0]=%s (%s)' % (
            cid[:50], c.get('baseKiFormatted'), forms[0].get('kiFormatted'), forms[0]['name'][:35]))
print('  Total:', n_a)

# ---------- B) forms[0] sin multiplicador x1 ----------
print('\n[B] FORMA BASE (index 0) SIN MULTIPLICADOR x1')
n_b = 0
for cid, c in chars.items():
    forms = c.get('forms', [])
    if not forms: continue
    m = str(forms[0].get('multiplier', ''))
    if '1' not in m:
        n_b += 1
        print('  ❌ %-50s mult=%s name=%s' % (cid[:50], m, forms[0]['name'][:40]))
print('  Total:', n_b)

# ---------- C) Tiers textuales / con rango ----------
print('\n[C] TIERS NO ESTÁNDAR (textuales, rangos, inválidos)')
n_c = 0
seen = set()
for cid, c in chars.items():
    for i, f in enumerate(c.get('forms', [])):
        t = str(f.get('tier', ''))
        if not TIER_RE.match(t) and t not in seen:
            seen.add(t)
            n_c += 1
            print('  ❌ %-50s forms[%d] tier="%s"' % (cid[:50], i, t))
    bt = str(c.get('baseTier', ''))
    if bt and not TIER_RE.match(bt) and bt not in seen:
        seen.add(bt)
        n_c += 1
        print('  ❌ %-50s baseTier="%s"' % (cid[:50], bt))
print('  Total distintos:', n_c)

# ---------- D) Nombres sucios ----------
print('\n[D] NOMBRES SUCIOS (duplicados "X / X", id numérico en nombre, dobles espacios)')
n_d = 0
for cid, c in chars.items():
    name = c['name']
    issues = []
    if re.search(r'\s/\s', name):
        issues.append('patron "X / X"')
    # el id tiene sufijo numérico que se coló en el nombre
    m = re.search(r'[-_ ](\d+)$', cid)
    if m and m.group(1) in name:
        issues.append('id numerico en nombre')
    if '  ' in name:
        issues.append('doble espacio')
    if issues:
        n_d += 1
        print('  ⚠️  %-50s %s' % (cid[:50], '; '.join(issues)))
print('  Total:', n_d)

# ---------- E) Encoding corrupto ----------
print('\n[E] ENCODING CORRUPTO (??, Ã, â€)')
n_e = 0
pat = re.compile(r'\?\?|Ã|â€|â™|�')
for cid, c in chars.items():
    for field in ['name']:
        if pat.search(str(c.get(field, ''))):
            n_e += 1
            print('  ❌ %s name=%s' % (cid[:40], c['name'][:50]))
    for i, f in enumerate(c.get('forms', [])):
        if pat.search(str(f.get('name', ''))):
            n_e += 1
            print('  ❌ %s forms[%d] name=%s' % (cid[:40], i, f['name'][:50]))
print('  Total:', n_e)

# ---------- F) Duplicados potenciales por nombre normalizado ----------
print('\n[F] DUPLICADOS POTENCIALES (mismo nombre normalizado)')
def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'\d+$', '', s)
    s = re.sub(r'[^a-z0-9]+', '', s.lower())
    return s
by_name = {}
n_f = 0
for cid, c in chars.items():
    k = norm(c['name'])
    by_name.setdefault(k, []).append(cid)
for k, v in by_name.items():
    if len(v) > 1:
        n_f += 1
        print('  ⚠️  %-30s -> %s' % (k[:30], ', '.join(v)))
print('  Total grupos:', n_f)