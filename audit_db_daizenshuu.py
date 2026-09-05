import re, json

# ============================================================
# DAIZENSHUU 7 - NIVELES OFICIALES (Scouter / Battle Power)
# ============================================================
DAIZENSHUU = {
    # DRAGON BALL CLÁSICO
    "farmer": 5,
    "goku_21tb": 260,      # 21º Torneo (sin ropa pesada: ~300-400)
    "goku_22tb": 180,      # 22º Torneo (con ropa pesada)
    "goku_23tb": 389,      # 23º Torneo (con ropa pesada 370, sin: 480)
    "krillin_21tb": 206,
    "krillin_23tb": 227,   # 23º Torneo
    "yamcha_21tb": 177,
    "yamcha_23tb": 249,
    "tien_22tb": 250,
    "tien_23tb": 250,
    "chaotzu_22tb": 130,
    "roshi_max": 300,      # Máximo poder
    "piccolo_daimao_old": 260,
    "piccolo_daimao_young": 350,
    "goku_rr": 530,        # Post-Agua Ultra Divina (antes Daimao)
    
    # DRAGON BALL Z - SAGA SAIYAN
    "raditz": 1500,
    "nappa": 4000,
    "vegeta_saiyan": 18000,
    "goku_saiyan": 8000,      # Llegada (8000+)
    "goku_kaioken_x2": 16000,
    "goku_kaioken_x3": 24000,
    "goku_kaioken_x4": 32000,
    "piccolo_saiyan": 3500,   # Vs Nappa
    "krillin_saiyan": 1770,
    "gohan_saiyan": 981,      # Niño
    
    # NAMEK
    "goku_namek_base": 3000000,   # 3,000,000
    "goku_kaioken_x10": 30000000,
    "goku_kaioken_x20": 60000000,
    "goku_ssj_namek": 150000000,  # 150M
    "vegeta_namek_base": 240000,  # Pre-zenkai (Cui level)
    "vegeta_zenkai1": 500000,     # Post-Zarbon
    "vegeta_zenkai2": 1500000,    # Post-Recoome
    "vegeta_zenkai3": 3000000,    # Post-Ginyu (antes Frieza)
    "freeza_1": 530000,
    "freeza_2": 1000000,
    "freeza_3": 2500000,
    "freeza_final_50": 60000000,
    "freeza_final_100": 120000000,
    "ginyu": 120000,
    "recoome": 45000,
    "burter": 40000,
    "jeice": 38000,
    "guldo": 11500,
    "nail": 42000,
    "piccolo_namek_base": 1000000,  # Pre-Nail
    "piccolo_nail": 10000000,       # Post-Nail (10M)
    "piccolo_kami": 100000000,      # Post-Kami (supuesto, no oficial)
    
    # ANDROIDES / CELL - DAIZENSHUU OFICIAL
    # Trunks futuro (primera aparición): 5 (suprimido) -> SSJ = ?
    # Los androides NO tienen power levels oficiales en Daizenshuu
    # Cell forms: solo "Cell Perfecto" = ~90M? No, Daizenshuu no da números Cell
    
    # Lo que SÍ dice Daizenshuu:
    # - Goku post-Yardrat (Cell Games): NO hay número oficial
    # - Vegeta post-ROSAT: NO hay número oficial
    # - Gohan SSJ2 vs Cell: NO hay número oficial
    
    # SAGA BUU - Daizenshuu 7 da:
    "goku_buu_base": 75000000,     # 75M (confirmado guía)
    "vegeta_buu_base": 70000000,   # 70M
    "gohan_buu_base": 40000000,    # 40M (base, no Ultimate)
    "gohan_ultimate": 80000000000, # 80B (Místico)
    "gotenks_base": 46000000000,   # 46B
    "gotenks_ssj3": 18000000000000,
    "super_buu": 38000000000,
    "kid_buu": 32000000000,
    "buuhan": 96000000000,
    "vegetto_base": 100000000000,
    "vegetto_ssj": 5000000000000,
    
    # DBS - Guías oficiales (Toyotaro/Toei)
    "goku_dbs_base": 82000000,     # ~82M (Torneo Poder)
    "vegeta_dbs_base": 80000000,   # ~80M
    "gohan_dbs_base": 57000000,    # 57M (Super Hero)
    "gohan_beast": 77000000000000, # 77T
    "piccolo_sh_base": 1400000000,
    "orange_piccolo": 14000000000000,
    "freeza_dbs_base": 1300000000, # 1.3B (Resurrection F)
    "golden_freeza": 328000000000,
    "black_freeza": 180000000000000,
    "jiren": 14700000000000,
    "broly_dbs_base": 4300000000,
    "broly_ssj": 215000000000,     # Ikari x50
    "broly_lssj": 860000000000000, # Full Power
}

