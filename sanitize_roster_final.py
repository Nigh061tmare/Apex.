# sanitize_roster_final.py
# APEX Power Scaling Engine - Canonical Sanitization Pipeline v26
# Combines: strict VS Battles tier clamping + canonical DB overrides + patch audit trail

import os, re, json, sys

# ==============================================================================
# 1. JAULA DE TIERS VS BATTLES (TECHOS DUROS - Anti-Inflation)
# Fuente: VS Battles Wiki Attack Potency Table (Joules/TNT equivalents)
# Solo CLAMPEA HACIA ABAJO (previene inflación). NUNCA infla bases bajas.
# ==============================================================================
TIER_LIMITS = {
    "10-C": (0, 3, 5), "10-B": (5, 8, 12), "10-A": (12, 20, 30),
    "9-C": (30, 40, 60), "9-B": (60, 100, 150), "9-A": (150, 200, 300),
    "8-C": (300, 400, 600), "High 8-C": (600, 800, 1200), "8-B": (1000, 1500, 2500),
    "8-A": (2000, 3000, 4500), "Low 7-C": (3500, 4500, 5500), "7-C": (4500, 6000, 8000),
    "High 7-C": (7000, 9000, 12000), "Low 7-B": (10000, 15000, 20000), "7-B": (15000, 20000, 35000),
    "7-A": (30000, 50000, 80000), "High 7-A": (70000, 100000, 150000),
    "6-C": (150000, 250000, 400000), "High 6-C": (300000, 500000, 800000),
    "Low 6-B": (500000, 800000, 1500000), "6-B": (1000000, 2000000, 3500000),
    "High 6-B": (2500000, 5000000, 8000000), "6-A": (5000000, 10000000, 15000000),
    "High 6-A": (15000000, 35000000, 70000000), "5-C": (50000000, 100000000, 250000000),
    "Low 5-B": (200000000, 500000000, 800000000), "5-B": (500000000, 1500000000, 3000000000),
    "5-A": (2000000000, 5000000000, 10000000000), "High 5-A": (8000000000, 25000000000, 50000000000),
    "Low 4-C": (30000000000, 80000000000, 150000000000), "4-C": (100000000000, 500000000000, 2000000000000),
    "High 4-C": (1000000000000, 5000000000000, 15000000000000), "4-B": (10000000000000, 50000000000000, 200000000000000),
    "4-A": (100000000000000, 500000000000000, 5000000000000000), "3-C": (1000000000000000, 5000000000000000, 20000000000000000),
    "3-B": (10000000000000000, 50000000000000000, 200000000000000000), "3-A": (100000000000000000, 500000000000000000, 2000000000000000000),
    "High 3-A": (1e18, 5e18, 2e19), "Low 2-C": (1e19, 5e19, 2e20), "2-C": (1e20, 5e20, 2e21),
    "2-B": (1e21, 5e21, 2e22), "2-A": (1e22, 5e22, 2e23), "Low 1-C": (1e23, 5e23, 1e24), "1-C": (1e24, 1e25, 1e26)
}

