# -*- coding: utf-8 -*-
"""
Comparador V26 JSON (nuestro roster activo) vs ROSTER_NIVELES_PODER_KI_COMPLETO_V26_CORREGIDO.md (Claude).
Extrae discrepancias significativas de Ki base por personaje para decidir qué conservar.
NO modifica nada: solo auditoría.
"""
import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

MD_PATH = 'ROSTER_NIVELES_PODER_KI_COMPLETO_V26_CORREGIDO.md'
JSON_PATH = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'

# ---------- 1. Parsear el MD de Claude ----------
with open(MD_PATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()

uni_pattern = re.compile(r'^## 🌌 (\d+)\. UNIVERSO: (.+)$')
char_pattern = re.compile(r'^### (\d+)\. (.+) \(`([^`]+)`\)$')
base_pattern = re.compile(r'^-\s*\*\*Base Tier\*\*:\s*`([^`]+)`\s*\|\s*\*\*Base Ki Numérico\*\*:\s*`([^`]+)`\s*\(([^)]+)\)')
row_pattern = re.compile(r'^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*`([^`]+)`\s*\|')

current_uni = None
current_char = None
claude = {}  # id -> {tier, ki_raw}

for line in lines:
    m = uni_pattern.match(line)
    if m:
        current_uni = int(m.group(1))
        continue
    m = char_pattern.match(line)
    if m:
        cid = m.group(3).strip()
        current_char = {'id': cid, 'uni': current_uni, 'base': None, 'forms': []}
        claude[cid] = current_char
        continue
    if current_char is None:
        continue
    m = base_pattern.match(line)
    if m:
        raw = m.group(2).replace('`', '').replace(',', '').replace('.', '')
        try:
            current_char['base'] = float(raw)
            current_char['tier'] = m.group(1)
        except ValueError:
            pass
        continue
    m = row_pattern.match(line)
    if m and 'Nombre de la Forma' not in line:
        try:
            ki = float(m.group(3).replace('`', '').replace(',', '').strip())
            current_char['forms'].append(ki)
        except ValueError:
            pass

print('Personajes parseados del MD de Claude:', len(claude))

# ---------- 2. Cargar V26 JSON ----------
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)
chars = data['characters']
print('Personajes en V26 JSON:', len(chars))

# ---------- 3. Comparar bases ----------
def parse_ki(v):
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).replace(',', '').replace('.', '')
    try:
        return float(s)
    except ValueError:
        return None

DISC_REPORT = []
for cid, c in chars.items():
    cl = claude.get(cid)
    if cl is None or cl['base'] is None:
        continue
    our_ki = parse_ki(c.get('baseKiNumeric'))
    cl_ki = cl['base']
    if our_ki is None:
        continue
    if cl_ki == 0:
        continue
    ratio = our_ki / cl_ki
    if ratio < 0.9 or ratio > 1.1:
        DISC_REPORT.append((cid, c.get('name'), c.get('universe'),
                            our_ki, cl_ki, ratio, c.get('baseTier'), cl['tier']))

print()
print('=== DISCREPANCIAS DE BASE >10% (%d) ===' % len(DISC_REPORT))
for (cid, name, uni, our, cl, ratio, ourT, clT) in sorted(DISC_REPORT, key=lambda x: abs(x[5] - 1), reverse=True):
    print('%-45s %-28s | JSON %15.0f | Claude %15.0f | x%.2f | %s vs %s' % (cid, uni, our, cl, ratio, ourT, clT))