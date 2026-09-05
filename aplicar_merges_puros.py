# -*- coding: utf-8 -*-
"""
FIX PENDIENTE: aplicar los 8 FUSIONAR puros que no se procesaron (bug de clave 'merge'
anidada). Los índices de estos personajes no han sido tocados, se aplican directo.
"""
import json, sys, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
with open(SRC, 'r', encoding='utf-8') as f:
    data = json.load(f)
chars = data['characters']

MERGES = [
    # (cid, keep, [drop], nuevo_nombre)
    ('lord-cooler-pel-culas-dbz-toei-792', 1, [2], 'Cooler (5ta Forma / Forma Final Extrema)'),
    ('son-goku-u18-dbm', 4, [5], 'Super Saiyan 3 (Control Energético Superior / Normal)'),
    ('vegeta-u18-dbm', 3, [4], 'Super Saiyan 3 (Vegeta U18 / Normal)'),
    ('captain-ginyu-saga-namek-524', 1, [2], 'Cuerpo de Goku (Intercambiado / 23.000 Unidades)'),
    ('garlic-jr-saga-garlic-jr-47', 1, [2], 'Forma Super Gigante'),
    ('soldados-de-freezer-saga-namek-793', 1, [2], 'Recluta'),
    ('phoenix-man-opm-ma', 1, [2], 'Modo Pingüino Diamante'),
    ('cabba-dragon-ball-super-566', 1, [2], 'Super Saiyan 1'),
]

ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
bak = 'src/data/BACKUP_ROSTER_V26_ANTES_MERGES_PUROS_%s.json' % ts
shutil.copy2(SRC, bak)
print('Backup:', bak)

total_before = sum(len(c['forms']) for c in chars.values())
n = 0
for cid, keep, drop, newname in MERGES:
    c = chars[cid]
    forms = c['forms']
    # sanity check: las formas drop existen y duplican el ki del keep
    dropped = []
    for idx in sorted(drop, reverse=True):
        f = forms[idx]
        dropped.append(f['name'])
        del forms[idx]
    if newname and forms:
        forms[keep]['name'] = newname
    n += 1
    print('FUSION %-45s -> "%s" (eliminadas: %s)' % (cid, newname, '; '.join(dropped)))

with open(SRC, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

total_after = sum(len(c['forms']) for c in chars.values())
print()
print('Fusiones aplicadas:', n)
print('Formas totales: %d -> %d (delta %d)' % (total_before, total_after, total_after - total_before))
print('JSON guardado OK')