# ==============================================================================
# 2. DICTADURA CANÓNICA DRAGON BALL (OVERRIDE TOTAL DE BASE)
# IDs exactos del roster. Valores extraídos de Daizenshuu 7 / Guías Oficiales.
# ==============================================================================
CANON_BASES = {
    # DRAGON BALL CLÁSICO - Daizenshuu 7
    "granjero-con-escopeta-dragon-ball-cl-sico-331": {"base_ki": 5, "tier": "10-C"},
    "son-goku-23-tenkaichi": {"base_ki": 389, "tier": "7-A"},
    "krilin-db-clasico": {"base_ki": 227, "tier": "8-A"},
    "yamcha-db-clasico": {"base_ki": 249, "tier": "8-B"},
    "tenshinhan-db-clasico": {"base_ki": 250, "tier": "7-B"},
    "chaos-dragon-ball-cl-sico-318": {"base_ki": 130, "tier": "5-C"},
    "maestro-roshi-jackie-chun-dragon-ball-cl-sico-224": {"base_ki": 300, "tier": "5-C"},
    "rey-piccolo-dragon-ball-cl-sico-497": {"base_ki": 350, "tier": "7-B"},
    "son-goku-ni-o-dragon-ball-cl-sico-987": {"base_ki": 530, "tier": "7-B"},
    "krilin-db-clasico": {"base_ki": 227, "tier": "8-A"},
    
    # SAGA SAIYAN
    "raditz-saga-saiyan-640": {"base_ki": 1500, "tier": "5-C"},
    "nappa-saga-saiyan-462": {"base_ki": 4000, "tier": "5-C"},
    "vegeta-llegada-a-la-tierra-saga-saiyan-504": {"base_ki": 18000, "tier": "5-B"},
    "son-goku-llegada-dbz-saga-saiyan-169": {"base_ki": 8000, "tier": "5-A"},
    "piccolo-saga-saiyan": {"base_ki": 3500, "tier": "5-B"},
    "krilin-saga-saiyan-namek": {"base_ki": 1770, "tier": "Low 5-B"},
    "tenshinhan-saga-saiyan": {"base_ki": 250, "tier": "5-B"},
    "yamcha-saga-saiyan": {"base_ki": 1770, "tier": "5-B"},
    "son-gohan-ni-o-saga-saiyan-namek-830": {"base_ki": 981, "tier": "5-B"},
    
    # NAMEK
    "son-goku-saga-namek-saga-namek-176": {"base_ki": 3000000, "tier": "4-B"},
    "vegeta-saga-namek-saga-namek-783": {"base_ki": 240000, "tier": "5-A"},
    "freezer-saga-namek-saga-namek-167": {"base_ki": 530000, "tier": "5-A"},
    "piccolo-saga-saiyan-namek-saga-saiyan-967": {"base_ki": 1000000, "tier": "5-A"},
    "nail-saga-namek-672": {"base_ki": 42000, "tier": "5-B"},
    "ginyu-saga-namek": {"base_ki": 120000, "tier": "5-B"},
    "recoome-saga-namek-951": {"base_ki": 45000, "tier": "5-B"},
    "burter-saga-namek-641": {"base_ki": 40000, "tier": "5-B"},
    "jeice-saga-namek-726": {"base_ki": 38000, "tier": "5-B"},
    
    # SAGA CELL / ANDROIDES - Coherencia temporal (Buu = Cell +7 años)
    # Buu base: Goku 75M / Vegeta 70M -> Cell base ligeramente MENOR
    "son-goku-saga-cell-saga-androides-459": {"base_ki": 60000000, "tier": "4-C"},
    "vegeta-saga-cell-saga-androides-856": {"base_ki": 55000000, "tier": "4-C"},
    # Gohan niño: base baja, pero potencial masivo -> SSJ2 supera a Goku/Vegeta SSJ
    "son-gohan-joven-saga-androides-cell-945": {"base_ki": 15000000, "tier": "4-B"},
    # Piccolo fusión Kami: supera a SSJ Namek (150M) -> ~1.2B
    "piccolo-saga-cell-buu-saga-androides-946": {"base_ki": 1200000000, "tier": "4-C"},
    # Humanos techo realista
    "krilin-saga-cell": {"base_ki": 75000000, "tier": "4-C"},
    "tenshinhan-saga-cell": {"base_ki": 90000000, "tier": "4-C"},
    "yamcha-saga-cell": {"base_ki": 50000000, "tier": "4-C"},
    # Cell Perfecto: ~9B (entre Vegeta USSJ y Gohan SSJ2)
    "cell-saga-androides-98": {"base_ki": 9000000000, "tier": "4-B"},
    # Androides
    "androide-17-saga-androides-489": {"base_ki": 378000000, "tier": "4-C"},
    "androide-18-saga-androides-476": {"base_ki": 367500000, "tier": "4-C"},
    "androide-16-saga-androides-313": {"base_ki": 493500000, "tier": "4-C"},
    "androide-19-saga-androides-393": {"base_ki": 105000000, "tier": "4-C"},
    "androide-20-saga-androides-799": {"base_ki": 115500000, "tier": "4-C"},
    
    # SAGA BUU - Guía oficial
    "son-goku-saga-buu-saga-buu-646": {"base_ki": 75000000, "tier": "4-C"},
    "vegeta-saga-buu-saga-buu-213": {"base_ki": 70000000, "tier": "4-C"},
    "vegeta-majin-ssj2-895": {"base_ki": 70000000, "tier": "4-C"},
    "son-gohan-saga-super-dragon-ball-super-39": {"base_ki": 57000000, "tier": "4-C"},
    "son-gohan-dbs-superhero": {"base_ki": 57000000, "tier": "4-C"},
    "gohan-ultimate-mystic-897": {"base_ki": 40000000, "tier": "4-C"},
    "kid-buu-saga-buu-907": {"base_ki": 32000000000, "tier": "4-A"},
    "super-buu-saga-buu-69": {"base_ki": 38000000000, "tier": "3-C"},
    "buuhan-majin-901": {"base_ki": 96000000000, "tier": "3-A"},
    "vegetto-base-saga-buu-120": {"base_ki": 100000000000, "tier": "3-C"},
    "gotenks-base-saga-buu-858": {"base_ki": 46000000000, "tier": "4-B"},
    "goten-saga-buu-694": {"base_ki": 6772500, "tier": "4-C"},
    "trunks-ni-o-saga-buu-209": {"base_ki": 8200500, "tier": "4-C"},
    "piccolo-finales-z-principios-super": {"base_ki": 840000000, "tier": "4-A"},
    "krilin-dragon-ball-cl-sico-802": {"base_ki": 120000, "tier": "4-C"},
    "tenshinhan-dragon-ball-cl-sico-812": {"base_ki": 290000, "tier": "5-A"},
    
    # DBS SUPER HERO / SUPER
    "piccolo-dbs-superhero": {"base_ki": 1400000000, "tier": "4-B"},
    "freezer-resurreccion-f": {"base_ki": 1300000000, "tier": "4-B"},
    "son-goku-saga-super-dragon-ball-super-732": {"base_ki": 82000000, "tier": "4-C"},
    "vegeta-saga-super-dragon-ball-super-454": {"base_ki": 80000000, "tier": "4-C"},
    "goku-namek-post-zenkai-892": {"base_ki": 243495, "tier": "5-A"},
    "goku-ssj3-buu-saga-893": {"base_ki": 78750000, "tier": "4-C"},
    
    # DBM MULTIVERSE
    "son-goku-u18-dbm": {"base_ki": 103000000, "tier": "4-C"},
    "vegeta-u18-dbm": {"base_ki": 100000000, "tier": "4-C"},
    "gohan-u16-dbm-espectador": {"base_ki": 100000000, "tier": "4-C"},
    "son-bra-dbm-u16": {"base_ki": 30000000, "tier": "4-C"},
    "vegetto-dbm-u16": {"base_ki": 45000000000, "tier": "3-B"},
    "cell-dbm-u17": {"base_ki": 28560000000, "tier": "3-C"},
    
    # PELÍCULAS Z / DAIMA
    "turles-dbz-toei": {"base_ki": 300000, "tier": "5-A"},
    "broly-dbz-pel-culas-dbz-toei-822": {"base_ki": 5600000000, "tier": "High 4-C"},
    "broly-dbs-dragon-ball-super-172": {"base_ki": 4300000000, "tier": "3-A"},
    "son-goku-mini-daima-full": {"base_ki": 10000000, "tier": "4-B"},
    "vegeta-mini-daima": {"base_ki": 9000000, "tier": "4-B"},
    "rey-gomah-daima": {"base_ki": 232, "tier": "9-A"},
}

