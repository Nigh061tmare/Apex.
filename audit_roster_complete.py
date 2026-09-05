import re, json

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

characters = []
current_char = None
base_tier = None
base_ki = None
in_table = False
forms = []

def parse_ki(s):
    clean = s.replace("`", "").replace(",", "").replace(".", "").strip()
    try:
        return float(clean)
    except:
        return None

for line in lines:
    m = re_header.match(line)
    if m:
        if current_char:
            characters.append({
                'id': current_char,
                'tier': base_tier,
                'base_ki': base_ki,
                'forms': forms
            })
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
            forms.append({
                'idx': int(idx),
                'name': name.strip(),
                'ki': parse_ki(ki_str),
                'fmt_ki': fmt_ki.strip(),
                'mult': mult_str.strip(),
                'tier': tier.strip(),
                'apex': apex.strip() == '⭐ **Sí**'
            })
        continue
    if in_table and not line.strip().startswith("|"):
        in_table = False

# Don't forget last character
if current_char:
    characters.append({
        'id': current_char,
        'tier': base_tier,
        'base_ki': base_ki,
        'forms': forms
    })

print("=== ROSTER AUDIT COMPLETO ===")
print(f"Total personajes: {len(characters)}")
total_forms = sum(len(c['forms']) for c in characters)
print(f"Total formas: {total_forms}")

# Show all character IDs with base stats
print("\n=== TODOS LOS PERSONAJES ===")
for c in characters:
    print(f"  {c['id']:50s} | Tier: {c['tier']:8s} | Base Ki: {c['base_ki']:>15,.0f} | Formas: {len(c['forms'])}")

# Check for missing expected transformations
print("\n=== CHECK TRANSFORMACIONES ESPERADAS ===")
expected_transforms = {
    "son-goku-saga-super-dragon-ball-super-732": ["Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 3", "Super Saiyan God", "Super Saiyan Blue", "SSGSS Kaioken", "Ultra Instinto Señal", "Ultra Instinto Dominado"],
    "vegeta-saga-super-dragon-ball-super-454": ["Super Saiyan", "Super Saiyan 2", "Super Saiyan 3", "Super Saiyan God", "Super Saiyan Blue", "Super Saiyan Blue Evolution", "Ultra Ego"],
    "son-gohan-saga-super-dragon-ball-super-39": ["Super Saiyan", "Super Saiyan 2", "Ultimate", "Beast"],
    "son-goku-u18-dbm": ["Kaioken", "Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 3"],
    "vegeta-u18-dbm": ["Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 3"],
    "son-goku-mini-daima-full": ["Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 3", "Super Saiyan 4"],
    "vegeta-mini-daima": ["Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 3"],
    "son-goku-saga-buu-saga-buu-646": ["Super Saiyan 1", "Super Saiyan 2", "Super Saiyan 3"],
    "vegeta-saga-buu-saga-buu-213": ["Super Saiyan 1", "Super Saiyan 2", "Majin Vegeta"],
    "son-gohan-joven-saga-androides-cell-945": ["Super Saiyan", "Super Saiyan 2"],
    "vegeta-saga-cell-saga-androides-856": ["Super Saiyan", "Super Vegeta"],
    "son-goku-saga-cell-saga-androides-459": ["Super Saiyan 1", "Super Saiyan Full Power"],
    "son-goku-23-tenkaichi": ["Sin Ropa Pesada"],
    "tenshinhan-db-clasico": ["Shiyoken", "Modo 23 Torneo", "Kikoho Primigenio"],
    "yamcha-db-clasico": ["Modo 21 Torneo", "Modo 23 Torneo"],
    "chaos-dragon-ball-cl-sico-318": ["Enano Psíquico"],
    "yamcha-saga-saiyan": [],
    "tenshinhan-saga-saiyan": ["Kikoho Suicida"],
    "piccolo-saga-saiyan": ["Supresión Inicial", "Poder Máximo vs Nappa", "Ráfaga Máxima", "Escudo Sacrificial"],
    "nappa-saga-saiyan": ["Gran Mono"],
    "raditz-saga-saiyan": ["Gran Mono", "Super Saiyan 2"],
    "vegeta-llegada-a-la-tierra-saga-saiyan-504": ["Oozaru"],
}

for char_id, expected in expected_transforms.items():
    char = next((c for c in characters if c['id'] == char_id), None)
    if char:
        actual = [f['name'] for f in char['forms']]
        missing = [e for e in expected if not any(e in a for a in actual)]
        extra = [a for a in actual if not any(e in a for e in expected)]
        if missing or extra:
            print(f"  {char_id}:")
            if missing:
                print(f"    FALTANTES: {missing}")
            if extra:
                print(f"    EXTRA/INESPERADAS: {extra}")
    else:
        print(f"  {char_id}: NO ENCONTRADO EN ROSTER")

# Save full audit
with open('roster_audit.json', 'w', encoding='utf-8') as f:
    json.dump(characters, f, indent=2, ensure_ascii=False)
print("\nAudit guardado en roster_audit.json")