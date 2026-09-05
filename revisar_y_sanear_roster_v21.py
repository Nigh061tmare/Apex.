# revisar_y_sanear_roster_v21.py
# Fixes: scope loss in tables, tier override clamp, duplicate Gohan entries,
#        clamping threshold 10x (no 100x), dry-run mode, patch output.

import os, re, json, copy
from pathlib import Path
import sys

# --- 1. TIER LIMITS (VS Battles) + CLAMPING 10x (no 100x) ---
TIER_LIMITS = {
    "10-C": (1, 12, 8), "10-B": (5, 20, 14), "10-A": (15, 40, 25),
    "9-C": (10, 60, 35), "9-B": (40, 150, 95), "9-A": (80, 300, 180),
    "8-C": (200, 700, 400), "High 8-C": (400, 1200, 650), "8-B": (600, 2000, 1200),
    "8-A": (1500, 4000, 2600), "Low 7-C": (2000, 4500, 3000), "7-C": (2500, 6000, 3800),
    "High 7-C": (3500, 7500, 4800), "Low 7-B": (4000, 9000, 5500), "7-B": (4500, 12000, 6500),
    "7-A": (7000, 35000, 10000), "High 7-A": (20000, 70000, 45000),
    "6-C": (15000, 45000, 25000), "High 6-C": (25000, 60000, 35000),
    "Low 6-B": (35000, 75000, 45000), "6-B": (45000, 90000, 60000),
    "High 6-B": (60000, 120000, 75000), "6-A": (80000, 200000, 110000),
    "High 6-A": (120000, 500000, 250000), "5-C": (500000, 2000000, 1300000),
    "Low 5-B": (1000000, 5000000, 3000000), "5-B": (3000000, 25000000, 18000000),
    "5-A": (20000000, 100000000, 50000000), "High 5-A": (80000000, 250000000, 150000000),
    "Low 4-C": (50000000, 200000000, 120000000), "4-C": (100000000, 800000000, 350000000),
    "High 4-C": (800000000, 2500000000, 1500000000), "4-B": (2000000000, 10000000000, 5500000000),
    "4-A": (8000000000, 35000000000, 18000000000), "3-C": (20000000000, 100000000000, 45000000000),
    "3-B": (100000000000, 500000000000, 250000000000), "3-A": (400000000000, 2000000000000, 800000000000),
    "High 3-A": (2000000000000, 10000000000000, 5000000000000),
    "Low 2-C": (8000000000000, 30000000000000, 15000000000000),
    "2-C": (20000000000000, 150000000000000, 50000000000000),
    "2-B": (100000000000000, 2000000000000000, 500000000000000),
    "2-A": (1e15, 1e18, 5e16), "Low 1-C": (1e18, 1e20, 5e18), "1-C": (1e20, 1e22, 8.7e20)
}