# ============================================================
# MAPEO IDs ROSTER -> Claves DAIZENSHUU
# ============================================================
ID_MAP = {
    # Clásico
    "granjero-con-escopeta-dragon-ball-cl-sico-331": "farmer",
    "son-goku-23-tenkaichi": "goku_23tb",
    "krilin-db-clasico": "krillin_23tb",
    "yamcha-db-clasico": "yamcha_23tb",
    "tenshinhan-db-clasico": "tien_23tb",
    "chaos-dragon-ball-cl-sico-318": "chaotzu_22tb",
    "maestro-roshi-jackie-chun-dragon-ball-cl-sico-224": "roshi_max",
    "rey-piccolo-dragon-ball-cl-sico-497": "piccolo_daimao_young",
    "son-goku-ni-o-dragon-ball-cl-sico-987": "goku_rr",
    
    # Saiyan
    "raditz-saga-saiyan-640": "raditz",
    "nappa-saga-saiyan-462": "nappa",
    "vegeta-llegada-a-la-tierra-saga-saiyan-504": "vegeta_saiyan",
    "son-goku-llegada-dbz-saga-saiyan-169": "goku_saiyan",
    "piccolo-saga-saiyan": "piccolo_saiyan",
    "krilin-saga-saiyan-namek": "krillin_saiyan",
    "yamcha-saga-saiyan": "yamcha_saiyan",
    "tenshinhan-saga-saiyan": "tien_23tb",
    "son-gohan-ni-o-saga-saiyan-namek-830": "gohan_saiyan",
    
    # Namek
    "son-goku-saga-namek-saga-namek-176": "goku_namek_base",
    "vegeta-saga-namek-saga-namek-783": "vegeta_namek_base",
    "freezer-saga-namek-saga-namek-167": "freeza_1",
    "piccolo-saga-saiyan-namek-saga-saiyan-967": "piccolo_namek_base",
    "nail-saga-namek-672": "nail",
    
    # Cell - NO HAY OFICIALES, usar escalado lógico
    "son-goku-saga-cell-saga-androides-459": "goku_cell_base",
    "vegeta-saga-cell-saga-androides-856": "vegeta_cell_base",
    "son-gohan-joven-saga-androides-cell-945": "gohan_cell_base",
    "cell-saga-androides-98": "cell_perfect",
    "krilin-saga-cell": "krillin_cell",
    "tenshinhan-saga-cell": "tien_cell",
    "piccolo-saga-cell-buu-saga-androides-946": "piccolo_cell",
    
    # Buu
    "son-goku-saga-buu-saga-buu-646": "goku_buu_base",
    "vegeta-saga-buu-saga-buu-213": "vegeta_buu_base",
    "vegeta-majin-ssj2-895": "vegeta_buu_base",
    "son-gohan-saga-super-dragon-ball-super-39": "gohan_buu_base",
    "gohan-ultimate-mystic-897": "gohan_ultimate",
    "kid-buu-saga-buu-907": "kid_buu",
    "super-buu-saga-buu-69": "super_buu",
    "buuhan-majin-901": "buuhan",
    "vegetto-base-saga-buu-120": "vegetto_base",
    "gotenks-base-saga-buu-858": "gotenks_base",
    
    # Super
    "son-goku-saga-super-dragon-ball-super-732": "goku_dbs_base",
    "vegeta-saga-super-dragon-ball-super-454": "vegeta_dbs_base",
    "son-gohan-saga-super-dragon-ball-super-39": "gohan_dbs_base",
    "son-gohan-dbs-superhero": "gohan_dbs_base",
    "piccolo-dbs-superhero": "piccolo_sh_base",
    "freezer-resurreccion-f": "freeza_dbs_base",
    "broly-dbs-dragon-ball-super-172": "broly_dbs_base",
    "jiren-dragon-ball-super-983": "jiren",
    "black-freezer-manga-granolah": "black_freeza",
}

# ============================================================
# CÁLCULOS LÓGICOS PARA SAGA CELL (sin oficiales)
# ============================================================
# Premisa: Goku Yardrat aprendió control total -> base sube ~50x de Namek (3M -> 150M)
# Vegeta ROSAT: similar a Goku, quizás +10%
# Gohan base (9 años): mucho más bajo que Goku Namek
# Krilin/Tien: entrenaron 3 años, pero humanos -> techo ~50-100M
# Piccolo: fusionó con Kami -> supera a SSJ1 Goku Namek (150M)

CELL_SAGA_ESTIMATES = {
    "goku_cell_base": 150_000_000,      # 150M (control total ki, no SSJ)
    "goku_cell_ssj": 7_500_000_000,     # 7.5B
    "goku_cell_ssj_fp": 7_500_000_000,  # Full Power = mismo
    "vegeta_cell_base": 180_000_000,    # 180M (ROSAT + orgullo)
    "vegeta_cell_ssj": 9_000_000_000,   # 9B
    "vegeta_cell_ussj": 11_700_000_000, # 11.7B (Grado 2 = x65)
    "gohan_cell_base": 15_000_000,      # 15M (niño, potencial latente)
    "gohan_cell_ssj": 750_000_000,      # 750M
    "gohan_cell_ssj2": 1_500_000_000,   # 1.5B
    "krillin_cell": 75_000_000,         # 75M (techo humano)
    "tien_cell": 90_000_000,            # 90M
    "piccolo_cell": 1_200_000_000,      # 1.2B (fusion Kami > SSJ Namek)
    "cell_imperfect": 2_000_000_000,    # 2B
    "cell_semi": 5_000_000_000,         # 5B
    "cell_perfect": 9_000_000_000,      # 9B (≈ Vegeta USSJ)
    "cell_super_perfect": 15_000_000_000, # 15B (≈ Gohan SSJ2)
}

