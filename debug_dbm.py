import re

with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`')

targets = ["gohan-u16-dbm-espectador", "son-bra-dbm-u16"]

current_char = None
for i, line in enumerate(lines):
    m = re_header.match(line)
    if m:
        current_char = m.group(1)
        continue
    if current_char in targets:
        m = re_meta.match(line)
        if m:
            print("L{} | {} | META: Tier={}, Ki={}".format(i, current_char, m.group(1), m.group(2)))
            # Check if in CANON_BASES
            CANON_BASES = {
                "gohan-u16-dbm-espectador": {"base_ki": 100000000, "tier": "3-C"},
                "son-bra-dbm-u16": {"base_ki": 30000000, "tier": "3-C"},
            }
            if current_char in CANON_BASES:
                print("  -> IN CANON_BASES: {}".format(CANON_BASES[current_char]))
            else:
                print("  -> NOT IN CANON_BASES")