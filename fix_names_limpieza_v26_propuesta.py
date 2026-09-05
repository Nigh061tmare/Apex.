# -*- coding: utf-8 -*-
"""LIMPIEZA NAMES V26 — PROPUESTA v2 (conservadora, revisable):
   Regla: NUNCA se borran palabras que sean nombres canónicos.
   1) Quitar token universo literal SOLO al final del name.
   2) Quitar abreviatura técnica de saga (lista blanca de sufijos de id) SOLO al final.
   3) Normalizar fragmentos corruptos conocidos (Pel Culas -> Películas, Dbgt -> DBGT, etc.).
   4) Detectar duplicados tras limpieza -> proponer contexto canónico del id para desambiguar.
   NO aplica nada: solo imprime propuesta.
"""
import json, sys, re
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

# Tokens universo literales (quitar al final, pueden ser multi-palabra)
UNI_TAIL = [
    'Dragon Ball Super', 'Dragon Ball Classico', 'Dragon Ball Clasico', 'Dragon Ball Z',
    'Dragon Ball Gt', 'Dragon Ball Daima', 'Dragon Ball Multiverse U2', 'Dragon Ball Multiverse',
    'Dragon Ball', 'Dragon Ball Z Toei', 'Jujutsu Kaisen', 'Jujutsu Kaisen0', 'Kimetsu No Yaiba',
    'Chainsaw Man', 'Hunter X Hunter', 'Jojo', 'One Punch Man', 'My Hero Academia',
    'Baki The Grappler', 'Baki', 'Shuumatsu No Valkyrie', 'Ragnarok', 'Marvel', 'Dc', 'Dc Comics',
    'Invincible', 'The Boys', 'Spy X Family', 'Record Of Ragnarok', 'Shuumatsu', 'Jojo’S',
    'Kimetsu No Yaiba', 'Dragon Ball Z Pel Culas',
]

# Abreviaturas técnicas de saga (solo al final; NO son nombres propios)
TECH_TAIL = [
    'Opm', 'Mha', 'Jjk', 'Kny', 'Csm', 'Hxh', 'Dbz', 'Dbs', 'Dbgt', 'Daima', 'Gt', 'Top', 'Fnf',
    'U6', 'U13', 'U18', 'U19', 'U9', 'U2', 'U4', 'U5', 'U16', 'U14', 'U12', 'U7', 'U11', 'U10',
    'U8', 'U15', 'U17', 'U20', 'U21', 'U3', 'Ror', 'R10', 'R6', 'Rebirth', 'Pcf', 'Toei', 'Toei Toei',
    'Saga Cell', 'Saga Androides', 'Saga Buu', 'Saga Saiyan', 'Saga Namek', 'Saga Garlic Jr',
    'Saga GT', 'Saga Super', 'Saga Gt', 'Cl Sico', 'Clasico', 'Classico', 'Clásico', 'Cl Sico',
    'Pel Culas Dragon Ball Z Toei', 'Pel Culas', 'P1', 'P2', 'S1', 'Sc', 'Va', 'Diu', 'Bt', 'Pb',
    'So', 'Sbr', 'Jjl', 'Ger', 'Ca', 'Yr', 'Yc', 'Election', 'Train', 'Lore', 'Mt', 'Mn', 'Sv',
    'Ic', 'Ed', 'Culling', 'Shinjuku', 'Kyoto', 'Shibuya', 'Jjk Shibuya', 'Peak', 'Gg001', 'Gs001',
    'Pm001', 'Yo001', 'Gr001', 'S001', 'Saga', 'Anime', 'Movie', 'Manga', 'Primal', 'Espada',
    'Escudo', 'Supremo', 'Reino Demonio', 'Demonio', '20Sellos', 'Ss', 'Ssj', 'Basico', 'V1', 'V3',
    'V4', 'Torneo Del Poder', 'Poder', 'Mera', 'Ma', 'Ha', 'Whm', 'Mla', 'Shie', 'Hosu', 'Pl', 'Loa',
    'Ua', 'Tartarus', 'Forest', 'Heroes Rising', 'Heroes', 'Tournament', 'Drc', 'Dou', 'Ig',
    'Poder Dbs', 'Torneo Del Poder Dbs', 'Csm P1', 'Csm P2', 'Sag', 'Yo', 'Ui', 'Individual',
    'Base Daima', 'Daima Reino Demonio', 'Poder Dbs Top',
]

# fragmentos corruptos -> corrección (dentro del name, no solo al final)
CORRUPT = {
    'Pel Culas': 'Películas', 'Cl Sico': 'Clásico', 'N Mero': 'Número', 'L Nea': 'Línea',
    'Dbgt': 'DBGT', 'Dbz': 'DBZ', 'Dbs': 'DBS', 'Ssj': 'SSJ', 'Ssj2': 'SSJ2', 'Ror': 'ROR',
    'Opm': 'OPM', 'Mha': 'MHA', 'Jjk': 'JJK', 'Kny': 'KNY', 'Csm': 'CSM', 'Hxh': 'HXH',
}

def clean(name, cid):
    nm = name.strip()
    # reparar corrupciones globales primero (no al final)
    for frag, fix in CORRUPT.items():
        # solo reemplazar si el fragmento NO está al final (porque al final se borrará vía TECH)
        nm = nm.replace(frag, fix)
    # 1) quitar token universo al final (repetidamente, ej. 'Dragon Ball Super Dragon Ball Super')
    changed = True
    while changed:
        changed = False
        for tok in UNI_TAIL:
            if nm.endswith(tok):
                nm = nm[: -len(tok)].strip()
                changed = True
                break
    # 2) quitar abreviatura técnica al final
    changed = True
    while changed:
        changed = False
        for tok in TECH_TAIL:
            # palabra al final exacta (case-sensitive)
            if re.search(r'\b' + re.escape(tok) + r'$', nm):
                nm = re.sub(r'\s*\b' + re.escape(tok) + r'$', '', nm).strip()
                changed = True
                break
    nm = re.sub(r'\s+', ' ', nm).strip()
    return nm

results = []
for cid, c in sorted(active.items()):
    old = c.get('name', '')
    new = clean(old, cid)
    if new != old:
        results.append((cid, old, new))

# duplicados
by_new = defaultdict(list)
for cid, old, new in results:
    by_new[new].append((cid, old))
dup_groups = {n: v for n, v in by_new.items() if len(set(x[0] for x in v)) > 1}

print('TOTAL a corregir:', len(results))
print()
print('######## DUPLICADOS POST-LIMPIEZA (requieren contexto del id) ########')
for n, lst in sorted(dup_groups.items()):
    print('  "%s" -> %s' % (n, [x[0] for x in lst]))
print()
print('######## RESTO DE CORRECCIONES ########')
for cid, old, new in results:
    if any(new == n for n in dup_groups):
        continue
    print('%-46s\n    OLD: %s\n    NEW: %s' % (cid[:46], old, new))