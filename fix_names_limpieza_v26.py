# -*- coding: utf-8 -*-
"""LIMPIEZA NAMES V26 — v3.1 ESTABLE (APLICA + backup)
   - Case-insensitive para tokens universo/siglas.
   - Tokens multi-palabra antes que cortos.
   - Nunca borra nombres propios (Max, Granolah, Moro, Superhero fuera de siglas).
"""
import json, sys, re, shutil, datetime
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

UNI_TAIL = [
    'Dragon Ball Super Superhero', 'Dragon Ball Super Broly Movie', 'Dragon Ball Super Top',
    'Dragon Ball Super Granolah', 'Dragon Ball Super Moro', 'Dragon Ball Super Super',
    'Dragon Ball Super', 'Dragon Ball Classico', 'Dragon Ball Clasico', 'Dragon Ball Clásico',
    'Dragon Ball Z Toei', 'Dragon Ball Z Películas', 'Dragon Ball Z Pel Culas', 'Dragon Ball Z',
    'Dragon Ball Gt', 'Dragon Ball GT', 'Dragon Ball Daima', 'Dragon Ball Multiverse',
    'Dragon Ball', 'Baki The Grappler Max', 'Baki the Grappler Max', 'Baki Max', 'Baki The Grappler',
    'Baki the Grappler', 'Baki', 'Jujutsu Kaisen', 'Jujutsu Kaisen0', 'Kimetsu No Yaiba',
    'Kimetsu no Yaiba', 'Kimetsu', 'Chainsaw Man', 'Hunter X Hunter', 'Hunter x Hunter',
    "Jojo'S Bizarre Adventure", "Jojo's Bizarre Adventure", 'Jojo Bizarre Adventure', 'Jojo',
    'One Punch Man', 'My Hero Academia', 'Shuumatsu No Valkyrie', 'Shuumatsu no Valkyrie',
    'Shuumatsu', 'Record Of Ragnarok', 'Record of Ragnarok', 'Ragnarok', 'Marvel', 'Dc Comics',
    'Dc', 'Invincible', 'The Boys', 'Spy X Family', 'Spy x Family', 'Dragon Ball Z Peli Culas',
]
UNI_TAIL.sort(key=len, reverse=True)

TECH_TAIL = [
    'Saga Garlic Jr', 'Saga Androides', 'Saga Cell', 'Saga Buu Saga Buu', 'Saga Namek Saga Namek',
    'Saga Buu', 'Saga Saiyan', 'Saga Namek', 'Saga Super', 'Saga GT', 'Saga Gt', 'Saga',
    'Pel Culas Dragon Ball Z Toei', 'Pel Culas', 'Torneo Del Poder Dbs', 'Torneo Del Poder',
    'Poder Dbs', 'Poder', 'Reino Demonio', 'Línea Temporal Futura', 'Linea Temporal Futura',
    'L Nea Temporal Futura', 'Temporal Futura', 'Anime Rage', 'Heroes Rising', 'Rage',
    '20Sellos', 'Primal Daima', 'Daima Reino Demonio', 'Cl Sico', 'Clásico', 'Clasico',
    'Classico', 'Db Clasico', 'Db Cl Sico', 'Individual', 'Opm', 'Mha', 'Jjk', 'Kny', 'Csm',
    'Hxh', 'Dbz', 'Dbs', 'Dbgt', 'Daima', 'Gt Toei', 'Gt', 'Top', 'Fnf', 'Toei', 'Ror', 'R10',
    'R9', 'R8', 'R7', 'R6', 'R5', 'R4', 'R3', 'R2', 'R1', 'Rebirth', 'Pcf', 'S1', 'P1', 'P2',
    'Sc', 'Va', 'Diu', 'Bt', 'Pb', 'So', 'Sbr', 'Jjl', 'Ger', 'Ca', 'Yr', 'Yc', 'Election',
    'Train', 'Lore', 'Mt', 'Mn', 'Sv', 'Ic', 'Ed', 'Culling', 'Shinjuku', 'Kyoto', 'Shibuya',
    'Peak', 'Gg001', 'Gs001', 'Pm001', 'Yo001', 'Gr001', 'S001', 'Ri001', 'Ma', 'Ha', 'Whm',
    'Mla', 'Shie', 'Hosu', 'Pl', 'Loa', 'Ua', 'Tartarus', 'Forest', 'Heroes', 'Tournament',
    'Drc', 'Dou', 'Pickle', 'New Hope', 'Ssj3', 'Ssj2', 'Ssj', 'SSJ3', 'SSJ2', 'Manga', 'Movie',
    'Anime', 'V1', 'V3', 'V4', 'Espada', 'Escudo', 'Supremo', 'Broly Movie', 'U2', 'U3', 'U4',
    'U5', 'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17',
    'U18', 'U19', 'U20', 'U21', 'Ssj3', 'Buu Saga Buu', 'Ssj3 Buu', 'Torneo Del Poder Dbs Top',
]
TECH_TAIL.sort(key=len, reverse=True)

