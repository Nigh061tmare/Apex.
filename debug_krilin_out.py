import re

# Quick check of raw lines for krilin-saga-cell in output
with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'krilin-saga-cell' in line:
        print("FOUND at line {}: {}".format(i, line.rstrip()))
        for j in range(i, min(i+15, len(lines))):
            print("  L{}: {}".format(j, lines[j].rstrip()))
        break