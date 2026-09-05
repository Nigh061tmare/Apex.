# sanitize_roster_final_v2.py
# APEX Power Scaling Engine - Canonical Sanitization Pipeline v26 FINAL
# Combines: strict VS Battles tier clamping + canonical DB overrides + form ordering + patch audit trail
# ELIMINA SCOUTER, CONSOLIDA A APEX KI, ORDENA FORMAS CANÓNICAMENTE

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
    "guldo-saga-namek-583": {"base_ki": 12075, "tier": "5-B"},
    
    # SAGA CELL / ANDROIDES - Coherencia temporal (Buu = Cell +7 años)
    # Buu base: Goku 75M / Vegeta 70M -> Cell base ligeramente MENOR
    "son-goku-saga-cell-saga-androides-459": {"base_ki": 60000000, "tier": "4-C"},
    "vegeta-saga-cell-saga-androides-856": {"base_ki": 55000000, "tier": "4-C"},
    # Gohan niño (9 años): base baja, pero potencial masivo -> SSJ2 supera a Goku/Vegeta SSJ
    "son-gohan-joven-saga-androides-cell-945": {"base_ki": 15000000, "tier": "4-B"},
    # Piccolo fusión Kami: supera a SSJ Namek (150M) -> 1.2B
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
    "gotenks-base-saga-buu-858": {"base_ki": 46200000000, "tier": "4-B"},
    "goten-saga-buu-694": {"base_ki": 6772500, "tier": "4-C"},
    "trunks-ni-o-saga-buu-209": {"base_ki": 8200500, "tier": "4-C"},
    "piccolo-finales-z-principios-super": {"base_ki": 840000000, "tier": "4-A"},
    "krilin-dragon-ball-cl-sico-802": {"base_ki": 120000, "tier": "4-C"},
    "ten-shin-han-dragon-ball-cl-sico-812": {"base_ki": 290000, "tier": "5-A"},
    
    # DBS SUPER HERO / SUPER
    "piccolo-dbs-superhero": {"base_ki": 1400000000, "tier": "4-B"},
    "freezer-resurreccion-f": {"base_ki": 1312500000, "tier": "4-B"},
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
    "broly-dbs-dragon-ball-super-172": {"base_ki": 4315500000, "tier": "3-A"},
    "son-goku-mini-daima-full": {"base_ki": 10000000, "tier": "4-B"},
    "vegeta-mini-daima": {"base_ki": 9000000, "tier": "4-B"},
    "rey-gomah-daima": {"base_ki": 232, "tier": "9-A"},
}

