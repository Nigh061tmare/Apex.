# -*- coding: utf-8 -*-
"""
AUDITORÍA DE COHERENCIA INTERNA APEX KI (single-measure).
Regla: el APEX KI es la UNICA medida. baseKiNumeric es la forma[0] y cada forma
debe cumplir kiNumeric ~= forma[0].kiNumeric * multiplier (cuando el multiplicador
es coherente). Detecta ANOMALIAS para revisión humana. NO modifica nada.
"""
import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

def parse_mult(m):
    if m is None:
        return None
    s = str(m).strip()
    m2 = re.search(r'[\d\.]+', s)
    if not m2:
        return None
    try:
        return float(m2.group(0))
    except ValueError:
        return None

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
chars = data['characters']

anomalias = []
sin_mult_base = 0
total_formas = 0
for cid, c in chars.items():
    forms = c.get('forms', [])
    if not forms:
        continue
    base_ki = forms[0].get('kiNumeric')
    if base_ki is None:
        continue
    for i, f in enumerate(forms):
        total_formas += 1
        ki = f.get('kiNumeric')
        if ki is None:
            continue
        mult = parse_mult(f.get('multiplier'))
        if mult is None:
            sin_mult_base += 1
            continue
        # tolerancia amplia (±10%) y solo para formas NO base
        if i == 0:
            continue
        esperado = base_ki * mult
        if esperado == 0:
            continue
        ratio = ki / esperado
        if ratio < 0.85 or ratio > 1.15:
            anomalias.append((cid, c.get('universe'), i, f.get('name'),
                              base_ki, ki, mult, esperado, ratio))

print('Total formas: %d | formas sin multiplicador parseable: %d | anomalias mult*base vs ki: %d'
      % (total_formas, sin_mult_base, len(anomalias)))
print()
print('%-45s %-26s %s' % ('PERSONAJE', 'UNIVERSO', 'FORMA / BASE | ki | mult | esperado | ratio'))
print('-' * 130)
for (cid, uni, i, name, base, ki, mult, exp, ratio) in sorted(anomalias, key=lambda x: x[8]):
    print('%-45s %-26s [%d] %s' % (cid, uni[:26], i, name[:60]))
    print('%-73s base=%12.0f ki=%18.0f mult=%8s esperado=%18.0f ratio=%.3f'
          % ('', base, ki, mult, exp, ratio))