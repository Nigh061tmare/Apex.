# -*- coding: utf-8 -*-
import json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

DB_FRANCHISES = {'Dragon Ball'}

# Patrones de formas típicamente DRAGON BALL
DB_FORM_PATTERNS = [
    (r'super\s*saiyan|ssj|ssj2|ssj3|ssj4', 'Saiyan'),
    (r'kaio[-\s]?ken', 'Kaioken'),
    (r'oozaru|gran\s*simio|golden\s*oozaru', 'Oozaru'),
    (r'super\s*saiyan\s*god|ssg', 'SSG'),
    (r'super\s*saiyan\s*blue|ssb|ssgss', 'SSB'),
    (r'ultra\s*instinct|instinto\s*perfecto', 'UI'),
    (r'zenkai', 'Zenkai'),
]

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

hits = []
for cid, c in data['characters'].items():
    franchise = c.get('franchise', '?')
    if franchise in DB_FRANCHISES:
        continue
    forms = c.get('forms', [])
    for fi, f in enumerate(forms):
        name = f.get('name', '')
        for pat, label in DB_FORM_PATTERNS:
            if re.search(pat, name, re.I):
                hits.append((cid, c.get('name'), franchise, fi, name, label))
                break

print('Total posibles contaminaciones DB en franquicias no-DB:', len(hits))
for h in hits:
    print(' -', h)

# Tambien: formas con apexKiMultiplier None o no numerico en TODO el roster
print()
print('=== Formas con apexKiMultiplier invalido ===')
bad = 0
for cid, c in data['characters'].items():
    for fi, f in enumerate(c.get('forms', [])):
        m = f.get('apexKiMultiplier')
        if m is None or (isinstance(m, str) and not m.replace('.', '').replace('-', '').isdigit()) or (isinstance(m, (int, float)) and m <= 0):
            if cid in ('jogo-jjk-shibuya', 'mahoraga-jjk-shibuya', 'sukuna-ryomen-jjk-20sellos-s001'):
                continue  # ya conocido
            bad += 1
            print(' -', cid, '|', f.get('name'), '| mult=', m)
print('Total invalidos (excluyendo 3 conocidos):', bad)