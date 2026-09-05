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

for line in lines:
    m = re_header.match(line)
    if m:
        if current_char:
            characters[current_char] = {'tier': base_tier, 'base_ki': base_ki, 'forms': forms}
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
    characters[current_char] = {'tier': base_tier, 'base_ki': base_ki, 'forms': forms}

print("Total personajes:", len(characters))
print("Total formas:", sum(len(c['forms']) for c in characters.values()))

# Agrupar por franquicia
franchises = {}
for cid, c in characters.items():
    # Extraer franquicia del ID o contexto
    # Usar el header del markdown para saber la franquicia
    pass

# Contar por universo (del header del markdown)
# El markdown tiene secciones por universo
universes = {}
current_universe = None
for line in lines:
    if line.startswith('## 🌌'):
        match = re.search(r'## 🌌\s+\d+\.\s+UNIVERSO:\s+([^|]+)\|', line) or re.search(r'## 🌌\s+\d+\.\s+UNIVERSO:\s+(.+)', line)
        if match:
            current_universe = match.group(1).strip()
            universes[current_universe] = 0
    m = re_header.match(line)
    if m and current_universe:
        universes[current_universe] = universes.get(current_universe, 0) + 1

print("\nPERSONAJES POR UNIVERSO:")
for u, count in sorted(universes.items(), key=lambda x: -x[1]):
    print(f"  {u}: {count}")

# Contar formas por universo
forms_by_universe = {}
current_universe = None
for line in lines:
    if line.startswith('## 🌌'):
        match = re.search(r'## 🌌\s+\d+\.\s+UNIVERSO:\s+(.+)', line)
        if match:
            current_universe = match.group(1).strip()
    m = re_header.match(line)
    if m and current_universe:
        cid = m.group(1)
        if cid in characters:
            forms_by_universe[current_universe] = forms_by_universe.get(current_universe, 0) + len(characters[cid]['forms'])

print("\nFORMAS POR UNIVERSO:")
for u, count in sorted(forms_by_universe.items(), key=lambda x: -x[1]):
    print(f"  {u}: {count}")