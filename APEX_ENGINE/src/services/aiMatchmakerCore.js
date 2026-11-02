/**
 * APEX Powerscaling Engine — AI Matchmaker & Natural Language What-If Parser
 * Parses natural language battle prompts into structured combat setups,
 * creates high-detail custom characters following all APEX rules, and configures scenarios/items.
 */

import { TIER_ORDER, getTierRank, calculateScores, formatApexKiFromLog10 } from '../lib/apexTierSystem.js';
import { resolveCombatState } from '../lib/combatStateResolver.js';
import { SCENARIOS } from '../data/scenarios.js';
import { ORACLE_EVENT_CONFIG } from './combatSimulationCore.js';

/**
 * Intelligent Heuristic & AI-Guided Prompt Parser
 */
export function parseMatchupPrompt(promptText, availableCharacters = []) {
  if (!promptText || typeof promptText !== 'string') {
    return null;
  }

  const text = promptText.trim();
  const lower = text.toLowerCase();

  // 1. Detect Combat Mode
  let mode = '1v1';
  if (lower.includes('boss') || lower.includes('raid') || lower.includes('1 vs 2') || lower.includes('1 vs 3') || lower.includes('1v2') || lower.includes('1v3') || lower.includes('1v4') || lower.includes('jefe')) {
    mode = 'boss';
  } else if (lower.includes('equipo') || lower.includes('team') || lower.includes('alfa vs omega') || lower.includes('2 vs 2') || lower.includes('3 vs 3') || lower.includes('2v2') || lower.includes('3v3') || lower.includes('guerra de equipos')) {
    mode = 'team';
  } else if (lower.includes('battle royale') || lower.includes('todos contra todos') || lower.includes('royale') || lower.includes('caos') || lower.includes('ffa') || lower.includes('4 luchadores') || lower.includes('cuadrilátero')) {
    mode = 'battleRoyale';
  }

  // 2. Detect Modifiers & Conditions
  const modifiers = {
    allowExternalItems: false,
    allowedExternalItemIds: [],
    allowFusion: false,
    allowNonCanonical: false,
    prepTime: 'Sin Preparación (Encuentro Espontáneo)',
    bloodlust: false,
    speedEqualized: false,
    statsEqualized: false,
    narrativePreset: 'Equilibrado',
    customContext: ''
  };

  // External Items (Senzu Bean, Potions, Artifacts)
  if (lower.includes('semilla') || lower.includes('senzu') || lower.includes('objeto') || lower.includes('ítem') || lower.includes('item') || lower.includes('poción') || lower.includes('curación') || lower.includes('artefacto')) {
    modifiers.allowExternalItems = true;
    modifiers.allowedExternalItemIds = ['senzu-bean'];
  }

  // Fusions
  if (lower.includes('fusión') || lower.includes('fusion') || lower.includes('potara') || lower.includes('metamoran') || lower.includes('danza')) {
    modifiers.allowFusion = true;
  }

  // Preparation time
  if (lower.includes('preparación') || lower.includes('preparacion') || lower.includes('prep time') || lower.includes('planificación')) {
    if (lower.includes('24 hora') || lower.includes('un día') || lower.includes('1 día')) {
      modifiers.prepTime = '24 Horas de Preparación';
    } else if (lower.includes('1 hora') || lower.includes('una hora')) {
      modifiers.prepTime = '1 Hora de Preparación';
    } else if (lower.includes('semana')) {
      modifiers.prepTime = '1 Semana de Preparación';
    } else {
      modifiers.prepTime = 'Con Tiempo de Preparación';
    }
  }

  // Bloodlust / Stats
  if (lower.includes('bloodlust') || lower.includes('sed de sangre') || lower.includes('a muerte') || lower.includes('sin piedad')) {
    modifiers.bloodlust = true;
  }
  if (lower.includes('velocidad igualada') || lower.includes('speed equalized')) {
    modifiers.speedEqualized = true;
  }
  if (lower.includes('stats igualados') || lower.includes('estadísticas igualadas')) {
    modifiers.statsEqualized = true;
  }

  // 3. Detect Oracle Events
  const selectedOracleEvents = [];
  if (lower.includes('finisher') || lower.includes('super técnica') || lower.includes('super tecnica') || lower.includes('técnica prohibida') || lower.includes('despertar de técnica') || lower.includes('remate prohibido')) {
    selectedOracleEvents.push('forbidden-finisher-awakening');
  }
  if (lower.includes('gravedad cero') || lower.includes('colapso de arena') || lower.includes('0g') || lower.includes('sin gravedad')) {
    selectedOracleEvents.push('arena-collapse-zero-gravity');
  }
  if (lower.includes('invasor') || lower.includes('invasión') || lower.includes('refuerzo') || lower.includes('intervención')) {
    selectedOracleEvents.push('same-verse-canon-invader');
  }
  if (lower.includes('fusión canónica') || lower.includes('fusion canónica') || (modifiers.allowFusion && lower.includes('evento'))) {
    selectedOracleEvents.push('canonical-fusion');
  }
  if (lower.includes('despertar canónico') || lower.includes('despertar canonico') || lower.includes('nueva transformación')) {
    selectedOracleEvents.push('canonical-awakening');
  }
  if (lower.includes('supernova') || lower.includes('ki desbocado') || lower.includes('cataclismo energético')) {
    selectedOracleEvents.push('runaway-ki-supernova');
  }
  if (lower.includes('anulación de hax') || lower.includes('anti-hax') || lower.includes('sin poderes especiales')) {
    selectedOracleEvents.push('temporary-hax-nullification');
  }

  // 4. Detect Scenario / Arena
  let matchedScenario = null;
  for (const scen of SCENARIOS) {
    const sName = scen.name.toLowerCase();
    if (lower.includes(sName) || (scen.id && lower.includes(scen.id.toLowerCase()))) {
      matchedScenario = scen;
      break;
    }
  }

  // Common aliases if not directly matched
  if (!matchedScenario) {
    if (lower.includes('namek')) matchedScenario = SCENARIOS.find(s => s.id?.includes('namek') || s.name.toLowerCase().includes('namek')) || SCENARIOS[0];
    else if (lower.includes('tiempo') || lower.includes('habitación') || lower.includes('habitacion')) matchedScenario = SCENARIOS.find(s => s.name.toLowerCase().includes('tiempo')) || SCENARIOS[0];
    else if (lower.includes('torneo del poder') || lower.includes('mundo de la nada')) matchedScenario = SCENARIOS.find(s => s.name.toLowerCase().includes('poder') || s.name.toLowerCase().includes('nada')) || SCENARIOS[0];
    else if (lower.includes('valhalla') || lower.includes('ragnarok')) matchedScenario = SCENARIOS.find(s => s.name.toLowerCase().includes('valhalla')) || SCENARIOS[0];
    else if (lower.includes('shibuya') || lower.includes('tokio')) matchedScenario = SCENARIOS.find(s => s.name.toLowerCase().includes('shibuya') || s.name.toLowerCase().includes('tokio')) || SCENARIOS[0];
  }

  // 5. Detect Fighters and Requested Forms
  const matchedFighters = [];
  const activeForms = {};
  const missingCharacters = [];

  // Keyword extraction helper for form requests
  const formKeywords = [
    { key: 'ssj3', regex: /\b(ssj3|ssj\s*3|super\s*saiyan\s*3|super\s*saiyajin\s*3)\b/i },
    { key: 'ssj2', regex: /\b(ssj2|ssj\s*2|super\s*saiyan\s*2|super\s*saiyajin\s*2)\b/i },
    { key: 'ssj1', regex: /\b(ssj1|ssj\s*1|super\s*saiyan\s*1|super\s*saiyajin\s*1|super\s*saiyan|super\s*saiyajin)\b/i },
    { key: 'ssb', regex: /\b(ssb|ssj\s*blue|super\s*saiyan\s*blue|super\s*saiyajin\s*blue|blue)\b/i },
    { key: 'ssj4', regex: /\b(ssj4|ssj\s*4|super\s*saiyan\s*4|super\s*saiyajin\s*4)\b/i },
    { key: 'ultra-instinct', regex: /\b(ultra\s*instinto|ultra\s*instinct|ui|migatte)\b/i },
    { key: 'ultra-ego', regex: /\b(ultra\s*ego|ue|wagama)\b/i },
    { key: 'majin', regex: /\b(majin)\b/i },
    { key: 'daima', regex: /\b(mini|daima)\b/i },
    { key: 'sun-dipped', regex: /\b(sun\s*dipped|sun-dipped|solar)\b/i },
    { key: 'godbuster', regex: /\b(godbuster|god\s*buster)\b/i },
    { key: 'rune-king', regex: /\b(rune\s*king|rey\s*de\s*las\s*runas)\b/i },
    { key: 'serious-mode', regex: /\b(serio|serious\s*mode|modo\s*serio)\b/i },
    { key: 'meteoric-burst', regex: /\b(meteoric\s*burst|ráfaga\s*meteórica)\b/i },
    { key: 'pico-total', regex: /\b(pico\s*total|seis\s*ojos|despertar)\b/i },
    { key: 'adulto', regex: /\b(adulto|prime|pico)\b/i }
  ];

  // Try matching characters in available roster
  availableCharacters.forEach(char => {
    const cName = (char.name || '').toLowerCase();
    const cAlias = (char.alias || '').toLowerCase();
    const rootName = cName.split('(')[0].trim();

    if (rootName.length > 2 && lower.includes(rootName)) {
      if (!matchedFighters.find(f => f.id === char.id)) {
        // Detect requested form for this character
        let requestedFormId = 'base';
        if (Array.isArray(char.forms)) {
          for (const fk of formKeywords) {
            if (fk.regex.test(lower)) {
              const matchedForm = char.forms.find(f => (f.id && f.id.toLowerCase().includes(fk.key)) || (f.name && f.name.toLowerCase().includes(fk.key)));
              if (matchedForm) {
                requestedFormId = matchedForm.id;
                break;
              }
            }
          }
        }

        matchedFighters.push({
          id: char.id,
          name: char.name,
          character: char,
          requestedForm: requestedFormId
        });
        activeForms[char.id] = requestedFormId;
      }
    }
  });

  // Extract What-If premise narrative
  modifiers.customContext = text;

  // Check if unrepresented names were requested (e.g. "vs Lord Xibalba", "contra Saitama Cósmico")
  const vsParts = text.split(/\b(vs|contra|contra\s+el|contra\s+los|frente\s+a)\b/i).filter(p => p.trim().length > 2 && !['vs', 'contra', 'frente a'].includes(p.toLowerCase()));
  if (matchedFighters.length < 2 && vsParts.length >= 2) {
    vsParts.forEach((part, pIdx) => {
      const trimmed = part.replace(/^[,\s-]+|[,\s-]+$/g, '').trim();
      const hasMatch = matchedFighters.some(f => trimmed.toLowerCase().includes(f.name.toLowerCase().split('(')[0].trim()));
      if (!hasMatch && trimmed.length > 2 && !missingCharacters.includes(trimmed)) {
        // Clean out prompt keywords
        const cleanName = trimmed
          .replace(/\b(1v1|entre|un|una|en|con|de|el|la|los|las|modo|boss|raid|equipo)\b/gi, '')
          .replace(/[\(\)]/g, '')
          .trim();
        if (cleanName.length > 2 && !matchedFighters.some(f => cleanName.toLowerCase().includes(f.name.toLowerCase()))) {
          missingCharacters.push(cleanName);
        }
      }
    });
  }

  return {
    mode,
    prompt: text,
    scenarioName: matchedScenario?.name || 'Arena Neutral Multiversal',
    scenario: matchedScenario,
    modifiers,
    selectedOracleEvents,
    activeForms,
    charA: matchedFighters[0] || null,
    charB: matchedFighters[1] || null,
    boss: mode === 'boss' ? (matchedFighters[0] || null) : null,
    squad: mode === 'boss' ? matchedFighters.slice(1) : [],
    teamA: mode === 'team' ? matchedFighters.slice(0, Math.max(1, Math.floor(matchedFighters.length / 2))) : [],
    teamB: mode === 'team' ? matchedFighters.slice(Math.max(1, Math.floor(matchedFighters.length / 2))) : [],
    battleRoyale: mode === 'battleRoyale' ? matchedFighters : [],
    missingCharacters
  };
}

