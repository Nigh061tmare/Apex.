# -*- coding: utf-8 -*-
import json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

DB_PREFIX = 'DRAGON BALL'

# Patrones de formas típicamente DRAGON BALL
DB_FORM_PATTERNS = [
    (r'super\s*saiyan|ssj\b|ssj\s*1|ssj\s*2|ssj\s*3|ssj\s*4|saiyajin', 'Saiyan'),
    (r'kaio[-\s]?ken', 'Kaioken'),
    (r'oozaru|gran\s*simio|golden\s*oozaru|mono gigante', 'Oozaru'),
    (r'super\s*saiyan\s*god|\bssg\b|dios rojo', 'SSG'),
    (r'super\s*saiyan\s*blue|\bssb\b|ssgss', 'SSB'),
    (r'ultra\s*instinct|instinto\s*perfecto|ultra ego', 'UI/UE'),
    (r'zenkai', 'Zenkai'),
    (r'fusion\s*potara|potara', 'Potara'),
    (r'genkidama|kamehameha', 'Golpe DB'),
]

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

hits = []
for cid, c in data['characters'].items():
    uni = c.get('universe', '?')
    if uni.startswith(DB_PREFIX):
        continue
    forms = c.get('forms', [])
    for fi, f in enumerate(forms):
        name = f.get('name', '')
        for pat, label in DB_FORM_PATTERNS:
            if re.search(pat, name, re.I):
                hits.append((cid, c.get('name'), uni, fi, name, label))
                break

print('Total posibles contaminaciones DB en universos NO-DB:', len(hits))
for h in hits:
    print(' -', h)

print()
print('=== Formas con multiplier invalido en universo NO-DB ===')
bad = 0
for cid, c in data['characters'].items():
    uni = c.get('universe', '?')
    if uni.startswith(DB_PREFIX):
        continue
    for fi, f in enumerate(c.get('forms', [])):
        m = f.get('multiplier')
        if m is None or not re.match(r'^x\s*[\d\.]+$', str(m)):
            bad += 1
            if bad <= 25:
                print(' -', cid, '|', f.get('name'), '| mult=', repr(m))
print('Total multiplers invalidos NO-DB:', bad)