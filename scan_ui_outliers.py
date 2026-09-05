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
        print('%-45s NO ENCONTRADO en characters.js' % cid)
        continue
    seg = src[pos:pos+2000]
    m = re.search(r'"numericStats"\s*:\s*\{[^}]*"apexKi"\s*:\s*([0-9.e+]+)', seg)
    tier_m = re.search(r'"tier"\s*:\s*"([^"]+)"', seg)
    print('%-45s apexKi=%s tier=%s' % (cid, m.group(1) if m else 'N/A', tier_m.group(1) if tier_m else 'N/A'))