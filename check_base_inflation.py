import re

with open('ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

re_header = re.compile(r'^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)')
re_meta = re.compile(r'^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Num[^`]*`([^`]+)`')

TIER_LIMITS = {
    "10-C": (0, 3, 5), "10-B": (5, 8, 12), "10-A": (12, 20, 30),
    "9-C": (30, 40, 60), "9-B": (60, 100, 150), "9-A": (150, 200, 300),
    "8-C": (300, 400, 600), "High 8-C": (600, 800, 1200), "8-B": (1000, 1500, 2500),
    "8-A": (2000, 3000, 4500), "Low 7-C": (3500, 4500, 5500), "7-C": (4500, 6000, 8000),
    "High 7-C": (7000, 9000, 12000), "Low 7-B": (10000, 15000, 20000), "7-B": (15000, 20000, 35000),
    "7-A": (30000, 50000, 80000), "High 7-A": (70000, 100000, 150000),
    "6-C": (150000, 250000, 400000), "High 6-C": (300000, 500000, 800000),
    "Low 6-B": (500000, 800000, 1500000), "6-B": (1000000, 2000000, 3500000),
    "High 6-B": (2500000, 5000000, 8000000), "6-A": (5000000, 10000000, 15000000),
    "High 6-A": (15000000, 35000000, 70000000), "5-C": (50000000, 100000000, 250000000),
    "Low 5-B": (200000000, 500000000, 800000000), "5-B": (500000000, 1500000000, 3000000000),
    "5-A": (2000000000, 5000000000, 10000000000), "High 5-A": (8000000000, 25000000000, 50000000000),
    "Low 4-C": (30000000000, 80000000000, 150000000000), "4-C": (100000000000, 500000000000, 2000000000000),
    "High 4-C": (1000000000000, 5000000000000, 15000000000000), "4-B": (10000000000000, 50000000000000, 200000000000000),
    "4-A": (100000000000000, 500000000000000, 5000000000000000), "3-C": (1000000000000000, 5000000000000000, 20000000000000000),
    "3-B": (10000000000000000, 50000000000000000, 200000000000000000), "3-A": (100000000000000000, 500000000000000000, 2000000000000000000),
    "High 3-A": (1e18, 5e18, 2e19), "Low 2-C": (1e19, 5e19, 2e20), "2-C": (1e20, 5e20, 2e21),
    "2-B": (1e21, 5e21, 2e22), "2-A": (1e22, 5e22, 2e23), "Low 1-C": (1e23, 5e23, 1e24), "1-C": (1e24, 1e25, 1e26)
}

def parse_ki(s):
    clean = s.replace("`", "").replace(",", "").replace(".", "").strip()
    try:
        return float(clean)
    except:
        return None

current_char = None
base_inflation = []

for line in lines:
    m = re_header.match(line)
    if m:
        current_char = m.group(1)
        continue
    m = re_meta.match(line)
    if m and current_char:
        tier = m.group(1).strip()
        ki = parse_ki(m.group(2))
        if tier in TIER_LIMITS and ki is not None:
            t_min, t_med, t_max = TIER_LIMITS[tier]
            if tier not in ["1-C", "Low 1-C", "2-C", "Low 2-C", "2-B", "2-A", "High 3-A"]:
                if ki > t_max:
                    base_inflation.append({
                        'char': current_char,
                        'tier': tier,
                        'ki': ki,
                        'ceiling': t_max,
                        'ratio': ki / t_max
                    })

base_inflation.sort(key=lambda x: x['ratio'], reverse=True)

print("BASE KI INFLATION (base Ki > tier ceiling):")
print("=" * 90)
for b in base_inflation[:20]:
    print("{:40s} | {:10s} | Ki: {:>15.0f} | ceil: {:>15.0f} | ratio: {:.2f}x".format(
        b['char'][:40], b['tier'], b['ki'], b['ceiling'], b['ratio']))
print("=" * 90)
print("Total inflated bases: {}".format(len(base_inflation)))