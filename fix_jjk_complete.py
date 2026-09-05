import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

print("=" * 60)
print("APLICANDO FIXES MASIVOS JJK - POWER SCALING CANÓNICO")
print("=" * 60)

# ============================================================
# 1. SUKUNA - Múltiples versiones/etapas
# ============================================================

# Sukuna Heian (True Form) - 20 dedos, forma completa
sukuna_heian = chars.get('sukuna-ryomen-jjk-20sellos-s001')
if sukuna_heian:
    sukuna_heian['baseKiNumeric'] = 15000
    sukuna_heian['baseKiFormatted'] = '15.000 Unidades'
    sukuna_heian['baseTier'] = '7-A'
    sukuna_heian['tier'] = '7-A'
    print('FIXED: Sukuna Heian (20 dedos) -> 15,000 (7-A)')

# Sukuna 15 dedos en cuerpo de Megumi (vs Gojo)
sukuna_megumi = chars.get('sukuna-megumi-15dedos')
if not sukuna_megumi:
    # Crear entrada nueva si no existe
    data['characters']['sukuna-megumi-15dedos'] = {
        'id': 'sukuna-megumi-15dedos',
        'name': 'Ryomen Sukuna (15 Dedos - Cuerpo Megumi)',
        'universe': 'Jujutsu Kaisen',
        'baseKiNumeric': 13000,
        'baseKiFormatted': '13.000 Unidades',
        'baseTier': '7-A',
        'tier': '7-A',
        'forms': [
            {'name': 'Estado Base (15 Dedos en Megumi)', 'kiNumeric': 13000, 'kiFormatted': '13.000 Unidades', 'multiplier': 'x 1', 'tier': '7-A', 'isApexCustom': False},
            {'name': 'Despertar Parcial (vs Gojo)', 'kiNumeric': 15000, 'kiFormatted': '15.000 Unidades', 'multiplier': 'x 1.15', 'tier': '7-A', 'isApexCustom': False}
        ]
    }
    print('CREADO: Sukuna 15 Dedos (Cuerpo Megumi) -> 13,000 base')

# Sukuna 15 dedos en Itadori
sukuna_itadori = chars.get('sukuna-itadori-15dedos')
if not sukuna_itadori:
    data['characters']['sukuna-itadori-15dedos'] = {
        'id': 'sukuna-itadori-15dedos',
        'name': 'Ryomen Sukuna (15 Dedos - Cuerpo Itadori)',
        'universe': 'Jujutsu Kaisen',
        'baseKiNumeric': 12000,
        'baseKiFormatted': '12.000 Unidades',
        'baseTier': '7-A',
        'tier': '7-A',
        'forms': [
            {'name': 'Estado Base (15 Dedos en Itadori)', 'kiNumeric': 12000, 'kiFormatted': '12.000 Unidades', 'multiplier': 'x 1', 'tier': '7-A', 'isApexCustom': False},
            {'name': 'Despertar vs Mahoraga', 'kiNumeric': 15000, 'kiFormatted': '15.000 Unidades', 'multiplier': 'x 1.25', 'tier': '7-A', 'isApexCustom': False}
        ]
    }
    print('CREADO: Sukuna 15 Dedos (Cuerpo Itadori) -> 12,000 base')

# Sukuna Heian ya existe, actualizar base
sukuna_heian = chars.get('sukuna-ryomen-jjk-20sellos-s001')
if sukuna_heian:
    sukuna_heian['baseKiNumeric'] = 15000
    sukuna_heian['baseKiFormatted'] = '15.000 Unidades'
    sukuna_heian['baseTier'] = '7-A'
    sukuna_heian['tier'] = '7-A'
    # Asegurar formas
    if 'forms' in sukuna_heian:
        sukuna_heian['forms'] = [
            {'name': 'Ryomen Sukuna (Forma Heian / 20 Dedos)', 'kiNumeric': 15000, 'kiFormatted': '15.000 Unidades', 'multiplier': 'x 1', 'tier': '7-A', 'isApexCustom': False}
        ]
    print('FIXED: Sukuna Heian (20 dedos) -> 15,000 base')

# ============================================================
# 2. JOGO - Bajar a nivel Special Grade bajo (por debajo de Sukuna)
# ============================================================
jogo = chars.get('jogo-jjk-shibuya')
if jogo:
    jogo['baseKiNumeric'] = 4500
    jogo['baseKiFormatted'] = '4.500 Unidades'
    jogo['baseTier'] = '7-A'
    jogo['tier'] = '7-A'
    if 'forms' in jogo:
        jogo['forms'] = [
            {'name': 'Jogo (Estado Base)', 'kiNumeric': 4500, 'kiFormatted': '4.500 Unidades', 'multiplier': 'x 1', 'tier': '7-A', 'isApexCustom': False},
            {'name': 'Maximum: Meteor', 'kiNumeric': 18000, 'kiFormatted': '18.000 Unidades', 'multiplier': 'x 4', 'tier': '7-A', 'isApexCustom': False},
            {'name': 'Maximum: Ultra', 'kiNumeric': 36000, 'kiFormatted': '36.000 Unidades', 'multiplier': 'x 8', 'tier': 'High 7-A', 'isApexCustom': False}
        ]
    print('FIXED: Jogo -> 4.500 base (Special Grade bajo)')

