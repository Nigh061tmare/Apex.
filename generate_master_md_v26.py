# -*- coding: utf-8 -*-
"""
GENERADOR DEL MD MAESTRO V26 DESDE EL JSON FINAL (fuente única de verdad).
Reconstruye ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md con la misma
estructura del documento oficial (tabla resumen + secciones por universo).
"""
import json, sys, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
OUT = 'ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md'

with open(SRC, 'r', encoding='utf-8') as f:
    data = json.load(f)
chars = data['characters']

# Orden canónico de universos (igual al documento oficial previo)
UNIVERSO_ORDER = [
    'DRAGON BALL (CLÁSICO)',
    'DRAGON BALL Z',
    'DEMON SLAYER (KIMETSU NO YAIBA)',
    'DRAGON BALL SUPER',
    'DRAGON BALL DAIMA',
    'DRAGON BALL GT',
    'DRAGON BALL Z — PELÍCULAS Y OVAS',
    'DRAGON BALL (MULTI-ERA)',
    'DRAGON BALL MULTIVERSE (FAN-MANGA)',
    'DRAGON BALL (FAN-MANGAS & WHAT-IF)',
    'JUJUTSU KAISEN',
    'CHAINSAW MAN',
    'HUNTER X HUNTER',
    "JOJO'S BIZARRE ADVENTURE",
    'ONE PUNCH MAN',
    'MY HERO ACADEMIA',
    'BAKI THE GRAPPLER',
    'SHUUMATSU NO VALKYRIE (RECORD OF RAGNAROK)',
    'MARVEL COMICS',
    'DC COMICS',
    'SPY X FAMILY',
    'INVINCIBLE',
    'THE BOYS',
    'UNIVERSO HÍBRIDO (APEX ORIGINAL)',
]

# Agrupar
by_universe = {}
for cid, c in chars.items():
    u = c.get('universe', 'OTRO')
    by_universe.setdefault(u, []).append(c)

def sort_key(c):
    return c['name'].lower()

total_active = len(chars)
total_forms = 0
total_apex = 0

L = []
L.append('# ⚡ ROSTER MAESTRO V26 — NIVELES DE PODER Y KI COMPLETO')
L.append('')
L.append('> **DOCUMENTO OFICIAL DEFINITIVO — APEX POWERSCALING ENGINE V26**')
L.append('>')
L.append('> • **Total de Personajes Activos**: %d' % total_active)
L.append('> • **Total de Formas / Transformaciones**: %d' % sum(len(c['forms']) for c in chars.values()))
L.append('> • **Total de Formas Apex-Custom**: %d' % sum(1 for c in chars.values() for f in c['forms'] if f.get('isApexCustom')))
L.append('> • **Universos Representados**: %d' % len(by_universe))
L.append('> • **Generado desde**: ROSTER_NIVELES_PODER_CORREGIDO_V26.json (baseline inmutable)')
L.append('')
L.append('---')
L.append('')
L.append('## 📊 TABLA RESUMEN POR UNIVERSO')
L.append('')
L.append('| # | Universo | Personajes | Total Formas | Formas Apex-Custom |')
L.append('| :-: | :--- | :-: | :-: | :-: |')
for i, u in enumerate(UNIVERSO_ORDER, 1):
    if u not in by_universe:
        continue
    clist = sorted(by_universe[u], key=sort_key)
    nf = sum(len(c['forms']) for c in clist)
    nax = sum(1 for c in clist for f in c['forms'] if f.get('isApexCustom'))
    total_forms += nf
    total_apex += nax
    L.append('| %d | **%s** | %d | %d | %d |' % (i, u, len(clist), nf, nax))
L.append('| **TOTAL** | **%d Universos** | **%d** | **%d** | **%d** |' % (len(by_universe), total_active, total_forms, total_apex))
L.append('')
L.append('---')
L.append('')

def fmt_ki(v):
    if v == int(v):
        return '{:,}'.format(int(v)).replace(',', '.')
    return '{:,}'.format(v).replace(',', '.')

sec_num = 0
for u in UNIVERSO_ORDER:
    if u not in by_universe:
        continue
    sec_num += 1
    clist = sorted(by_universe[u], key=sort_key)
    nf = sum(len(c['forms']) for c in clist)
    nax = sum(1 for c in clist for f in c['forms'] if f.get('isApexCustom'))
    L.append('## 🌌 %d. UNIVERSO: %s' % (sec_num, u))
    L.append('*%d combatientes · %d formas en catálogo · %d formas Apex-Custom*' % (len(clist), nf, nax))
    L.append('')
    for j, c in enumerate(clist, 1):
        kid = c.get('baseKiFormatted') or fmt_ki(c['baseKiNumeric'])
        apx = sum(1 for f in c['forms'] if f.get('isApexCustom'))
        L.append('### %d. %s (`%s`)' % (j, c['name'], c['id']))
        L.append('- **Base Tier**: `%s` | **Base Ki Numérico**: `%s` (%s | %s)' % (
            c.get('baseTier', c.get('tier', '?')), kid, c['universe'], fmt_ki(c['baseKiNumeric'])))
        L.append('- **Estado de Sincronización (tierStatus)**: `%s`' % (
            c.get('powerSchema', {}).get('tierStatus', 'internally_aligned')))
        L.append('')
        L.append('| # Forma | Nombre de la Forma | Ki Numérico | Ki Formateado | Multiplicador | Tier | Es Apex-Custom |')
        L.append('| :---: | :--- | :---: | :---: | :---: | :---: | :---: |')
        for k, f in enumerate(c['forms'], 1):
            L.append('| %d | %s | `%s` | %s | %s | `%s` | %s |' % (
                k, f['name'], fmt_ki(f['kiNumeric']), f['kiFormatted'],
                f['multiplier'], f['tier'], 'Sí' if f.get('isApexCustom') else 'No'))
        L.append('')
    L.append('---')
    L.append('')

report = '\n'.join(L)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(report)
print('MD MAESTRO V26 GENERADO OK:', OUT)
print('Líneas:', len(L))
print('Personajes:', total_active, '| Formas:', total_forms, '| Apex-Custom:', total_apex)
print('Tamaño: %.1f KB' % (len(report.encode('utf-8')) / 1024))