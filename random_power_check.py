import json, random

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']
char_ids = list(chars.keys())

print("=" * 80)
print("MUESTREO ALEATORIO DE NIVELES DE PODER - 50 PERSONAJES")
print("=" * 80)

# Semilla para reproducibilidad
random.seed(42)
sample_ids = random.sample(list(chars.keys()), min(50, len(chars)))

TIER_REGEX = __import__('re').compile(r'^(High |Low )?\d{1,2}-[ABC]$')

def get_ki(f):
    return f.get('kiNumeric') or f.get('ki') or 0

issues_found = 0

for i, cid in enumerate(sample_ids):
    char = chars[cid]
    print(f"\n{'='*60}")
    print(f"[{i+1}/50] {char.get('name', cid)} ({cid})")
    print(f"  Universo: {char.get('universe', 'N/A')}")
    print(f"  Base Tier: {char.get('baseTier') or char.get('tier')}")
    print(f"  Base Ki: {char.get('baseKiNumeric', char.get('baseKi', 0)):,.0f}".replace(',', '.'))
    print(f"  Formas: {len(char.get('forms', []))}")
    
    issues = []
    forms = char.get('forms', [])
    
    # 1. Base tier vs form[0].tier
    if forms:
        bt = char.get('baseTier') or char.get('tier')
        ft = forms[0].get('tier')
        if bt != ft:
            print(f"  ❌ TIER MISMATCH: baseTier={bt} vs form0.tier={ft}")
    
    # 2. Base Ki > 0
    base_ki = chars[char.get('id', '')].get('baseKiNumeric', char.get('baseKi', 0))
    if not base_ki or base_ki <= 0:
        print(f"  ❌ BASE KI INVÁLIDO: {base_ki}")
    
    # 3. Orden Ki ascendente en formas
    prev_ki = -1
    for f in forms:
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if ki and ki < prev_ki:
            print(f"  ❌ ORDEN KI: {f['name']} Ki={ki:,.0f} < anterior {prev_ki:,.0f}")
        prev_ki = ki if ki else prev_ki
    
    # 4. Multiplicadores SSJ
    for f in forms:
        name_lower = f['name'].lower()
        if ('super saiyan' in f['name'].lower() or 'super saiyajin' in f['name'].lower()) and \
           'god' not in f['name'].lower() and 'blue' not in f['name'].lower() and \
           'rose' not in f['name'].lower() and '4' not in f['name'].lower() and \
           'ikar' not in f['name'].lower() and 'legendario' not in f['name'].lower() and \
           'broly' not in f['name'].lower() and 'mary sue' not in f['name'].lower() and \
           'parody' not in f['name'].lower() and 'ultra' not in f['name'].lower() and \
           'ego' not in f['name'].lower() and 'instinto' not in f['name'].lower():
            m = __import__('re').search(r'[\d\.]+', f['multiplier'].replace('\u00d7', 'x').replace('x', ''))
            if m:
                mult = float(m.group())
                name_lower = f['name'].lower()
                if '3' in f['name'] or 'ssj3' in f['name'].lower():
                    if abs(mult - 400) > 50:
                        print(f"  ⚠️ MULT_SSJ3: {f['name']} mult={mult}x (esperado ~400x)")
                elif '2' in f['name'] or 'ssj2' in f['name'].lower() or '2do grado' in f['name'].lower() or 'grado 2' in f['name'].lower():
                    if abs(mult - 100) > 30 and abs(mult - 65) > 15:
                        print(f"  ⚠️ MULT_SSJ2: {f['name']} mult={mult}x (esperado ~100x o ~65x)")
                elif 'super saiyan' in f['name'].lower() and '2' not in f['name'] and '3' not in f['name'] and 'grado' not in f['name'].lower():
                    if abs(mult - 50) > 10:
                        print(f"  ⚠️ MULT_SSJ1: {f['name']} mult={mult}x (esperado ~50x)")
    
    # 5. Tier format
    TIER_REGEX = __import__('re').compile(r'^(High |Low )?\d{1,2}-[ABC]$')
    bt = char.get('baseTier') or char.get('tier')
    if bt and not TIER_REGEX.match(bt):
        print(f"  ⚠️ TIER FORMAT INVÁLIDO base: {bt}")
    for f in forms:
        ft = f.get('tier')
        if ft and not __import__('re').match(r'^(High |Low )?\d{1,2}-[ABC]$', ft):
            print(f"  ⚠️ TIER FORM INVÁLIDO: {f['name']} = {ft}")
    
    # 6. Ki > 0 en formas
    for f in forms:
        ki = f.get('kiNumeric') or f.get('ki') or 0
        if ki <= 0:
            print(f"  ❌ KI INVÁLIDO: {f['name']} = {ki}")
    
    # Mostrar formas
    print(f"  Formas ({len(forms)}):")
    for f in forms:
        ki = f.get('kiNumeric') or f.get('ki') or 0
        print(f"    [{f.get('tier')}] {f['name']} | Ki={ki:,.0f} | mult={f.get('multiplier')}")
    
    if not any(['❌' in str(locals().get(k, '')) for k in ['ki', 'tier', 'mult'] if k in locals()]):
        print(f"  [OK]")

print("\n" + "=" * 80)
print("MUESTREO ALEATORIO COMPLETADO")
print("=" * 80)