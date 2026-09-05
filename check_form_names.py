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
    if m and current == 'son-goku-u18-dbm':
        idx, name, ki, fmt, mult, tier, apex = m.groups()
        print("  Forma {}: {} | mult={} | Ki={}".format(idx, name.strip(), mult.strip(), ki.strip()))
    if m and current == 'vegeta-u18-dbm':
        idx, name, ki, fmt, mult, tier, apex = m.groups()
        print("  VEGETA Forma {}: {} | mult={} | Ki={}".format(idx, name.strip(), mult.strip(), ki.strip()))
    if m and current == 'trunks-futuro-v2-armadura-grados':
        idx, name, ki, fmt, mult, tier, apex = m.groups()
        print("  TRUNKS Forma {}: {} | mult={} | Ki={}".format(idx, name.strip(), mult.strip(), ki.strip()))