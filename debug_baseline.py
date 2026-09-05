import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check exact format of Base Tier line
for i, line in enumerate(lines):
    if 'son-goku-23-tenkaichi' in line:
        print(f"L{i}: {line.rstrip()}")
        for j in range(i, min(i+10, len(lines))):
            print(f"L{j}: {lines[j].rstrip()}")
        break