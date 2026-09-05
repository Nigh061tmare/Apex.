/**
 * APEX Combat State Resolver v2.2
 * Single Source of Truth for resolving any character combat state.
 * Non-mutating. No BigInt/NaN/Infinity/fallback-8.
 */

import {
  TIER_ORDER,
  getTierRank,
  getBaseApexKiLog10,
  getScouterEnergy,
  getScaledScouterEnergy,
  formatApexKiFromLog10,
  formatApexKi,
  formatSourceKi,
  calculateQuality,
  calculateScores,
  TEMP_PROFILES
} from './apexTierSystem.js';
import { FORM_SCALING_CONFIG } from '../data/formScalingConfig.js';
import { KNOWN_CANON_DB_LEVELS, getBaseEnergyFromTier, getPowerLevelFormulaBreakdown } from '../services/scouterEngine.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function normalizeText(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeUniverseToKey(universe) {
  if (!universe) return 'unknown';
  const norm = normalizeText(universe);

  const MAP = {
    'dragon ball': 'dragon-ball',
    'dragon ball z': 'dragon-ball',
    'dragon ball super': 'dragon-ball',
    'dragon ball gt': 'dragon-ball',
    'dragon ball heroes': 'dragon-ball',
    'dragon ball daima': 'dragon-ball',
    'dragon ball canonico': 'dragon-ball',
    'marvel comics': 'marvel',
    'marvel': 'marvel',
    'the boys': 'the-boys',
    'dc comics': 'dc',
    'dc': 'dc',
    'one punch man': 'opm',
    'one-punch man': 'opm',
    'jujutsu kaisen': 'jjk',
    'hunter x hunter': 'hxh',
    'chainsaw man': 'chainsaw',
    'demon slayer kimetsu no yaiba': 'kimetsu',
    'demon slayer': 'kimetsu',
    'kimetsu no yaiba': 'kimetsu',
    'my hero academia': 'my-hero',
    'my hero academia boku no hero': 'my-hero',
    'baki the grappler baki hanma': 'baki',
    'baki the grappler': 'baki',
    'baki': 'baki',
    'shuumatsu no valkyrie record of ragnarok': 'shuumatsu',
    'jo jos bizarre adventure': 'jojos',
    'spy x family': 'spyxfamily',
    'universo hibrido apex original': 'apextech'
  };

  if (norm === 'dragon-ball') return 'dragon-ball';
  if (norm.startsWith('dragon ball')) return 'dragon-ball';

  for (const [key, val] of Object.entries(MAP)) {
    if (norm === key || norm.startsWith(key)) return val;
  }

  return norm;
}

function validPositive(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, Number(v) || 0));
}

function extractCandidateSegments(name, id) {
  const raw = [name, id].filter(Boolean);
  const segments = new Set();
  for (const s of raw) {
    const norm = normalizeText(s);
    if (norm) segments.add(norm);
    const parts = String(s).split(/[\(\)\/\—\-\|]/).map(p => normalizeText(p)).filter(Boolean);
    for (const p of parts) segments.add(p);
  }
  return Array.from(segments);
}

/**
 * Apply form stat-modifiers to base stats.
 * Multiplies each key by its modifier; clamps result to [0,1].
 */
function applyStatModifiers(baseStats, modifiers = {}) {
  const keys = ['ap', 'speed', 'durability', 'formControl', 'battleIQ', 'haxReliability'];
  const active = {};
  for (const key of keys) {
    const base = Number(baseStats?.[key] ?? 0.5);
    const mod  = Number(modifiers?.[key]  ?? 1.0);
    active[key] = clamp01(base * mod);
  }
  return active;
}

// ── findStateInCharacter ──────────────────────────────────────────────────────