# ==============================================================================
# 2b. ORDEN CANÓNICO DE FORMAS (para personajes con orden incorrecto en fuente)
# ==============================================================================
FORM_ORDER = {
    "cell-saga-androides-98": [
        "Cell Imperfecto",
        "Cell Semi-Perfecto",
        "Estado Base",
        "Cell Perfecto",
        "Cell Super Perfecto"
    ],
    "goku-namek-post-zenkai-892": [
        "Base Post-Tanque",
        "Kaiō-ken x2",
        "Kaiō-ken x10",
        "Kaiō-ken x20",
        "Super Saiyan"
    ],
    "broly-dbz-pel-culas-dbz-toei-822": [
        "Broly (Estado Base / Restringido con Tiara)",
        "Super Saiyan Tipo A (Pelo Azul / Despertar)",
        "Super Saiyan Legendario (LSSJ / Masa Desbordante)"
    ],
    "trunks-futuro-v2-armadura-grados": [
        "Trunks del Futuro (Estado Base - Post-RoSaT)",
        "Super Saiyan (Control Básico / Armadura)",
        "Super Saiyan Grado 2 (Ascendido)",
        "Super Saiyan Grado 3 (Ultra Super Saiyan)"
    ],
    "trunks-futuro-v3-saga-buu-ssj2": [
        "Trunks del Futuro (Estado Base - Pacificador del Futuro)",
        "Super Saiyan 1 (Básico)",
        "Super Saiyan Perfeccionado (Full Power / Mastered)",
        "Super Saiyan 2 (Verdadero)"
    ],
    "trunks-futuro-v1-espada-ssj-basico": [
        "Trunks del Futuro (Estado Base)",
        "Super Saiyan (Básico / Primera Transformación)"
    ],
    "trunks-futuro-v4-manga-super-zamasu": [
        "Trunks del Futuro (Estado Base - Manga DBS)",
        "Super Saiyan 1 (Manga DBS)",
        "Super Saiyan 2 (Manga Estándar)",
        "Super Saiyan 2 Potenciado / Perfeccionado (Rival de Goku SSJ3)"
    ],
    "vegeta-saga-cell-saga-androides-856": [
        "Vegeta (Saga Cell) (Estado Base)",
        "Super Saiyajin (Super Saiyan Ordinario)",
        "Super Vegeta (SSJ 2do Grado)"
    ],
    "vegeta-majin-ssj2-895": [
        "Majin Vegeta (Estado Base / Sello Desatado)",
        "Majin Vegeta (Super Saiyajin)",
        "Majin Vegeta (Super Saiyajin 2 / Rival de Goku)",
        "Final Explosion (Detonación Suicida de Todo el Ki)"
    ],
    "vegeta-saga-super-dragon-ball-super-454": [
        "Vegeta (Estado Base DBS)",
        "Super Saiyan",
        "Super Saiyan 2",
        "Super Saiyan 3 (Teórica)",
        "Super Saiyan God (Rojo)",
        "Super Saiyan Blue",
        "Super Saiyan Blue Evolution (Evolución Azul)",
        "Ultra Ego (Mega Instinto / Hakaishin)"
    ],
    "son-goku-saga-super-dragon-ball-super-732": [
        "Son Goku (Estado Base DBS)",
        "Super Saiyan 1",
        "Super Saiyan 2",
        "Super Saiyan 3",
        "Super Saiyan God (Dios Rojo)",
        "Super Saiyan Blue (SSGSS)",
        "SSGSS + Kaio-ken (x20)",
        "Ultra Instinto -Señal- (Omen)",
        "Ultra Instinto Dominado (Plateado / Verdadero)"
    ],
    "son-gohan-saga-super-dragon-ball-super-39": [
        "Estado Base (DBS - Entrenado con Piccolo)",
        "Super Saiyan",
        "Super Saiyan 2",
        "Estado Definitivo (Ultimate Gohan)",
        "Modo Bestia (Gohan Beast)"
    ],
    "vegetto-base-saga-buu-120": [
        "Vegetto Base",
        "Super Vegetto"
    ],
    "son-goku-saga-buu-saga-buu-646": [
        "Son Goku (Estado Base Saga Buu)",
        "Super Saiyan 1",
        "Super Saiyan 2",
        "Super Saiyan 3"
    ],
    "vegeta-saga-buu-saga-buu-213": [
        "Vegeta Base (Saga Buu)",
        "Super Saiyan 1",
        "Super Saiyan 2",
        "Majin Vegeta"
    ],
    "freezer-resurreccion-f": [
        "Freezer 1ª Forma (Silla Espacial / Entrenado)",
        "Freezer Forma Final (Poder Real Desatado)",
        "Golden Freezer (Evolución Dorada / Desgaste Rápido)"
    ],
    "broly-dbz-pel-culas-dbz-toei-822": [
        "Broly (Estado Base / Restringido con Tiara)",
        "Super Saiyan Tipo A (Pelo Azul / Despertar)",
        "Super Saiyan Legendario (LSSJ / Masa Desbordante)"
    ],
    "broly-dbs-dragon-ball-super-172": [
        "Broly (Estado Base / Collar Eléctrico de Paragus)",
        "Estado Iracundo (Ikari / Poder del Oozaru en Forma Humana)",
        "Super Saiyan (Furia Desbordante / Cúspide de Ira)",
        "Super Saiyan Full Power (Legendario / Pelo Verde)"
    ],
    "trunks-futuro-v1-espada-ssj-basico": [
        "Trunks del Futuro (Estado Base)",
        "Super Saiyan (Básico / Primera Transformación)"
    ],
    "trunks-futuro-v2-armadura-grados": [
        "Trunks del Futuro (Estado Base - Post-RoSaT)",
        "Super Saiyan (Control Básico / Armadura)",
        "Super Saiyan Grado 2 (Ascendido)",
        "Super Saiyan Grado 3 (Ultra Super Saiyan)"
    ],
    "trunks-futuro-v3-saga-buu-ssj2": [
        "Trunks del Futuro (Estado Base - Pacificador del Futuro)",
        "Super Saiyan 1 (Básico)",
        "Super Saiyan Perfeccionado (Full Power / Mastered)",
        "Super Saiyan 2 (Verdadero)"
    ],
    "trunks-futuro-v4-manga-super-zamasu": [
        "Trunks del Futuro (Estado Base - Manga DBS)",
        "Super Saiyan 1 (Manga DBS)",
        "Super Saiyan 2 (Manga Estándar)",
        "Super Saiyan 2 Potenciado / Perfeccionado (Rival de Goku SSJ3)"
    ],
    "vegeta-saga-buu-saga-buu-213": [
        "Vegeta Base (Saga Buu)",
        "Super Saiyan 1",
        "Super Saiyan 2",
        "Majin Vegeta"
    ],
    "son-goku-saga-buu-saga-buu-646": [
        "Son Goku (Estado Base Saga Buu)",
        "Super Saiyan 1",
        "Super Saiyan 2",
        "Super Saiyan 3"
    ],
    "goku-namek-post-zenkai-892": [
        "Base Post-Tanque",
        "Kaiō-ken x2",
        "Kaiō-ken x10",
        "Kaiō-ken x20",
        "Super Saiyan"
    ],
    "vegeta-saga-namek-saga-namek-783": [
        "Vegeta (Saga Namek) (Estado Base)",
        "Zenkai Élite (Post-Curación Dende)"
    ],
    "son-gohan-joven-saga-androides-cell-945": [
        "Son Gohan Joven (Estado Base / Traje de Piccolo)",
        "Super Saiyajin (Full Power / Estado Normalizado)",
        "Super Saiyajin 2 (Despertar de la Ira Absoluta)"
    ],
    "son-gohan-saga-super-dragon-ball-super-39": [
        "Estado Base (DBS - Entrenado con Piccolo)",
        "Super Saiyan",
        "Super Saiyan 2",
        "Estado Definitivo (Ultimate Gohan)",
        "Modo Bestia (Gohan Beast)"
    ],
    "piccolo-saga-cell-buu-saga-androides-946": [
        "Piccolo (Guerrero Namekiano Base)",
        "Fusión con Nail (Saga Namek)",
        "Super Namekiano (Fusión con Kami-sama)"
    ],
    "vegeta-majin-ssj2-895": {
        "Majin Vegeta (Estado Base / Sello Desatado)": {"ki": 70000000, "tier": "4-C"},
        "Majin Vegeta (Super Saiyajin)": {"ki": 3500000000, "tier": "4-B"},
        "Majin Vegeta (Super Saiyajin 2 / Rival de Goku)": {"ki": 7000000000, "tier": "4-A"},
        "Final Explosion (Detonación Suicida de Todo el Ki)": {"ki": 23000000000, "tier": "High 4-B"}
    },