CORRUPT = {
    'Pel Culas': 'Películas', 'Cl Sico': 'Clásico', 'N Mero': 'Número', 'L Nea': 'Línea',
    'Dbgt': 'DBGT', 'Dbz': 'DBZ', 'Dbs': 'DBS', 'Ror': 'ROR', 'Gg001': '', 'Gs001': '',
    'Pm001': '', 'Yo001': '', 'Gr001': '', 'S001': '', 'Ri001': '', 'Ssj3': 'SSJ3',
    'Ssj2': 'SSJ2', 'Ssj': 'SSJ', 'Ninos': 'Niños',
}
# orden: largos primero
CORRUPT = dict(sorted(CORRUPT.items(), key=lambda kv: len(kv[0]), reverse=True))

def clean(name):
    nm = re.sub(r'\s+', ' ', name.strip())
    changed = True
    while changed:
        changed = False
        for tok in UNI_TAIL:
            if nm.lower().endswith(tok.lower()):
                nm = nm[: -len(tok)].strip()
                changed = True
        for tok in TECH_TAIL:
            if re.search(r'\b' + re.escape(tok) + r'$', nm, flags=re.I):
                nm = re.sub(r'\s*\b' + re.escape(tok) + r'$', '', nm, flags=re.I).strip()
                changed = True
        nm = re.sub(r'\s+', ' ', nm)
    for frag, fix in CORRUPT.items():
        if fix == '':
            nm = re.sub(r'\s*' + re.escape(frag) + r'$', '', nm).strip()
        else:
            nm = re.sub(r'\b' + re.escape(frag) + r'\b', fix, nm)
    nm = re.sub(r'\s+', ' ', nm).strip()
    return nm

results = {}
for cid, c in active.items():
    old = c.get('name', '')
    new = clean(old)
    if new != old:
        results[cid] = (old, new)

by_new = defaultdict(list)
for cid, (old, new) in results.items():
    by_new[new].append(cid)
dup = {n: v for n, v in by_new.items() if len(v) > 1}
print('A corregir: %d | Duplicados tras limpieza: %d' % (len(results), len(dup)))
for n, v in sorted(dup.items()):
    print('  DUP "%s" -> %s' % (n, v))

