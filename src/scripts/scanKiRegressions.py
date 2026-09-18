"""APEX :: Escaner de regresiones de Ki intra-roster.

Detecta fichas del MISMO personaje donde el Ki BAJA al avanzar la saga,
comparando todas las variantes contra la de mayor rango temporal.

Uso:  python src/scripts/scanKiRegressions.py

Caso real cazado con esta herramienta:
  piccolo-finales-z-principios-super declaraba 12.000.000 cuando tanto la
  ficha anterior (400M) como la referencia Niveles de poder.txt (1.100M)
  exigian un valor muy superior.

OJO: no toda caida es un bug. Un estado "suprimido" (forma mini de Daima) o
un personaje que aun no ha entrenado (Pan en GT) bajan legitimamente. Hay que
contrastar cada aviso contra Niveles de poder.txt antes de corregir.
"""
import json, io

P = r'Z:\apex-powerscaling-engine\src\data\ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
d = json.load(io.open(P, encoding='utf-8'))
cs = d['characters']

NAMES = [
    'son-gohan', 'son-goku', 'son-goten', 'son-gotenks', 'majin-buu', 'ten-shin-han',
    'trunks', 'vegeta', 'piccolo', 'krilin', 'freezer', 'cell', 'gohan', 'goten',
    'bardock', 'broly', 'yamcha', 'chaoz', 'videl', 'pan', 'uub', 'gogeta', 'vegetto',
    'androide', 'a-17', 'a-18', 'cooler', 'slug', 'turles', 'janemba', 'beerus', 'whis',
]
SAGAS = [
    ('daima', 32), ('superhero', 30), ('super-hero', 30), ('granola', 28), ('moro', 26),
    ('broly', 24), ('torneo-del-poder', 22), ('black', 21), ('univ-6', 20),
    ('resurreccion', 19), ('batalla-de-los-dioses', 18), ('finales', 16),
    ('buu', 14), ('cell', 12), ('androides', 12), ('namek', 10), ('saiyan', 8),
    ('23tb', 6), ('db-clasico', 5), ('clasico', 5), ('gt', 34),
]
def rank(cid):
    c = cid.lower()
    if 'dragon-ball-gt' in c or '-gt-' in c:
        return 34
    b = 0
    for k, v in SAGAS:
        if k in c and v > b:
            b = v
    return b

def base(cid):
    for n in NAMES:
        if cid.startswith(n):
            return n
    return None

grupos = {}
for cid, c in cs.items():
    b = base(cid)
    r = rank(cid)
    if not b or r == 0:
        continue
    grupos.setdefault(b, []).append((r, cid, c))

print('grupos:', {k: len(v) for k, v in sorted(grupos.items())})
print()
print('=== REGRESIONES: el Ki BAJA al avanzar la saga ===')
tot = 0
for fam, lst in sorted(grupos.items()):
    if len(lst) < 2:
        continue
    lst.sort()
    for i in range(len(lst) - 1):
        r1, cid1, c1 = lst[i]
        r2, cid2, c2 = lst[i + 1]
        k1 = c1.get('baseKiNumeric') or 0
        k2 = c2.get('baseKiNumeric') or 0
        if k1 > k2 > 0 and r2 > r1:
            tot += 1
            print(' %-11s r%02d->%02d  %-46s %13d -> %-34s %13d  x%.0f' % (
                fam[:11], r1, r2, cid1[:46], k1, cid2[:34], k2, k1 / k2))
print()
print('TOTAL:', tot)
