# -*- coding: utf-8 -*-
"""Desambiguación final de 8 fichas con nombre colisionante (distintas versiones/franquicias)."""
import json, sys, shutil, datetime
sys.stdout.reconfigure(encoding='utf-8')
SRC = 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json'
data = json.load(open(SRC, encoding='utf-8'))
chars = data['characters']

FIX = {
    'darkseid': 'Darkseid (Cósmico / Avatar)',
    'darkseid-dc-rebirth': 'Darkseid (Rebirth)',
    'fami': 'Fami (Demonio del Hambre)',
    'fami-csm-p2': 'Fami (Parte 2)',
    'loki': 'Loki (Marvel)',
    'loki-ror-ragnarok': 'Loki (Record of Ragnarok)',
    'martian-manhunter': 'Martian Manhunter (Cósmico)',
    'martian-manhunter-dc-rebirth': 'Martian Manhunter (Rebirth)',
}
ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
shutil.copy2(SRC, 'src/data/BACKUP_ROSTER_V26_ANTES_DESAMBIG_%s.json' % ts)
for cid, new in FIX.items():
    if cid in chars:
        old = chars[cid].get('name')
        chars[cid]['name'] = new
        print('%-32s %s -> %s' % (cid, old, new))
json.dump(data, open(SRC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('Guardado.')