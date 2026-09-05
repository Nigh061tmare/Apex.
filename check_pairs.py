# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.load(open('src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json', encoding='utf-8'))
chars = data['characters']
targets = ['darkseid', 'darkseid-dc-rebirth', 'fami', 'fami-csm-p2', 'loki-ror-ragnarok', 'loki', 'martian-manhunter-dc-rebirth', 'martian-manhunter']
for cid in targets:
    c = chars.get(cid)
    if not c: 
        print('%-28s NO EXISTE' % cid); continue
    forms = c.get('forms', [])
    f0 = forms[0] if forms else {}
    print('%-28s UNI=%-24s TIER=%-10s baseKi=%-18s form0=%-30s nForms=%d' % (
        cid, str(c.get('universe'))[:24], str(c.get('baseTier'))[:10], c.get('baseKiNumeric'), str(f0.get('name'))[:30], len(forms)))
    for f in forms[:3]:
        print('      form: %-34s tier=%-8s ki=%s x%s' % (str(f.get('name'))[:34], str(f.get('tier'))[:8], f.get('kiNumeric'), f.get('multiplier')))