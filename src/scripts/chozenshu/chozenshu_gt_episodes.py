import json, re, sys, io
# APEX Chozenshu :: extractor de la guia de episodios de Dragon Ball GT
# (Tomo 03, seccion SINOPSIS DE LOS EPISODIOS). Lee el texto ya separado en
# columnas por chozenshu_columns.py.

SRC = r'C:\Users\JOSELU~1\AppData\Local\Temp\opencode\db_ocr\gt_eps.txt'
OUT = r'Z:\apex-powerscaling-engine\src\data\referencias\dragonball_gt_episodes.json'

STAFF = re.compile(r'^\((DE|DA|G|A|AG|GG|E)\)')
DATE = re.compile(r'\(E\)\s*([0-9]{1,2}\s*de\s*[a-z0-9]+\s*de\s*[0-9]{4})')
PAGE = re.compile(r'\[PAGE (\d+)\]')
COL = re.compile(r'^--- COLUMNA (\d+) ---$', re.M)


def blocks(text):
    """Separa el texto en (pagina, columna, contenido) por marca de columna.
    El marcador [PAGE n] aparece ANTES del primer bloque COLUMNA de cada pagina,
    asi que la pagina se arrastra hacia las columnas siguientes."""
    out = []
    parts = COL.split(text)
    # parts = [pre, col_num, cuerpo, col_num, cuerpo, ...]
    current = None
    m = PAGE.search(parts[0])
    if m:
        current = m.group(1)
    for i in range(1, len(parts) - 1, 2):
        num, body = parts[i], parts[i + 1]
        m2 = PAGE.search(body)
        if m2:
            current = m2.group(1)
        out.append((current, num, body))
    return out


def clean(s):
    s = re.sub(r'\s+', ' ', s or '').strip()
    return re.sub(r'^(EPISODIO|EPISODE)\s*', '', s, flags=re.I).strip()


def clean_date(s):
    return re.sub(r'\s+', ' ', s or '').strip() if s else None


def parse_blocks(text):
    """Cada bloque tras 'EPISODIO' contiene: titulo JP, (titulo ES), sinopsis y
    a continuacion el staff y la fecha del episodio SIGUIENTE."""
    eps = []
    for page, col, body in blocks(text):
        joined = '\n'.join(l.strip() for l in body.split('\n'))
        chunks = re.split(r'(?im)^\s*EPISODIO\s*', joined)
        for ch in chunks[1:]:
            lines = [l.strip() for l in ch.split('\n') if l.strip()]
            if not lines:
                continue
            jp = clean(lines[0])
            m = re.search(r'\(([^()]{4,90})\)', ch)
            es = clean(m.group(1)) if m else ''
            # Sinopsis: lineas tras el titulo ES hasta el proximo staff (DE)/(DA)/(G)...
            start = 1
            for i, l in enumerate(lines[1:], start=1):
                if es and l.strip().startswith('(') and es[:8] in l:
                    start = i + 1
                    break
            syn = []
            for l in lines[start:]:
                if STAFF.match(l):
                    break
                if re.match(r'^\([A-Z]{1,2}\)', l):
                    break
                syn.append(l)
            d = DATE.findall(ch)
            eps.append({
                'jp': jp,
                'es': es,
                'synopsis': clean(' '.join(syn))[:700],
                'dateEnBloque': clean_date(d[-1]) if d else None,
                'tomo': 't03',
                'page': int(page) if page else None,
                'col': col
            })
    return eps


def main():
    txt = io.open(SRC, encoding='utf-8').read()
    eps = parse_blocks(txt)
    seen, uniq = set(), []
    for e in eps:
        k = e['jp'].lower()[:40]
        if not k or k in seen or len(k) < 6:
            continue
        seen.add(k)
        e['order'] = len(uniq) + 1
        uniq.append(e)
    data = {
        '_meta': {
            'name': 'Dragon Ball GT - Sinopsis de episodios (Chozenshu 3)',
            'source': 'Dragon Ball Compendio Tomo 03, seccion Sinopsis de los episodios de Dragon Ball GT',
            'pages': 't03 pp.350-357',
            'coverage': len(uniq),
            'totalSeries': 64,
            'limitations': [
                'Los numeros de episodio del libro van en un rotulo grafico que el OCR no captura: el campo "order" es el orden de aparicion en el tomo, no el numero oficial.',
                'Los episodios 1 y 2 de GT quedan en el encabezado grafico de la seccion y no se extraen con fiabilidad.',
                'El campo "dateEnBloque" recoge la fecha literal del bloque; por la maquetacion del tomo esa fecha corresponde al episodio SIGUIENTE. No se ha reasignado para no inventar datos.',
                'La sinopsis es texto OCR sin correccion ortografica.'
            ]
        },
        'episodes': uniq
    }
    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(json.dumps(data, ensure_ascii=False, indent=1))
    print('[out]', OUT)
    withsyn = sum(1 for x in uniq if len(x['synopsis']) > 40)
    withdate = sum(1 for x in uniq if x.get('dateEnBloque'))
    print('[stats] episodios =', len(uniq), '| con sinopsis =', withsyn, '| con fecha =', withdate)
    for x in uniq[:3]:
        print('  ', x['order'], '|', x['jp'][:48], '|', (x['es'] or '')[:34], '|', x.get('dateEnBloque'))
    return 0


if __name__ == '__main__':
    sys.exit(main())



