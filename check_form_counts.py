import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

for cid, c in chars.items():
    forms = c.get('forms', [])
    if len(forms) > 10:
        print(cid + ': ' + str(len(forms)) + ' forms')
        for f in c['forms']:
            print('  - ' + f['name'])