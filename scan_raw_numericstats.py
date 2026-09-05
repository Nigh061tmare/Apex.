# -*- coding: utf-8 -*-
import re, sys
sys.stdout.reconfigure(encoding='utf-8')
src = open('src/data/characters.js', encoding='utf-8').read()
ids = ['martian-manhunter','wonder-woman','zen-buu-dbm-u4','bardock-superviviente-brokoly',
       'xxi-hechicero-dbm-u5','dr-raichi-dbm-u3','pan-ssj-dbm-u16','ribrianne-dragon-ball-super-396',
       'androide-13-base-pel-culas-dbz-toei-646','arqua-torneo-del-otro-mundo-715',
       'maraikoh-torneo-del-otro-mundo-620','mijorin-torneo-del-otro-mundo-618',
       'olibu-torneo-del-otro-mundo-109','scarlet-witch','doctor-strange','hulk','thanos']
for cid in ids:
    pos = src.find('"id": "' + cid + '"')
    if pos == -1:
        print('%-45s NO ENCONTRADO' % cid); continue
    # buscar numericStats del bloque del personaje (antes del proximo "id":)
    seg = src[pos:pos+6000]
    m = re.search(r'"numericStats"\s*:\s*\{([^}]*)\}', seg)
    if m:
        print('%-45s numericStats: {%s}' % (cid, m.group(1).replace(chr(10),' ')[:220]))
    else:
        print('%-45s SIN numericStats en RAW (usa fallback)' % cid)