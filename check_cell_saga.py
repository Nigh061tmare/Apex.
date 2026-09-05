import re

with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

def parse_ki(s):
    clean = s.replace("`", "").replace(",", "").strip()
    try:
        return float(clean)
    except:
        return None

targets = [
    "krilin-saga-cell",
    "krilin-dragon-ball-cl-sico-802",  # Krilin Saga Super
    "son-goku-saga-cell-saga-androides-459",
    "son-goku-saga-super-dragon-ball-super-732",
    "vegeta-saga-cell-saga-androides-856",
    "vegeta-saga-super-dragon-ball-super-454",
    "piccolo-saga-cell-buu-saga-androides-946",
    "son-gohan-joven-saga-androides-cell-945",
]

current_char = None
base_tier = None
base_ki = None
in_table = False

for i, line in enumerate(lines):
    m = re_header.match(line)
    if m:
        current_char = m.group(1)
        base_tier = None
        base_ki = None
        in_table = False
        continue
    m = re_meta.match(line)
    if m:
        base_tier = m.group(1).strip()
        base_ki = parse_ki(m.group(2))
        if current_char in targets:
            print("=== {} ===".format(current_char))
            print("  Base Tier: {} | Base Ki: {} ({})".format(base_tier, base_ki, "{:,.0f}".format(base_ki).replace(",", ".")))
        continue
    if "| # Forma |" in line:
        in_table = True
        continue
    if in_table and line.strip().startswith("|") and not line.strip().startswith("| :-"):
        m = re_row.match(line)
        if m and current_char in targets:
            idx, name, ki_str, fmt_ki, mult_str, tier, _ = m.groups()
            print("  Forma {}: {} | Ki={} | mult={} | tier={}".format(idx, name.strip(), ki_str.strip(), mult_str.strip(), tier.strip()))
    if in_table and not line.strip().startswith("|"):
        in_table = False