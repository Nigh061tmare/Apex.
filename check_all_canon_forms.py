import json, re

with open('characters_parsed.json', 'r', encoding='utf-8') as f:
    characters = json.load(f)

# ============================================================
# FUNCIONES DE AYUDA
# ============================================================
def find_form(char, keywords_any, keywords_all=None):
    for f in char['forms']:
        name_lower = f['name'].lower()
        if any(kw.lower() in name_lower for kw in f['name'].lower().split()):
            pass
        if all(kw.lower() in f['name'].lower() for kw in f['name'].lower().split()):
            pass
    for f in char['forms']:
        name_lower = f['name'].lower()
        if keywords_any and not any(kw.lower() in name_lower for kw in keywords_any):
            continue
        if keywords_all and not all(kw.lower() in name_lower for kw in keywords_all):
            continue
        return f
    return None

def has_form(char_id, chars, keywords_any, keywords_all=None):
    if char_id not in chars:
        return False
    char = chars[char_id]
    for f in char['forms']:
        name_lower = f['name'].lower()
        if keywords_any and not any(kw.lower() in name_lower for kw in keywords_any):
            continue
        if keywords_all and not all(kw.lower() in name_lower for kw in keywords_all):
            continue
        return True
    return False

def get_form(char_id, chars, keywords_any):
    if char_id not in chars:
        return None
    char = chars[char_id]
    for f in char['forms']:
        name_lower = f['name'].lower()
        if any(kw.lower() in name_lower for kw in keywords_any):
            return f
    return None

# ============================================================
# CARGAR PERSONAJES
# ============================================================
with open('characters_parsed.json', 'r', encoding='utf-8') as f:
    characters = json.load(f)

print("Total personajes:", len(characters))

# ============================================================
# 1. VERIFICAR FORMAS CANÓNICAS POR FRANQUICIA
# ============================================================

# Dragon Ball - formas canónicas obligatorias
DB_CANON = {
    # Goku
    "son-goku-saga-super-dragon-ball-super-732": [["super saiyan god"], ["super saiyan blue"], ["ultra instinto", "señal"], ["ultra instinto", "dominado"]],
    "vegeta-saga-super-dragon-ball-super-454": [["super saiyan god"], ["super saiyan blue"], ["super saiyan blue", "evolution"], ["ultra ego"]],
    "son-gohan-saga-super-dragon-ball-super-39": [["super saiyan"], ["super saiyan 2"], ["definitivo"], ["beast"]],
    "vegeta-saga-cell-saga-androides-856": [["super saiyan"], ["super vegeta"]],
    "son-goku-saga-cell-saga-androides-459": [["super saiyan"]],
    "son-gohan-joven-saga-androides-cell-945": [["super saiyan"], ["super saiyan 2"]],
    "freezer-resurreccion-f": [["golden"]],
    "broly-dbs-dragon-ball-super-172": [["ikari"], ["super saiyan"], ["legendario"]],
    "piccolo-dbs-superhero": [["orange"]],
    "vegeta-majin-ssj2-895": [["super saiyan 2"], ["final explosion"]],
    "vegetto-base-saga-buu-120": [["super vegetto"]],
    "gotenks-base-saga-buu-858": [["super saiyan 3"]],
    "trunks-futuro-v2-armadura-grados": [["super saiyan grado 3"]],
    "piccolo-dbs-superhero": [["orange"]],
    "son-goku-saga-super-dragon-ball-super-732": [["super saiyan god"], ["super saiyan blue"], ["ultra instinto", "señal"], ["ultra instinto", "dominado"]],
    "vegeta-saga-super-dragon-ball-super-454": [["super saiyan god"], ["super saiyan blue"], ["super saiyan blue", "evolution"], ["ultra ego"]],
}

print("=" * 80)
print("FORMAS CANÓNICAS FALTANTES - DRAGON BALL")
print("=" * 80)

