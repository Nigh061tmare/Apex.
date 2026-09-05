import re

with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

current = None
found = False
for line in lines:
    m = re_header.match(line)
    if m:
        current = m.group(1)
        continue
    if '| # Forma |' in line and current == 'cell-saga-androides-98':
        found = True
        continue
    if current == 'cell-saga-androides-98' and found:
        m = re_row.match(line)
        if m:
            idx, name, ki, fmt, mult, tier, apex = m.groups()
            print('  Forma {}: {} | Ki={} | mult={} | tier={}'.format(idx, name.strip(), ki.strip(), mult.strip(), tier.strip()))
        if not line.strip().startswith('|'):
            break