import json

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']

# Find all Sukuna entries
for cid in chars:
    if 'sukuna' in cid.lower() or 'sukuna' in chars[cid].get('name', '').lower():
        c = chars[cid]
        print(f'{cid}: {c.get("name")} - forms: {len(chars[cid].get("forms", []))} - baseKi: {chars[cid].get("baseKiNumeric")} tier: {chars[cid].get("baseTier") or chars[cid].get("tier")}')