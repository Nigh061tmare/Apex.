import re

with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`')

found_headers = 0
found_meta = 0
for i, line in enumerate(lines[:200]):
    m = re_header.match(line)
    if m:
        print('L{}: HEADER -> {}'.format(i, m.group(1)))
        found_headers += 1
    m = re_meta.match(line)
    if m:
        print('L{}: META -> Tier={}'.format(i, m.group(1)))
        found_meta += 1

print('Total headers: {}, Total meta: {}'.format(found_headers, found_meta))