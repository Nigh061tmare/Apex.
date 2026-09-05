import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

targets = {
    "son-gohan-joven-saga-androides-cell-945": "Gohan Cell - debe superar a Goku/Vegeta SSJ",
    "son-goku-saga-cell-saga-androides-459": "Goku Cell",
    "vegeta-saga-cell-saga-androides-856": "Vegeta Cell",
    "cell-saga-androides-98": "Cell Perfecto",
}

current_char = None
in_table = False

for line in lines:
    m = re_header.match(line)
    if m:
        current_char = m.group(1)
        in_table = False
        continue
    if "| # Forma |" in line:
        in_table = True
        continue
    if in_table and line.strip().startswith("|") and not line.strip().startswith("| :-"):
        m = re_row.match(line)
        if m and current_char in targets:
            idx, name, ki_str, fmt_ki, mult_str, tier, apex = m.groups()
            print(f"{current_char} | Forma {idx}: {name.strip()} | Ki={ki_str.strip()} | mult={mult_str.strip()} | tier={tier.strip()}")
    if in_table and not line.strip().startswith("|"):
        in_table = False