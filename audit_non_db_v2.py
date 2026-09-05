import json, re

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=" * 80)
print("AUDITORIA NO-DB - FRANQUICIAS NO DRAGON BALL")
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

# Filtrar solo NO Dragon Ball
non_db = {k: v for k, v in universes.items() if 'DRAGON BALL' not in k.upper()}

TIER_REGEX = re.compile(r'^(High |Low )?\d{1,2}-[ABC]$')

total_issues = 0

for uni, data in sorted(non_db.items(), key=lambda x: -x[1]['count']):
    print("\n" + "=" * 60)
    print(f" {uni}: {data['count']} chars, {data['forms']} formas")
    print("=" * 60)
    
    issues_found = 0
    for char in data['chars']:
        char_issues = []
        char_data = data['characters'].get(char['id']) if 'characters' in data else None
        
        # Buscar en data original completa
        # (simplificado: usar el char que ya tenemos)
        
        # 1. Base tier y form[0].tier match
        bt = char.get('tier')
        ft = char['forms'][0].get('tier') if char['forms'] else None
        if bt != ft:
            char_issues.append(f"TIER MISMATCH: baseTier={bt} vs form0.tier={ft}")
        
        # 2. Base Ki > 0
        if not char['base_ki'] or char['base_ki'] <= 0:
            char_issues.append(f"BASE KI INVALIDO: {char['base_ki']}")
        
        # 3. Formas con Ki ascendente
        prev_ki = -1
        for f in char['forms']:
            ki = f.get('kiNumeric') or f.get('ki')
            if ki is not None and ki < prev_ki:
                char_issues.append(f"ORDEN KI: {f['name']} Ki={ki:,.0f} < anterior {prev_ki:,.0f}")
            if ki is not None:
                prev_ki = ki
        
        # 4. Multiplicadores SSJ coherentes (solo Saiyans)
        for f in char['forms']:
            name_lower = f['name'].lower()
            if ('super saiyan' in name_lower or 'super saiyajin' in name_lower) and \
               'god' not in name_lower and 'blue' not in name_lower and \
               'rose' not in name_lower and '4' not in name_lower and \
               'ikar' not in name_lower and 'legendario' not in name_lower and \
               'broly' not in name_lower and 'mary sue' not in name_lower and \
               'parody' not in name_lower and 'ultra' not in name_lower and \
               'ego' not in name_lower and 'instinto' not in name_lower:
                m = re.search(r'[\d\.]+', f['multiplier'].replace('\u00d7', 'x').replace('x', ''))
                if m:
                    mult = float(m.group())
                    name_lower = f['name'].lower()
                    if '3' in f['name'] or 'ssj3' in name_lower:
                        if abs(mult - 400) > 50:
                            char_issues.append(f"MULT_SSJ3: {f['name']} mult={mult}x (esperado ~400x)")
                    elif '2' in f['name'] or 'ssj2' in name_lower or '2do grado' in name_lower or 'grado 2' in name_lower:
                        if abs(mult - 100) > 30 and abs(mult - 65) > 15:
                            char_issues.append(f"MULT_SSJ2: {f['name']} mult={mult}x (esperado ~100x o ~65x)")
                    elif 'super saiyan' in name_lower and '2' not in name_lower and '3' not in name_lower and 'grado' not in name_lower:
                        if abs(mult - 50) > 10:
                            char_issues.append(f"MULT_SSJ1: {f['name']} mult={mult}x (esperado ~50x)")
        
        # 5. Tier format valido
        if bt and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', bt):
            char_issues.append(f"TIER FORMAT INVALIDO: {bt}")
        for f in char['forms']:
            ft = f.get('tier')
            if ft and not re.match(r'^(High |Low )?\d{1,2}-[ABC]$', ft):
                char_issues.append(f"TIER FORM INVALIDO: {f['name']} = {ft}")
        
        if char_issues:
            issues_found += 1
            print(f"\n[WARN] {char['id']} ({char['name']}):")
            for issue in char_issues:
                print(f"   [ERROR] {issue}")
    
    if issues_found == 0:
        print(f"  [OK] SIN ERRORES - {data['count']} personajes OK")
    else:
        print(f"  [WARN] {issues_found} personajes con issues")
    
    total_issues += issues_found

print("\n" + "=" * 80)
print(f"AUDITORIA NO-DB COMPLETADA - Total issues: {total_issues}")
print("=" * 80)