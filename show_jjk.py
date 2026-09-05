import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']
jjk_chars = {cid: c for cid, c in data['characters'].items() if 'JUJUTSU' in c.get('universe', '').upper()}

print('Total JJK personajes:', len(jjk_chars))
print('=' * 80)

for cid, c in jjk_chars.items():
    base_ki = c.get('baseKiNumeric', c.get('baseKi', 0))
    base_tier = c.get('baseTier') or c.get('tier')
    forms = c.get('forms', [])
    name = c.get('name', cid).encode('ascii', 'replace').decode('ascii')
    print('\n' + name)
    print('  Base: {:,.0f} | Tier: {} | Formas: {}'.format(base_ki, base_tier, len(forms)))
    for f in c.get('forms', []):
        ki = f.get('kiNumeric') or f.get('ki') or 0
        mult = f.get('multiplier', 'x1')
        tier = f.get('tier', '?')
        flags = f.get('specialFlags', [])
        flag_str = ' | Flags: ' + str(flags) if flags else ''
        fname = f['name'].encode('ascii', 'replace').decode('ascii')
        print('  -> {}: {:,.0f} | {} | {}{}'.format(fname, ki, mult, tier, flag_str))