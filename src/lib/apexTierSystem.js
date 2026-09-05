/**
 * APEX Tier System & Lightweight Mathematical Index Core
 * Single Source of Truth for Tiers and Logarithmic APEX-Ki
 * No BigInt, no giant numbers, no floating point precision artifacts, no fallback 8.
 */

export const TIER_ORDER = [
  "10-C", "10-B", "10-A",
  "9-C", "9-B", "9-A",
  "8-C", "High 8-C", "8-B", "8-A",
  "Low 7-C", "7-C", "High 7-C", "Low 7-B", "7-B", "7-A", "High 7-A",
  "6-C", "High 6-C", "Low 6-B", "6-B", "High 6-B", "6-A", "High 6-A",
  "5-C", "Low 5-B", "5-B", "5-A", "High 5-A",
  "Low 4-C", "4-C", "High 4-C", "4-B", "4-A",
  "3-C", "3-B", "3-A", "High 3-A",
  "Low 2-C", "2-C", "2-B", "2-A",
  "Low 1-C", "1-C", "High 1-C", "1-B", "High 1-B",
  "Low 1-A", "1-A", "High 1-A", "0"
];

export const APEX_KI_LOG10_ANCHORS = {
  "10-C": 0.5, "10-B": 1.0, "10-A": 1.5,
  "9-C": 2.0, "9-B": 2.6, "9-A": 3.2,
  "8-C": 4.0, "High 8-C": 4.6, "8-B": 5.3, "8-A": 6.0,
  "Low 7-C": 6.6, "7-C": 7.3, "High 7-C": 8.0, "Low 7-B": 8.7, "7-B": 9.4, "7-A": 10.2, "High 7-A": 11.0,
  "6-C": 12.0, "High 6-C": 13.0, "Low 6-B": 14.0, "6-B": 15.0, "High 6-B": 16.0, "6-A": 17.0, "High 6-A": 18.0,
  "5-C": 19.5, "Low 5-B": 21.0, "5-B": 22.5, "5-A": 24.0, "High 5-A": 25.5,
  "Low 4-C": 27.0, "4-C": 28.5, "High 4-C": 30.0, "4-B": 32.0, "4-A": 34.5,
  "3-C": 37.0, "3-B": 40.0, "3-A": 43.0, "High 3-A": 46.0,
  "Low 2-C": 50.0, "2-C": 54.0, "2-B": 58.0, "2-A": 62.0,
  "Low 1-C": 68.0, "1-C": 74.0, "High 1-C": 80.0, "1-B": 90.0, "High 1-B": 100.0,
  "Low 1-A": 120.0, "1-A": 140.0, "High 1-A": 160.0, "0": 200.0
};

export const TEMP_PROFILES = {
  martialArtist: { ap: 0.70, speed: 0.72, durability: 0.68, formControl: 0.65, battleIQ: 0.82, haxReliability: 0.15 },
  brute: { ap: 0.82, speed: 0.58, durability: 0.84, formControl: 0.58, battleIQ: 0.52, haxReliability: 0.10 },
  speedster: { ap: 0.62, speed: 0.90, durability: 0.60, formControl: 0.72, battleIQ: 0.70, haxReliability: 0.22 },
  strategist: { ap: 0.56, speed: 0.62, durability: 0.55, formControl: 0.72, battleIQ: 0.92, haxReliability: 0.48 },
  energyFighter: { ap: 0.78, speed: 0.76, durability: 0.72, formControl: 0.78, battleIQ: 0.72, haxReliability: 0.34 },
  haxSpecialist: { ap: 0.52, speed: 0.66, durability: 0.56, formControl: 0.74, battleIQ: 0.80, haxReliability: 0.80 },
  tank: { ap: 0.74, speed: 0.50, durability: 0.90, formControl: 0.65, battleIQ: 0.60, haxReliability: 0.18 },
  balanced: { ap: 0.68, speed: 0.68, durability: 0.68, formControl: 0.68, battleIQ: 0.68, haxReliability: 0.25 }
};

/**
 * Mapa de energía-base por Tier (Escala Scouter Canónica de Dragon Ball)
 * Un humano promedio (10-B) = 5 Unidades de Poder.
 * Se extiende monolícticamente hacia arribas para cubrir el poder total del universo.
 */