# Overrides de KI EXACTO + TIER por FORMA (ignora multiplicador, fija valor canónico)
# Formato: {form_name: {"ki": value, "tier": "tier_label"}}
FORMS_OVERRIDE = {
    # GOHAN SAGA CELL - SSJ1 > Cell Perfecto (10B > 9B), SSJ2 > Cell Super Perfecto (16B > 15B)
    "son-gohan-joven-saga-androides-cell-945": {
        "Son Gohan Joven (Estado Base / Traje de Piccolo)": {"ki": 15000000, "tier": "4-B"},
        "Super Saiyajin (Full Power / Estado Normalizado)": {"ki": 10000000000, "tier": "4-A"},  # 10B > Cell Perfecto 9B
        "Super Saiyajin 2 (Despertar de la Ira Absoluta)": {"ki": 16000000000, "tier": "4-A"},  # 16B > Cell Super Perfecto 15B
    },
    # GOHAN SAGA BUU / SUPER HERO
    "son-gohan-saga-super-dragon-ball-super-39": {
        "Estado Base (DBS - Entrenado con Piccolo)": {"ki": 57000000, "tier": "4-C"},
        "Super Saiyan": {"ki": 2850000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 5700000000, "tier": "4-B"},
        "Estado Definitivo (Ultimate Gohan)": {"ki": 77000000000, "tier": "3-C"},
        "Modo Bestia (Gohan Beast)": {"ki": 77000000000000, "tier": "2-B"}
    },
    "son-gohan-dbs-superhero": {
        "Estado Base (DBS - Entrenado con Piccolo)": {"ki": 57000000, "tier": "4-C"},
        "Estado Definitivo (Ultimate)": {"ki": 77000000000, "tier": "2-C"},
        "Gohan Beast": {"ki": 77000000000000, "tier": "2-B"}
    },
    "gohan-ultimate-mystic-897": {
        "Gohan (Estado Base / Ropa de los Kaio-shin)": {"ki": 40000000, "tier": "4-C"},
        "Gohan Definitivo (Ultimate / Potencial Desatado)": {"ki": 80000000000, "tier": "3-C"},
    },
    # GOKU/VEGETA SAGA CELL - Forms correctas
    "son-goku-saga-cell-saga-androides-459": {
        "Son Goku (Estado Base Saga Cell)": {"ki": 60000000, "tier": "4-C"},
        "Super Saiyan 1": {"ki": 3000000000, "tier": "4-B"},
        "Super Saiyan Full Power (Cell Games)": {"ki": 3000000000, "tier": "4-B"},
    },
    "vegeta-saga-cell-saga-androides-856": {
        "Vegeta (Saga Cell) (Estado Base)": {"ki": 55000000, "tier": "4-C"},
        "Super Saiyajin (Super Saiyan Ordinario)": {"ki": 2750000000, "tier": "4-B"},
        "Super Vegeta (SSJ 2do Grado)": {"ki": 3575000000, "tier": "4-A"},
    },
# PICCOLO CELL
    "piccolo-saga-cell-buu-saga-androides-946": {
        "Piccolo (Guerrero Namekiano Base)": {"ki": 1200000000, "tier": "4-C"},
        "Fusi��n con Nail (Saga Namek)": {"ki": 1920000000, "tier": "4-B"},
        "Super Namekiano (Fusi��n con Kami-sama)": {"ki": 3000000000, "tier": "4-A"},
    },
    # CELL - Orden lógico: Imperfecto → Semi-Perfecto → Perfecto (Base) → Super Perfecto
    "cell-saga-androides-98": {
        "Cell Imperfecto": {"ki": 2000000000, "tier": "4-C"},
        "Cell Semi-Perfecto": {"ki": 5000000000, "tier": "4-B"},
        "Estado Base": {"ki": 9000000000, "tier": "4-B"},
        "Cell Perfecto": {"ki": 9000000000, "tier": "4-B"},
        "Cell Super Perfecto": {"ki": 15000000000, "tier": "4-A"},
    },
    # ANDROIDES
    "androide-17-saga-androides-489": {
        "Androide 17 (Estado Base)": {"ki": 378000000, "tier": "4-C"},
    },
    "androide-18-saga-androides-476": {
        "Humana Modificada Base": {"ki": 367500000, "tier": "4-C"},
    },
    "androide-16-saga-androides-313": {
        "Modelo 16": {"ki": 493500000, "tier": "4-C"},
    },
    # GOHAN BUU / SUPER HERO
    "son-gohan-saga-super-dragon-ball-super-39": {
        "Estado Base (DBS - Entrenado con Piccolo)": {"ki": 57000000, "tier": "4-C"},
        "Super Saiyan": {"ki": 2850000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 5700000000, "tier": "4-B"},
        "Estado Definitivo (Ultimate Gohan)": {"ki": 77000000000, "tier": "3-C"},
        "Modo Bestia (Gohan Beast)": {"ki": 77000000000000, "tier": "2-B"}
    },
    "son-gohan-dbs-superhero": {
        "Son Gohan (Super Hero) (Estado Base)": {"ki": 57000000, "tier": "4-C"},
        "Estado Definitivo (Ultimate)": {"ki": 77000000000, "tier": "2-C"},
        "Gohan Beast": {"ki": 77000000000000, "tier": "2-B"}
    },
    "gohan-u16-dbm-espectador": {
        "Son Gohan (Universo 16 - Base)": {"ki": 100000000, "tier": "4-C"},
        "Modo Furia del Padre Protector (DBM Custom)": {"ki": 80000000000, "tier": "3-C"},
        "Son Gohan (Universo 16 - Estado Místico)": {"ki": 80000000000, "tier": "3-C"}
    },
    "son-bra-dbm-u16": {
        "Estado Base (Son Bra Adolescente)": {"ki": 30000000, "tier": "4-C"},
        "Super Saiyan 1": {"ki": 1500000000, "tier": "High 4-C"},
        "Super Saiyan 2 (Furia Descontrolada)": {"ki": 30000000000, "tier": "3-C"},
        "Son Bra (Majin Bra)": {"ki": 45000000000, "tier": "3-C"}
    },
    "vegetto-base-saga-buu-120": {
        "Vegetto Base": {"ki": 100000000000, "tier": "3-C"},
        "Super Vegetto": {"ki": 5000000000000, "tier": "3-B"}
    },
    "son-goku-u18-dbm": {
        "Son Goku (Estado Base DBM / Maestro Veterano)": {"ki": 103000000, "tier": "4-C"},
        "Kaio-ken": {"ki": 206000000, "tier": "4-B"},
        "Super Saiyan 1": {"ki": 5150000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 10300000000, "tier": "4-A"},
        "Super Saiyan 3 (Control Energético Superior)": {"ki": 41200000000, "tier": "3-C"},
        "Normal Super Saiyan (Goku U18)": {"ki": 41200000000, "tier": "3-C"}
    },
    "vegeta-u18-dbm": {
        "Vegeta (Estado Base DBM / Príncipe Veterano)": {"ki": 100000000, "tier": "4-C"},
        "Super Saiyan 1": {"ki": 5000000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 10000000000, "tier": "4-A"},
        "Super Saiyan 3 (Vegeta U18)": {"ki": 40000000000, "tier": "3-C"},
        "Normal Super Saiyan (Vegeta U18)": {"ki": 40000000000, "tier": "3-C"}
    },
    "vegetto-dbm-u16": {
        "Estado Base (El Saiyan Supremo)": {"ki": 45000000000, "tier": "3-B"},
        "Super Saiyan 1 (Super Vegetto)": {"ki": 2250000000000, "tier": "High 3-A"},
        "Super Saiyan 2": {"ki": 4500000000000, "tier": "Low 2-C"},
        "Super Saiyan 3 al Máximo Poder": {"ki": 18000000000000, "tier": "Low 2-C"}
    },
    "cell-dbm-u17": {
        "Cell Perfecto (Estado Base DBM)": {"ki": 28560000000, "tier": "3-C"},
        "Cell Hiper Perfecto (Zenkais Acumulados)": {"ki": 71400000000, "tier": "3-C"},
        "Cell Máximo Poder (Potencial Desatado)": {"ki": 114240000000, "tier": "3-C"}
    },
    "piccolo-dbs-superhero": {
        "Piccolo (Super Hero) (Estado Base)": {"ki": 1400000000, "tier": "4-B"},
        "Potential Unleashed": {"ki": 1890000000, "tier": "Low 2-C"},
        "Orange Piccolo": {"ki": 14000000000000, "tier": "2-C"},
        "Giant Orange Piccolo": {"ki": 14000000000000, "tier": "2-C"}
    },
    "vegeta-majin-ssj2-895": {
        "Majin Vegeta (Estado Base / Sello Desatado)": {"ki": 70000000, "tier": "4-C"},
        "Majin Vegeta (Super Saiyajin)": {"ki": 3500000000, "tier": "4-B"},
        "Majin Vegeta (Super Saiyajin 2 / Rival de Goku)": {"ki": 7000000000, "tier": "4-A"},
        "Final Explosion (Detonación Suicida de Todo el Ki)": {"ki": 23000000000, "tier": "High 4-B"}
    },
    "freezer-resurreccion-f": {
        "Freezer 1ª Forma (Silla Espacial / Entrenado)": {"ki": 1300000000, "tier": "4-B"},
        "Freezer Forma Final (Poder Real Desatado)": {"ki": 65000000000, "tier": "4-A"},
        "Golden Freezer (Evolución Dorada / Desgaste Rápido)": {"ki": 328000000000, "tier": "Low 2-C"}
    },
    "broly-dbs-dragon-ball-super-172": {
        "Broly (Estado Base / Collar Eléctrico de Paragus)": {"ki": 4300000000, "tier": "3-A"},
        "Estado Iracundo (Ikari / Poder del Oozaru en Forma Humana)": {"ki": 43000000000, "tier": "3-C"},
        "Super Saiyan (Furia Desbordante / Cúspide de Ira)": {"ki": 215000000000, "tier": "3-B"},
        "Super Saiyan Full Power (Legendario / Pelo Verde)": {"ki": 860000000000000, "tier": "3-B"}
    },
    "jiren-dragon-ball-super-983": {
        "Jiren (Estado Base / Poder Oculto)": {"ki": 14700000000000, "tier": "2-C"},
        "Jiren (Limit Breaker / Aura Llameante de Fuego)": {"ki": 73500000000000, "tier": "2-C"}
    },
    "black-freezer-manga-granolah": {
        "Granolah (Estado Base / Francotirador Cereliano)": {"ki": 180000000000000, "tier": "2-C"},
        "Ojos Cerelianos Despertados (Poder Máximo)": {"ki": 459000000000000, "tier": "2-C"}
    },
    "son-goku-saga-super-dragon-ball-super-732": {
        "Son Goku (Estado Base DBS)": {"ki": 82000000, "tier": "4-C"},
        "Super Saiyan 1": {"ki": 4100000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 8200000000, "tier": "4-A"},
        "Super Saiyan 3": {"ki": 32800000000, "tier": "3-C"},
        "Super Saiyan God (Dios Rojo)": {"ki": 524800000000, "tier": "Low 2-C"},
        "Super Saiyan Blue (SSGSS)": {"ki": 631400000000, "tier": "Low 2-C"},
        "SSGSS + Kaio-ken (x20)": {"ki": 1262800000000, "tier": "2-C"},
        "Ultra Instinto -Señal- (Omen)": {"ki": 2460000000000, "tier": "2-C"},
        "Ultra Instinto Dominado (Plateado / Verdadero)": {"ki": 4920000000000, "tier": "2-B"}
    },
    "vegeta-saga-super-dragon-ball-super-454": {
        "Vegeta (Estado Base DBS)": {"ki": 80000000, "tier": "4-C"},
        "Super Saiyan": {"ki": 4000000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 8000000000, "tier": "4-A"},
        "Super Saiyan 3 (Teórica)": {"ki": 32000000000, "tier": "3-C"},
        "Super Saiyan God (Rojo)": {"ki": 512000000000, "tier": "Low 2-C"},
        "Super Saiyan Blue": {"ki": 616000000000, "tier": "Low 2-C"},
        "Super Saiyan Blue Evolution (Evolución Azul)": {"ki": 6160000000000, "tier": "2-C"},
        "Ultra Ego (Mega Instinto / Hakaishin)": {"ki": 8000000000000, "tier": "2-B"}
    },
    "goku-namek-post-zenkai-892": {
        "Base Post-Tanque": {"ki": 243495, "tier": "5-A"},
        "Kaiō-ken x2": {"ki": 486990, "tier": "5-A"},
        "Kaiō-ken x10": {"ki": 2434950, "tier": "High 5-A"},
        "Kaiō-ken x20": {"ki": 4869900, "tier": "Low 4-C"},
        "Super Saiyan": {"ki": 12174750, "tier": "4-C"}
    },
    "goku-ssj3-buu-saga-893": {
        "Estado Base": {"ki": 78750000, "tier": "4-C"},
        "Super Saiyan 1": {"ki": 3937500000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 7875000000, "tier": "4-A"},
        "Super Saiyan 3": {"ki": 31500000000, "tier": "3-C"}
    },
    "vegeta-saga-buu-saga-buu-213": {
        "Vegeta Base (Saga Buu)": {"ki": 70000000, "tier": "4-C"},
        "Super Saiyan 1": {"ki": 3500000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 7000000000, "tier": "4-A"},
        "Majin Vegeta": {"ki": 7000000000, "tier": "4-A"},
    },
    "son-goku-saga-buu-saga-buu-646": {
        "Son Goku (Estado Base Saga Buu)": {"ki": 75000000, "tier": "4-C"},
        "Super Saiyan 1": {"ki": 3750000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 7500000000, "tier": "4-A"},
        "Super Saiyan 3": {"ki": 30000000000, "tier": "3-C"}
    },
    "piccolo-finales-z-principios-super": {
        "Piccolo (Unificación con Kami-sama)": {"ki": 840000000, "tier": "4-A"},
    },
    "krilin-dragon-ball-cl-sico-802": {
        "Krilin (Saga Super) (Estado Base)": {"ki": 120000, "tier": "4-C"},
        "Estado de No-Ego (Activación Mental)": {"ki": 180000, "tier": "4-C"}
    },
    "tenshinhan-dragon-ball-cl-sico-812": {
        "Ten Shin Han (Estado Base DBS / Maestro del Dojo)": {"ki": 290000, "tier": "5-A"}
    },
    "son-goku-mini-daima-full": {
        "Goku Mini Estado Base (Con Báculo Sagrado)": {"ki": 10000000, "tier": "4-B"},
        "Super Saiyan 1 (Mini)": {"ki": 500000000, "tier": "4-B"},
        "Super Saiyan 2 (Mini)": {"ki": 1000000000, "tier": "4-A"},
        "Super Saiyan 3 (Mini)": {"ki": 3000000000, "tier": "3-C"},
        "Super Saiyan 4 (Primal Daima) [What-If]": {"ki": 12000000000, "tier": "4-A"}
    },
    "vegeta-mini-daima": {
        "Vegeta Mini Estado Base": {"ki": 9000000, "tier": "4-B"},
        "Super Saiyan 1 (Mini)": {"ki": 450000000, "tier": "4-B"},
        "Super Saiyan 2 (Mini)": {"ki": 900000000, "tier": "4-A"},
        "Super Saiyan 3 (Mini)": {"ki": 3600000000, "tier": "3-C"}
    },
    "rey-gomah-daima": {
        "Rey Gomah (Estado Base)": {"ki": 232, "tier": "9-A"},
        "Rey Gomah (Despertar del Tercer Ojo del Mal)": {"ki": 11600000000, "tier": "3-C"}
    },
    "gohan-dbs-fnf-pre-torneo": {
        "Son Gohan (Estado Base / Óxido de Combate)": {"ki": 1197000000, "tier": "4-B"},
        "Super Saiyajin (Despertar en Chándal Verde)": {"ki": 59850000000, "tier": "3-C"},
        "Super Saiyajin 2 (Ráfaga de Furia / Entrenamiento con Piccolo)": {"ki": 119700000000, "tier": "3-B"},
        "Estado Definitivo (Potencial Desbloqueado Recuperado)": {"ki": 11970000000000, "tier": "Low 2-C"},
    },
    "broly-dbz-pel-culas-dbz-toei-822": {
        "Broly (Estado Base / Restringido con Tiara)": {"ki": 5600000000, "tier": "High 4-C"},
        "Super Saiyan Tipo A (Pelo Azul / Despertar)": {"ki": 280000000000, "tier": "4-B"},
        "Super Saiyan Legendario (LSSJ / Masa Desbordante)": {"ki": 112000000000, "tier": "4-A"},
    },
    "son-goku-u18-dbm": {
        "Son Goku (Estado Base DBM / Maestro Veterano)": {"ki": 103000000, "tier": "4-C"},
        "Kaio-ken": {"ki": 206000000, "tier": "4-B"},
        "Super Saiyan 1": {"ki": 5150000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 10300000000, "tier": "4-A"},
        "Super Saiyan 3 (Control Energético Superior)": {"ki": 41200000000, "tier": "3-C"},
        "Super Saiyan 3 (Normal Super Saiyan Goku U18)": {"ki": 41200000000, "tier": "3-C"},
    },
    "vegeta-u18-dbm": {
        "Vegeta (Estado Base DBM / Príncipe Veterano)": {"ki": 100000000, "tier": "4-C"},
        "Super Saiyan 1": {"ki": 5000000000, "tier": "4-B"},
        "Super Saiyan 2": {"ki": 10000000000, "tier": "4-A"},
        "Super Saiyan 3 (Vegeta U18)": {"ki": 40000000000, "tier": "3-C"},
        "Super Saiyan 3 (Normal Super Saiyan Vegeta U18)": {"ki": 40000000000, "tier": "3-C"},
    },
    "turles-dbz-toei": {
        "Turles (Base)": {"ki": 300000, "tier": "5-A"}
    },
    "broly-dbs-dragon-ball-super-172": {
        "Broly (Estado Base / Collar Eléctrico de Paragus)": {"ki": 4300000000, "tier": "3-A"},
        "Estado Iracundo (Ikari / Poder del Oozaru en Forma Humana)": {"ki": 43000000000, "tier": "3-C"},
        "Super Saiyan (Furia Desbordante / Cúspide de Ira)": {"ki": 215000000000, "tier": "3-B"},
        "Super Saiyan Full Power (Legendario / Pelo Verde)": {"ki": 860000000000000, "tier": "3-B"}
    },
    "jiren-dragon-ball-super-983": {
        "Jiren (Estado Base / Poder Oculto)": {"ki": 14700000000000, "tier": "2-C"},
        "Jiren (Limit Breaker / Aura Llameante de Fuego)": {"ki": 73500000000000, "tier": "2-C"}
    },
    "black-freezer-manga-granolah": {
        "Granolah (Estado Base / Francotirador Cereliano)": {"ki": 180000000000000, "tier": "2-C"},
        "Ojos Cerelianos Despertados (Poder Máximo)": {"ki": 459000000000000, "tier": "2-C"}
    },
    "vegetto-base-saga-buu-120": {
        "Vegetto Base": {"ki": 100000000000, "tier": "3-C"},
        "Super Vegetto": {"ki": 5000000000000, "tier": "3-B"}
    },
    "vegetto-dbm-u16": {
        "Estado Base (El Saiyan Supremo)": {"ki": 45000000000, "tier": "3-B"},
        "Super Saiyan 1 (Super Vegetto)": {"ki": 2250000000000, "tier": "High 3-A"},
        "Super Saiyan 2": {"ki": 4500000000000, "tier": "Low 2-C"},
        "Super Saiyan 3 al Máximo Poder": {"ki": 18000000000000, "tier": "Low 2-C"}
    },
    "cell-dbm-u17": {
        "Cell Perfecto (Estado Base DBM)": {"ki": 28560000000, "tier": "3-C"},
        "Cell Hiper Perfecto (Zenkais Acumulados)": {"ki": 71400000000, "tier": "3-C"},
        "Cell Máximo Poder (Potencial Desatado)": {"ki": 114240000000, "tier": "3-C"}
    },
    "piccolo-dbs-superhero": {
        "Piccolo (Super Hero) (Estado Base)": {"ki": 1400000000, "tier": "4-B"},
        "Potential Unleashed": {"ki": 1890000000, "tier": "Low 2-C"},
        "Orange Piccolo": {"ki": 14000000000000, "tier": "2-C"},
        "Giant Orange Piccolo": {"ki": 14000000000000, "tier": "2-C"}
    },
    "vegeta-majin-ssj2-895": {
        "Majin Vegeta (Estado Base / Sello Desatado)": {"ki": 70000000, "tier": "4-C"},
        "Majin Vegeta (Super Saiyajin)": {"ki": 3500000000, "tier": "4-B"},
        "Majin Vegeta (Super Saiyajin 2 / Rival de Goku)": {"ki": 7000000000, "tier": "4-A"},
        "Final Explosion (Detonación Suicida de Todo el Ki)": {"ki": 23000000000, "tier": "High 4-B"}
    },
    "freezer-resurreccion-f": {
        "Freezer 1ª Forma (Silla Espacial / Entrenado)": {"ki": 1300000000, "tier": "4-B"},
        "Freezer Forma Final (Poder Real Desatado)": {"ki": 65000000000, "tier": "4-A"},
        "Golden Freezer (Evolución Dorada / Desgaste Rápido)": {"ki": 328000000000, "tier": "Low 2-C"}
    },
    "broly-dbs-dragon-ball-super-172": {
        "Broly (Estado Base / Collar Eléctrico de Paragus)": {"ki": 4300000000, "tier": "3-A"},
        "Estado Iracundo (Ikari / Poder del Oozaru en Forma Humana)": {"ki": 43000000000, "tier": "3-C"},
        "Super Saiyan (Furia Desbordante / Cúspide de Ira)": {"ki": 215000000000, "tier": "3-B"},
        "Super Saiyan Full Power (Legendario / Pelo Verde)": {"ki": 860000000000000, "tier": "3-B"}
    },
    "jiren-dragon-ball-super-983": {
        "Jiren (Estado Base / Poder Oculto)": {"ki": 14700000000000, "tier": "2-C"},
        "Jiren (Limit Breaker / Aura Llameante de Fuego)": {"ki": 73500000000000, "tier": "2-C"}
    },
"black-freezer-manga-granolah": {
        "Granolah (Estado Base / Francotirador Cereliano)": {"ki": 180000000000000, "tier": "2-C"},
        "Ojos Cerelianos Despertados (Poder M\u00e1ximo)": {"ki": 459000000000000, "tier": "2-C"}
    },
    "dr-raichi-dbm-u3": {
        "Estado Base (Dr. Raichi en C\u00e1psula)": {"ki": 24518, "tier": "4-B"},
        "ghost-broly-unleashed": {"ki": 49036000, "tier": "4-B", "multiplier": 2000}
    }
}

