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

# Build V26 JSON structure matching V25 schema exactly
roster_v26 = {
    "meta": {
        "title": "APEX Power Scaling Engine – Roster Oficial V26",
        "version": "V26",
        "status": "V26_CANONICAL_BASELINE",
        "sourceRoster": "ROSTER_NIVELES_PODER_CORREGIDO_V25.json",
        "appliedPatchFile": "rosterEnrichmentPatches.json",
        "description": "V26 Canonical Baseline – Reemplaza a V25 permanentemente"
    },
    "deprecatedRecords": [
        {"recordId": "dep-001", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-002", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-003", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-004", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-005", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-006", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-007", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-008", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-009", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-010", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-011", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-012", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"},
        {"recordId": "dep-013", "recordType": "duplicate", "reason": "Duplicate entry merged", "sourcePatchId": "V26-MERGE-001", "timestamp": "2026-09-05T00:00:00Z", "snapshot": {}, "canonicalRecordId": "merged-id"}
    ],
    "characters": {}
}

for cid, char in characters.items():
    forms_list = []
    for f in char['forms']:
        forms_list.append({
            "id": f"form_{f['idx']}",
            "name": f['name'],
            "kiNumeric": f['ki'],
            "kiFormatted": f"{f['ki']:,.0f}".replace(",", ".") if f['ki'] else "0",
            "multiplier": f['mult'],
            "tier": f['tier'],
            "isApexCustom": False
        })
    
    roster_v26["characters"][cid] = {
        "id": cid,
        "name": cid.replace('-', ' ').title(),
        "baseTier": char['tier'],
        "baseKiNumeric": char['base_ki'],
        "baseKiFormatted": f"{char['base_ki']:,.0f}".replace(",", ".") if char['base_ki'] else "0",
        "universe": char['universe'],
        "forms": forms_list,
        "powerSchema": {
            "tierStatus": "internally_aligned"
        }
    }

output_path = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(roster_v26, f, indent=2, ensure_ascii=False)

# Debug: verify what was written
with open(output_path, 'r', encoding='utf-8') as f:
    test_data = json.load(f)
print("Keys written:", list(test_data.keys()))
print("Has meta:", 'meta' in test_data)
print("Has deprecatedRecords:", 'deprecatedRecords' in test_data)
print("Deprecated count:", len(test_data.get('deprecatedRecords', [])))

print(f"V26 JSON generado: {len(characters)} personajes, {sum(len(c['forms']) for c in characters.values())} formas")
print(f"Archivo: {output_path}")