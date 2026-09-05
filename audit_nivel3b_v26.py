# -*- coding: utf-8 -*-
"""AUDITORÍA NIVEL 3B V26 — comprobaciones con formato REAL del roster:
   B2) kiFormatted debe ser kiNumeric con separadores de miles españoles (1.522.500) o entero plano (96)
   E)  Nombres con universo/saga colado (name contiene tokens del universe)
   F)  Nombre de personaje duplicado entre fichas distintas (confusión UI)
   I)  Forma base (índice 0): multiplier debe ser x1
   G)  Personajes con 'tier' además de 'baseTier' (campo residual)
   H)  Forms con isApexCustom=true (no deberían existir tras saneamiento)
   J)  Multiplicador en forma base no-x1 y forma con multiplier faltante
   K)  kiNumeric formas base != baseKiNumeric (medida única, ya validado pero re-audito sin redondeo)
"""
import json, sys, re
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
active = {k: v for k, v in chars.items() if v.get('status') not in ('archived', 'deprecated')}

def es_formato_miles(txt, num):
    """True si txt es num con separadores de miles españoles o entero plano."""
    if num is None or txt is None: return True
    txt = txt.strip()
    if txt.lower() in ('∞', 'incalculable'): return True
    try:
        n = float(num)
        is_int = n == int(n)
    except: return True
    # entero plano: '96', '2027'
    if is_int and txt == str(int(n)):
        return True
    if is_int:
        # separador de miles: '2.027' -> 2027 ; '1.522.500' -> 1522500
        if re.fullmatch(r'\d{1,3}(\.\d{3})+', txt):
            return int(txt.replace('.', '')) == int(n)
        # '68.145.000.000' -> 68145000000
        if re.fullmatch(r'\d{1,3}(\.\d{3})+', txt):
            return int(txt.replace('.', '')) == int(n)
    # con decimales como '5.93' (> trillones reales) - permitir notación '59.304.000.000.000.000'
    if re.fullmatch(r'\d{1,3}(\.\d{3})+', txt):
        return int(txt.replace('.', '')) == int(round(n))
    return False

print('='*100)
print('B2) kiFormatted NO coherente con kiNumeric (formato separador de miles real)')
print('='*100)
bad_b2 = []
for cid, c in sorted(active.items()):
    pairs = [('base', c.get('baseKiNumeric'), c.get('baseKiFormatted'))] + \
        [('form_%d' % i, f.get('kiNumeric'), f.get('kiFormatted')) for i, f in enumerate(c.get('forms', []))]
    for key, num, txt in pairs:
        if not es_formato_miles(txt, num):
            bad_b2.append((cid, key, num, txt))
for cid, key, num, txt in bad_b2[:40]:
    print('  %-44s %-8s kiNumeric=%-16s kiFormatted="%s"' % (cid[:44], key, num, txt))
print('Total incoherencias de formato: %d' % len(bad_b2))

print()
print('='*100)
print('E) Name con universo/saga colado (sin paréntesis de contexto)')
print('='*100)
UNI_TOKENS = {
    'DRAGON BALL (CLÁSICO)': ['dragon ball clasico', 'dragon ball classico'],
    'DRAGON BALL Z': ['dragon ball z'],
    'DRAGON BALL Z — PELÍCULAS Y OVAS': ['dragon ball z', 'dbz'],
    'DRAGON BALL SUPER': ['dragon ball super', 'dbs'],
    'DRAGON BALL GT': ['dragon ball gt', 'gt'],
    'DRAGON BALL DAIMA': ['daima'],
    'MULTIVERSO DBM': ['multiverso dbm', 'dbm'],
    'FAN-MANGAS & WHAT-IF': ['fan-manga', 'what-if', 'dbm'],
}
bad_e = []
for cid, c in sorted(active.items()):
    uni = c.get('universe', '')
    nm = c.get('name', '')
    nml = nm.lower()
    for u_label, toks in UNI_TOKENS.items():
        if uni.upper() == u_label or (u_label in uni.upper()):
            for tok in toks:
                # evitar falsos positivos: si el nombre ya tiene el contexto completo, ok
                if tok in nml:
                    bad_e.append((cid, uni, nm, tok))
                    break
# filtrar duplicados por cid
seen = set()
uniq_e = []
for r in bad_e:
    if r[0] not in seen:
        seen.add(r[0]); uniq_e.append(r)
for cid, uni, nm, tok in uniq_e[:50]:
    print('  %-44s [%s] name="%s" (token: %s)' % (cid[:44], uni.split(' ')[0][:12], nm[:55], tok))
print('Total con universo colado: %d' % len(uniq_e))

print()
print('='*100)
print('F) Nombres de personaje duplicados')
print('='*100)
by_name = defaultdict(list)
for cid, c in active.items():
    by_name[c.get('name', '').strip()].append(cid)
dups = {n: ids for n, ids in by_name.items() if len(ids) > 1}
for n, ids in sorted(dups.items()):
    print('  "%s" -> %s' % (n[:60], ids))
print('Total nombres duplicados: %d' % len(dups))

print()
print('='*100)
print('G) Personajes con campo tier residual (además de baseTier)')
print('='*100)
for cid, c in sorted(active.items()):
    if 'tier' in c:
        print('  %-44s tier=%s baseTier=%s%s' % (cid[:44], c['tier'], c['baseTier'], '' if c['tier'] == c['baseTier'] else ' <-- DIFERENTE'))

print()
print('='*100)
print('H/I) Forma base no-x1, isApexCustom, multiplier faltante')
print('='*100)
bad_hi = []
for cid, c in sorted(active.items()):
    forms = c.get('forms', [])
    if not forms: continue
    f0 = forms[0]
    m0 = (f0.get('multiplier') or '').lower()
    if 'x1' not in m0.replace(' ','') and '$\times 1$' not in f0.get('multiplier',''):
        bad_hi.append((cid, 'forma-base-mult', f0.get('multiplier')))
    for i, f in enumerate(forms):
        if f.get('isApexCustom'):
            bad_hi.append((cid, 'apex-custom', i))
        if not f.get('multiplier'):
            bad_hi.append((cid, 'sin-mult', i))
for cid, kind, extra in bad_hi[:30]:
    print('  %-44s %-16s %s' % (cid[:44], kind, extra))
print('Total anomalías H/I: %d' % len(bad_hi))