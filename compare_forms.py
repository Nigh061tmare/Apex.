import json, re

# Load V25 counts
with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

current = None
v25_counts = {}

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

# Load V26
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    v26 = json.load(f)

chars = v26['characters']

print("Characters with form count differences:")
diffs = 0
for cid in set(list(chars.keys()) + list(v25_counts.keys())):
    v25_count = v25_counts.get(cid, 0)
    v26_count = len(chars.get(cid, {}).get('forms', []))
    if v25_count != v26_count:
        diff = v26_count - v25_count
        print(f"  {cid}: V25={v25_count}, V26={v26_count} (diff={diff:+d})")
        diffs += abs(v26_count - v25_count)

print(f"\nTotal difference: {diffs} forms")