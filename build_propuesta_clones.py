# -*- coding: utf-8 -*-
"""
PROPUESTA DE CORRECCIÓN DE CLONES PLANOS V26 (dry-run, VERIFICADA CONTRA ROSTER REAL).
Regla maestro: el APEX KI es la UNICA medida. Formas que representan transformaciones
distintas DEBEN escalar; nombres que describen el MISMO estado se FUSIONAN.
Genera: propuesta_clones_v26.json + reporte_propuesta_clones.md
NO modifica el roster.
"""
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
chars = data['characters']

# Verificación previa de índices contra el roster
BASE_OK = {}

def chk(cid, idx, name_contains, ki_actual):
    forms = chars[cid]['forms']
    if idx >= len(forms):
        raise SystemExit('ERROR: %s no tiene forma [%d]' % (cid, idx))
    f = forms[idx]
    if name_contains and name_contains.lower() not in f['name'].lower():
        print('AVISO: %s [%d] nombre "%s" no contiene "%s"' % (cid, idx, f['name'], name_contains))
    if ki_actual is not None and f['kiNumeric'] != ki_actual:
        print('AVISO: %s [%d] ki real=%s esperado=%s' % (cid, idx, f['kiNumeric'], ki_actual))

# Verificaciones clave
chk('vegeta-saga-super-dragon-ball-super-454', 2, 'Super Saiyan 2', 4000000000.0)
chk('son-gohan-saga-super-dragon-ball-super-39', 2, 'Super Saiyan 2', 2850000000.0)
chk('son-goku-saga-cell-saga-androides-459', 2, 'Full Power', 3000000000.0)
chk('trunks-futuro-dbs-anime-rage', 2, 'Rage', 955500000000.0)
chk('trunks-futuro-v3-saga-buu-ssj2', 2, 'Perfeccionado', 761250000.0)
chk('baby-vegeta-dragon-ball-gt-510', 2, 'Super Baby 2', 32886000000.0)
chk('goku-black-l-nea-temporal-futura-209', 2, 'Ros', 4908750000000.0)
chk('freezer-saga-namek-saga-namek-167', 4, '100%', 63600000.0)
chk('kale-dbs-u6', 3, 'Berserker', 3265500000000.0)
chk('son-goku-saga-gt-dragon-ball-gt-281', 7, 'Full Power', 2352000000000.0)
chk('son-goku-saga-gt-dragon-ball-gt-281', 4, 'Super Saiyan 3', 235200000000.0)
chk('kale-dbs-u6', 2, 'Controlado (True)', 3265500000000.0)
chk('son-goku-u18-dbm', 5, 'Normal Super Saiyan', 41200000000.0)
chk('vegeta-u18-dbm', 4, 'Normal Super Saiyan', 40000000000.0)
chk('cell-saga-androides-98', 2, 'Estado Base', 9000000000.0)
chk('cell-saga-androides-98', 3, 'Cell Perfecto', 9000000000.0)
chk('cell-saga-androides-98', 4, 'Super Perfecto', 15000000000.0)
chk('yoriichi-tsugikuni-kny-902', 1, 'Pico', 5004.0)
chk('yoriichi-tsugikuni-kny-902', 2, 'Anciano', 5004.0)
chk('yoriichi-tsugikuni-kny-902', 3, 'Decimotercera', 5004.0)
print('--- verificaciones de índice completadas ---')