export const SCOUTER_ENERGY_ANCHORS = {
  "10-C": 2,
  "10-B": 5,
  "10-A": 10,
  "9-C": 15,
  "9-B": 22,
  "9-A": 35,
  "8-C": 120,
  "High 8-C": 350,
  "8-B": 550,
  "8-A": 900,
  "Low 7-C": 1300,
  "7-C": 1800,
  "High 7-C": 2200,
  "Low 7-B": 2500,
  "7-B": 2800,
  "7-A": 4800,
  "High 7-A": 6500,
  "6-C": 8000,
  "High 6-C": 9500,
  "Low 6-B": 10500,
  "6-B": 12000,
  "High 6-B": 14000,
  "6-A": 16000,
  "High 6-A": 22000,
  "5-C": 4500,
  "Low 5-B": 530000,
  "5-B": 2000000,
  "5-A": 18000,
  "High 5-A": 150000000,
  "Low 4-C": 200000000,
  "4-C": 500000000,
  "High 4-C": 1000000000,
  "4-B": 1200000000,
  "4-A": 1500000000,
  "3-C": 5000000000,
  "3-B": 15000000000,
  "3-A": 50000000000,
  "High 3-A": 200000000000,
  "Low 2-C": 500000000000000,
  "2-C": 1000000000000000,
  "2-B": 50000000000000000,
  "2-A": 1000000000000000000,
  "Low 1-C": 1e21,
  "1-C": 1e25,
  "High 1-C": 1e28,
  "1-B": 1e32,
  "High 1-B": 1e38,
  "Low 1-A": 1e44,
  "1-A": 1e52,
  "High 1-A": 1e60,
  "0": null
};

/**
 * Normaliza y obtiene el índice del tier dentro de TIER_ORDER.
 * Maneja formatos con sufijos como "Físico", "(Base)", "(AP)", "(Galáctico)", etc.
 * Devuelve null si no es un tier válido de la jerarquía.
 */
export function getTierRank(tierExact) {
  if (!tierExact) return null;
  const clean = String(tierExact).replace(/^Tier\s+/i, '').trim();

  // Try exact match
  const index = TIER_ORDER.indexOf(clean);
  if (index >= 0) return index;

  // Try stripping suffixes like "(Base)", "Físico", "(AP)", "(Galáctico)", etc.
  // Pattern: "TierName <optional text>" -> extract the first tier token
  for (const tier of TIER_ORDER) {
    if (clean === tier) return TIER_ORDER.indexOf(tier);
    // Check if clean starts with this tier followed by space, paren, or end
    const regex = new RegExp('^' + tier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '(\\s|$|\\(|\\b)', 'i');
    if (regex.test(clean)) return TIER_ORDER.indexOf(tier);
  }

  return null;
}

/**
 * Obtiene el log10 ancla de un tier
 */
export function getTierLog10(tierExact) {
  if (!tierExact) return null;
  const clean = String(tierExact).replace(/^Tier\s+/i, '').trim();
  if (clean === '0') return null;
  if (clean.includes('1-A') || clean.includes('1-B') || clean.includes('0')) return null;
  const anchors = APEX_KI_LOG10_ANCHORS[clean];
  if (anchors !== undefined) return anchors;

  for (const tier of TIER_ORDER) {
    if (tier === '0' || tier === 'High 1-A' || tier === '1-A' || tier === 'Low 1-A') continue;
    const regex = new RegExp('^' + tier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '(\\s|$|\\(|\\b)', 'i');
    if (regex.test(clean)) {
      const log10 = APEX_KI_LOG10_ANCHORS[tier];
      return log10 !== undefined ? log10 : null;
    }
  }

  return null;
}

/**
 * Calcula el baseApexKiLog10 combinando tier y withinTierScore (0..100)
 */
export function getBaseApexKiLog10(tierExact, withinTierScore = 50) {
  const baseAnchor = getTierLog10(tierExact);
  if (baseAnchor === null) return null;
  const scoreOffset = ((Number(withinTierScore) || 50) - 50) / 100 * 0.4;
  return baseAnchor + scoreOffset;
}

export function getApexKiLog10FromTierRank(tierRank, withinTierScore = 50, tierExact = '') {
  const tierName = TIER_ORDER[tierRank];
  if (tierName === '0' || tierName === 'High 1-A' || tierName === '1-A' || tierName === 'Low 1-A') {
    return null;
  }
  const log10 = APEX_KI_LOG10_ANCHORS[tierName];
  if (log10 === undefined) return null;
  const scoreOffset = ((Number(withinTierScore) || 50) - 50) / 100 * 0.4;
  return log10 + scoreOffset;
}

