# -*- coding: utf-8 -*-
"""
FIX DE NOMBRES SUCIOS V26 (Pilar 7: Nombres Limpios y Sin Duplicación).
Artefactos del pipeline kebab->espacios:
  1) Sufijo numérico del ID colado al final del nombre (206 casos).
  2) Fragmentos kebab corruptos: 'Cl Sico'->'Clásico', 'N Mero'->'Número',
     'L Nea'->'Línea', 'Ni O'->'Niño', 'Saiyan'->'Saiyajin'(solo fragmento), etc.
Los IDs, tiers, ki y formas NO se tocan.
"""
import json, sys, re, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']

ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
bak = 'src/data/BACKUP_ROSTER_V26_ANTES_NOMBRES_%s.json' % ts
shutil.copy2(SRC, bak)
print('Backup:', bak)

# Reemplazos de fragmentos corruptos (seguros, de kebab-case -> español)
REPL = {
    'Cl Sico': 'Clásico',
    'N Mero': 'Número',
    'L Nea': 'Línea',
    'Ni O': 'Niño',
    'Csm': 'Chainsaw Man',
    'Hxh': 'Hunter x Hunter',
    'Kny': 'Kimetsu no Yaiba',
    'Jjk': 'Jujutsu Kaisen',
    'Dbz': 'Dragon Ball Z',
    'Dbs': 'Dragon Ball Super',
    'Dbm': 'Dragon Ball Multiverse',
    'Dc ': 'DC ',
    'Gt ': 'GT ',
    'Jojos': 'JoJo',
}

def limpiar(name, cid):
    name = name.strip()
    # 1) quitar sufijo numerico del ID si esta al final del nombre
    m = re.search(r'[-_](\d+)$', cid)
    if m:
        num = m.group(1)
        if re.search(r'\s' + num + r'$', name):
            name = re.sub(r'\s+' + num + r'\s*$', '', name)
    # 2) fragmentos corruptos
    for old, new in REPL.items():
        name = name.replace(old, new)
    # 3) limpiar espacios dobles y bordes
    name = re.sub(r'\s{2,}', ' ', name).strip()
    return name

n_fix = 0
examples = []
for cid, c in chars.items():
    old = c.get('name', '')
    new = limpiar(old, cid)
    if new != old:
        c['name'] = new
        n_fix += 1
        if len(examples) < 12:
            examples.append((cid, old, new))

print('Nombres corregidos:', n_fix)
for cid, old, new in examples:
    print('  %-48s | %s' % (cid[:48], old))
    print('  %48s | %s' % ('', new))

with open(SRC, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('JSON guardado OK')