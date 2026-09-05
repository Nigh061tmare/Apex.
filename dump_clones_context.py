# -*- coding: utf-8 -*-
"""
Genera el CONTEXTO COMPLETO de los 43 personajes con clones planos.
Salida: report_contexto_clones_v26.txt (para construir la propuesta editorial)
"""
import json, sys, re
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
chars = data['characters']

clones = {}
for cid, c in chars.items():
    forms = c.get('forms', [])
    if len(forms) < 3:
        continue
    grupos = defaultdict(list)
    for i, f in enumerate(forms):
        if i == 0:
            continue
        ki = f.get('kiNumeric')
        if ki is None:
            continue
        grupos[ki].append((i, f))
    for ki, items in grupos.items():
        if len(items) >= 2:
            clones.setdefault(cid, []).append((ki, items))

def parse_mult(m):
    if m is None:
        return None
    mm = re.search(r'[\d\.]+', str(m))
    return float(mm.group(0)) if mm else None

lines = []
for cid in sorted(clones.keys()):
    c = chars[cid]
    lines.append('=' * 100)
    lines.append('%s (%s) | universe=%s' % (c.get('name'), cid, c.get('universe')))
    lines.append('baseKiNumeric=%s | baseTier=%s | tier=%s' % (c.get('baseKiNumeric'), c.get('baseTier'), c.get('tier')))
    lines.append('powerSchema=%s' % json.dumps(c.get('powerSchema', {}), ensure_ascii=False))
    for i, f in enumerate(c.get('forms', [])):
        lines.append('  [%d] ki=%12s mult=%-12s tier=%-8s apex=%s | %s'
                     % (i, f.get('kiNumeric'), repr(f.get('multiplier')), f.get('tier'),
                        f.get('isApexCustom'), f.get('name')))
    lines.append('')
    for ki, items in clones[cid]:
        base_ki = c.get('forms', [{}])[0].get('kiNumeric')
        lines.append('  --> CLON en ki=%s (base form[0]=%s): formas %s'
                     % (ki, base_ki, [i for i, _ in items]))
    lines.append('')

out = '\n'.join(lines)
with open('report_contexto_clones_v26.txt', 'w', encoding='utf-8') as f:
    f.write(out)
print('Reporte de contexto guardado: report_contexto_clones_v26.txt (%d lineas)' % len(lines))
print('Personajes con clones:', len(clones))
print('Total grupos de clones:', sum(len(v) for v in clones.values()))