# ============================================================
# 3. MAHORAGA - Subir por encima de Jogo (adaptación perfecta)
# ============================================================
mahoraga = chars.get('mahoraga-jjk-shibuya')
if mahoraga:
    mahoraga['baseKiNumeric'] = 12000
    mahoraga['baseKiFormatted'] = '12.000 Unidades'
    mahoraga['baseTier'] = '7-A'
    mahoraga['tier'] = '7-A'
    if 'forms' in mahoraga:
        mahoraga['forms'] = [
            {'name': 'Mahoraga (Estado Base)', 'kiNumeric': 12000, 'kiFormatted': '12.000 Unidades', 'multiplier': 'x 1', 'tier': '7-A', 'isApexCustom': False},
            {'name': 'Adaptación: Contra Jogo', 'kiNumeric': 18000, 'kiFormatted': '18.000 Unidades', 'multiplier': 'x 1.5', 'tier': '7-A', 'isApexCustom': False},
            {'name': 'Adaptación Total: Rueda', 'kiNumeric': 24000, 'kiFormatted': '24.000 Unidades', 'multiplier': 'x 2', 'tier': 'High 7-A', 'isApexCustom': False},
            {'name': 'Adaptación Máxima (vs Sukuna)', 'kiNumeric': 15000, 'kiFormatted': '15.000 Unidades', 'multiplier': 'x 1.25', 'tier': '7-A', 'isApexCustom': False}
        ]
    print('FIXED: Mahoraga -> 12.000 base (adaptación > Jogo)')

# ============================================================
# 3. SUKUNA - Formas adicionales (15 dedos Itadori/Megumi)
# ============================================================
# Sukuna 15 dedos en Itadori (ya creado arriba)

# Sukuna 15 dedos en Megumi (vs Gojo)
sukuna_megumi = chars.get('sukuna-megumi-15dedos')
if sukuna_megumi:
    sukuna_megumi['baseKiNumeric'] = 13000
    sukuna_megumi['baseKiFormatted'] = '13.000 Unidades'
    sukuna_megumi['baseTier'] = '7-A'
    sukuna_megumi['tier'] = '7-A'
    sukuna_megumi['forms'] = [
        {'name': 'Estado Base (15 Dedos en Megumi)', 'kiNumeric': 13000, 'kiFormatted': '13.000 Unidades', 'multiplier': 'x 1', 'tier': '7-A', 'isApexCustom': False},
        {'name': 'Despertar vs Gojo', 'kiNumeric': 15000, 'kiFormatted': '15.000 Unidades', 'multiplier': 'x 1.15', 'tier': '7-A', 'isApexCustom': False},
        {'name': 'Dominio: Santuario Maligno', 'kiNumeric': 20000, 'kiFormatted': '20.000 Unidades', 'multiplier': 'x 1.54', 'tier': 'High 7-A', 'isApexCustom': False}
    ]
    print('FIXED: Sukuna 15 Dedos (Megumi) -> 13.000 base')

# Sukuna 15 dedos en Itadori
sukuna_itadori = chars.get('sukuna-itadori-15dedos')
if sukuna_itadori:
    sukuna_itadori['baseKiNumeric'] = 12000
    sukuna_itadori['baseKiFormatted'] = '12.000 Unidades'
    sukuna_itadori['baseTier'] = '7-A'
    sukuna_itadori['tier'] = '7-A'
    sukuna_itadori['forms'] = [
        {'name': 'Estado Base (15 Dedos en Itadori)', 'kiNumeric': 12000, 'kiFormatted': '12.000 Unidades', 'multiplier': 'x 1', 'tier': '7-A', 'isApexCustom': False},
        {'name': 'Despertar vs Mahoraga', 'kiNumeric': 15000, 'kiFormatted': '15.000 Unidades', 'multiplier': 'x 1.25', 'tier': '7-A', 'isApexCustom': False},
        {'name': 'Dominio: Santuario Maligno', 'kiNumeric': 20000, 'kiFormatted': '20.000 Unidades', 'multiplier': 'x 1.67', 'tier': 'High 7-A', 'isApexCustom': False}
    ]
    print('FIXED: Sukuna 15 Dedos (Itadori) -> 12.000 base')

# Sukuna Heian (20 dedos) - ya existe, actualizar
sukuna_heian = chars.get('sukuna-ryomen-jjk-20sellos-s001')
if sukuna_heian:
    sukuna_heian['baseKiNumeric'] = 15000
    sukuna_heian['baseKiFormatted'] = '15.000 Unidades'
    sukuna_heian['baseTier'] = '7-A'
    sukuna_heian['tier'] = '7-A'
    print('FIXED: Sukuna Heian (20 dedos) -> 15.000 base')