# ============================================================
# PROPUESTAS (índices VERIFICADOS contra el roster real)
# ============================================================
PROPOSALS = {
    # 1. Vegeta DBS: 6 formas planchadas a 4.000.000.000
    'vegeta-saga-super-dragon-ball-super-454': {
        'type': 'patch',
        'note': 'SSJ/SSJ2/SSJ3/SSG/SSB/SSBE planchadas a 4.000.000.000. Recalculadas con multiplicador canónico sobre base 80.000.000 (SSJ x50, SSJ2 x100, SSJ3 x400, SSG x6400, SSB x7700, SSBE x77000).',
        'forms': [
            {'index': 1, 'ki': 4000000000, 'multiplier': 'x 50'},
            {'index': 2, 'ki': 8000000000, 'multiplier': 'x 100'},
            {'index': 3, 'ki': 32000000000, 'multiplier': 'x 400'},
            {'index': 4, 'ki': 512000000000, 'multiplier': 'x 6400'},
            {'index': 5, 'ki': 616000000000, 'multiplier': 'x 7700'},
            {'index': 6, 'ki': 6160000000000, 'multiplier': 'x 77000'},
        ]
    },
    # 2. Gohan DBS: SSJ2 clonado al SSJ
    'son-gohan-saga-super-dragon-ball-super-39': {
        'type': 'patch',
        'note': 'SSJ2 estaba clonado al SSJ (2.850.000.000). SSJ2 = base 57.000.000 x100 = 5.700.000.000.',
        'forms': [
            {'index': 2, 'ki': 5700000000, 'multiplier': 'x 100'},
        ]
    },
    # 3. Goku Cell Games: SSJ Full Power > SSJ1 básico
    'son-goku-saga-cell-saga-androides-459': {
        'type': 'patch',
        'note': 'SSJ Full Power (Cell Games) = SSJ dominado, ligeramente superior al SSJ1. FP = base 60.000.000 x55 = 3.300.000.000.',
        'forms': [
            {'index': 2, 'ki': 3300000000, 'multiplier': 'x 55'},
        ]
    },
    # 4. Trunks Rage (anime DBS): Rage >> SSJ1
    'trunks-futuro-dbs-anime-rage': {
        'type': 'patch',
        'note': 'SSJ Rage/Ikari > SSJ1 y SSJ2. Rage = base 19.110.000.000 x120 = 2.293.200.000.000 (superior al SSJ2 x100 = 1.911.000.000.000).',
        'forms': [
            {'index': 2, 'ki': 2293200000000, 'multiplier': 'x 120'},
        ]
    },
    # 5. Trunks Futuro V3: SSJ Perfeccionado > SSJ1 básico
    'trunks-futuro-v3-saga-buu-ssj2': {
        'type': 'patch',
        'note': 'SSJ Perfeccionado (Full Power) > SSJ1 Básico. FP = base 15.225.000 x55 = 837.375.000.',
        'forms': [
            {'index': 2, 'ki': 837375000, 'multiplier': 'x 55'},
        ]
    },
    # 6. Baby Vegeta: Super Baby 2 > Super Baby 1
    'baby-vegeta-dragon-ball-gt-510': {
        'type': 'patch',
        'note': 'Super Baby 2 > Super Baby 1. Baby 2 = base 24.360.000.000 x1.8 = 43.848.000.000 (por debajo del Ohzaru Dorado x10 = 243.600.000.000).',
        'forms': [
            {'index': 2, 'ki': 43848000000, 'multiplier': 'x 1.8'},
        ]
    },
    # 7. Goku Black: Rosé superior al Dorado (manga)
    'goku-black-l-nea-temporal-futura-209': {
        'type': 'patch',
        'note': 'SSJ Rosé (ki divino) > SSJ Dorado. Rosé = base 98.175.000.000 x60 = 5.890.500.000.000.',
        'forms': [
            {'index': 2, 'ki': 5890500000000, 'multiplier': 'x 60'},
        ]
    },
    # 8. Freezer Namek: 100% = el doble del 50%
    'freezer-saga-namek-saga-namek-167': {
        'type': 'patch',
        'note': 'Forma Final 100% (hipertrofia) = 2x la Forma Final 50%. 100% = 530.000 x240 = 127.200.000.',
        'forms': [
            {'index': 4, 'ki': 127200000, 'multiplier': 'x 240'},
        ]
    },
    # 9. Cooler: duplicado literal (5ta Forma vs Forma Final Extrema)
    'lord-cooler-pel-culas-dbz-toei-792': {
        'type': 'merge',
        'keep': 1, 'drop': [2], 'name': 'Cooler (5ta Forma / Forma Final Extrema)',
        'note': 'Duplicado literal del mismo estado. Se fusiona en una sola entrada.'
    },
    # 10. Goku U18: SSJ3 Controlado = Normal SSJ
    'son-goku-u18-dbm': {
        'type': 'merge',
        'keep': 4, 'drop': [5], 'name': 'Super Saiyan 3 (Control Energético Superior / Normal)',
        'note': 'El "Normal Super Saiyan" de Goku U18 es su SSJ3 dominado. Se fusiona.'
    },
    # 11. Vegeta U18: idem
    'vegeta-u18-dbm': {
        'type': 'merge',
        'keep': 3, 'drop': [4], 'name': 'Super Saiyan 3 (Vegeta U18 / Normal)',
        'note': '"Normal Super Saiyan" de Vegeta U18 = SSJ3 dominado. Se fusiona.'
    },
    # 12. Goku GT: SSJ3 duplicado + SSJ4 FP > Primitiva
    'son-goku-saga-gt-dragon-ball-gt-281': {
        'type': 'patch',
        'note': 'SSJ3 (GT) == SSJ3 (duplicado literal, se fusiona). SSJ4 Full Power > SSJ4 Primitiva: FP = base 588.000.000 x5000 = 2.940.000.000.000.',
        'merge': {'keep': 3, 'drop': [4], 'name': 'Super Saiyan 3 (GT)'},
        'forms': [
            {'index': 7, 'ki': 2940000000000, 'multiplier': 'x 5000'},
        ]
    },
    # 13. Cell: rediseño completo (medida única + fusión Estado Base/Perfecto)
    'cell-saga-androides-98': {
        'type': 'patch',
        'note': 'A) Medida única: baseKiNumeric estaba en 9.000.000.000 pero forms[0] es Cell Imperfecto 2.000.000.000 (progresión canónica Imperfecto→Semi→Perfecto→Super Perfecto). B) "Estado Base" (9.000.000.000, x1) y "Cell Perfecto" (9.000.000.000, x20) son el MISMO estado → se fusionan. C) Multiplicadores reasignados para describir la progresión real desde Imperfecto (x1, x2.5, x4.5, x7.5). Los ki aprobados se conservan: 2B, 5B, 9B, 15B.',
        'base': {'ki': 2000000000, 'formatted': '2.000.000.000'},
        'merge': {'keep': 3, 'drop': [2]},
        'forms': [
            {'index': 0, 'ki': 2000000000, 'multiplier': 'x 1', 'tier': '4-C'},
            {'index': 1, 'ki': 5000000000, 'multiplier': 'x 2.5', 'tier': '4-B'},
            {'index': 3, 'ki': 9000000000, 'multiplier': 'x 4.5', 'tier': '4-B'},
            {'index': 4, 'ki': 15000000000, 'multiplier': 'x 7.5', 'tier': '4-A'},
        ]
    },
    # 14-17. Duplicados literales (pares exactos)
    'captain-ginyu-saga-namek-524': {
        'type': 'merge', 'keep': 1, 'drop': [2],
        'name': 'Cuerpo de Goku (Intercambiado / 23.000 Unidades)',
        'note': 'Duplicado literal (con/sin cifra en el nombre).'
    },
    'garlic-jr-saga-garlic-jr-47': {
        'type': 'merge', 'keep': 1, 'drop': [2], 'name': 'Forma Super Gigante',
        'note': 'Duplicado literal.'
    },
    'soldados-de-freezer-saga-namek-793': {
        'type': 'merge', 'keep': 1, 'drop': [2], 'name': 'Recluta',
        'note': 'Duplicado literal.'
    },
    'phoenix-man-opm-ma': {
        'type': 'merge', 'keep': 1, 'drop': [2], 'name': 'Modo Pingüino Diamante',
        'note': '"Modo Pollito (Roto)" = mismo estado post-regeneración sin poder propio. Se fusiona.'
    },
    # 18-21. Variantes narrativas donde el ki igual es CANÓNICAMENTE correcto
    'kaio-sama-del-norte-saga-saiyan-446': {
        'type': 'keep',
        'note': 'Kaio-sama vivo vs con aureola: mismo poder (x1.35), variante narrativa del mismo estado. MANTENER.'
    },
    'pikkon-torneo-del-otro-mundo-912': {
        'type': 'keep',
        'note': 'Sin Pesas vs Sin Pesas (Velocidad Máxima): misma potencia física, variante de movilidad. MANTENER.'
    },
    'piccolo-dbs-superhero': {
        'type': 'keep',
        'note': 'Orange Piccolo vs Giant Orange Piccolo: la gigantificación NO multiplica el poder. Mismo ki correcto. MANTENER.'
    },
    'vegeta-saga-buu-saga-buu-213': {
        'type': 'keep',
        'note': 'SSJ2 vs Majin Vegeta: la posesión de Babidi NO aumenta el poder (solo sadismo). Mismo ki canónicamente correcto. MANTENER.'
    },
    # 22-23. Cabba + Kale
    'cabba-dragon-ball-super-566': {
        'type': 'merge', 'keep': 1, 'drop': [2], 'name': 'Super Saiyan 1',
        'note': '"Super Saiyan" duplicado de "Super Saiyan 1". SSJ2 queda escalado aparte.'
    },
    'kale-dbs-u6': {
        'type': 'patch',
        'note': '"SSJ Controlado (True)" es duplicado de la SSJ Perfecta (Controlada). SSJ Berserker > Controlada: Berserker = base 65.310.000.000 x100 = 6.531.000.000.000.',
        'merge': {'keep': 1, 'drop': [2], 'name': 'Super Saiyan Perfecta (Controlada)'},
        'forms': [
            {'index': 3, 'ki': 6531000000000, 'multiplier': 'x 100'},
        ]
    },
    # 24-42. No-DB / escenarios varios
    'black-sperm-opm-ma': {
        'type': 'patch',
        'note': 'Platinum Sperm > Golden Sperm (pelea final, superioridad explícita). Platinum = 14.430 x2 = 28.860.',
        'forms': [{'index': 2, 'ki': 28860, 'multiplier': 'x 2.7'}]
    },
    'biscuit-krueger-hxh-gi': {
        'type': 'patch',
        'note': 'Forma Verdadera > Forma Infante disfraz (disfraz deliberadamente débil). Verdadera = 2.573 x1.5 = 3.860.',
        'forms': [{'index': 2, 'ki': 3860, 'multiplier': 'x 1.5'}]
    },
    'pucci-made-in-heaven-jojo-pm001': {
        'type': 'patch',
        'note': 'Made in Heaven (Velocidad Infinita) >> C-Moon. MiH = 600 x2.7 = 1.620.',
        'forms': [{'index': 2, 'ki': 1620, 'multiplier': 'x 2.7'}]
    },
    'lord-boros-opm': {
        'type': 'patch',
        'note': 'Meteoric Burst >> Forma Liberada. MB = 3.748.500 x10 = 37.485.000.',
        'forms': [{'index': 2, 'ki': 37485000, 'multiplier': 'x 10'}]
    },
    'the-sentry': {
        'type': 'patch',
        'note': 'Sentry desatado >> suprimido. Desatado = 161.700.000.000.000 x2.7 = 436.590.000.000.000.',
        'forms': [{'index': 2, 'ki': 436590000000000, 'multiplier': 'x 2.7'}]
    },
    'overhaul-mha-shie': {
        'type': 'patch',
        'note': 'Forma Monstruosa Final (Katsukame) > Fusión con Shin Nemoto. Final = 1.880 x1.5 = 2.820.',
        'forms': [{'index': 2, 'ki': 2820, 'multiplier': 'x 1.5'}]
    },
    'katsuki-bakugo-mha': {
        'type': 'patch',
        'note': 'Full-Body Cluster (Despertar Final) > Despertar Cluster. Full-Body = 10.301 x1.6 = 16.482.',
        'forms': [{'index': 2, 'ki': 16482, 'multiplier': 'x 1.6'}]
    },
    'ant-man-marvel-616': {
        'type': 'patch',
        'note': 'Giant-Man (Macro) > Ant-Man (Micro) en potencia de impacto. Giant = 150 x1.5 = 225.',
        'forms': [{'index': 2, 'ki': 225, 'multiplier': 'x 1.5'}]
    },
    'denji-csm-903': {
        'type': 'patch',
        'note': 'Pochita Verdadero > Denji Híbrido. Pochita = 3.287 x1.5 = 4.931.',
        'forms': [{'index': 2, 'ki': 4931, 'multiplier': 'x 1.5'}]
    },
    'katana-man-csm-p1': {
        'type': 'patch',
        'note': 'Forma Híbrido (Katana Devil) > Forma Humana. Híbrido = 3.119 x1.5 = 4.679.',
        'forms': [{'index': 2, 'ki': 4679, 'multiplier': 'x 1.5'}]
    },
    'garou-hero-hunter-opm': {
        'type': 'patch',
        'note': 'Forma Semi-Monstruo (Espiral) > Cazador de Héroes humano. Semi-Monstruo = 2.741 x1.5 = 4.112.',
        'forms': [{'index': 2, 'ki': 4112, 'multiplier': 'x 1.5'}]
    },
    'kokushibo-kimetsu': {
        'type': 'patch',
        'note': 'Monstruo Desfigurado (superación de la muerte) > Espada Despertada + Regeneración. Monstruo = 6.195 x1.5 = 9.293.',
        'forms': [{'index': 2, 'ki': 9293, 'multiplier': 'x 1.5'}]
    },
    'muzan-kibutsuji-kny-901': {
        'type': 'patch',
        'note': 'Formas de combate escalan: Disfraz 7.683 (x1.35), Combate Final 8.537 (x1.5), Bebé Gigante 9.390 (x1.65), Látigos 10.244 (x1.8). Base 5.691.',
        'forms': [
            {'index': 2, 'ki': 8537, 'multiplier': 'x 1.5'},
            {'index': 3, 'ki': 9390, 'multiplier': 'x 1.65'},
            {'index': 4, 'ki': 10244, 'multiplier': 'x 1.8'},
        ]
    },
    'yoriichi-tsugikuni-kny-902': {
        'type': 'patch',
        'note': 'Escalado y REORDEN: Anciano (85) 4.634 (x1.25) < Pico Sengoku 5.004 (x1.35) < 13ª Forma 7.414 (x2). Base 3.707. Los nombres de las formas [1] y [2] se intercambian para mantener el orden ascendente.',
        'rename': {1: 'Yoriichi Anciano (85 Años)', 2: 'Yoriichi (Pico Sengoku)'},
        'forms': [
            {'index': 1, 'name': 'Yoriichi Anciano (85 Años)', 'ki': 4634, 'multiplier': 'x 1.25'},
            {'index': 2, 'name': 'Yoriichi (Pico Sengoku)', 'ki': 5004, 'multiplier': 'x 1.35'},
            {'index': 3, 'name': 'Decimotercera Forma Solar en Cadena', 'ki': 7414, 'multiplier': 'x 2'},
        ]
    },
    'hirudegarn-pel-culas-dbz-toei-805': {
        'type': 'patch',
        'note': 'Bestia Alada (completa) > Forma Mitad. Bestia = 2.163.000.000 x1.5 = 3.244.500.000.',
        'forms': [{'index': 2, 'ki': 3244500000, 'multiplier': 'x 1.5'}]
    },
    'rey-cold-formas-dbm-u8': {
        'type': 'patch',
        'note': 'Sexta Forma Titánica > Forma Original. Titánica = 163.800.000 x25 = 4.095.000.000.',
        'forms': [{'index': 3, 'ki': 4095000000, 'multiplier': 'x 25'}]
    },
    'gohan-u16-dbm-espectador': {
        'type': 'patch',
        'note': 'Modo Furia (x62.5) estaba inflada al ki del Místico (80.000.000.000). Furia = 100.000.000 x62.5 = 6.250.000.000. Místico (x800 = 80.000.000.000) intacto.',
        'forms': [{'index': 1, 'ki': 6250000000, 'multiplier': 'x 62.5'}]
    },
    'piccolo-inicio-saga-saiyan': {
        'type': 'patch',
        'note': 'Makankosappo a Plena Carga (técnica para superar a Raditz) >> Sin Ropa Pesada. Makankosappo = 1.575 x5 = 7.875.',
        'forms': [{'index': 2, 'ki': 7875, 'multiplier': 'x 5'}]
    },
    # Vegeta DB After: MANTENER (SSJ+Kaio-ken x20 es técnica inestable no-sostenible,
    # su ki refleja el SSJ1 puro sin stack real; escalarlo rompería el orden ascendente
    # del array y no existe consenso canónico de stack SSJ+KK20 en el manga).
    'vegeta-db-after': {
        'type': 'keep',
        'note': 'SSJ+Kaio-ken x20: técnica temporal no-sostenible (anime DBS vs Bills). Su ki 588.000.000.000 = SSJ1 puro es deliberado: evitar inventar un stack no canónico y preservar el orden ascendente SSJ1<SSJ2<SSJ3. MANTENER.'
    },
}

