import json, re

with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

current = None
v25_forms = {}

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
            if current not in v25_counts:
                v25_counts[current] = []
            v25_counts[current].append({
                'name': name.strip(),
                'ki': ki.strip(),
                'fmt': fmt.strip(),
                'mult': mult.strip(),
                'tier': tier.strip()
            })

# Print V25 forms for the 3 problematic characters
for cid in ['jogo-jjk-shibuya', 'sukuna-ryomen-jjk-20sellos-s001', 'mahoraga-jjk-shibuya']:
    if cid in v25_forms:
        print("\n" + cid + " V25 forms (" + str(len(v25_forms[cid])) + "):")
        for f in v25_forms[cid]:
            print("  - " + f['name'] + " | Ki=" + f['ki'] + " | mult=" + f['mult'] + " | tier=" + f['tier'])