import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

hakari = data['characters'].get('kinji-hakari')
if hakari and 'forms' in hakari:
    for f in hakari['forms']:
        name_lower = f['name'].lower()
        if 'jackpot' in f['name'].lower() or '4:11' in f['name'].lower() or 'jackpot' in f['name'].lower():
            # Añadir flag de inmortalidad/regeneración extrema sin tocar Ki
            if 'specialFlags' not in f:
                f['specialFlags'] = []
            flags_to_add = [
                'Inmortalidad 4:11 min (Jackpot)',
                'Regeneración extrema (RCT Auto)',
                'CE Infinito durante Jackpot',
                'Inmortalidad funcional 4:11 min'
            ]
            for flag in ['Inmortalidad 4:11 min (Jackpot)', 'Regeneración extrema (RCT Auto)', 'CE Infinito durante Jackpot', 'Inmortalidad funcional 4:11 min']:
                if flag not in f['specialFlags']:
                    f['specialFlags'].append(flag)
            print('HAKARI ACTUALIZADO (solo flags):', f['name'])
            print('  Flags añadidos:', f['specialFlags'])

# Save
import json
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'w', encoding='utf-8') as f:
    json.dump({'meta': data.get('meta', {}), 'deprecatedRecords': data.get('deprecatedRecords', []), 'characters': data['characters']}, f, indent=2, ensure_ascii=False)

print('GUARDADO - Solo flags añadidos, Ki intacto')