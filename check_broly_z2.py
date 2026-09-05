import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

current = None
for line in lines:
    m = re_header.match(line)
    if m:
        current = m.group(1)
        continue
    m = re_row.match(line)
    if m and current == 'broly-dbz-pel-culas-dbz-toei-822':
        idx, name, ki, fmt, mult, tier, apex = m.groups()
        print("  Forma {}: '{}' | Ki={} | mult={} | tier={}".format(idx, name.strip(), ki.strip(), mult.strip(), tier.strip()))