# ============================================================
# Reporte
# ============================================================
def fmt_ki(v):
    if v >= 1e12: return '%.2fT' % (v / 1e12)
    if v >= 1e9: return '%.2fB' % (v / 1e9)
    if v >= 1e6: return '%.2fM' % (v / 1e6)
    if v >= 1e3: return '%.2fK' % (v / 1e3)
    return str(int(v)) if v == int(v) else '%.2f' % v

lines = ['# PROPUESTA DE CORRECCIÓN DE CLONES PLANOS — ROSTER V26 (verificada)']
lines.append('')
lines.append('> **Regla rectora**: el APEX KI es la UNICA medida. Formas que representan transformaciones')
lines.append('> distintas DEBEN escalar; nombres que describen el MISMO estado se FUSIONAN.')
lines.append('> Acciones: **ESCALAR** · **FUSIONAR** · **MANTENER (justificado)**.')
lines.append('')
lines.append('| # | Personaje | Acción | Detalle |')
lines.append('|---|-----------|--------|---------|')

n = 0
counts = {'patch': 0, 'merge': 0, 'keep': 0}
for cid, prop in PROPOSALS.items():
    if prop is None:
        continue
    c = chars.get(cid)
    name = c['name'] if c else cid
    n += 1
    if prop['type'] == 'keep':
        counts['keep'] += 1
        accion = 'MANTENER'
        detalle = prop.get('note', '')
        lines.append('| %d | %s (%s) | **MANTENER** | %s |' % (n, name, cid, detalle))
        continue
    if prop['type'] == 'merge':
        counts['merge'] += 1
        lines.append('| %d | %s (%s) | **FUSIONAR** | %s → queda "%s" |' % (
            n, name, cid, prop.get('note',''), prop.get('name','')))
        if 'forms' in prop:
            for f in prop.get('forms', []):
                cur = chars[cid]['forms'][f['index']]
                lines.append('        ↳ [%d] %s : %s → %s (x%s)' % (
                    f['index'], cur['name'], fmt_ki(cur['kiNumeric']), fmt_ki(f['ki']), f['multiplier']))
        continue
    # patch
    counts['patch'] += 1
    accion = 'ESCALAR' + (' + FUSIONAR' if 'merge' in prop else '')
    partes = []
    for f in prop.get('forms', []):
        cur = chars[cid]['forms'][f['index']]
        partes.append('[%d] %s: %s→%s (x%s)' % (
            f['index'], cur['name'], fmt_ki(cur['kiNumeric']), fmt_ki(f['ki']), f['multiplier']))
    detalle = prop.get('note', '') + (' | ' + ' | '.join(partes))
    if 'merge' in prop:
        m = prop['merge']
        detalle += ' | FUSION: %s' % m.get('name', '')
    lines.append('| %d | %s (%s) | **%s** | %s |' % (n, name, cid, accion, detalle))

lines.append('')
lines.append('---')
lines.append('### Resumen')
lines.append('- ESCALAR: %d | FUSIONAR: %d | MANTENER: %d | Total propuestas: %d' % (
    counts['patch'], counts['merge'], counts['keep'], n))
lines.append('- Tras aplicar: total de formas 1316 → ~1310 (13-14 fusiones netas de ~15 parejas).')
lines.append('- Cell: alineación de medida única (baseKiNumeric 9B → 2B = forms[0]) + fusión "Estado Base"/"Cell Perfecto".')
lines.append('- Pendiente humano: aprobación caso por caso antes de tocar el JSON.')

report = '\n'.join(lines)
with open('reporte_propuesta_clones.md', 'w', encoding='utf-8') as f:
    f.write(report)
with open('propuesta_clones_v26.json', 'w', encoding='utf-8') as f:
    json.dump({'version': 'V26', 'dryRun': True, 'propuestas': PROPOSALS}, f, ensure_ascii=False, indent=2)

print('reporte_propuesta_clones.md OK (%d líneas)' % len(lines))
print('propuesta_clones_v26.json OK (dry-run, NO aplicado)')
print()
print(report)