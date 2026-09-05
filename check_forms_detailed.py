import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# Check key characters that should have multiple forms
important_chars = [
    'son-goku-saga-super-dragon-ball-super-732',
    'vegeta-saga-super-dragon-ball-super-454',
    'son-gohan-saga-super-dragon-ball-super-39',
    'vegeta-majin-ssj2-895',
    'freezer-resurreccion-f',
    'broly-dbs-dragon-ball-super-172',
    'jiren-dragon-ball-super-983',
    'black-freezer-manga-granolah',
    'vegetto-base-saga-buu-120',
    'gotenks-base-saga-buu-858',
    'trunks-futuro-v2-armadura-grados',
    'trunks-futuro-v4-manga-super-zamasu',
    'vegeta-saga-cell-saga-androides-856',
    'vegeta-majin-ssj2-895',
    'vegetto-base-saga-buu-120',
    'gotenks-base-saga-buu-858',
    'trunks-futuro-v2-armadura-grados',
    'son-gohan-saga-super-dragon-ball-super-39',
    'son-gohan-dbs-superhero',
    'piccolo-dbs-superhero',
    'freezer-resurreccion-f',
    'broly-dbs-dragon-ball-super-172',
    'jiren-dragon-ball-super-983',
    'black-freezer-manga-granolah',
    'vegetto-base-saga-buu-120',
    'gotenks-base-saga-buu-858',
    'trunks-futuro-v2-armadura-grados',
    'son-gohan-saga-super-dragon-ball-super-39',
    'son-gohan-dbs-superhero',
    'piccolo-dbs-superhero',
    'freezer-resurreccion-f',
    'broly-dbs-dragon-ball-super-172',
    'jiren-dragon-ball-super-983',
    'black-freezer-manga-granolah',
    'vegetto-base-saga-buu-120',
    'gotenks-base-saga-buu-858',
    'trunks-futuro-v2-armadura-grados',
]

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

print("Checking important characters:")
for cid in important_chars:
    if cid in chars:
        c = chars[cid]
        forms = c.get('forms', [])
        print(f"{cid}: {len(forms)} forms")
        for f in c.get('forms', []):
            print(f"  - {f['name']}")
        print()