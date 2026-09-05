import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`')

targets = {
    "krilin-saga-cell": 75000,
    "krilin-dragon-ball-cl-sico-802": 120000,
    "son-goku-saga-cell-saga-androides-459": 150000000,
    "vegeta-saga-cell-saga-androides-856": 160000000,
    "son-gohan-joven-saga-androides-cell-945": 12000000,
    "turles-dbz-toei": 300000,
    "ten-shin-han-dragon-ball-cl-sico-812": 290000,
    "son-gohan-saga-super-dragon-ball-super-39": 57000000,
    "son-gohan-dbs-superhero": 57000000,
    "son-goku-u18-dbm": 103000000,
    "vegeta-u18-dbm": 100000000,
    "gohan-u16-dbm-espectador": 100000000,
    "son-bra-dbm-u16": 30000000,
    "vegetto-base-saga-buu-120": 100000000000,
}

current_char = None
found = {}

for line in lines:
    m = re_header.match(line)
    if m:
        current_char = m.group(1)
        continue
    m = re_meta.match(line)
    if m and current_char in targets:
        tier = m.group(1)
        ki_str = m.group(2)
        # Parse ki - handle Spanish format (dots as thousands separators)
        ki_clean = ki_str.replace("`", "").replace(",", "").replace(".", "")
        try:
            ki_val = int(ki_clean)
        except:
            ki_val = 0
        expected = targets[current_char]
        status = "OK" if ki_val == expected else "FAIL"
        print("{} | Expected: {:>15,} | Got: {:>15,} | Tier: {} {}".format(
            current_char, expected, ki_val, tier, status))
        found[current_char] = True

print("\nMissing targets:")
for t in targets:
    if t not in found:
        print("  {} - NOT FOUND IN OUTPUT".format(t))