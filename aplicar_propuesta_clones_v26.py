# -*- coding: utf-8 -*-
"""
APLICAR PROPUESTA DE CORRECCIÓN DE CLONES PLANOS V26 (aprobada en bloque por el usuario).
- Backup previo del JSON.
- Aplica: patch (ki+multiplier+tier), rename (Yoriichi), merge (drop duplicados), base update (Cell).
- Re-formatea kiFormatted con el formato APEX (separador '.', sin decimales).
- Guarda el archivo maestro.
"""
import json, sys, shutil, datetime, os
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
PROP = 'propuesta_clones_v26.json'

with open(SRC, 'r', encoding='utf-8') as f:
    data = json.load(f)
with open(PROP, 'r', encoding='utf-8') as f:
    propuestas = json.load(f)['propuestas']
chars = data['characters']

# Backup
ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
bak = 'src/data/BACKUP_ROSTER_V26_ANTES_CLONES_%s.json' % ts
shutil.copy2(SRC, bak)
print('Backup creado:', bak)

def fmt_ki_formatted(v):
    v = int(round(v))
    s = '{:,}'.format(v).replace(',', '.')
    return s

def fmt_multiplier(m):
    # 'x 50' -> '$\times 50$' ; 'x 1.8' -> '$\times 1.8$'
    m = m.strip()
    if m.startswith('x '):
        return '$\\times %s$' % m[2:]
    return m

log = []
n_patch = n_merge = 0

for cid, prop in propuestas.items():
    if prop is None or cid not in chars:
        continue
    c = chars[cid]
    forms = c['forms']

    # 1. base update (Cell)
    if 'base' in prop:
        b = prop['base']
        c['baseKiNumeric'] = float(b['ki'])
        c['baseKiFormatted'] = b.get('formatted') or fmt_ki_formatted(b['ki'])
        log.append('[%s] baseKiNumeric -> %s' % (cid, c['baseKiFormatted']))

    # 2. rename (Yoriichi) - antes del merge, los índices aún son los originales
    if 'rename' in prop:
        for idx, newname in prop['rename'].items():
            forms[int(idx)]['name'] = newname
            log.append('[%s] forms[%d] renombrada a "%s"' % (cid, int(idx), newname))

    # 3. patch (ki + multiplier + tier opcional)
    if 'forms' in prop:
        for f in prop['forms']:
            idx = int(f['index'])
            cur = forms[idx]
            cur['kiNumeric'] = float(f['ki'])
            cur['kiFormatted'] = fmt_ki_formatted(f['ki'])
            cur['multiplier'] = fmt_multiplier(f.get('multiplier', cur['multiplier']))
            if 'tier' in f:
                cur['tier'] = f['tier']
            log.append('[%s] forms[%d] "%s" -> ki %s (x%s)' % (
                cid, idx, cur['name'], cur['kiFormatted'], f.get('multiplier','')))
            n_patch += 1

    # 4. merge (drop duplicados) - eliminar de mayor a menor índice para no corromper
    if 'merge' in prop:
        m = prop['merge']
        drop = sorted([int(d) for d in m['drop']], reverse=True)
        for idx in drop:
            dropped_name = forms[idx]['name']
            del forms[idx]
            log.append('[%s] FUSION: eliminada forma "%s" (idx %d)' % (cid, dropped_name, idx))
            n_merge += 1
        if m.get('name') and forms:
            forms[int(m['keep'])]['name'] = m['name']
            log.append('[%s] forma conservada renombrada a "%s"' % (cid, m['name']))

print()
print('=== RESUMEN APLICADO ===')
print('Patches de ki/multiplier:', n_patch)
print('Formas fusionadas (eliminadas):', n_merge)
print('MANTENER (sin cambios):', sum(1 for p in propuestas.values() if p and p.get('type')=='keep'))
print()

# Guardar
with open(SRC, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('JSON guardado OK:', SRC)

# Chequeo de conteos
total_forms = sum(len(c['forms']) for c in chars.values())
print('Formas totales ahora:', total_forms)
print('Personajes activos:', len(chars))

# Log de cambios
with open('log_aplicacion_clones_%s.txt' % ts, 'w', encoding='utf-8') as f:
    f.write('\n'.join(log))
print('Log creado: log_aplicacion_clones_%s.txt' % ts)