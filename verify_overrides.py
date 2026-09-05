import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_row = re.compile(r'^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|')

targets = {
    "son-gohan-dbs-superhero": ["Gohan Beast", "Estado Definitivo (Ultimate)"],
    "son-gohan-saga-super-dragon-ball-super-39": ["Modo Bestia (Gohan Beast)", "Estado Definitivo (Ultimate Gohan)"],
    "piccolo-dbs-superhero": ["Orange Piccolo", "Giant Orange Piccolo"],
    "vegetto-base-saga-buu-120": ["Super Vegetto"],
    "vegeta-majin-ssj2-895": ["Majin Vegeta (Super Saiyajin 2", "Final Explosion"],
    "son-goku-u18-dbm": ["Super Saiyan 3 (Control Energ", "Normal Super Saiyan (Goku U18)"],
    "vegeta-u18-dbm": ["Super Saiyan 3 (Vegeta U18)", "Normal Super Saiyan (Vegeta U18)"],
    "gohan-u16-dbm-espectador": ["Modo Furia del Padre", "Son Gohan (Universo 16 - Estado Místico)"],
    "son-bra-dbm-u16": ["Super Saiyan 2 (Furia Descontrolada)", "Son Bra (Majin Bra)"],
}

current_char = None
in_table = False

for i, line in enumerate(lines):
    m = re_header.match(line)
    if m:
        current_char = m.group(1)
        in_table = False
        continue
    if "| # Forma |" in line:
        in_table = True
        continue
    if in_table and line.strip().startswith("|") and not line.strip().startswith("| :-"):
        m = re_row.match(line)
        if m and current_char in targets:
            idx, name, ki_str, fmt_ki, mult_str, tier, _ = m.groups()
            name_clean = name.strip()
            for target_form in targets[current_char]:
                if target_form in name_clean:
                    print("{} | {} | Ki={} | fmt={} | mult={} | tier={}".format(
                        current_char, name_clean[:50], ki_str.strip(), fmt_ki.strip(), mult_str.strip(), tier.strip()))
                    break
    if in_table and not line.strip().startswith("|"):
        in_table = False