# --- 2. OVERRIDES CANÓNICOS (solo los 4 focos + DBM techo) ---
CANON_OVERRIDES = {
    "turles-dbz-toei": {"base_ki": 300000, "base_tier": "5-A",
        "forms": {"Turles (Base)": {"ki": 300000, "mult": 1.0, "tier": "5-A"}}},
    "ten-shin-han-dragon-ball-cl-sico-812": {"base_ki": 290000, "base_tier": "4-C",
        "forms": {"Ten Shin Han (Estado Base DBS / Maestro del Dojo)": {"ki": 290000, "mult": 1.0, "tier": "4-C"}}},
    "son-gohan-saga-super-dragon-ball-super-39": {"base_ki": 57000000, "base_tier": "2-B",
        "forms": {
            "Estado Base (DBS - Entrenado con Piccolo)": {"ki": 57000000, "mult": 1.0, "tier": "4-C"},
            "Super Saiyan": {"ki": 2850000000, "mult": 50.0, "tier": "4-B"},
            "Super Saiyan 2": {"ki": 5700000000, "mult": 100.0, "tier": "4-B"},
            "Estado Definitivo (Ultimate Gohan)": {"ki": 77000000000, "mult": 1350.8, "tier": "3-C"},
            "Modo Bestia (Gohan Beast)": {"ki": 77000000000000, "mult": 1000000.0, "tier": "2-B"}
        }},
    "son-goku-u18-dbm": {"base_ki": 103000000, "base_tier": "3-C",
        "forms": {
            "Son Goku (Estado Base DBM / Maestro Veterano)": {"ki": 103000000, "mult": 1.0, "tier": "4-C"},
            "Kaio-ken": {"ki": 206000000, "mult": 2.0, "tier": "4-B"},
            "Super Saiyan 1": {"ki": 5150000000, "mult": 50.0, "tier": "4-B"},
            "Super Saiyan 2": {"ki": 10300000000, "mult": 100.0, "tier": "4-A"},
            "Super Saiyan 3 (Control Energético Superior)": {"ki": 41200000000, "mult": 400.0, "tier": "3-C"},
            "Normal Super Saiyan (Goku U18)": {"ki": 41200000000, "mult": 400.0, "tier": "3-C"}
        }},
    "vegeta-u18-dbm": {"base_ki": 100000000, "base_tier": "4-B",
        "forms": {
            "Vegeta (Estado Base DBM / Príncipe Veterano)": {"ki": 100000000, "mult": 1.0, "tier": "4-C"},
            "Super Saiyan 1": {"ki": 5000000000, "mult": 50.0, "tier": "4-B"},
            "Super Saiyan 2": {"ki": 10000000000, "mult": 100.0, "tier": "4-A"},
            "Super Saiyan 3 (Vegeta U18)": {"ki": 40000000000, "mult": 400.0, "tier": "3-C"},
            "Normal Super Saiyan (Vegeta U18)": {"ki": 40000000000, "mult": 400.0, "tier": "3-C"}
        }},
    "gohan-u16-dbm-espectador": {"base_ki": 100000000, "base_tier": "3-C",
        "forms": {
            "Son Gohan (Universo 16 - Base)": {"ki": 100000000, "mult": 1.0, "tier": "4-C"},
            "Modo Furia del Padre Protector (DBM Custom)": {"ki": 80000000000, "mult": 800.0, "tier": "3-C"},
            "Son Gohan (Universo 16 - Estado Místico)": {"ki": 80000000000, "mult": 800.0, "tier": "3-C"}
        }},
    "son-bra-dbm-u16": {"base_ki": 30000000, "base_tier": "3-C",
        "forms": {
            "Estado Base (Son Bra Adolescente)": {"ki": 30000000, "mult": 1.0, "tier": "4-C"},
            "Super Saiyan 1": {"ki": 1500000000, "mult": 50.0, "tier": "High 4-C"},
            "Super Saiyan 2 (Furia Descontrolada)": {"ki": 30000000000, "mult": 1000.0, "tier": "3-C"},
            "Son Bra (Majin Bra)": {"ki": 45000000000, "mult": 1500.0, "tier": "3-C"}
        }},
    "vegetto-base-saga-buu-120": {"base_ki": 100000000000, "base_tier": "3-C",
        "forms": {"Vegetto Base": {"ki": 100000000000, "mult": 1.0, "tier": "3-C"},
                  "Super Vegetto": {"ki": 5000000000000, "mult": 50.0, "tier": "3-B"}}},
}

# --- 3. FORMATTERS ---
def fmt_ki(v):
    if v >= 1e21: return f"{v/1e21:.2f} Sextillones"
    if v >= 1e18: return f"{v/1e18:.2f} Trillones"
    if v >= 1e12: return f"{v/1e12:.2f} Billones"
    if v >= 1e9:  return f"{v/1e9:.2f} Mil Millones"
    if v >= 1e6:  return f"{v/1e6:.2f} Millones"
    if v >= 1e3:  return f"{v/1e3:.2f} Mil"
    return f"{int(v):,} Unidades".replace(",", ".")

def parse_ki(s):
    return float(s.replace("`","").replace(",","").replace(".","").strip())

def parse_mult(s):
    m = re.search(r"×\s*([\d\.]+)", s)
    return float(m.group(1)) if m else 1.0

