// APEX Power Scaling Engine — Master Characters Roster
// Refinado y enriquecido automáticamente con Estándar Dorado APEX
import v26Data from './ROSTER_NIVELES_PODER_CORREGIDO_V26.json' with { type: 'json' };

import RAW_TACTICAL_PROFILES from './tacticalProfiles.json' with { type: 'json' };
import CHARACTER_IMAGES from './characterImages.json' with { type: 'json' };

// ── Fase 7: Retrato IA determinista (Pollinations, gratis, seed estable por id).
// Genera una URL estable para personajes sin imagen de wiki. Se usa como último
// recurso antes de DiceBear. El seed deriva del id para que sea reproducible.
function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 999999;
}
function aiPortraitFor(char) {
  const seed = hashId(char.id || char.name || 'x');
  const name = encodeURIComponent((char.name || 'personaje').split('(')[0].trim().slice(0, 40));
  const uni = encodeURIComponent((char.universe || '').slice(0, 30));
  const prompt = `anime character portrait of ${name} from ${uni}, dynamic pose, vibrant colors, high quality, clean background`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=256&height=256&seed=${seed}&nologo=true&model=flux`;
}



// Map raw tactical profiles by id for fast O(1) lookup
const tacticalMap = new Map();
for (const profile of RAW_TACTICAL_PROFILES) {
  if (profile && profile.id) {
    tacticalMap.set(profile.id, profile);
  }
}

// Deprecated record ID set from V26
export const DEPRECATED_RECORD_IDS = new Set(
  (v26Data.deprecatedRecords || []).map(r => r.recordId || r.id)
);

// Track any active character that lacks a tactical profile
export const MISSING_TACTICAL_PROFILE_IDS = [];

const v26CharList = Array.isArray(v26Data.characters)
  ? v26Data.characters
  : Object.values(v26Data.characters);

// Construct canonical INITIAL_CHARACTERS strictly from v26Data.characters (775 active)
export const INITIAL_CHARACTERS = v26CharList.map((v26Char) => {
  const tactical = tacticalMap.get(v26Char.id);

  if (!tactical) {
    MISSING_TACTICAL_PROFILE_IDS.push(v26Char.id);
  }

  // Safe fallback defaults for tactical data if missing
  const defaultTactical = {
    alias: v26Char.name,
    version: 'Base Canonical',
    tier: v26Char.baseTier || '10-B',
    ap: `Nivel ${v26Char.baseTier || '10-B'}.`,
    range: 'Cuerpo a cuerpo estándar.',
    speed: { combat: 'Desconocida', reaction: 'Desconocida', travel: 'Desconocida', attack: 'Desconocida' },
    strength: 'Desconocida',
    durability: `Nivel ${v26Char.baseTier || '10-B'}.`,
    stamina: 'Media',
    battleIQ: 'Estándar',
    haxTags: [],
    arsenal: { basicAttacks: [], superAttacks: [], ultimateAttacks: [] },
    feats: [],
    psychology: 'Estándar',
    weaknesses: [],
    synergies: [],
    teamCombos: [],
    combatStatuses: [],
    arenaAffinities: [],
    narrativeCombatProfile: {}
  };

  const baseProfile = tactical ? { ...tactical } : { ...defaultTactical };

  // Normaliza el multiplicador de forma a número puro. El JSON V26 (fuente
  // protegida e inmutable) almacena el campo como string tipo "$\\times 50$";
  // esta fachada lo convierte a 50 para que el resolver y la UI consuman
  // siempre un número limpio sin mutar el baseline.
  const normalizeMultiplier = (raw) => {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
    if (typeof raw === 'string') {
      const match = raw.match(/(\d+(?:[.,]\d+)?)/);
      const num = match ? parseFloat(match[1].replace(',', '.')) : NaN;
      if (Number.isFinite(num) && num > 0) return num;
    }
    return 1;
  };

  const mergedForms = (v26Char.forms || []).map((v26Form, formIndex) => {
    const tacticalForm = (tactical?.forms || []).find(f => f && f.id === v26Form.id) || (tactical?.forms || [])[formIndex];
    const numericMultiplier = normalizeMultiplier(v26Form.multiplier);
    const merged = {
      ...(tacticalForm || {}),
      ...v26Form,
      tier: v26Form.tier,
      multiplier: numericMultiplier,
      kiNumeric: v26Form.kiNumeric,
      kiFormatted: v26Form.kiFormatted,
      apexKiMultiplier: numericMultiplier,
      apexKi: v26Form.kiNumeric,
      stats: v26Form.stats || tacticalForm?.stats || `Forma oficial APEX V26 (${v26Form.name}). Tier ${v26Form.tier}, Multiplicador ${numericMultiplier}x.`
    };
    if (v26Form.tier) {
      merged.tierExact = v26Form.tier;
    }
    if (v26Char.lorePriorForm) {
      merged.lorePriorForm = v26Char.lorePriorForm;
    }
    return merged;
  });

  return {
    ...baseProfile,
    id: v26Char.id,
    name: v26Char.name,
    franchise: v26Char.franchise,
    universe: v26Char.universe,
    saga: v26Char.saga,
    // ── Fase 7: imagen real de Fandom wiki inyectada como avatar (505 fichas),
    // con retrato IA determinista (Pollinations) como respaldo para el resto.
    // Se respeta cualquier avatar explícito del JSON V26.
    avatar: v26Char.avatar || CHARACTER_IMAGES[v26Char.id] || aiPortraitFor(v26Char),
    aiPortraitFallback: !v26Char.avatar && !CHARACTER_IMAGES[v26Char.id],
    tier: v26Char.baseTier,
    baseTier: v26Char.baseTier,
    baseKiFormatted: v26Char.baseKiFormatted,
    baseKiNumeric: v26Char.baseKiNumeric,
    powerSchema: v26Char.powerSchema,
    powerCorrectionVersion: v26Char.powerCorrectionVersion || 'V26',
    lorePriorForm: v26Char.lorePriorForm || null,
    // ── Sincronía de fuente única: numericStats siempre derivado del JSON V26 ──
    // El resolver prioriza numericStats.apexKi sobre baseKiNumeric, de modo que
    // congelar los valores tácticos antigua desincronizaría la simulación.
    numericStats: (() => {
      const oldNS = baseProfile.numericStats || {};
      const baseKi = v26Char.baseKiNumeric ?? oldNS.apexKi ?? 1;
      const oldApex = oldNS.apexKi && oldNS.apexKi > 0 ? oldNS.apexKi : baseKi;
      const burstRatio = oldNS.burstKi && oldNS.burstKi > 0 ? oldNS.burstKi / oldApex : 1.35;
      return {
        ...oldNS,
        apexKi: baseKi,
        burstKi: Math.round(baseKi * burstRatio),
        durabilityKi: baseKi,
      };
    })(),
    forms: mergedForms
  };
});

// Development / Runtime Assertions
if (INITIAL_CHARACTERS.length !== 775) {
  throw new Error(`[APEX FATAL] INITIAL_CHARACTERS must have exactly 775 active characters, found ${INITIAL_CHARACTERS.length}`);
}

const seenIds = new Set();
for (const char of INITIAL_CHARACTERS) {
  if (seenIds.has(char.id)) {
    throw new Error(`[APEX FATAL] Duplicate character ID detected in INITIAL_CHARACTERS: "${char.id}"`);
  }
  seenIds.add(char.id);

  if (DEPRECATED_RECORD_IDS.has(char.id)) {
    throw new Error(`[APEX FATAL] Deprecated record ID found in active INITIAL_CHARACTERS: "${char.id}"`);
  }
}