for cid, required_groups in DB_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in f['name'].lower() for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# ============================================================
# 2. JUJUTSU KAISEN - Formas canónicas
# ============================================================
JK_CANON = {
    "gojo-satoru-jjk-peak-gs001": [["expansion", "dominio"], ["azul"], ["rojo"], ["morado"], ["infinity"]],
    "sukuna-ryomen-jjk-20sellos-s001": [["expansion", "dominio"], ["corte", "mundo"], ["desmantelamiento"]],
    "yuji-itadori-jjk-shinjuku": [["black flash"], ["consecutive", "black flash"]],
    "yuta-okkotsu-jjk-peak-yo001": [["rika"], ["copy", "technique"]],
    "mahoraga-jjk-shibuya": [["adaptation"], ["wheel"]],
    "hakari-kinji": [["jackpot"], ["domain", "expansion"]],
    "choso-jjk-shibuya": [["blood", "manipulation"], ["piercing", "blood"]],
    "nanami-kento": [["ratio", "technique"], ["overtime"]],
    "mahito-forma-verdadera": [["idle", "transfiguration"], ["self", "embodiment"]],
    "jogo-jjk-shibuya": [["maximum", "meteor"], ["ember", "insects"]],
}

print("\n=== JUJUTSU KAISEN - FORMAS FALTANTES ===")
for cid, required_groups in JK_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in f['name'].lower() for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# ============================================================
# 3. MY HERO ACADEMIA - Formas canónicas
# ============================================================
MHA_CANON = {
    "izuku-midoriya-deku-mha": [["one for all", "100%"], ["gearshift"], ["fa jin"], ["blackwhip"], ["smokescreen"], ["danger sense"]],
    "katsuki-bakugo-mha": [["explosion"], ["cluster", "explosion"], ["ap shot"]],
    "shoto-todoroki-mha": [["half-cold", "half-hot"], ["phosphor"], ["flashfire", "fist"], ["great", "glacier"]],
    "all-might-prime-mha": [["united states of smash"]],
    "all-for-one": [["all for one"], ["reversal"]],
    "shigaraki-tomura-mha": [["decay"], ["all for one", "fusion"]],
    "endeavor-mha": [["prominence", "burn"], ["hellflame"]],
    "hawks-mha": [["fierce wings"], ["feather", "blade"]],
    "mirio-togata-mha-shie": [["permeation"], ["phantom", "menace"]],
    "overhaul-mha-shie": [["overhaul"], ["fusion"]],
}

print("\n=== MY HERO ACADEMIA - FORMAS FALTANTES ===")
for cid, required_groups in MHA_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in name_lower for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# ============================================================
# 4. ONE PUNCH MAN - Formas canónicas
# ============================================================
OPM_CANON = {
    "saitama-opm": [["serious", "punch"], ["serious", "series"], ["zero", "punch"]],
    "garou-cosmico-opm": [["mode", "fear"], ["mode", "saitama"], ["awakened"]],
    "garou-hero-hunter-opm": [["monster", "form"], ["awakened"]],
    "boros-lord": [["meteoric", "burst"], ["collapsing", "star", "roaring", "cannon"]],
    "tatsumaki-opm": [["psychic", "binding"], ["barrier"]],
    "bang-silver-fang-opm": [["water", "stream", "rock", "smashing", "fist"], ["abandonment"]],
    "atomic-samurai-opm-ma": [["atomic", "slash"], ["sun", "blade"]],
    "flashy-flash-opm-ma": [["flashy", "slash"]],
    "metal-bat-opm-ma": [["fighting", "spirit"]],
    "king-opm": [["king", "engine"]],
}

