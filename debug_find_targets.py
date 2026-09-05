import re

with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num')

targets = [
    "son-goku-u18-dbm",
    "vegeta-u18-dbm", 
    "turles-dbz-toei",
    "ten-shin-han-dragon-ball-cl-sico-812",
    "son-gohan-saga-super-dragon-ball-super-39",
    "vegetto-base-saga-buu-120",
    "son-gohan-dbs-superhero",
    "piccolo-dbs-superhero",
    "son-goku-mini-daima-full",
    "vegeta-mini-daima",
    "vegeta-majin-ssj2-895",
    "son-goku-saga-buu-saga-buu-646",
    "vegeta-saga-buu-saga-buu-213",
    "son-goku-saga-super-dragon-ball-super-732",
    "vegeta-saga-super-dragon-ball-super-454"
]

for i, line in enumerate(lines):
    m = re_header.match(line)
    if m:
        char_id = m.group(1)
        if char_id in targets:
            print('FOUND TARGET: {} at line {}'.format(char_id, i))
            # Print next 5 lines
            for j in range(i, min(i+10, len(lines))):
                print('  L{}: {}'.format(j, lines[j].rstrip()))
            print('---')