/**
 * Obtiene la energía base Scouter (número absoluto) para un Tier dado
 * Maneja formatos con sufijos como "7-A Físico", "3-C (Galáctico)", etc.
 */
export function getScouterEnergy(tierExact) {
  if (!tierExact) return 5;
  const clean = String(tierExact).replace(/^Tier\s+/i, '').trim();

  if (clean === '0') return null;

  if (SCOUTER_ENERGY_ANCHORS[clean] !== undefined && SCOUTER_ENERGY_ANCHORS[clean] !== null) return SCOUTER_ENERGY_ANCHORS[clean];

  for (const tier of TIER_ORDER) {
    if (tier === '0') continue;
    const regex = new RegExp('^' + tier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '(\\s|$|\\(|\\b)', 'i');
    if (regex.test(clean)) {
      const anchor = SCOUTER_ENERGY_ANCHORS[tier];
      return anchor !== undefined && anchor !== null ? anchor : null;
    }
  }

  return 5;
}

/**
 * Obtiene la energía base Scouter ajustada por withinTierScore (0..100)
 * Aplica un multiplicador de calidad que varía linearmente entre 0.5x y 1.5x
 */
export function getScaledScouterEnergy(tierExact, withinTierScore = 50) {
  const baseEnergy = getScouterEnergy(tierExact);
  if (baseEnergy === null || baseEnergy === 0 || baseEnergy === 5) return baseEnergy;
  const quality = Math.max(0, Math.min(1, (Number(withinTierScore) || 50) / 100));
  const multiplier = 0.5 + (quality * 1.0);
  return baseEnergy * multiplier;
}

/**
 * Formatea un valor log10 a texto legible usando la escala Scouter canónica.
 * Ya no usa notación científica (10^X); en su lugar usa formatApexKi.
 */
export function formatApexKiFromLog10(log10Val, tierExact = '') {
  if (log10Val === null || log10Val === undefined || isNaN(log10Val)) return "—";
  if (log10Val <= 0) return "1 Unidad";

  if (log10Val >= 100) {
    return "∞ Incalculable";
  }
  if (log10Val >= 68) {
    return "∞ Incalculable";
  }
  if (log10Val >= 36) {
    const exp = Math.floor(log10Val);
    const mantissa = Math.pow(10, log10Val - exp);
    const val = mantissa * Math.pow(10, exp);
    return formatApexKi(val);
  }

  const rawVal = Math.pow(10, log10Val);
  return formatApexKi(rawVal);
}

/**
 * Formateador de números positivos para APEX-Ki con sufijos de RPG/DB
 */
export function formatApexKi(value) {
  if (value === null || value === undefined || isNaN(value) || value < 0) return "—";
  if (value === Infinity) return "∞ Incalculable";

  const num = Number(value);
  if (!Number.isFinite(num)) return "∞ Incalculable";

  if (num < 1000) {
    if (num >= 10) return String(Math.round(num)) + " Unidades";
    return num.toFixed(1) + " Unidades";
  }

  if (num >= 1e30) return "Trascendente Cósmico";
  if (num >= 1e27) return (num / 1e27).toFixed(2) + " Octillones";
  if (num >= 1e24) return (num / 1e24).toFixed(2) + " Septillones";
  if (num >= 1e21) return (num / 1e21).toFixed(2) + " Sextillones";
  if (num >= 1e18) return (num / 1e18).toFixed(2) + " Quintillones";
  if (num >= 1e15) return (num / 1e15).toFixed(2) + " Trillones";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + " Billones";
  if (num >= 1e9)  return (num / 1e9).toFixed(2) + " Mil Millones";
  if (num >= 1e6)  return (num / 1e6).toFixed(2) + " Millones";
  if (num >= 1e3)  return (num / 1e3).toFixed(2) + " Mil";

  return String(Math.round(num));
}

/**
 * Formateador para Source Ki (Scouter DB)
 */