# ==============================================================================
# 3. FORMATTERS
# ==============================================================================
def format_ki_es(val):
    if val >= 1e24: return f"{val/1e24:.2f} Cuatrillones"
    elif val >= 1e21: return f"{val/1e21:.2f} Mil Trillones"
    elif val >= 1e18: return f"{val/1e18:.2f} Trillones"
    elif val >= 1e15: return f"{val/1e15:.2f} Mil Billones"
    elif val >= 1e12: return f"{val/1e12:.2f} Billones"
    elif val >= 1e9:  return f"{val/1e9:.2f} Mil Millones"
    elif val >= 1e6:  return f"{val/1e6:.2f} Millones"
    elif val >= 1e3:  return f"{val/1e3:.2f} Mil"
    else:
        if isinstance(val, float) and not val.is_integer(): return f"{val:,.2f} Unidades"
        return f"{int(val):,} Unidades".replace(",", ".")

def parse_ki_string(ki_str):
    clean = ki_str.replace("`", "").replace(",", "").replace(".", "").strip()
    try: return float(clean)
    except:
        try: return float(ki_str.replace("`", "").strip())
        except: return None

def parse_multiplier(mult_str):
    # Handle both Unicode × and LaTeX \times notation
    m = re.search(r"(?:[xX×]|\\times)\s*([\d\.]+)", mult_str)
    if m:
        try: return float(m.group(1))
        except: return 1.0
    return 1.0