# --- 4. PIPELINE CORREGIDO ---
def sanitize_roster(input_path, output_path, patch_path, dry_run=False):
    with open(input_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    re_char = re.compile(r"^###\s+\d+\.\s+.*?\(`([a-zA-Z0-9_-]+)`\)")
    re_meta = re.compile(r"^-\s+\*\*Base Tier\*\*:\s+`([^`]+)`\s+\|\s+\*\*Base Ki Numérico\*\*:\s+`([^`]+)`\s+\((.*?)\)")
    re_status = re.compile(r"^-\s+\*\*Estado de Sincronización \(tierStatus\)\*\*:\s+`([^`]+)`")
    re_row = re.compile(r"^\|\s*(\d+)\s*\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*`([^`]+)`\s*\|\s*([^|]+)\|")

    output = []
    patches = {"corrections": [], "clamping": [], "warnings": []}
    state = {"char_id": None, "override": None, "base_ki": None, "base_tier": None, "in_table": False}

    def flush_patch(char_id, field, old, new, reason):
        patches["corrections"].append({"char_id": char_id, "field": field, "old": old, "new": new, "reason": reason})

    for i, line in enumerate(lines):
        # Character header
        m = re_char.match(line)
        if m:
            state["char_id"] = m.group(1)
            state["override"] = CANON_OVERRIDES.get(state["char_id"])
            state["base_ki"] = None
            state["base_tier"] = None
            state["in_table"] = False
            output.append(line)
            continue

        # Meta line (Base Tier | Base Ki)
        m = re_meta.match(line)
        if m:
            tier_in = m.group(1).strip()
            raw_ki = parse_ki(m.group(2))
            
            if state["override"]:
                state["base_ki"] = state["override"]["base_ki"]
                state["base_tier"] = state["override"].get("base_tier", tier_in)
                if tier_in != state["base_tier"]:
                    flush_patch(state["char_id"], "base_tier", tier_in, state["base_tier"], "canon_override")
                if raw_ki != state["base_ki"]:
                    flush_patch(state["char_id"], "base_ki", raw_ki, state["base_ki"], "canon_override")
            else:
                state["base_tier"] = tier_in
                state["base_ki"] = raw_ki
                # CLAMPING 10x (no 100x)
                if state["base_tier"] in TIER_LIMITS:
                    t_min, t_max, t_mid = TIER_LIMITS[state["base_tier"]]
                    if state["base_ki"] > t_max * 10:
                        clamped = t_mid
                        flush_patch(state["char_id"], "base_ki", state["base_ki"], clamped, f"clamping_10x_tier_{state['base_tier']}")
                        patches["clamping"].append({"char_id": state["char_id"], "tier": state["base_tier"], "original": state["base_ki"], "clamped": clamped})
                        state["base_ki"] = clamped

            num_str = f"{state['base_ki']:,.0f}".replace(",", ".")
            output.append(f"- **Base Tier**: `{state['base_tier']}` | **Base Ki Numérico**: `{num_str}` ({fmt_ki(state['base_ki'])})\n")
            continue

        # Status line
        if re_status.match(line):
            output.append("- **Estado de Sincronización (tierStatus)**: `internally_aligned`\n")
            continue

        # Table handling
        if "| # Forma |" in line:
            state["in_table"] = True
            output.append(line)
            continue

        if state["in_table"] and line.strip().startswith("|") and not line.strip().startswith("| :-"):
            m = re_row.match(line)
            if m:
                idx, name, _, _, orig_mult, orig_tier, custom = m.groups()
                name = name.strip()
                orig_mult = orig_mult.strip()
                orig_tier = orig_tier.strip()

                # Override forms
                if state["override"] and "forms" in state["override"]:
                    matched = None
                    for k, v in state["override"]["forms"].items():
                        if k.lower() in name.lower() or name.lower() in k.lower():
                            matched = (k, v)
                            break
                    if matched:
                        k, v = matched
                        calc_ki = v["ki"]
                        new_mult = f"×{v['mult']:g}"
                        new_tier = v["tier"]
                        num_str = f"{calc_ki:,.0f}".replace(",", ".")
                        output.append(f"| {idx} | {name} | `{num_str}` | {fmt_ki(calc_ki)} | {new_mult} | `{new_tier}` | {custom} |\n")
                        if orig_mult != new_mult:
                            flush_patch(state["char_id"], f"form_{idx}_mult", orig_mult, new_mult, f"override_{k}")
                        if orig_tier != new_tier:
                            flush_patch(state["char_id"], f"form_{idx}_tier", orig_tier, new_tier, f"override_{k}")
                        continue

                # Safe recalc
                if state["base_ki"] is not None:
                    mult = parse_mult(orig_mult)
                    calc_ki = state["base_ki"] * mult
                    # Clamp form ki to tier max * 10
                    if orig_tier in TIER_LIMITS:
                        t_min, t_max, t_mid = TIER_LIMITS[orig_tier]
                        if calc_ki > t_max * 10:
                            calc_ki = t_max
                            flush_patch(state["char_id"], f"form_{idx}_ki_clamp", state["base_ki"]*mult, calc_ki, f"form_clamp_tier_{orig_tier}")
                    num_str = f"{calc_ki:,.0f}".replace(",", ".")
                    output.append(f"| {idx} | {name} | `{num_str}` | {fmt_ki(calc_ki)} | {orig_mult} | `{orig_tier}` | {custom} |\n")
                    continue

        if state["in_table"] and not line.strip().startswith("|"):
            state["in_table"] = False

        output.append(line)

    if not dry_run:
        with open(output_path, "w", encoding="utf-8") as f:
            f.writelines(output)
        with open(patch_path, "w", encoding="utf-8") as f:
            json.dump(patches, f, indent=2, ensure_ascii=False)
        print(f"✅ Sanitizado: {output_path}")
        print(f"📋 Patches: {patch_path} ({len(patches['corrections'])} correcciones, {len(patches['clamping'])} clamping)")
    else:
        print("🔍 DRY-RUN: No se escribieron archivos.")
        print(json.dumps(patches, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    sanitize_roster(
        "ROSTER_NIVELES_PODER_KI_COMPLETO_V25.md",
        "ROSTER_MAESTRO_SANEADO_V26_FINAL_CORREGIDO.md",
        "rosterEnrichmentPatches.json",
        dry_run=dry_run
    )