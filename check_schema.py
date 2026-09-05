# -*- coding: utf-8 -*-
import json, sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Muestra de universe/powerSchema de varios personajes
samples = ['jogo-jjk-shibuya', 'son-goku-saga-buu-saga-buu-646', 'saitama-opm', 'superman-dc-909']
for sid in samples:
    c = data['characters'].get(sid)
    if c:
        print(sid, '| universe=', repr(c.get('universe')), '| powerSchema=', repr(c.get('powerSchema')))

print()

# Mapa universe -> nombre (mira el meta si existe)
meta = data.get('meta', {})
print('META keys:', list(meta.keys()) if isinstance(meta, dict) else type(meta))
universe_map = meta.get('universeMap') or meta.get('universos') if isinstance(meta, dict) else None
if universe_map:
    print('universoMap:', json.dumps(universe_map, ensure_ascii=False)[:1200])

# Contar personajes por universe
from collections import Counter
uc = Counter(c.get('universe') for c in data['characters'].values())
print('Distribución universe:', dict(uc))