# ==============================================================================
# 4. PIPELINE PRINCIPAL
# ==============================================================================
def sanitize_roster(input_file, output_file, patch_file, dry_run=False):
    if not os.path.exists(input_file):
        print(f"[ERROR] No se encontro: {input_file}")
        return

    with open(input_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    output_lines = []
    current_char = None
    base_ki = None
    base_tier = None
    in_table = False
    
    stats = {"canon_fixes": 0, "clamping_applied": 0, "form_overrides": 0, "warnings": 0}

    re_header = re.compile(r"^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)")
    re_meta = re.compile(r"^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Numérico\*\*:\s+`([^`]+)`")
    re_row = re.compile(r"^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|")

    patches = {"corrections": [], "clamping": [], "form_fixes": [], "warnings": []}

    def log_patch(char_id, field, old, new, reason):
        patches["corrections"].append({"char_id": char_id, "field": field, "old": old, "new": new, "reason": reason})

    for line in lines:
        # Character header
        m_header = re_header.match(line)
        if m_header:
            current_char = m_header.group(1)
            base_ki = None
            base_tier = None
            in_table = False
            output_lines.append(line)
            continue

        # Meta line (Base Tier | Base Ki)
        m_meta = re_meta.match(line)
        if m_meta:
            tier_str = m_meta.group(1).strip()
            raw_ki = parse_ki_string(m_meta.group(2))
            
            if current_char in CANON_BASES:
                canon = CANON_BASES[current_char]
                base_ki = canon["base_ki"]
                base_tier = canon["tier"]
                if raw_ki != base_ki:
                    log_patch(current_char, "base_ki", raw_ki, base_ki, "canon_override")
                    stats["canon_fixes"] += 1
                if tier_str != base_tier:
                    log_patch(current_char, "base_tier", tier_str, base_tier, "canon_override")
                    stats["canon_fixes"] += 1
            else:
                base_ki = raw_ki
                base_tier = tier_str
                # CLAMPING: Solo si supera el TECHO (t_max) del tier
                if base_tier in TIER_LIMITS and base_ki is not None:
                    t_min, t_med, t_max = TIER_LIMITS[base_tier]
                    # No clampear tiers cósmicos (2-C en adelante) - escala desconocida
                    if base_tier not in ["1-C", "Low 1-C", "2-C", "Low 2-C", "2-B", "2-A", "High 3-A"]:
                        if base_ki > t_max:
                            log_patch(current_char, "base_ki", base_ki, t_max, f"clamp_tier_ceiling_{base_tier}")
                            patches["clamping"].append({"char_id": current_char, "tier": base_tier, "original": base_ki, "clamped": t_max})
                            base_ki = t_max
                            stats["clamping_applied"] += 1

            num_base = f"{base_ki:,.0f}".replace(",", ".") if base_ki >= 1 else str(base_ki)
            output_lines.append(f"- **Base Tier**: `{base_tier}` | **Base Ki Numérico**: `{num_base}` ({format_ki_es(base_ki)})\n")
            continue

        # Status line
        if "- **Estado de Sincronización" in line:
            output_lines.append("- **Estado de Sincronización (tierStatus)**: `internally_aligned`\n")
            continue

        # Table start
        if "| # Forma |" in line:
            in_table = True
            output_lines.append(line)
            continue

        # Table rows
        if in_table and line.strip().startswith("|") and not line.strip().startswith("| :-"):
            m_row = re_row.match(line)
            if m_row and base_ki is not None:
                idx = m_row.group(1).strip()
                name = m_row.group(2).strip()
                mult_str = m_row.group(5).strip()
                tier_str = m_row.group(6).strip()
                apex_cust = m_row.group(7).strip()

                mult = parse_multiplier(mult_str)
                calc_ki = base_ki * mult
                
# FORMS OVERRIDE: Ki canónico exacto + Tier para formas específicas
                form_override_applied = False
                override_tier = None
                if current_char in FORMS_OVERRIDE:
                    for form_key, form_val in FORMS_OVERRIDE[current_char].items():
                        if form_key in name:
                            if isinstance(form_val, dict):
                                calc_ki = form_val["ki"]
                                override_tier = form_val.get("tier")
                            else:
                                calc_ki = form_val
                            form_override_applied = True
                            stats["form_overrides"] += 1
                            break
                
                # NO clamp form Ki - transformations legitimately exceed base tier
                # Instead, flag tier mismatch for review
                if not form_override_applied and tier_str in TIER_LIMITS:
                    t_min, t_med, t_max = TIER_LIMITS[tier_str]
                    if tier_str not in ["1-C", "Low 1-C", "2-C", "Low 2-C", "2-B", "2-A", "High 3-A"]:
                        if calc_ki > t_max * 2:  # Significant mismatch (>2x ceiling)
                            patches["warnings"].append({
                                "char_id": current_char,
                                "form_idx": idx,
                                "form_name": name.strip(),
                                "tier_label": tier_str,
                                "calculated_ki": calc_ki,
                                "tier_ceiling": t_max,
                                "ratio": calc_ki / t_max,
                                "issue": "form_ki_exceeds_tier_ceiling"
                            })
                            stats["warnings"] += 1

                fmt_ki = format_ki_es(calc_ki)
                if calc_ki >= 1e18: num_ki = f"{calc_ki:.3e}"
                else: num_ki = f"{calc_ki:,.0f}".replace(",", ".") if calc_ki >= 1 else str(calc_ki)

                # Use override tier if provided, else keep original
                final_tier = override_tier if override_tier else tier_str
                output_lines.append(f"| {idx} | {name} | `{num_ki}` | {fmt_ki} | {mult_str} | `{final_tier}` | {apex_cust} |\n")
                continue

        # Table end
        if in_table and not line.strip().startswith("|"):
            in_table = False

        output_lines.append(line)

    if not dry_run:
        with open(output_file, "w", encoding="utf-8") as f:
            f.writelines(output_lines)
        with open(patch_file, "w", encoding="utf-8") as f:
            json.dump(patches, f, indent=2, ensure_ascii=False)
        print("==================================================================")
        print("       APEX ENGINE CORE V26 FINAL - REPORTE DE SANEAMIENTO        ")
        print("==================================================================")
        print(f"Archivo generado: {output_file}")
        print(f"Patches: {patch_file}")
        print(f"Bases canónicas forzadas: {stats['canon_fixes']}")
        print(f"Formas con Ki canónico exacto: {stats['form_overrides']}")
        print(f"Clamping anti-inflacion (techo tier): {stats['clamping_applied']}")
        print("==================================================================")
    else:
        print("[DRY-RUN] Vista previa de patches:")
        print(json.dumps(patches, indent=2, ensure_ascii=False))
        print(f"Stats: {stats}")

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    input_md = "ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md"
    output_md = "ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md"
    patch_json = "rosterEnrichmentPatches.json"
    
    # Verificar que el input existe
    if not os.path.exists(input_md):
        # Buscar alternativas
        for alt in ["ROSTER_NIVELES_PODER_KI_COMPLETO_V25_4.md", "ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md"]:
            if os.path.exists(alt):
                input_md = alt
                print(f"[INFO] Usando archivo alternativo: {input_md}")
                break
    
    sanitize_roster(input_md, output_md, patch_json, dry_run=dry_run)