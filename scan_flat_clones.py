# -*- coding: utf-8 -*-
"""
Detección de CLONES PLANOS: personajes con >=2 formas NO base con el MISMO kiNumeric
(excepto pares deliberados documentados). Viola Pilar 3 (Cero Niveles Planos Genéricos).
Solo auditoría informativa. NO modifica.
"""
import json, sys
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
chars = data['characters']

print('=== PERSONAJES CON FORMAS NO-BASE DUPLICADAS (mismo kiNumeric) ===')
print()
total_clon = 0
for cid, c in chars.items():
    forms = c.get('forms', [])
    if len(forms) < 3:
        continue
    # agrupar formas no-base (indice>0) por ki
    grupos = defaultdict(list)
    for i, f in enumerate(forms):
        if i == 0:
            continue
        ki = f.get('kiNumeric')
        if ki is None:
            continue
        grupos[ki].append(f.get('name', '?'))
    for ki, names in grupos.items():
        if len(names) >= 2:
            total_clon += 1
            print('%-48s ki=%18.0f (%d formas):' % (cid, ki, len(names)))
            for n in names:
                print('      - %s' % n[:90])
            print()
print('Total personajes-formas con clon plano:', total_clon)