# Overrides para duplicados y casos especiales
OVERRIDES = {
    'a-train': 'A-Train',
    'pickle-baki': 'Pickle',
    'dabi-mha': 'Dabi (Pre-Guerra)',
    'dabi-mha-war': 'Dabi (Guerra)',
    'garou-hero-hunter-opm': 'Garou (Hero Hunter)',
    'garou-opm-hero-hunter': 'Garou (Hero Hunter)',
    'giorno-giovanna-ger-jojo-gg001': 'Giorno Giovanna (GER)',
    'giorno-giovanna-jojo-va': 'Giorno Giovanna (Vento Aureo)',
    'hawks-mha': 'Hawks (Pre-Guerra)',
    'hawks-mha-war': 'Hawks (Guerra)',
    'krilin-db-clasico': 'Krilin (Niño / Clásico)',
    'krilin-dragon-ball-cl-sico-802': 'Krilin (Saga Super)',
    'krilin-saga-cell': 'Krilin (Saga Cell)',
    'kulilin-turtle-hermit-u9': 'Krilin (Turtle Hermit U9)',
    'piccolo-saga-saiyan': 'Piccolo (Saga Saiyan)',
    'piccolo-saga-saiyan-namek-saga-saiyan-967': 'Piccolo (Saga Namek)',
    'piccolo-dbs-superhero': 'Piccolo (Super Hero)',
    'piccolo-dragon-ball-daima-343': 'Piccolo (Daima)',
    'piccolo-new-hope': 'Piccolo (New Hope)',
    'piccolo-saga-super-dragon-ball-super-228': 'Piccolo (Saga Super)',
    'tenshinhan-saga-cell': 'Tenshinhan (Saga Cell)',
    'tenshinhan-saga-saiyan': 'Tenshinhan (Saga Saiyan)',
    'tenshinhan-db-clasico': 'Tenshinhan (Clásico)',
    'tenshinhan-new-hope': 'Tenshinhan (New Hope)',
    'tenshinhan-u9-dbm': 'Tenshinhan (U9)',
    'vegeta-saga-buu-saga-buu-213': 'Vegeta (Saga Buu)',
    'vegeta-saga-namek-saga-namek-783': 'Vegeta (Saga Namek)',
    'vegeta-saga-cell-saga-androides-856': 'Vegeta (Saga Cell)',
    'vegeta-saga-super-dragon-ball-super-454': 'Vegeta (Saga Super)',
    'vegeta-saga-gt-dragon-ball-gt-851': 'Vegeta (Saga GT)',
    'vegeta-u13-dbm': 'Vegeta (U13)',
    'vegeta-u18-dbm': 'Vegeta (U18)',
    'son-goku-saga-buu-saga-buu-646': 'Son Goku (Saga Buu)',
    'son-goku-saga-cell-saga-androides-459': 'Son Goku (Saga Cell)',
    'son-goku-saga-namek-saga-namek-176': 'Son Goku (Saga Namek)',
    'son-goku-llegada-dbz-saga-saiyan-169': 'Son Goku (Llegada DBZ / Saga Saiyan)',
    'son-goku-saga-gt-dragon-ball-gt-281': 'Son Goku (Saga GT)',
    'son-goku-saga-super-dragon-ball-super-732': 'Son Goku (Saga Super)',
    'son-goku-u18-dbm': 'Son Goku (U18)',
    'son-goku-mini-daima-full': 'Son Goku Mini (Daima Full)',
    'son-goku-adulto-daima': 'Son Goku Adulto (Daima)',
    'vegeta-adulto-daima': 'Vegeta Adulto (Daima)',
    'vegeta-mini-daima': 'Vegeta Mini (Daima)',
    'freezer-saga-namek-saga-namek-167': 'Freezer (Saga Namek)',
    'freezer-torneo-del-poder-dbs': 'Freezer (Torneo del Poder)',
    'freezer-dbs-broly-movie': 'Freezer (Broly Movie)',
    'gohan-dbs-fnf-pre-torneo': 'Gohan (FNF Pre-Torneo)',
    'son-gohan-dbs-superhero': 'Son Gohan (Super Hero)',
    'son-gohan-saga-super-dragon-ball-super-39': 'Son Gohan (Saga Super)',
    'granolah-peak-dbs-manga-gr001': 'Granolah (Peak)',
    'cell-max-dragon-ball-super-993': 'Cell Max',
    'vinel-vegeta-u16-dbm': 'Vinel Vegeta (U16)',
    'broli-broli-dbgt': 'Broli (GT)',
    'moro-dragon-ball-super-496': 'Moro',
    'son-bra-dbm-u16': 'Son Bra (U16)',
    'super-buu-saga-buu-69': 'Super Buu',
    'androide-17-saga-androides-489': 'Androide 17 (Saga Androides)',
    'androide-17-u14-individual': 'Androide 17 (U14)',
    'androide-18-saga-androides-476': 'Androide 18 (Saga Androides)',
    'androide-18-u14-individual': 'Androide 18 (U14)',
    'bardock-dragon-ball-super-194': 'Bardock (DBS)',
    'bardock-u10-dbm': 'Bardock (U10)',
    'beelzebub-dbm-u2': 'Beelzebub (Dragon Ball Multiverse)',
    'beelzebub-shuumatsu': 'Beelzebub (Shuumatsu no Valkyrie)',
    'bojack-pel-culas-dbz-toei-695': 'Bojack (Película DBZ)',
    'bojack-dbm': 'Bojack (Dragon Ball Multiverse)',
    'broly-dbs-dragon-ball-super-172': 'Broly (DBS)',
    'broly-dbz-pel-culas-dbz-toei-822': 'Broly (Película DBZ)',
    'cell-saga-androides-98': 'Cell (Saga Androides)',
    'cell-dbm-u17': 'Cell (Dragon Ball Multiverse U17)',
    'cell-jr-saga-androides-134': 'Cell Jr (Saga Androides)',
    'cell-jr-u17-dbm': 'Cell Jr (U17)',
    'gogeta-dragon-ball-gt-258': 'Gogeta (GT)',
    'gogeta-pel-culas-dbz-toei-800': 'Gogeta (Película DBZ)',
    'nail-saga-namek-672': 'Nail (Saga Namek)',
    'nail-u10-dbm': 'Nail (U10)',
    'nappa-saga-saiyan-462': 'Nappa (Saga Saiyan)',
    'nappa-u13-dbm': 'Nappa (U13)',
    'pan-saga-buu-780': 'Pan (Saga Buu)',
    'pan-ssj-dbm-u16': 'Pan (SSJ U16)',
    'trunks-futuro-v3-saga-buu-ssj2': 'Trunks del Futuro (SSJ2 / Saga Buu)',
    'trunks-futuro-dbs-anime-rage': 'Trunks del Futuro (Rage / Anime DBS)',
    'uub-saga-buu-276': 'Uub (Saga Buu)',
    'uub-dbm': 'Uub (Dragon Ball Multiverse)',
    'videl-saga-buu-6': 'Videl (Saga Buu)',
    'videl-u9-dbm': 'Videl (U9)',
    'yamcha-db-clasico': 'Yamcha (Bandido / Clásico)',
    'yamcha-dragon-ball-cl-sico-865': 'Yamcha (Saga Androides)',
    'yamcha-saga-saiyan': 'Yamcha (Saga Saiyan)',
    'yamcha-u9-dbm': 'Yamcha (U9)',
}