print("\n=== ONE PUNCH MAN - FORMAS FALTANTES ===")
for cid, required_groups in OPM_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in f['name'].lower() for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# ============================================================
# 5. CHAINSAW MAN - Formas canónicas
# ============================================================
CSM_CANON = {
    "denji-csm-903": [["chainsaw", "man"], ["hero", "hell"], ["pocheta"]],
    "makima-csm-904": [["control"], ["domination"]],
    "power-csm": [["blood", "manipulation"], ["blood", "hammer"]],
    "reze-csm": [["bomb", "hybrid"], ["explosion"]],
    "angel-devil-csm-p1": [["angel", "weapon"], ["lifespan"]],
    "kobeni-csm-p1": [["devil", "contract"]],
    "yoshida-hirofumi-csm-p2": [["octopus", "devil"]],
    "fami-csm": [["hunger", "devil"], ["famine"]],
}

print("\n=== CHAINSAW MAN - FORMAS FALTANTES ===")
for cid, required_groups in CSM_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in f['name'].lower() for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# ============================================================
# 6. DEMON SLAYER - Formas canónicas
# ============================================================
KNY_CANON = {
    "tanjiro-kamado": [["water", "breathing"], ["sun", "breathing"], ["hinokami", "kagura"], ["see", "transparent", "world"]],
    "nezuko-kamado": [["blood", "demon", "art"], ["exploding", "blood"]],
    "zenitsu-agatsuma": [["thunder", "breathing"], ["godspeed"], ["first", "form"], ["seventh", "form"]],
    "inosuke-hashibira": [["beast", "breathing"], ["sudden", "throwing", "strike"]],
    "giyu-tomioka-kny-ic": [["water", "breathing"], ["eleventh", "form", "dead", "calm"]],
    "shinobu-kocho": [["insect", "breathing"], ["dance", "dragonfly"], ["poison"]],
    "kyojuro-rengoku-kimetsu": [["flame", "breathing"], ["ninth", "form", "rengoku"]],
    "muzan-kibutsuji-kny-901": [["biokinesis"], ["demon", "form"], ["shockwave"]],
    "kokushibo-kimetsu": [["moon", "breathing"], ["sixteen", "forms"]],
    "doma-kimetsu": [["ice", "breathing"], ["bodhisattva"], ["lotus"]],
    "akaza-kimetsu": [["destructive", "death"], ["compass", "needle"]],
}

print("\n=== DEMON SLAYER - FORMAS FALTANTES ===")
for cid, required_groups in KNY_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in f['name'].lower() for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# ============================================================
# 7. JOJO - Formas canónicas
# ============================================================
JOJO_CANON = {
    "jotaro-kujo": [["star", "platinum"], ["time", "stop"], ["star", "platinum", "the", "world"]],
    "dio": [["the", "world"], ["time", "stop"], ["vampire"]],
    "giorno-giovanna-jojo-va": [["gold", "experience"], ["gold", "experience", "requiem"]],
    "jolyne-cujoh-jojo-so": [["stone", "free"], ["stone", "free", "awakening"]],
    "johnny-joestar": [["tusk", "act1"], ["tusk", "act2"], ["tusk", "act3"], ["tusk", "act4"]],
    "gyro-zeppeli-jojo-sbr": [["scan"], ["ball", "breaker"]],
    "funny-valentine-jojo-sbr": [["dirty", "deeds", "done", "dirt", "cheap"], ["love", "train"]],
    "pucci-made-in-heaven-jojo-pm001": [["whitesnake"], ["c-moon"], ["made", "in", "heaven"]],
    "diavolo-jojo-va": [["king", "crimson"], ["epitaph"], ["time", "erasure"]],
    "kira-yoshikage": [["killer", "queen"], ["sheer", "heart", "attack"], ["bites", "the", "dust"]],
}

