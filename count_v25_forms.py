import re

with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

current = None
forms_per_char = {}

for line in lines:
    m = re_header.match(line)
    if m:
        current = m.group(1)
        continue
    if '| # Forma |' in line:
        continue
    if line.strip().startswith('|') and not line.strip().startswith('| :-'):
        m = re_row.match(line)
        if m and current:
            idx, name, ki, fmt, mult, tier, apex = m.groups()
            if current not in forms_per_char:
                forms_per_char[current] = 0
            forms_per_char[current] = forms_per_char.get(current, 0) + 1

print("Characters with multiple forms in V25:")
for cid, count in sorted(forms_per_char.items(), key=lambda x: -x[1]):
    if count > 1:
        print(f'{cid}: {count} forms')