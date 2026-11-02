/* Apex Power Scaling Engine — invariant PL core
   PL is an ordinal combat index. sourceKi is a separate historical DB field.
   No BigInt, no Infinity, no NaN, no fallback-8.
*/

import { formatApexKi } from '../lib/apexTierSystem.js';

export const TIER_ORDER = [
  '10-C','10-B','10-A','9-C','9-B','9-A','8-C','High 8-C','8-B','8-A',
  'Low 7-C','7-C','High 7-C','Low 7-B','7-B','7-A','High 7-A',
  '6-C','High 6-C','Low 6-B','6-B','High 6-B','6-A','High 6-A',
  '5-C','Low 5-B','5-B','5-A','High 5-A','Low 4-C','4-C','High 4-C',
  '4-B','4-A','3-C','3-B','3-A','High 3-A','Low 2-C','2-C','2-B','2-A',
  'Low 1-C','1-C','High 1-C','1-B','High 1-B','Low 1-A','1-A','High 1-A','0'
];

const TIER_INDEX = new Map(TIER_ORDER.map((tier, index) => [tier, index]));

export function assert(condition, message) {
  if (!condition) throw new Error(`APEX validation: ${message}`);
}

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function makeVariantId({ universe, character, continuity, saga, version }) {
  const fields = [universe, character, continuity, saga, version];
  assert(fields.every(Boolean), 'universe, character, continuity, saga and version are mandatory for a variant ID');
  return fields.map(normalizeText).join('--');
}

export function tierIndex(tier) {
  if (!tier) return 0;
  const clean = String(tier).trim().replace(/^Tier\s*/i, '');
  if (TIER_INDEX.has(clean)) return TIER_INDEX.get(clean);
  
  for (const [t, idx] of TIER_INDEX.entries()) {
    if (clean.toLowerCase().startsWith(t.toLowerCase()) || clean.toLowerCase().includes(t.toLowerCase())) {
      return idx;
    }
  }
  
  const low = clean.toLowerCase();
  if (low.includes('outerversal') || low.includes('1-a')) return TIER_INDEX.get('1-A') ?? 48;
  if (low.includes('hyperversal') || low.includes('1-b')) return TIER_INDEX.get('1-B') ?? 45;
  if (low.includes('complex') || low.includes('1-c')) return TIER_INDEX.get('1-C') ?? 43;
  if (low.includes('multiversal+') || low.includes('2-a')) return TIER_INDEX.get('2-A') ?? 41;
  if (low.includes('multiversal') || low.includes('2-b')) return TIER_INDEX.get('2-B') ?? 40;
  if (low.includes('2-c')) return TIER_INDEX.get('2-C') ?? 39;
  if (low.includes('universal+') || low.includes('low 2-c')) return TIER_INDEX.get('Low 2-C') ?? 38;
  if (low.includes('universal') || low.includes('3-a')) return TIER_INDEX.get('3-A') ?? 36;
  if (low.includes('galact') || low.includes('3-c')) return TIER_INDEX.get('3-C') ?? 34;
  if (low.includes('solar') || low.includes('4-b')) return TIER_INDEX.get('4-B') ?? 32;
  if (low.includes('estelar') || low.includes('4-c')) return TIER_INDEX.get('4-C') ?? 30;
  if (low.includes('planet') || low.includes('5-a')) return TIER_INDEX.get('5-A') ?? 27;
  if (low.includes('luna') || low.includes('5-c')) return TIER_INDEX.get('5-C') ?? 24;
  if (low.includes('contin') || low.includes('6-a')) return TIER_INDEX.get('6-A') ?? 22;
  if (low.includes('ciudad') || low.includes('7-b') || low.includes('7-a')) return TIER_INDEX.get('7-B') ?? 14;
  if (low.includes('edificio') || low.includes('8-c')) return TIER_INDEX.get('8-C') ?? 6;
  
  return 0;
}

export function clamp01(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return 0.5;
  return Math.max(0, Math.min(1, x));
}

export function withinTierQuality({ ap = 0.5, speed = 0.5, durability = 0.5, form = 0.5, battleIQ = 0.5, haxReliability = 0.5 } = {}) {
  const q =
    0.62 * clamp01(ap) +
    0.12 * clamp01(speed) +
    0.12 * clamp01(durability) +
    0.06 * clamp01(form) +
    0.05 * clamp01(battleIQ) +
    0.03 * clamp01(haxReliability);
  return clamp01(q);
}

export function calculateApexPL(profile) {
  if (!profile) return 0;
  const tierKey = profile.tierExact || profile.tier || '10-B';
  const rank = tierIndex(tierKey);
  const q = withinTierQuality(profile);
  const quality = Math.max(0, Math.min(100, Math.round(q * 100)));
  return rank * 101 + quality;
}

export function comparePL(a, b) {
  const pa = calculateApexPL(a);
  const pb = calculateApexPL(b);
  return pa === pb ? 0 : pa > pb ? 1 : -1;
}

export function assertMonotonic(a, b) {
  const tierDelta = tierIndex(a.tierExact || a.tier) - tierIndex(b.tierExact || b.tier);
  const plDelta = comparePL(a, b);
  if (tierDelta > 0) {
    assert(plDelta > 0, `Monotonicity violation: ${a.character || a.name || 'A'} is higher tier than ${b.character || b.name || 'B'} but has lower or equal PL.`);
  }
}

export function calculateApexKiEquivalent(profile) {
  const pl = calculateApexPL(profile);
  const tierKey = profile.tierExact || profile.tier || '10-B';
  const rank = tierIndex(tierKey);
  const q = withinTierQuality(profile);

  // Escala Scouter: usar el ancla directo del tier en lugar de log10
  const baseLog10 = 2.0 + (rank * 1.5);
  const currentLog10 = baseLog10 + (q * 1.5);

  // Convertir a un valor absoluto usando la escala Scouter
  const baseEnergy = Math.pow(10, baseLog10);
  const currentEnergy = Math.pow(10, Math.min(currentLog10, 68)); // Cap at 1e68

  // Usar formatApexKi para etiquetas DB en lugar de notación científica
  const formatted = formatApexKi(currentEnergy);

  return {
    log10: currentLog10,
    raw: currentEnergy,
    formatted,
    pl
  };
}