# ============================================================
# 4. KENJAKU - Bajar a 9K (Special Grade alto, no roto)
# ============================================================
kenjaku = chars.get('kenjaku-jjk')
if kenjaku:
    kenjaku['baseKiNumeric'] = 9000
    kenjaku['baseKiFormatted'] = '9.000 Unidades'
    kenjaku['baseTier'] = '7-A'
    kenjaku['tier'] = '7-A'
    if 'forms' in kenjaku:
        kenjaku['forms'] = [
            {'name': 'Estado Base (Pseudo-Geto)', 'kiNumeric': 9000, 'kiFormatted': '9.000 Unidades', 'multiplier': 'x 1', 'tier': '7-A', 'isApexCustom': False},
            {'name': 'Dominio: Vientre Fusión', 'kiNumeric': 16200, 'kiFormatted': '16.200 Unidades', 'multiplier': 'x 1.8', 'tier': '7-A', 'isApexCustom': False}
        ]
    print('FIXED: Kenjaku -> 9.000 base (Special Grade equilibrado)')

# ============================================================
# 5. GOJO - Subir a 15K (para enfrentar Sukuna Megumi + Mahoraga)
# ============================================================
gojo = chars.get('gojo-satoru-jjk-peak-gs001')
if gojo:
    gojo['baseKiNumeric'] = 15000
    gojo['baseKiFormatted'] = '15.000 Unidades'
    gojo['baseTier'] = '7-A'
    gojo['tier'] = '7-A'
    print('FIXED: Gojo -> 15.000 base (para enfrentar Sukuna Megumi + Mahoraga)')

gojo_std = chars.get('satoru-gojo-jjk')
if gojo_std:
    gojo_std['baseKiNumeric'] = 15000
    gojo_std['baseKiFormatted'] = '15.000 Unidades'
    gojo_std['baseTier'] = '7-A'
    gojo_std['tier'] = '7-A'
    print('FIXED: Gojo (estándar) -> 15.000 base')

# ============================================================
# 5. HAKARI - Bajar a nivel Mahoraga (~10K base, Jackpot ~100K)
# ============================================================
hakari = chars.get('kinji-hakari')
if hakari:
    hakari['baseKiNumeric'] = 9500
    hakari['baseKiFormatted'] = '9.500 Unidades'
    hakari['baseTier'] = '7-A'
    hakari['tier'] = '7-A'
    if 'forms' in hakari:
        for f in hakari['forms']:
            if 'jackpot' in f['name'].lower() or '4:11' in f['name'].lower():
                f['kiNumeric'] = 95000
                f['kiFormatted'] = '95.000 Unidades'
                f['multiplier'] = 'x 10'
                f['tier'] = '7-A'
                # Mantener flags de inmortalidad
                if 'specialFlags' not in f:
                    f['specialFlags'] = []
                flags = ['Inmortalidad 4:11 min (Jackpot)', 'Regeneración extrema (RCT Auto)', 'CE Infinito durante Jackpot', 'Inmortalidad funcional 4:11 min']
                for flag in ['Inmortalidad 4:11 min (Jackpot)', 'Regeneración extrema (RCT Auto)', 'CE Infinito durante Jackpot', 'Inmortalidad funcional 4:11 min']:
                    if flag not in f['specialFlags']:
                        f['specialFlags'].append(flag)
                print('FIXED: Hakari -> Base 9.5K, Jackpot 95K (x10) - Nivel Mahoraga')

# ============================================================
# 5. MAHORAGA - Ajustar a 12K base (adaptación > Jogo)
# ============================================================
mahoraga = chars.get('mahoraga-jjk-shibuya')
if mahoraga:
    mahoraga['baseKiNumeric'] = 12000
    mahoraga['baseKiFormatted'] = '12.000 Unidades'
    mahoraga['baseTier'] = '7-A'
    mahoraga['tier'] = '7-A'
    print('FIXED: Mahoraga -> 12.000 base (adaptación > Jogo)')

# ============================================================
# GOJO VS SUKUNA MEGUMI + MAHORAGA - Niveles coherentes
# ============================================================
print('\n--- RESUMEN NIVELES FINALES ---')
print('Sukuna Heian (20 dedos): 15.000')
print('Sukuna 15 dedos (Megumi): 13.000')
print('Sukuna 15 dedos (Itadori): 12.000')
print('Gojo: 15.000')
print('Sukuna 15 ded Megumi: 13.000')
print('Mahoraga: 12.000')
print('Jogo: 4.500')
print('Kenjaku: 9.000')
print('Hakari Base: 9.500 | Jackpot: 95.000 (x10)')

# Save
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'w', encoding='utf-8') as f:
    json.dump({'meta': data.get('meta', {}), 'deprecatedRecords': data.get('deprecatedRecords', []), 'characters': data['characters']}, f, indent=2, ensure_ascii=False)

print('\n✅ TODOS LOS FIXES JJK APLICADOS Y GUARDADOS')