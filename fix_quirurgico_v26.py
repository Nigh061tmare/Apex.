# -*- coding: utf-8 -*-
"""
CORRECCIÓN QUIRÚRGICA V26:
1. Revertir deprecatedRecords a las 13 entradas originales (quitar 8 dummies dep-v26-form-*).
2. Sukuna Heian: eliminar formas contaminadas (Super Saiyan 1/2/3) -> solo Forma Heian canónica.
3. Mahoraga: reordenar formas en orden ascendente estricto de Ki.
4. Validar que no quedan personajes sukuna-megumi/itadori duplicados sueltos.
"""
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

PATH = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# ---------- 1. DeprecatedRecords: quitar dummies ----------
dep = data.get('deprecatedRecords', [])
orig = [d for d in dep if not str(d.get('recordId', '')).startswith('dep-v26-form-')]
print('DeprecatedRecords: %d -> %d' % (len(dep), len(orig)))
data['deprecatedRecords'] = orig

# ---------- 2. Sukuna Heian: quitar Super Saiyans ----------
su = chars.get('sukuna-ryomen-jjk-20sellos-s001')
if su:
    antes = len(su.get('forms', []))
    su['forms'] = [f for f in su.get('forms', [])
                   if not any(k in f.get('name', '').lower() for k in ('super saiyan',))]
    despues = len(su['forms'])
    print('Sukuna Heian formas: %d -> %d' % (antes, despues))
    su['baseKiNumeric'] = 15000
    su['baseKiFormatted'] = '15.000 Unidades'
    su['baseTier'] = '7-A'
    su['tier'] = '7-A'
    # Asegurar que las formas restantes estan bien formadas
    for f in su['forms']:
        if 'multiplier' not in f or not f.get('multiplier'):
            f['multiplier'] = 'x 1'
        if f.get('kiNumeric') != 15000:
            f['kiNumeric'] = 15000
            f['kiFormatted'] = '15.000 Unidades'
        if f.get('tier') != '7-A':
            f['tier'] = '7-A'
        if 'isApexCustom' not in f:
            f['isApexCustom'] = False
        print('   form:', json.dumps(f, ensure_ascii=False))

# ---------- 3. Mahoraga: orden ascendente ----------
ma = chars.get('mahoraga-jjk-shibuya')
if ma:
    forms = ma.get('forms', [])
    # ordenar por kiNumeric ascendente
    forms.sort(key=lambda f: float(f.get('kiNumeric', 0)))
    ma['forms'] = forms
    print('Mahoraga formas reordenadas:')
    for f in forms:
        print('   %s | ki=%s | mult=%s | tier=%s' % (f.get('name'), f.get('kiNumeric'), f.get('multiplier'), f.get('tier')))

# ---------- 4. Comprobar sueltos de sukuna ----------
for cid in ['sukuna-megumi-15dedos', 'sukuna-itadori-15dedos']:
    if cid in chars:
        print('ATENCION: sigue existiendo %s' % cid)
    else:
        print('OK: %s no existe' % cid)

# ---------- Guardar ----------
out = {
    'meta': data.get('meta', {}),
    'deprecatedRecords': data['deprecatedRecords'],
    'characters': chars
}
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)

# ---------- Resumen final ----------
total_forms = sum(len(c.get('forms', [])) for c in chars.values())
print()
print('=== RESUMEN FINAL ===')
print('activeCount:', len(chars))
print('deprecatedCount:', len(data['deprecatedRecords']))
print('totalCensus:', len(chars) + len(data['deprecatedRecords']))
print('totalForms:', total_forms)
print('OK: guardado de forma segura sin tocar V22 ni V25')