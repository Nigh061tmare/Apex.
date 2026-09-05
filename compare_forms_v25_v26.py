import json, re

# Load V26
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    v26_data = json.load(f)

v26_chars = v26_data['characters']

# Load V25
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
            v25_forms[current] = v25_forms.get(current, 0) + 1

# Load V26
with open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', 'r', encoding='utf-8') as f:
    v26_data = json.load(f)

v26_chars = v26_data['characters']

print("Characters with form count mismatch:")
for cid in set(list(v25_forms.keys()) + list(v26_chars.keys())):
    v25_count = v25_forms.get(cid, 0)
    v26_count = len(v26_chars.get(cid, {}).get('forms', []))
    if v25_count != v26_count:
        print("  {}: V25={}, V26={}".format(cid, v25_count, v26_count))

print("\nDone")