print("\n=== JOJO - FORMAS FALTANTES ===")
for cid, required_groups in JOJO_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in f['name'].lower() for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# ============================================================
# 8. HUNTER X HUNTER - Formas canónicas
# ============================================================
HXH_CANON = {
    "gon-freecss": [["adult", "gon"], ["transformation"], ["paper", "rock", "scissors"]],
    "killua-zoldyck-hxh": [["godspeed"], ["kanmuru"], ["thunderbolt"]],
    "kurapika-hxh": [["emperor", "time"], ["chain", "jail"], ["steal", "chain"]],
    "hisoka-morow": [["bungee", "gum"], ["texture", "surprise"]],
    "meruem-hxh-911": [["photon"], ["metamorphosis"], ["rage", "blast"]],
    "netero-hxh-912": [["100-type", "guanyin", "bodhisattva"], ["zero", "hand"], ["poor", "man's", "rose"]],
    "chrollo-lucilfer-hxh": [["skill", "hunter"], ["indoor", "fish"], ["sun", "and", "moon"]],
    "feitan-portor-hxh-ca": [["pain", "packer"], ["rising", "sun"]],
    "gon-adult-hxh": [["transformation"], ["restriction", "covenant"]],
    "neferpitou-hxh-ca": [["terpsichora"], ["doctor", "blythe"]],
    "shaiapouf-hxh-ca": [["beelzebub"], ["spiritual", "message"]],
    "shalnark-hxh-yr": [["autopilot"], ["remote", "control"]],
    "illumi-zoldyck-individual": [["needle", "people"]],
    "kite-hxh-ca": [["crazy", "slots"]],
}

print("\n=== HUNTER X HUNTER - FORMAS FALTANTES ===")
for cid, required_groups in HXH_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in f['name'].lower() for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# ============================================================
# 9. INVINCIBLE - Formas canónicas
# ============================================================
INV_CANON = {
    "omni-man-invincible-905": [["viltrumite", "strength"], ["flight"], ["enhanced", "senses"]],
    "mark-grayson-clasico": [["viltrumite", "heritage"], ["flight"], ["healing", "factor"]],
    "mark-grayson-guerra": [["viltrumite", "war"], ["coalition"]],
    "thragg-invincible-war": [["grand", "regent"], ["viltrumite", "elite"]],
    "conquest-invincible": [["viltrumite", "warrior"]],
    "battle-beast-thokk": [["berserker"], ["martial", "arts"]],
    "atom-eve": [["matter", "manipulation"], ["transmutation"]],
    "allen-the-alien-poder-completo": [["unit", "power"], ["flight"]],
}

print("\n=== INVINCIBLE - FORMAS FALTANTES ===")
for cid, required_groups in INV_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in f['name'].lower() for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

# ============================================================
# 10. THE BOYS - Formas canónicas
# ============================================================
BOYS_CANON = {
    "homelander-the-boys-913": [["heat", "vision"], ["flight"], ["super", "hearing"], ["x-ray", "vision"]],
    "billy-butcher-the-boys-914": [["temp-v"], ["laser", "eyes"], ["tumor", "tentacles"]],
    "starlight-the-boys": [["light", "manipulation"], ["electricity", "absorption"], ["energy", "blast"]],
    "soldier-boy": [["nuclear", "blast"], ["radiation"], ["shield"]],
    "queen-maeve": [["super", "strength"], ["flight"], ["durability"]],
    "black-noir-the-boys": [["martial", "arts"], ["stealth"], ["enhanced", "senses"]],
    "stormfront-the-boys": [["plasma", "manipulation"], ["flight"], ["electricity"]],
    "kimiko-miyashiro-the-boys": [["enhanced", "strength"], ["regeneration"]],
    "a-train": [["super", "speed"], ["acceleration"]],
    "victoria-neuman-the-boys": [["blood", "manipulation"], ["head", "popping"]],
}

print("\n=== THE BOYS - FORMAS FALTANTES ===")
for cid, required_groups in BOYS_CANON.items():
    if cid in characters:
        for kw_group in required_groups:
            found = False
            for f in characters[cid]['forms']:
                name_lower = f['name'].lower()
                if all(kw.lower() in f['name'].lower() for kw in kw_group):
                    break
            else:
                print(f"[FORMA_FALTANTE] {cid}: Falta forma con keywords {kw_group}")

print("\n=== VERIFICACIÓN DE FORMAS CANÓNICAS COMPLETADA ===")