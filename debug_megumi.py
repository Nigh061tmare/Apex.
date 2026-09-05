import re

with open('ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check meta line format for megumi-fushiguro
for i, line in enumerate(lines):
    if 'megumi-fushiguro' in line:
        print("L{}: {}".format(i, line.rstrip()))
        for j in range(i, min(i+20, len(lines))):
            print("L{}: {}".format(j, lines[j].rstrip()))
        break