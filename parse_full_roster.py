import re, json

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

def parse_ki(s):
    clean = s.replace("`", "").replace(",", "").replace(".", "").strip()
    try: return float(clean)
    except: return None

characters = {}
current_char = None
base_tier = None
base_ki = None
in_table = False
forms = []
current_universe = None
char_universe = {}

for line in lines:
    if line.startswith('## 🌌'):
        match = re.search(r'## 🌌\s+\d+\.\s+UNIVERSO:\s+(.+)', line)
        if match:
            current_universe = match.group(1).strip()
    m = re_header.match(line)
    if m:
        if current_char:
            characters[current_char] = {'tier': base_tier, 'base_ki': base_ki, 'forms': forms, 'universe': current_universe}
        current_char = m.group(1)
        base_tier = None
        base_ki = None
        in_table = False
        forms = []
        continue
    m = re_meta.match(line)
    if m:
        base_tier = m.group(1).strip()
        base_ki = parse_ki(m.group(2))
        continue
    if "| # Forma |" in line:
        in_table = True
        continue
    if in_table and line.strip().startswith("|") and not line.strip().startswith("| :-"):
        m = re_row.match(line)
        if m:
            idx, name, ki_str, fmt_ki, mult_str, tier, apex = m.groups()
            forms.append({'idx': int(idx), 'name': name.strip(), 'ki': parse_ki(ki_str), 'mult': mult_str.strip(), 'tier': tier.strip()})
        continue
    if in_table and not line.strip().startswith("|"):
        in_table = False
        continue

if current_char:
    characters[current_char] = {'tier': base_tier, 'base_ki': base_ki, 'forms': forms, 'universe': current_universe}

print("Total:", len(characters))

# Guardar para uso posterior
with open('characters_parsed.json', 'w', encoding='utf-8') as f:
    # Convertir a serializable
    serializable = {}
    for cid, c in characters.items():
        serializable[cid] = {
            'tier': c['tier'],
            'base_ki': c['base_ki'],
            'universe': c['universe'],
            'forms': [{'name': f['name'], 'ki': f['ki'], 'mult': f['mult'], 'tier': f['tier']} for f in c['forms']]
        }
    json.dump(serializable, f, ensure_ascii=False, indent=2)

print("Guardado characters_parsed.json")

# Contar por universo
uni_counts = {}
for cid, c in characters.items():
    u = c['universe']
    if u:
        uni_counts[u] = uni_counts.get(u, 0) + 1

print("\nPersonajes por universo:")
for u, count in sorted(uni_counts.items(), key=lambda x: -x[1]):
    print(f"  {u}: {count}")