export function formatSourceKi(value) {
  if (value === null || value === undefined || isNaN(value) || value <= 0) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return "∞ Incalculable (Scouter)";
  if (num >= 1e30) return "Trascendente Cósmico (Scouter)";
  if (num >= 1e24) return (num / 1e24).toFixed(2) + " Septillones (Scouter)";
  if (num >= 1e21) return (num / 1e21).toFixed(2) + " Sextillones (Scouter)";
  if (num >= 1e18) return (num / 1e18).toFixed(2) + " Quintillones (Scouter)";
  if (num >= 1e15) return (num / 1e15).toFixed(2) + " Trillones (Scouter)";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + " Billones (Scouter)";
  if (num >= 1e9)  return (num / 1e9).toFixed(2) + " Mil Millones (Scouter)";
  if (num >= 1e6)  return (num / 1e6).toFixed(2) + " Millones (Scouter)";
  if (num >= 1e3)  return num.toLocaleString('es-ES') + " Unidades (Scouter)";
  return Math.round(num) + " Unidades (Scouter)";
}

/**
 * Calcula la calidad interna ponderada a partir de estadísticas [0..1]
 */
export function calculateQuality(stats = {}) {
  const ap = typeof stats.ap === 'number' ? stats.ap : 0.5;
  const speed = typeof stats.speed === 'number' ? stats.speed : 0.5;
  const durability = typeof stats.durability === 'number' ? stats.durability : 0.5;
  const formControl = typeof stats.formControl === 'number' ? stats.formControl : 0.5;
  const battleIQ = typeof stats.battleIQ === 'number' ? stats.battleIQ : 0.5;
  const haxReliability = typeof stats.haxReliability === 'number' ? stats.haxReliability : 0.5;

  return (
    0.62 * ap +
    0.12 * speed +
    0.12 * durability +
    0.06 * formControl +
    0.05 * battleIQ +
    0.03 * haxReliability
  );
}

/**
 * Calcula withinTierScore, powerKey y apexScore a partir de tierRank y quality
 */
export function calculateScores(tierRank, quality, tierExact) {
  if (tierRank === null || tierRank === undefined) {
    return {
      withinTierScore: 0,
      powerKey: null,
      apexScore: null,
      powerBand: tierExact ? (tierExact + " · N/A") : "Unknown"
    };
  }

  const withinTierScore = Math.max(0, Math.min(100, Math.round(quality * 100)));
  const powerKey = tierRank * 101 + withinTierScore;
  const apexScore = tierRank + "." + String(withinTierScore).padStart(2, "0");
  const powerBand = tierExact + " · " + withinTierScore + "/100";

  return {
    withinTierScore,
    powerKey,
    apexScore,
    powerBand
  };
}

/**
 * Deduce el Tier de combate más coherente para un nivel numérico APEX-Ki
 */
export function getEstimatedTierFromApexKi(apexKi) {
  if (apexKi === null || apexKi === undefined || isNaN(apexKi)) return "8-A";
  if (apexKi <= 3) return "10-C";
  if (apexKi <= 7) return "10-B";
  if (apexKi <= 12) return "10-A";
  if (apexKi <= 18) return "9-C";
  if (apexKi <= 28) return "9-B";
  if (apexKi <= 60) return "9-A";
  if (apexKi <= 200) return "8-C";
  if (apexKi <= 450) return "High 8-C";
  if (apexKi <= 700) return "8-B";
  if (apexKi <= 1150) return "8-A";
  if (apexKi <= 1500) return "Low 7-C";
  if (apexKi <= 2000) return "7-C";
  if (apexKi <= 2400) return "High 7-C";
  if (apexKi <= 2700) return "Low 7-B";
  if (apexKi <= 3800) return "7-B";
  if (apexKi <= 5800) return "7-A";
  if (apexKi <= 7500) return "High 7-A";
  if (apexKi <= 9000) return "6-C";
  if (apexKi <= 10000) return "High 6-C";
  if (apexKi <= 11000) return "Low 6-B";
  if (apexKi <= 13000) return "6-B";
  if (apexKi <= 15000) return "High 6-B";
  if (apexKi <= 20000) return "6-A";
  if (apexKi <= 100000) return "High 6-A";
  if (apexKi <= 800000) return "Low 5-B";
  if (apexKi <= 5000000) return "5-B";
  if (apexKi <= 80000000) return "5-A";
  if (apexKi <= 250000000) return "High 5-A";
  if (apexKi <= 800000000) return "4-C";
  if (apexKi <= 2000000000) return "4-B";
  if (apexKi <= 5000000000) return "4-A";
  return "3-C";
}

