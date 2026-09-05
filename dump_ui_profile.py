# -*- coding: utf-8 -*-
import re, sys
sys.stdout.reconfigure(encoding='utf-8')
src = open('src/data/characters.js', encoding='utf-8').read()
for cid in ['martian-manhunter', 'hulk', 'scarlet-witch']:
    pos = src.find('"id": "' + cid + '"')
    if pos == -1:
        print('%-20s NO ENCONTRADO' % cid); continue
    print('=' * 110)
    print(cid)
    print(src[pos:pos+2600])