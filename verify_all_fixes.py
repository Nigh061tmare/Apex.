import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Check all corrected characters by searching for their Base Ki lines
targets = [
    "krilin-saga-cell",
    "krilin-dragon-ball-cl-sico-802",
    "son-goku-saga-cell-saga-androides-459",
    "vegeta-saga-cell-saga-androides-856",
    "son-gohan-joven-saga-androides-cell-945",
    # Also verify previously fixed ones
    "turles-dbz-toei",
    "ten-shin-han-dragon-ball-cl-sico-812",
    "son-gohan-saga-super-dragon-ball-super-39",
    "son-gohan-dbs-superhero",
    "son-goku-u18-dbm",
    "vegeta-u18-dbm",
    "gohan-u16-dbm-espectador",
    "son-bra-dbm-u16",
    "vegetto-base-saga-buu-120",
]

for tid in targets:
    # Find the character block
    pattern = r'###\s+\d+\.\s+.*?\(`' + re.escape(tid) + r'`\).*?(?=###|\Z)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        block = match.group(0)
        # Extract Base Tier and Base Ki line
        meta_match = re.search(r'\*\*Base Tier\*\*:\s*`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`', block)
        if meta_match:
            tier = meta_match.group(1)
            ki = meta_match.group(2)
            print("{} | Tier: {} | Base Ki: {}".format(tid, tier, ki))
        else:
            print("{} | META NOT FOUND".format(tid))
    else:
        print("{} | CHARACTER NOT FOUND".format(tid))