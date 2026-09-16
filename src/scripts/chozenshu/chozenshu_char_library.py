import json, re, io, unicodedata
# APEX Chozenshu :: Biblioteca de personajes (Tomo 03, pp. 212-296).
# El OCR entrelaza varios personajes por pagina, asi que se conserva el bloque
# de texto por pagina (biblioteca navegable) mas los nombres detectados.

D = r'C:\Users\JOSELU~1\AppData\Local\Temp\opencode\db_ocr\t03.json'
OUT = r'Z:\apex-powerscaling-engine\src\data\referencias\dragonball_character_library.json'

STOP = set('''DE LA EL LOS LAS DEL UN UNA UNOS UNAS Y O QUE EN CON POR PARA SU SUS
AL SE LO ES SON ERA FUE SER ESTA ESTE ESTO ESTOS ESTAS MAS COMO CUANDO DONDE
TRAS SOBRE ENTRE SIN NI PERO SI NO YA LE LES TE MI TU SE'''.split())


def norm(s):
    s = unicodedata.normalize('NFD', s or '')
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', ' ', s).strip()


def main():
    d = json.load(open(D, encoding='utf-8'))
    pages = []
    for k in sorted((int(x) for x in d.keys())):
        v = d.get(str(k))
        if not v:
            continue
        txt = norm(' '.join((l.get('text') or '') for l in v.get('lines', [])))
        if 'bibliotecadepersonajes' not in txt.replace(' ', '').lower():
            continue
        body = re.sub(r'(?i)biblioteca de personajes', ' ', txt).strip()
        body = re.sub(r'\s+', ' ', body)
        # Nombres candidatos: rachas en MAYUSCULAS de 3+ letras no genericas.
        names = []
        for m in re.finditer(r'\b([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9\-\']{2,}(?:\s+[A-ZÁÉÍÓÚÑ0-9]{3,})?)\b', body):
            n = m.group(1).strip()
            if not n or n in STOP:
                continue
            if n.lower() in {x.lower() for x in names}:
                continue
            names.append(n)
        pages.append({'p': k, 'names': names[:12], 'text': body[:1400]})
    data = {
        '_meta': {
            'name': 'Dragon Ball - Biblioteca de personajes (Chozenshu 3)',
            'source': 'Dragon Ball Compendio Tomo 03, seccion BIBLIOTECA DE PERSONAJES',
            'pages': 't03 pp.212-296',
            'coverage': len(pages),
            'limitations': [
                'El OCR entrelaza varios personajes por pagina: el texto por pagina es un bloque continuo sin segmentar.',
                'La lista "names" es una deteccion automatica de rachas en mayusculas; puede incluir ruido o faltar nombres.',
                'Texto OCR sin correccion ortografica.'
            ]
        },
        'pages': pages
    }
    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(json.dumps(data, ensure_ascii=False, indent=1))
    print('[out]', OUT)
    print('[stats] paginas =', len(pages), '| con nombres =', sum(1 for x in pages if x['names']))
    for x in pages[:6]:
        print('  p.%-4d %s' % (x['p'], ', '.join(x['names'][:6])))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
