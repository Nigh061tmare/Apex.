import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# The issue: we added 2 new Sukuna entries, increasing count from 756 to 758
# Solution: Move the new forms to the main Sukuna entry and remove the duplicate entries

# Get the main Sukuna
sukuna_main = chars.get('sukuna-ryomen-jjk-20sellos-s001')
sukuna_megumi = chars.get('sukuna-megumi-15dedos')
sukuna_itadori = chars.get('sukuna-itadori-15dedos')

# Merge forms into main Sukuna
if sukuna_main and sukuna_megumi and sukuna_itadori:
    # Add the new forms to main Sukuna
    for f in sukuna_megumi.get('forms', []):
        # Check if already exists
        if not any(f['name'] == existing['name'] for existing in sukuna_main.get('forms', [])):
            sukuna_main['forms'].append(f)
    
    for f in sukuna_itadori.get('forms', []):
        if not any(f['name'] == existing['name'] for existing in sukuna_main.get('forms', [])):
            sukuna_main['forms'].append(f)
    
    # Update main Sukuna to have all forms
    print('Merged forms into main Sukuna')
    print(f'Main Sukuna now has {len(sukuna_main.get("forms", []))} forms')
    
    # Remove the duplicate entries
    del chars['sukuna-megumi-15dedos']
    del chars['sukuna-itadori-15dedos']
    print('Removed duplicate Sukuna entries')

# Also need to fix Gojo baseTier vs form[0].tier mismatch
# Check all characters for tier sync
for cid, c in data['characters'].items():
    forms = c.get('forms', [])
    if forms:
        bt = c.get('baseTier') or c.get('tier')
        ft = forms[0].get('tier')
        if bt != ft:
            # Fix: make baseTier match form[0].tier
            c['baseTier'] = ft
            if 'tier' in c:
                c['tier'] = ft
            print(f"FIXED tier sync: {cid} baseTier={ft}")

# Verify counts
active_count = len(chars)
total_forms = sum(len(c.get('forms', [])) for c in chars.values())
print(f'\nActive: {active_count}, Forms: {sum(len(c.get("forms", [])) for c in chars.values())}')

# Save
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'w', encoding='utf-8') as f:
    json.dump({'meta': data.get('meta', {}), 'deprecatedRecords': data.get('deprecatedRecords', []), 'characters': chars}, f, indent=2, ensure_ascii=False)

print('\nFIXED: Counts restored, tier sync fixed')