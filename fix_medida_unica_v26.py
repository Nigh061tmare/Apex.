# -*- coding: utf-8 -*-
"""
FIX QUIRÚRGICO FINAL: desalineación de medida única (baseKiNumeric vs forms[0]).
Evidencia interna:
  - Cósmicos x1000: Jean Grey (forma x1.35 = 1.871e27 cuadra con forms[0], no con base),
    Anti-Monitor (x1.5 = 1.922e27 idem). Corrección: base = forms[0] (x1 = medida única).
  - Gojo x2: base=15.000 (decisión editorial Gojo≈Sukuna 20D) pero forma=5.200 -> forma debe ser 15.000.
  - Hakari: Jackpot x10=95.000 confirma base=9.500 -> forma base debe ser 9.500.
  - Black Freezer: forma x2.5=459e12 cuadra con base 183.75e12 -> forms[0] 180e12 -> 183.75e12.
"""
import json, sys, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']

ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
bak = 'src/data/BACKUP_ROSTER_V26_ANTES_MEDIDA_UNICA_%s.json' % ts
shutil.copy2(SRC, bak)
print('Backup:', bak)

def fmt_ki_formatted(v):
    v = int(round(v))
    return '{:,}'.format(v).replace(',', '.')

# A) Cósmicos: alinear baseKiNumeric al forms[0] (x1). Mantener formas.
COSMICOS = ['gran-sacerdote','zeno-sama','franklin-richards','jean-grey-fenix',
            'molecule-man','scarlet-witch','anti-monitor','dr-manhattan','spectre']
for cid in COSMICOS:
    c = chars.get(cid)
    if not c or not c.get('forms'):
        print('  SKIP (no existe):', cid); continue
    f0 = c['forms'][0]
    old_base = c.get('baseKiNumeric')
    new_base = f0['kiNumeric']
    if abs(old_base - new_base) > 0.5:
        c['baseKiNumeric'] = float(new_base)
        c['baseKiFormatted'] = fmt_ki_formatted(new_base)
        print('  FIX %-22s base %.4e -> %.4e (= forms[0] x1)' % (cid, old_base, new_base))
    else:
        print('  OK  %-22s ya alineado' % cid)

# B) Gojo (2): la forma base debe ser 15.000 (decisión editorial)
GOJOS = ['gojo-satoru-jjk-peak-gs001','satoru-gojo-jjk']
for cid in GOJOS:
    c = chars.get(cid)
    if not c or not c.get('forms'):
        print('  SKIP (no existe):', cid); continue
    f0 = c['forms'][0]
    if abs(f0['kiNumeric'] - 15000) > 0.5:
        f0['kiNumeric'] = 15000.0
        f0['kiFormatted'] = '15.000'
        print('  FIX %-28s forms[0] -> 15.000 (Gojo = Sukuna 20D)' % cid)
    else:
        print('  OK  %-28s ya en 15.000' % cid)

# C) Hakari: forma base 9.500 (Jackpot x10 = 95.000)
c = chars.get('kinji-hakari')
if c:
    f0 = c['forms'][0]
    if abs(f0['kiNumeric'] - 9500) > 0.5:
        f0['kiNumeric'] = 9500.0
        f0['kiFormatted'] = '9.500'
        print('  FIX kinji-hakari forms[0] -> 9.500 (Jackpot x10 = 95.000 confirma base)')
    else:
        print('  OK  kinji-hakari ya en 9.500')

# D) Black Freezer: forms[0] 180e12 -> 183.75e12 (forma x2.5=459e12 confirma base 183.75e12)
c = chars.get('black-freezer-manga-granolah')
if c:
    f0 = c['forms'][0]
    if abs(f0['kiNumeric'] - 183750000000000) > 0.5:
        f0['kiNumeric'] = 183750000000000.0
        f0['kiFormatted'] = fmt_ki_formatted(183750000000000)
        print('  FIX black-freezer-manga-granolah forms[0] -> 183.750.000.000.000')
    else:
        print('  OK  black-freezer ya alineado')

with open(SRC, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print()
print('JSON guardado OK')

# Re-verificar la auditoría
print()
print('=== RE-VERIFICACIÓN (desalineaciones restantes) ===')
n = 0
for cid, c in chars.items():
    forms = c.get('forms', [])
    if not forms: continue
    base = c.get('baseKiNumeric')
    f0 = forms[0].get('kiNumeric')
    if base and f0 and abs(base - f0) > 0.5:
        n += 1
        print('  ❌ %-45s base=%s forms[0]=%s' % (cid[:45], base, f0))
print('Total restantes:', n)