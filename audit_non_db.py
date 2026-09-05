import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=" * 80)
print("AUDITORÍA COMPLETA POR FRANQUICIA/UNIVERSO (NO DRAGON BALL)")
print("=" * 80)

# Agrupar por universo
universes = {}
for cid, char in data['characters'].items():
    universe = char.get('universe', 'UNKNOWN')
    if universe not in universes:
        universes[universe] = {'count': 0, 'forms': 0, 'chars': []}
    universes[universe]['count'] += 1
    universes[universe]['forms'] += len(char.get('forms', []))
    universes[universe]['chars'].append({
        'id': char['id'],
        'name': char.get('name', cid),
        'tier': char.get('baseTier') or char.get('tier'),
        'base_ki': char.get('baseKiNumeric') or char.get('base_ki'),
        'forms_count': len(char.get('forms', [])),
        'forms': char.get('forms', [])
    })

# Ordenar por universo
for uni, data in sorted(universes.items(), key=lambda x: -x[1]['count']):
    if 'DRAGON BALL' in uni.upper():
        continue
print(f"\n{'='*60}")
print(f" {uni}: {data['count']} chars, {data['forms']} formas")
print(f"{'='*60}")
    
    issues_found = 0
    for char in data['chars']:
        # Verificaciones
        char_issues = []
        
        # 1. Base tier y form[0].tier match
        char_data = None
        # Buscar en data original
        with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
            full_data = json.load(f)
            char_data = full_data['characters'].get(char['id'])
        
        if char_data:
            bt = char_data.get('baseTier') or char_data.get('tier')
            ft = char_data['forms'][0].get('tier') if char_data.get('forms') else None
            if bt != ft:
                char_issues.append(f"TIER MISMATCH: baseTier={bt} vs form0.tier={ft}")
        
        # 2. Base Ki > 0
        if not char['base_ki'] or char['base_ki'] <= 0:
            char_issues.append(f"BASE KI INVÁLIDO: {char['base_ki']}")
        
        # 3. Formas con Ki ascendente
        if char_data and char_data.get('forms'):
            prev_ki = -1
            for f in char_data['forms']:
                ki = f.get('kiNumeric') or f.get('ki')
                if ki and ki < prev_ki:
                    char_issues.append(f"ORDEN KI: {f['name']} Ki={ki} < anterior {prev_ki}")
                if ki:
                    prev_ki = ki
        
        # 4. Multiplicadores SSJ coherentes (solo para Saiyans)
        if char_data and char_data.get('forms'):
            for f in char_data['forms']:
                name_lower = f['name'].lower()
                if ('super saiyan' in f['name'].lower() or 'super saiyajin' in f['name'].lower()) and \
                   'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and \
                   'rose' not in f['name'].lower() and '4' not in f['name'].lower() and \
                   'ikar' not in f['name'].lower() and 'legendario' not in f['name'].lower() and \
                   'broly' not in f['name'].lower() and 'mary sue' not in f['name'].lower() and \
                   'parody' not in f['name'].lower():
                    mult_str = f.get('multiplier', '')
                    import re
                    m = re.search(r'[\d\.]+', f['multiplier'].replace('×', 'x').replace('x', ''))
                    if m:
                        mult = float(m.group())
                        name_lower = f['name'].lower()
                        if '3' in f['name'] or 'ssj3' in f['name'].lower():
                            if abs(mult - 400) > 50:
                                char_issues.append(f"MULT_SSJ3: {f['name']} mult={mult}x (esperado ~400x)")
                        elif '2' in f['name'] or 'ssj2' in f['name'].lower() or '2do grado' in f['name'].lower() or 'grado 2' in f['name'].lower():
                            if abs(mult - 100) > 30 and abs(mult - 65) > 15:
                                char_issues.append(f"MULT_SSJ2: {f['name']} mult={mult}x (esperado ~100x o ~65x)")
                        elif 'super saiyan' in f['name'].lower() and '2' not in f['name'] and '3' not in f['name'] and 'grado' not in f['name'].lower():
                            if abs(mult - 50) > 10:
                                char_issues.append(f"MULT_SSJ1: {f['name']} mult={mult}x (esperado ~50x)")
        
        # 5. Tier format válido
        import re
        TIER_REGEX = re.compile(r'^(High |Low )?\d{1,2}-[ABC]$')
        if char_data:
            bt = char_data.get('baseTier') or char_data.get('tier')
            if bt and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', bt):
                char_issues.append(f"TIER FORMAT INVÁLIDO: {bt}")
            for f in char_data.get('forms', []):
                ft = f.get('tier')
                if ft and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', ft):
                    char_issues.append(f"TIER FORM INVÁLIDO: {f['name']} = {ft}")
        
        if char_issues:
            issues_found += 1
            print(f"\n⚠️  {char['id']} ({char['name']}):")
            for issue in char_issues:
                print(f"   ❌ {issue}")
    
    if issues_found == 0:
        print(f"  ✅ SIN ERRORES - {data['count']} personajes OK")
    else:
        print(f"  ⚠️  {issues_found} personajes con issues")

print("\n" + "=" * 80)
print("AUDITORÍA NO-DB COMPLETADA")
print("=" * 80)