/**
 * High-Detail Character Generator Compliant with all APEX Rules
 * Creates fully featured character profiles with proper Tiers, APEX-Ki, Arsenals, Hax, and Stats.
 */
export function generateApexDetailedCharacter({
  name,
  universe = 'APEX Multiverse',
  saga = 'Saga What-If Dimensional',
  suggestedTier = '7-A',
  concept = 'Combatiente Cósmico'
}) {
  const cleanName = name || 'Guerrero Personalizado';
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const id = `custom-${slug}-${Date.now().toString(36)}`;

  // Ensure Tier is valid in TIER_ORDER
  const validTier = TIER_ORDER.includes(suggestedTier) ? suggestedTier : '7-A';
  const tierRank = getTierRank(validTier) ?? 15;
  const withinTierScore = 50;
  const powerKey = tierRank * 101 + withinTierScore;

  // Resolve APEX-Ki
  const mockChar = { id, name: cleanName, universe, tier: validTier };
  const resolved = resolveCombatState(mockChar, 'base');

  const newCharacter = {
    id,
    name: cleanName,
    alias: `El Titán de ${universe}`,
    universe,
    saga,
    version: 'Apex Custom / What-If',
    tier: validTier,
    tierExact: validTier,
    sourceKi: universe.toLowerCase().includes('dragon ball') ? 1000000 : null,
    canon_status: 'apex-custom',
    userAuthorized: true,
    temporaryForSimulation: false, // Can be saved permanently by user
    description: `Personaje sintetizado con el sistema de combate APEX para el concepto: ${concept}.`,
    statsStatus: 'custom-calibrated',
    stats: {
      ap: 0.85,
      speed: 0.82,
      durability: 0.80,
      battleIQ: 0.90,
      haxReliability: 0.75
    },
    arsenal: {
      basicAttacks: 'Secuencia de golpes de alta velocidad y ráfagas de energía comprimida.',
      superAttacks: [
        {
          id: `${id}-super-1`,
          name: `Impacto Destructor de ${cleanName.split(' ')[0]}`,
          desc: 'Golpe cinético concentrado con vector de ruptura de armadura.',
          staminaCost: 20,
          cooldownTurns: 2,
          powerModifier: 1.15,
          effects: ['armor-pierce', 'heavy-stagger']
        },
        {
          id: `${id}-super-2`,
          name: 'Descarga de Energía Hiperdimensional',
          desc: 'Ráfaga masiva que satura el campo de batalla con radiación pura.',
          staminaCost: 30,
          cooldownTurns: 3,
          powerModifier: 1.30,
          effects: ['area-of-effect', 'thermal-burn']
        }
      ],
      ultimateAttacks: [
        {
          id: `${id}-ultimate-1`,
          name: `Juicio Cósmico: Colapso de ${cleanName.split(' ')[0]}`,
          desc: 'Liberación del 100% de reservas de poder en un único impacto fulminante.',
          staminaCost: 50,
          cooldownTurns: 99,
          powerModifier: 1.65,
          effects: ['decisive-impact', 'screen-shatter']
        }
      ],
      passives: [
        {
          id: `${id}-passive-1`,
          name: 'Resonancia Adaptativa',
          desc: 'Incrementa la velocidad de reacción un 10% tras recibir daño crítico.'
        }
      ]
    },
    haxTags: ['energy-manipulation', 'adaptive-combat', 'spatial-awareness'],
    forms: [
      {
        id: `${id}-despertar`,
        name: `${cleanName} (Liberación Total)`,
        tier: validTier,
        multiplier: 2.0,
        apexKiMultiplier: 2.0,
        statModifiers: { ap: 0.15, speed: 0.15 }
      }
    ],
    weaknesses: ['Consumo acelerado de stamina al mantener la liberación de poder'],
    feats: ['Generado y calibrado por el motor APEX Power Scaling'],
    psychology: 'Estratega disciplinado con alta determinación de combate.'
  };

  return newCharacter;
}