print()
print('##### PROPUESTA FINAL (aplicando overrides) #####')
final = {}
for cid, (old, new) in sorted(results.items()):
    new = OVERRIDES.get(cid, new)
    final[cid] = (old, new)

by_new2 = defaultdict(list)
for cid, (old, new) in final.items():
    by_new2[new].append(cid)
dup2 = {n: v for n, v in by_new2.items() if len(v) > 1}
print('DUPLICADOS TRAS OVERRIDES: %d' % len(dup2))
for n, v in sorted(dup2.items()):
    print('  "%s" -> %s' % (n, v))

with open('limpieza_names_v26_propuesta.txt', 'w', encoding='utf-8') as f:
    prev_ok = 0
    for cid, (old, new) in sorted(final.items()):
        f.write('%-46s\n    OLD: %s\n    NEW: %s\n' % (cid[:46], old, new))
        # registro de casos que quedan con residuo universo o sigla
        low = new.lower()
        residuo_uni = [t for t in UNI_TAIL if len(t) > 3 and low.endswith(t.lower())]
        residuo_tech = [t for t in TECH_TAIL if len(t) > 2 and re.search(r'\b' + re.escape(t) + r'$', new, re.I)]
        if residuo_uni or residuo_tech:
            print('  ⚠ RESIDUO %-40s "%s" -> %s (%s)' % (cid[:40], old[-30:], new, (residuo_uni or residuo_tech)[:1]))
print('Propuesta guardada en limpieza_names_v26_propuesta.txt')

# ============ APLICACIÓN CON BACKUP ============
if 'APLICAR' in sys.argv:
    ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup = 'src/data/BACKUP_ROSTER_V26_ANTES_NAMES_%s.json' % ts
    shutil.copy2(SRC, backup)
    print('Backup creado: %s' % backup)

    applied = 0
    for cid, (old, new) in sorted(final.items()):
        c = chars.get(cid)
        if c and c.get('status') not in ('archived', 'deprecated'):
            c['name'] = new
            applied += 1
    json.dump(data, open(SRC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('APLICADOS %d nombres. Roster guardado.' % applied)