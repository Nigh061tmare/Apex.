# -*- coding: utf-8 -*-
"""Auditoría de cruces de universo (Pilar 1: Cero Cruces de Franquicia)."""
import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']

HINTS = {
  'sukuna': 'JUJUTSU', 'gojo': 'JUJUTSU', 'jjk': 'JUJUTSU', 'itadori': 'JUJUTSU', 'megumi': 'JUJUTSU',
  'hakari': 'JUJUTSU', 'toji': 'JUJUTSU', 'maki-zenin': 'JUJUTSU', 'mahoraga': 'JUJUTSU', 'jogo': 'JUJUTSU',
  'zeno-zoldyck': 'HUNTER', 'killua': 'HUNTER', 'hxh': 'HUNTER', 'netero': 'HUNTER',
  'meruem': 'HUNTER', 'hisoka': 'HUNTER', 'chrollo': 'HUNTER', 'kurapika': 'HUNTER',
  'yujiro': 'BAKI', 'baki': 'BAKI', 'hanma': 'BAKI', 'jack-hanma': 'BAKI', 'doppo': 'BAKI', 'yujiro-hanma': 'BAKI',
  'tanjiro': 'DEMON', 'kny': 'DEMON', 'muzan': 'DEMON', 'yoriichi': 'DEMON', 'akaza': 'DEMON', 'giyu': 'DEMON', 'rengoku': 'DEMON',
  'denji': 'CHAINSAW', 'csm': 'CHAINSAW', 'makima': 'CHAINSAW', 'power': 'CHAINSAW', 'aki': 'CHAINSAW',
  'saitama': 'ONE PUNCH', 'opm': 'ONE PUNCH', 'genos': 'ONE PUNCH', 'garou': 'ONE PUNCH', 'tatsumaki': 'ONE PUNCH', 'fubuki': 'ONE PUNCH',
  'superman': 'DC COMICS', 'batman': 'DC COMICS', 'wonder-woman': 'DC COMICS', 'flash': 'DC COMICS',
  'thor-marvel': 'MARVEL', 'marvel': 'MARVEL', 'iron-man': 'MARVEL', 'spider': 'MARVEL', 'hulk': 'MARVEL',
  'omni-man': 'INVINCIBLE', 'invincible': 'INVINCIBLE', 'mark-grayson': 'INVINCIBLE', 'battle-beast': 'INVINCIBLE',
  'homelander': 'THE BOYS', 'butcher': 'THE BOYS', 'the-boys': 'THE BOYS', 'soldier-boy': 'THE BOYS',
  'jojo': 'JOJO', 'dio': 'JOJO', 'jotaro': 'JOJO', 'giorno': 'JOJO', 'kakyoin': 'JOJO', 'zeppeli': 'JOJO',
  'zeus': 'SHUUMATSU', 'ragnarok': 'SHUUMATSU', 'kojiro': 'SHUUMATSU', 'lu bu': 'SHUUMATSU', 'thor': 'SHUUMATSU',
  'adam-warlock': 'MARVEL', 'dr-manhattan': 'DC COMICS', 'spectre': 'DC COMICS', 'anti-monitor': 'DC COMICS',
  'darkseid': 'DC COMICS', 'thanos': 'MARVEL', 'galactus': 'MARVEL', 'jean-grey': 'MARVEL',
}

suspects = []
for cid, c in chars.items():
    if c.get('status') in ('archived', 'deprecated'):
        continue
    uni = (c.get('universe') or '').upper()
    cid_l = cid.lower()
    for hint, expected in HINTS.items():
        if hint in cid_l and expected.upper() not in uni:
            suspects.append((cid, c.get('universe'), c.get('name'), hint, expected))
            break

seen = set()
for s in suspects:
    if s[0] in seen:
        continue
    seen.add(s[0])
    print('ALERTA %-46s uni=%-42s pista=%s esperado=%s' % (s[0][:46], str(s[1])[:42], s[3], s[4]))
print()
print('Total sospechosos de cruce:', len(seen))