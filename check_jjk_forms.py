# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']
for cid in ['jogo-jjk-shibuya', 'mahoraga-jjk-shibuya', 'sukuna-ryomen-jjk-20sellos-s001']:
    c = chars.get(cid)
    if not c:
        print('== NO EXISTE:', cid)
        continue
    print('==' + c.get('name', '') + ' (' + cid + ')')
    for i, f in enumerate(c.get('forms', [])):
        print('  [%d] %s | mult=%s | ki=%s | tier=%s' % (
            i, f.get('name'), f.get('apexKiMultiplier'), f.get('kiNumeric'), f.get('tier')))
    print()

# Check total forms again + names uniqueness per character
print('=== SUMA DE FORMAS ===')
total = sum(len(c.get('forms', [])) for c in chars.values())
print('totalForms:', total)