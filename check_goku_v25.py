import re

with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

current = None
for line in lines:
    m = re_header.match(line)
    if m:
        current = m.group(1)
        continue
    if '| # Forma |' in line:
        if current == 'goku-namek-post-zenkai-892':
            break
        continue
    if line.strip().startswith('|') and not line.strip().startswith('| :-'):
        m = re_row.match(line)
        if m and current == 'goku-namek-post-zenkai-892':
            idx, name, ki, fmt, mult, tier, apex = m.groups()
            print('  Forma {}: {} | mult={} | tier={}'.format(idx, name.strip(), mult.strip(), tier.strip()))