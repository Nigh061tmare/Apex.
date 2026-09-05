# -*- coding: utf-8 -*-
"""
FIX: formas JJK sin `id` (viola Regla de Oro 2). Se generan ids canónicos
a partir del nombre de la forma (kebab-case, sin duplicar entre sí).
"""
import json, sys, re, shutil, datetime, unicodedata
sys.stdout.reconfigure(encoding='utf-8')

SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']

def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^a-zA-Z0-9 ]', '', s).strip().lower()
    s = re.sub(r'\s+', '-', s)
    return s

ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
bak = 'src/data/BACKUP_ROSTER_V26_ANTES_FORM_IDS_%s.json' % ts
shutil.copy2(SRC, bak)
print('Backup:', bak)

TARGETS = ['jogo-jjk-shibuya', 'kenjaku-jjk', 'mahoraga-jjk-shibuya']
n = 0
for cid in TARGETS:
    c = chars.get(cid)
    if not c: continue
    used = set()
    for i, f in enumerate(c['forms']):
        if f.get('id'):
            used.add(f['id'])
            continue
        base = slugify(f['name'])
        fid = '%s-%s' % (cid, base) if base else '%s-form-%d' % (cid, i)
        # garantizar unicidad
        if fid in used:
            fid = '%s-%d' % (fid, i)
        used.add(fid)
        f['id'] = fid
        n += 1
        print('  %-24s form[%d] id=%s' % (cid, i, fid))

with open(SRC, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print('JSON guardado OK (%d ids generados)' % n)