# ============================================================
# CARGAR ROSTER ACTUAL
# ============================================================
with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

def parse_ki(s):
    clean = s.replace("`", "").replace(",", "").replace(".", "").strip()
    try: return float(clean)
    except: return None

current_char = None
in_table = False
results = {}

for line in lines:
    m = re_header.match(line)
    if m:
        if current_char:
            results[current_char] = {'base_ki': base_ki, 'tier': tier, 'forms': forms}
        current_char = m.group(1)
        base_ki = None
        tier = None
        in_table = False
        forms = []
        continue
    if current_char and "- **Base Tier**" in line:
        m = re_meta.match(line)
        if m:
            tier = m.group(1).strip()
            base_ki = parse_ki(m.group(2))
        continue
    if "| # Forma |" in line:
        in_table = True
        continue
    if in_table and line.strip().startswith("|") and not line.strip().startswith("| :-"):
        m = re_row.match(line)
        if m:
            idx, name, ki_str, fmt, mult_str, form_tier, apex = m.groups()
            forms.append({'name': name.strip(), 'ki': parse_ki(ki_str), 'mult': mult_str.strip(), 'tier': form_tier.strip()})
        continue
    if in_table and not line.strip().startswith("|"):
        in_table = False
        continue

if current_char:
    results[current_char] = {'base_ki': base_ki, 'tier': tier, 'forms': forms}

# ============================================================
# AUDITORÍA
# ============================================================
print("=" * 100)
print("AUDITORÍA DB CONTRA DAIZENSHUU 7 + LÓGICA CELL")
print("=" * 100)

errors = 0
warnings = 0
ok = 0

for roster_id, daiz_key in ID_MAP.items():
    if roster_id not in results:
        print(f"[MISSING] {roster_id} -> {daiz_key}: NO EN ROSTER")
        errors += 1
        continue
    
    char = results[roster_id]
    expected = DAIZENSHUU.get(daiz_key) or CELL_SAGA_ESTIMATES.get(daiz_key)
    
    if expected is None:
        print(f"[NO_REF] {roster_id} -> {daiz_key}: Sin referencia Daizenshuu")
        warnings += 1
        continue
    
    actual = char['base_ki']
    if actual is None:
        print(f"[NO_KI] {roster_id}: Base Ki None")
        errors += 1
        continue
    
    diff_pct = abs(actual - expected) / expected * 100
    if diff_pct <= 5:
        print(f"[OK] {roster_id:50s} | Esperado: {expected:>15,.0f} | Actual: {actual:>15,.0f} | Tier: {char['tier']}")
        ok += 1
    elif diff_pct <= 20:
        print(f"[WARN] {roster_id:50s} | Esperado: {expected:>15,.0f} | Actual: {actual:>15,.0f} | Diff: {diff_pct:.1f}% | Tier: {char['tier']}")
        warnings += 1
    else:
        print(f"[ERROR] {roster_id:50s} | Esperado: {expected:>15,.0f} | Actual: {actual:>15,.0f} | Diff: {diff_pct:.1f}% | Tier: {char['tier']}")
        errors += 1

print("\n" + "=" * 100)
print(f"RESUMEN: {ok} OK | {warnings} WARN (<20%) | {errors} ERROR (>20%)")
print("=" * 100)

# ============================================================
# GENERAR OVERRIDES CORREGIDOS
# ============================================================
overrides = {}
for roster_id, daiz_key in ID_MAP.items():
    if roster_id in results:
        expected = DAIZENSHUU.get(daiz_key) or CELL_SAGA_ESTIMATES.get(daiz_key)
        if expected and results[roster_id]['base_ki']:
            actual = results[roster_id]['base_ki']
            diff_pct = abs(actual - expected) / expected * 100
            if diff_pct > 5:
                overrides[roster_id] = {
                    "base_ki": expected,
                    "tier": results[roster_id]['tier'],  # mantener tier actual
                    "reason": f"Daizenshuu: {daiz_key} = {expected:,.0f}"
                }

# Guardar overrides para el script de saneamiento
with open('daizenshuu_overrides.json', 'w', encoding='utf-8') as f:
    json.dump(overrides, f, indent=2, ensure_ascii=False)

print(f"\nOverrides generados: {len(overrides)} personajes necesitan corrección")
print("Archivo: daizenshuu_overrides.json")