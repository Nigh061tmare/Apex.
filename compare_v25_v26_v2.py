import json, re

# Count forms in V25 markdown
with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

current = None
v25_counts = {}
v25_total = 0

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
            v25_counts[current] = v25_counts.get(current, 0) + 1
            v25_total += 1

print('V25 Total forms:', v25_total)
print()

# Check which characters have fewer forms in our V26
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = data['characters']
v26_total = sum(len(c.get('forms', [])) for c in chars.values())
print('V26 Total forms:', v26_total)
print('Difference:', v26_total - v25_total)
print()

# Find differences
print('Characters with form count differences:')
for cid in v25_counts:
    v25_count = v25_counts.get(cid, 0)
    v26_count = len(chars.get(cid, {}).get('forms', []))
    if v25_count != v26_count:
        print(f'  {cid}: V25={v25_count}, V26={v26_count} (diff={v26_count - v25_count:+d})')

# Also check V26 characters not in V25
v26_chars = set(chars.keys())
v25_chars = set(v25_counts.keys())
new_in_v26 = v26_chars - v25_chars
removed_from_v26 = v25_chars - v26_chars
if new_in_v26:
    print(f'\nNew characters in V26: {new_in_v26}')
if removed_from_v26:
    print(f'\nCharacters removed from V26: {removed_from_v26}')