export function findStateInCharacter(character, stateId) {
  if (!character) return null;
  if (!stateId || stateId === 'base' || stateId === 'default') {
    const firstForm = Array.isArray(character.forms) && character.forms.length > 0 ? character.forms[0] : null;
    if (firstForm) {
      return { ...firstForm, isBase: true };
    }
    return { id: 'base', name: character.form_or_state || character.name || 'Estado Base', isBase: true };
  }

  const collections = [
    character.forms, character.transformations, character.states,
    character.modes, character.variants, character.powerUps,
    character.releases, character.armors, character.fusions,
    character.absorptions, character.awakenings, character.fusionMethods
  ];
  const normTarget = normalizeText(stateId);

  for (const col of collections) {
    if (!Array.isArray(col)) continue;
    const byId = col.find(item => item && (item.id === stateId || item.stateId === stateId));
    if (byId) return byId;
    const byNorm = col.find(item => item && (normalizeText(item.id) === normTarget || normalizeText(item.name) === normTarget));
    if (byNorm) return byNorm;
  }
  return null;
}

// ── resolveCombatState ────────────────────────────────────────────────────────

export function resolveCombatState(character, activeStateId = 'base', scenario = {}) {
  if (!character || typeof character !== 'object') {
    return _emptyState('unknown');
  }

  const warnings = [];
  const charId = String(character.id || 'char-unknown').trim();
  const universe = character.universe || character.franchise || 'Unknown';
  const isDB = /dragon\s*ball/i.test(universe) || /dragon-ball/i.test(charId);

  // ── 1. Base tier & quality ────────────────────────────────────────────────
  const rawBaseTier = character.tierExact || character.tier || null;
  const cleanBaseTier = rawBaseTier
    ? String(rawBaseTier).replace(/^Tier\s+/i, '').split('|')[0].trim().replace(/\s+a\s+.*$/i, '')
    : null;
  const baseTierRank = getTierRank(cleanBaseTier);
  if (baseTierRank === null) warnings.push(`Tier base no reconocido en TIER_ORDER: '${rawBaseTier}'`);

  const baseStatsRaw = (character.stats && typeof character.stats === 'object')
    ? { ...character.stats }
    : { ...TEMP_PROFILES.balanced };
  const baseQuality = calculateQuality(baseStatsRaw);
  const baseWithinTierScore = Math.max(0, Math.min(100, Math.round(baseQuality * 100)));
  const baseApexKiLog10 = baseTierRank !== null ? getBaseApexKiLog10(cleanBaseTier, baseWithinTierScore) : null;

  // ── 2. Source Ki (Scouter canónico) — SOLO para Dragon Ball ───────────────────
  let sourceKiBase   = null;
  let sourceKiStatus = null;
  if (validPositive(character.sourceKi)) {
    sourceKiBase   = character.sourceKi;
    sourceKiStatus = character.sourceKiStatus || 'verified';
  } else if (validPositive(character.numericStats?.apexKi)) {
    sourceKiBase   = character.numericStats.apexKi;
    sourceKiStatus = 'character-stats';
  } else if (validPositive(character.baseKiNumeric)) {
    sourceKiBase   = character.baseKiNumeric;
    sourceKiStatus = 'roster-base-ki';
  }

  // Para personajes DB sin sourceKi explícito, buscar en niveles canónicos conocidos
  if (sourceKiBase === null && isDB) {
    const fullName = ((character.name || '') + ' ' + (character.saga || '')).toLowerCase();
    for (const item of KNOWN_CANON_DB_LEVELS) {
      if (item.pattern.test(fullName) && !item.calculatedOnly) {
        sourceKiBase = item.base;
        sourceKiStatus = 'canonical-db';
        break;
      }
    }
  }

  // Solo Dragon Ball: calcular desde escala Scouter canónica
  if (sourceKiBase === null && isDB && baseTierRank !== null) {
    if (validPositive(character.numericStats?.apexKi)) {
      sourceKiBase = character.numericStats.apexKi;
      sourceKiStatus = 'character-stats';
    } else {
      const cleanTier = cleanBaseTier;
      const isTranscendent = cleanTier && (
        /^(Low|High)?\s*1-[ABC]/.test(cleanTier) ||
        /^(Low|High)?\s*1-A/.test(cleanTier) ||
        cleanTier === '0'
      );
      if (!isTranscendent) {
        const baseEnergyObj = getBaseEnergyFromTier(cleanTier, character);
        const scouterBase = baseEnergyObj?.value;
        if (validPositive(scouterBase)) {
          sourceKiBase = scouterBase;
          sourceKiStatus = 'calculated';
        }
      }
    }
  }

  // ── 3. Locate active state object ─────────────────────────────────────────
  const stateObj = findStateInCharacter(character, activeStateId);
  const normActiveId = normalizeText(activeStateId);
  const firstFormId = character.forms?.[0]?.id;
  const normStateRawName = normalizeText(stateObj?.name || '');
  
  const isBaseState = !activeStateId || activeStateId === 'base' || activeStateId === 'default'
    || normActiveId === 'base' || normActiveId === 'estado base' || normActiveId === 'forma base'
    || normActiveId.endsWith('base std') || normActiveId.endsWith('base')
    || (activeStateId === firstFormId && (normActiveId.endsWith('base') || /base/i.test(normStateRawName)))
    || !!(stateObj && (stateObj.isBase
      || /^(estado\s+base|base|forma\s+base|normal|humano)$/i.test(normStateRawName)
      || normStateRawName.includes('estado base')
      || normStateRawName.includes('forma base')
      || normStateRawName === normalizeText((stateObj?.id || '').replace(/-[^-]+$/, ''))
      || /(estado base|base)/i.test(stateObj?.name || '')));

  const isBaseFormById = stateObj && typeof stateObj.id === 'string'
    && (stateObj.id.endsWith('-base') || stateObj.id.endsWith('-base-std') || stateObj.id.endsWith('-base-std'));
  const isBaseFormByFirst = stateObj && activeStateId === firstFormId
    && (normActiveId.endsWith('base') || /(estado\s+base|base|forma\s+base|normal)/i.test(normStateRawName));

  const isTrulyBase = isBaseState || isBaseFormById || isBaseFormByFirst;

  if (!stateObj && !isTrulyBase) {
    warnings.push(`Forma/Estado '${activeStateId}' no encontrado en el árbol de formas de ${character.name}.`);
  }

  const stateName = stateObj?.name || (isTrulyBase ? (character.form_or_state || character.name || 'Estado Base') : String(activeStateId));

  // ── 4. Resolve Source Ki for the active state (DB canon override / non-DB calc) ─
  let sourceKiCurrent = sourceKiBase;
  if (!isTrulyBase && stateObj && isDB) {
    if (validPositive(stateObj.explicitSourceKi)) {
      sourceKiCurrent = stateObj.explicitSourceKi;
    } else if (validPositive(stateObj.sourceKi)) {
      sourceKiCurrent = stateObj.sourceKi;
    } else if (validPositive(stateObj.kiNumeric)) {
      sourceKiCurrent = stateObj.kiNumeric;
    } else if (validPositive(stateObj.apexKi)) {
      sourceKiCurrent = stateObj.apexKi;
    } else if (sourceKiBase && validPositive(stateObj.sourceKiMultiplier)) {
      sourceKiCurrent = sourceKiBase * stateObj.sourceKiMultiplier;
    }
  }

  // ── 5. Resolve APEX-Ki and form multiplier ────────────────────────────────
  let activeTierExact    = cleanBaseTier;
  let formMultiplier     = 1.0;
  let currentApexKiLog10 = baseApexKiLog10;
  let scalingMethod      = isTrulyBase ? 'base' : 'unresolved';
  let statModifiers      = (stateObj?.statModifiers && typeof stateObj.statModifiers === 'object')
    ? { ...stateObj.statModifiers }
    : {};

  // Si el estado activo (incluso la forma base seleccionada) tiene un tier explícito definido en su forma (ej: 5-A o 7-B), usarlo
  const rawActiveTier = stateObj?.tierExact || stateObj?.tier;
  if (rawActiveTier) {
    const cleanActiveTier = String(rawActiveTier).replace(/^Tier\s+/i, '').split('|')[0].trim().replace(/\s+a\s+.*$/i, '');
    const activeRank = getTierRank(cleanActiveTier);
    if (activeRank !== null) {
      activeTierExact = cleanActiveTier;
      currentApexKiLog10 = getBaseApexKiLog10(cleanActiveTier, baseWithinTierScore);
      if (isTrulyBase && isDB) {
        if (validPositive(character.numericStats?.apexKi)) {
          sourceKiBase = character.numericStats.apexKi;
          sourceKiCurrent = character.numericStats.apexKi;
        } else if (validPositive(character.baseKiNumeric)) {
          sourceKiBase = character.baseKiNumeric;
          sourceKiCurrent = character.baseKiNumeric;
        } else if (validPositive(stateObj?.kiNumeric)) {
          sourceKiBase = stateObj.kiNumeric;
          sourceKiCurrent = stateObj.kiNumeric;
        } else {
          const baseEnergyObj = getBaseEnergyFromTier(cleanActiveTier, character);
          if (validPositive(baseEnergyObj?.value)) {
            sourceKiBase = baseEnergyObj.value;
            sourceKiCurrent = baseEnergyObj.value;
          }
        }
      }
    }
  }

  if (!isTrulyBase && stateObj) {
    let resolved = false;

    // P1: explicit apexKiMultiplier on state object
    const explicitMult = stateObj.apexKiMultiplier ?? (typeof stateObj.multiplier === 'number' ? stateObj.multiplier : parseFloat(stateObj.multiplier)) ?? stateObj.powerMultiplier;
    if (validPositive(explicitMult)) {
      formMultiplier = explicitMult;
      currentApexKiLog10 = baseApexKiLog10 !== null ? baseApexKiLog10 + Math.log10(formMultiplier) : null;
      scalingMethod = 'explicit-multiplier';
      resolved = true;
    }

    // P2: explicit apexKi (raw value on stateObj)
    if (!resolved && validPositive(stateObj.apexKi)) {
      const baseKi = character.numericStats?.apexKi || character.apexKi || 1;
      formMultiplier = stateObj.apexKi / baseKi;
      if (!Number.isFinite(formMultiplier) || formMultiplier <= 0) formMultiplier = 1;
      scalingMethod = 'explicit-apex-ki';
      resolved = true;
    }

    // P4: Config alias lookup in formScalingConfig (picks the longest/most specific exact match)
    const universeKey = isDB ? 'dragon-ball' : normalizeUniverseToKey(universe);
    const universeConfig = FORM_SCALING_CONFIG[universeKey] ?? (isDB ? FORM_SCALING_CONFIG['dragon-ball'] : null);
    const candidateSegments = extractCandidateSegments(stateName, stateObj?.id || activeStateId);

      if (!resolved && universeConfig) {
       let bestFormDef = null;
       let maxAliasLen = -1;

       for (const [formKey, formDef] of Object.entries(universeConfig)) {
         const aliases = Array.isArray(formDef.aliases) ? formDef.aliases : [];
         const normFormKey = normalizeText(formKey);

         for (const seg of candidateSegments) {
           if (seg === normFormKey) {
             if (seg.length > maxAliasLen) {
               maxAliasLen = seg.length;
               bestFormDef = formDef;
             }
           }
           for (const a of aliases) {
             const normA = normalizeText(a);
             if (normA === seg) {
               if (normA.length > maxAliasLen) {
                 maxAliasLen = normA.length;
                 bestFormDef = formDef;
               }
             }
           }
         }
       }

        if (bestFormDef) {
          if (isDB && validPositive(bestFormDef.apexKiMultiplier)) {
            formMultiplier = bestFormDef.apexKiMultiplier;
            currentApexKiLog10 = baseApexKiLog10 !== null ? baseApexKiLog10 + Math.log10(formMultiplier) : null;
            scalingMethod = 'config-alias';
            resolved = true;

            if (validPositive(bestFormDef.explicitSourceKi)) {
              sourceKiCurrent = bestFormDef.explicitSourceKi;
            } else if (validPositive(bestFormDef.sourceKiMultiplier) && validPositive(sourceKiBase)) {
              sourceKiCurrent = sourceKiBase * bestFormDef.sourceKiMultiplier;
            } else if (validPositive(sourceKiBase) && validPositive(bestFormDef.apexKiMultiplier)) {
              // DB character: apply apexKiMultiplier to sourceKi when sourceKiMultiplier is not set
              sourceKiCurrent = sourceKiBase * bestFormDef.apexKiMultiplier;
            }

            if (bestFormDef.statModifiers && typeof bestFormDef.statModifiers === 'object') {
              statModifiers = { ...statModifiers, ...bestFormDef.statModifiers };
            }
         } else if (!isDB && !validPositive(bestFormDef.apexKiMultiplier)) {
           // External char: forma reconocida pero sin multiplicador explícito configurado
           // NO inventamos multiplicadores
           scalingMethod = 'unresolved';
         } else if (!isDB && validPositive(bestFormDef.apexKiMultiplier)) {
           // External char: forma con multiplicador explícito en config (fromScalingConfig)
           formMultiplier = bestFormDef.apexKiMultiplier;
           currentApexKiLog10 = baseApexKiLog10 !== null ? baseApexKiLog10 + Math.log10(formMultiplier) : null;
           scalingMethod = 'config-alias';
           resolved = true;

           if (bestFormDef.statModifiers && typeof bestFormDef.statModifiers === 'object') {
             statModifiers = { ...statModifiers, ...bestFormDef.statModifiers };
           }
         }
       }
     }

    // P5: form has its own distinct tier (different from base)
    if (!resolved) {
      const rawDirectTier = stateObj.tierExact || stateObj.tier;
      const directRank = getTierRank(rawDirectTier);
      if (directRank !== null && directRank !== baseTierRank) {
        activeTierExact = TIER_ORDER[directRank];
        const targetLog10 = getBaseApexKiLog10(activeTierExact, baseWithinTierScore);
        const logDiff = targetLog10 - (baseApexKiLog10 ?? targetLog10);
        formMultiplier = Math.pow(10, logDiff);
        if (!Number.isFinite(formMultiplier) || formMultiplier <= 0) formMultiplier = 1;
        currentApexKiLog10 = targetLog10;
        scalingMethod = 'active-tier';
        resolved = true;
      } else if (stateObj.stats) {
        const tierMatch = String(stateObj.stats).match(/(?:Tier\s+)?((?:High|Low)\s+[\w\-]+|[\w]+-[ABC])/i);
        if (tierMatch) {
          const parsedTier = tierMatch[1].trim();
          const parsedRank = getTierRank(parsedTier);
          if (parsedRank !== null && parsedRank !== baseTierRank) {
            activeTierExact = TIER_ORDER[parsedRank];
            const targetLog10 = getBaseApexKiLog10(activeTierExact, baseWithinTierScore);
            const logDiff = targetLog10 - (baseApexKiLog10 ?? targetLog10);
            formMultiplier = Math.pow(10, logDiff);
            if (!Number.isFinite(formMultiplier) || formMultiplier <= 0) formMultiplier = 1;
            currentApexKiLog10 = targetLog10;
            scalingMethod = 'active-tier';
            resolved = true;
          }
        }
      }
    }

    // P6: DB Source Ki ratio -> APEX-Ki
    if (!resolved && isDB && validPositive(sourceKiCurrent) && validPositive(sourceKiBase)
        && sourceKiCurrent !== sourceKiBase) {
      const ratio = sourceKiCurrent / sourceKiBase;
      if (validPositive(ratio)) {
        formMultiplier = ratio;
        currentApexKiLog10 = baseApexKiLog10 !== null ? baseApexKiLog10 + Math.log10(ratio) : null;
        scalingMethod = 'db-source-ratio';
        resolved = true;
      }
    }

    // P7: unresolved fallback
    if (!resolved) {
      warnings.push(`Forma '${stateName}' sin escalado APEX configurado; se mantiene valor base.`);
      scalingMethod = 'unresolved';
      formMultiplier = 1.0;
      currentApexKiLog10 = baseApexKiLog10;
    }

    // Ensure DB sourceKi scales with formMultiplier if not explicitly overridden
    if (isDB && validPositive(sourceKiBase) && formMultiplier !== 1.0 && !validPositive(stateObj?.explicitSourceKi) && !validPositive(stateObj?.sourceKi)) {
      sourceKiCurrent = sourceKiBase * formMultiplier;
    }
  }

  // ── 6. Active stats (apply form modifiers to base stats) ─────────────────
  const activeStatsRaw = applyStatModifiers(baseStatsRaw, statModifiers);
  const activeQuality  = calculateQuality(activeStatsRaw);

  // ── 7. Final scores ───────────────────────────────────────────────────────
  const activeTierRank = getTierRank(activeTierExact);
  const withinTierScore = Math.max(0, Math.min(100, Math.round(activeQuality * 100)));
  const powerKey = activeTierRank === null ? null : activeTierRank * 101 + withinTierScore;
  const apexScore = activeTierRank === null
    ? null
    : `${activeTierRank}.${String(withinTierScore).padStart(2, '0')}`;

  // ── 8. Status ─────────────────────────────────────────────────────────────
  let apexKiStatus = 'resolved';
  if (activeTierRank === null || baseTierRank === null) apexKiStatus = 'unresolved';
  else if (activeTierExact === '0') {
    apexKiStatus = 'boundless';
    currentApexKiLog10 = null;
  } else if (activeTierExact === '1-A' || activeTierExact === 'High 1-A' || activeTierExact === 'Low 1-A'
             || activeTierExact === '1-B' || activeTierExact === 'High 1-B'
             || activeTierExact === '1-C' || activeTierExact === 'High 1-C' || activeTierExact === 'Low 1-C') {
    apexKiStatus = 'transcendent';
    currentApexKiLog10 = null;
  } else if (currentApexKiLog10 !== null && currentApexKiLog10 >= 68) apexKiStatus = 'transcendent';
  else if (scalingMethod === 'unresolved') apexKiStatus = 'unresolved';

   // ── 9. Display strings — APEX-Ki para TODOS los personajes (escala Scouter universal) ──
   // Calcular APEX-Ki como un número absoluto
   let apexKiRaw = null;
   let isApexKiTranscendent = false;
   
   const activeTierName = TIER_ORDER[activeTierRank];
   if (activeTierExact === '0' || activeTierName === '0') {
     isApexKiTranscendent = true;
   } else if (activeTierExact && /^(Low|High)?\s*1-[ABC]/.test(activeTierExact)
              || activeTierExact && /^(Low|High)?\s*1-A/.test(activeTierExact)) {
     isApexKiTranscendent = true;
   } else if (activeTierName && (activeTierName === '1-A' || activeTierName === 'High 1-A' || activeTierName === 'Low 1-A'
               || activeTierName === '1-B' || activeTierName === 'High 1-B'
               || activeTierName === '1-C' || activeTierName === 'High 1-C' || activeTierName === 'Low 1-C'
               || activeTierName === 'Low 2-C')) {
     isApexKiTranscendent = true;
   }
   
   if (isApexKiTranscendent) {
     apexKiRaw = null;
   } else if (validPositive(stateObj?.apexKi)) {
     apexKiRaw = stateObj.apexKi;
   } else if (isDB && validPositive(sourceKiCurrent)) {
     apexKiRaw = sourceKiCurrent;
   } else {
      // Prioridad 1: Si el personaje tiene numericStats auténticos ya calibrados y únicos
      const charKi = character.numericStats?.apexKi || character.numericStats?.powerLevel || character.numericStats?.scouterKi;
      if (validPositive(charKi)) {
        apexKiRaw = Math.round(charKi * (validPositive(formMultiplier) ? formMultiplier : 1.0));
      } else {
        // Usar el desglose dinámico individualizado por estadísticas, hazañas, velocidad, durabilidad y Hax
        const bd = getPowerLevelFormulaBreakdown(character, activeStateId);
        const dynamicKi = bd?.finalPowerLevel || bd?.sourceKi || character.powerScaling?.scouterKi;
        if (validPositive(dynamicKi)) {
          apexKiRaw = dynamicKi;
        } else if (baseTierRank !== null) {
          const scouterBase = getScaledScouterEnergy(cleanBaseTier, baseWithinTierScore);
          apexKiRaw = validPositive(scouterBase) ? scouterBase * formMultiplier : null;
        }
      }
   }

  const apexKiDisplay = validPositive(apexKiRaw)
    ? formatApexKi(apexKiRaw)
    : (currentApexKiLog10 !== null && Number.isFinite(currentApexKiLog10)
      ? formatApexKiFromLog10(currentApexKiLog10, activeTierExact)
      : (activeTierExact === '0'
        ? 'Boundless · Tier 0'
        : (apexKiStatus === 'transcendent'
          ? 'Trascendente · ' + activeTierExact
          : '—')));
  const sourceKiDisplay = validPositive(sourceKiCurrent) ? formatSourceKi(sourceKiCurrent) : null;
  const multiplierDisplay = formMultiplier === 1 ? '×1'
    : `×${formMultiplier >= 1000 ? formMultiplier.toLocaleString('es-ES') : formMultiplier}`;

  // ── 10. Special mechanics (char + state merged, no mutation) ─────────────
  const specialMechanics = [
    ...(Array.isArray(character.specialMechanics) ? character.specialMechanics : []),
    ...(Array.isArray(stateObj?.specialMechanics)  ? stateObj.specialMechanics  : [])
  ];

  return {
    characterId: charId,
    activeStateId: isTrulyBase ? 'base' : (stateObj?.id || activeStateId),
    stateName,

    tierExact: activeTierExact,
    tierRank:  activeTierRank,
    withinTierScore,
    powerKey,
    apexScore,

     baseApexKiLog10,
     currentApexKiLog10,
     apexKiDisplay,
     apexKiRaw,
     apexKiStatus,

    scalingMethod,
    formMultiplier,
    multiplierDisplay,

     sourceKiBase:    sourceKiBase,
     sourceKiCurrent: sourceKiCurrent,
     sourceKiDisplay,
     sourceKiStatus:  sourceKiStatus,

    activeStats: activeStatsRaw,
    statModifiers,

    specialMechanics,
    warnings,
    manualReviewRequired: warnings.length > 0 || apexKiStatus === 'unresolved'
  };
}

// ── empty state helper ────────────────────────────────────────────────────────
function _emptyState(charId) {
  return {
    characterId: charId,
    activeStateId: 'base',
    stateName: 'Desconocido',
    tierExact: null,
    tierRank: null,
    withinTierScore: 0,
    powerKey: null,
    apexScore: null,
    baseApexKiLog10: null,
    currentApexKiLog10: null,
    apexKiDisplay: '—',
    apexKiStatus: 'unresolved',
    scalingMethod: 'unresolved',
    formMultiplier: 1,
    multiplierDisplay: '×1',
    sourceKiBase: null,
    sourceKiCurrent: null,
    sourceKiDisplay: null,
    sourceKiStatus: null,
    activeStats: null,
    statModifiers: {},
    specialMechanics: [],
    warnings: ['Personaje nulo o no proporcionado.'],
    manualReviewRequired: true
  };
}