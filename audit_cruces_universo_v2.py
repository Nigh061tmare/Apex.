# -*- coding: utf-8 -*-
"""Auditoría refinada de cruces de universo - solo pistas fuertes y explícitas."""
import json, sys, re
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']

# Pistas FUERTES: sufijos explícitos de franquicia en el id (no substrings ambiguos)
STRONG = [
    (r'jjk|jujutsu|sukuna|gojo|itadori|fushiguro|mahoraga|zenin|kugisaki|okkotsu|hakari|jogo|toji', 'JUJUTSU KAISEN'),
    (r'csm|chainsaw|denji|makima|pochita|power\b|yoshida-hirofumi', 'CHAINSAW MAN'),
    (r'hxh|zoldyck|killua|meruem|netero|hisoka|chrollo|kurapika|gon-freecss', 'HUNTER X HUNTER'),
    (r'jojo|kakyoin|jotaro|giorno|dio|zeppeli|yoshikage', "JOJO'S BIZARRE ADVENTURE"),
    (r'opm|saitama|genos|garou|tatsumaki|fubuki|zombieman|flashy-flash', 'ONE PUNCH MAN'),
    (r'mha|bakugo|deku|shigaraki|all-might|todoroki|uraraka', 'MY HERO ACADEMIA'),
    (r'baki|hanma|yujiro|pickle|orochi|kaioh|sikorsky|oliva|guevaru', 'BAKI THE GRAPPLER'),
    (r'shuumatsu|valkyrie|ragnarok|zeus-|kojiro|lu-?bu|buddha', 'SHUUMATSU NO VALKYRIE (RECORD OF RAGNAROK)'),
    (r'marvel|wolverine|iron-man|spider|hulk|thor-marvel|adam-warlock|jean-grey|dr-doom|galactus|thanos', 'MARVEL COMICS'),
    (r'dc-|superman|batman|wonder-woman|flash-|darkseid|lex-luthor|joker|dr-manhattan|spectre|anti-monitor', 'DC COMICS'),
    (r'invincible|omni-man|battle-beast|mark-grayson|universa', 'INVINCIBLE'),
    (r'the-boys|homelander|butcher|neuman|soldier-boy', 'THE BOYS'),
    (r'kny|kimetsu|tanjiro|muzan|yoriichi|akaza|rengoku|giyu|nezuko', 'DEMON SLAYER (KIMETSU NO YAIBA)'),
]

refined = []
for cid, c in chars.items():
    if c.get('status') in ('archived', 'deprecated'):
        continue
    uni = (c.get('universe') or '').upper()
    cid_l = cid.lower()
    for pat, expected in STRONG:
        if re.search(pat, cid_l):
            key = expected.split(' ')[0][:20]
            if key.upper() not in uni:
                refined.append((cid, c.get('universe'), expected))
            break

print('=== CRUCES REFINADOS (pistas fuertes) ===')
for cid, uni, exp in refined:
    print('ALERTA %-42s uni=%-44s -> %s' % (cid[:42], uni[:44], exp))
print('Total:', len(refined))