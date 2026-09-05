/**
 * APEX Powerscaling Engine — Simulation Contracts & Governance V2
 * 
 * Strict Three-Layer Architecture:
 * - Layer 1: Canonical Roster Fact (permanent_roster, immutable, V25)
 * - Layer 2: Scenario & Oracle Event (simulation_only, phase 1-4, non-mutating)
 * - Layer 3: Simulation Outcome (simulation_only, isolated, promotes to CampaignState only on explicit user request)
 * 
 * Determinism: same snapshot + same randomSeed + same engineVersion = same structured outcome.
 */

export const ENGINE_VERSION_V2 = '2.0.0';
export const RULESET_VERSION_V2 = '2.0.0';
export const ROSTER_VERSION_CANONICAL = 'V25';

/**
 * 1. ACTION & SOURCE TAXONOMY (Layer Classification)
 */
export const SOURCE_TYPES = {
  CANON_ROSTER_FACT: 'canon_roster_fact',
  ORACLE_SCENARIO_EVENT: 'oracle_scenario_event',
  SIMULATION_OUTCOME: 'simulation_outcome',
  ORACLE_CANONICAL_AWAKENING: 'oracle_canonical_awakening',
  ORACLE_TRANSCENDENT_WHAT_IF: 'oracle_transcendent_what_if'
};

export const ACTION_SOURCES = [
  'roster_form',
  'roster_arsenal',
  'roster_hax',
  'external_entity_framework',
  'scenario_modifier',
  'oracle_scenario_event',
  'oracle_canonical_awakening',
  'oracle_transcendent_what_if',
  'narrative_outcome'
];

export const PERSISTENCE_MODES = {
  PERMANENT_ROSTER: 'permanent_roster',
  SIMULATION_ONLY: 'simulation_only',
  CAMPAIGN_SAVED: 'campaign_saved'
};

export const UI_BADGES = {
  ROSTER_V25: { label: 'ROSTER V25', color: 'cyan', type: 'canon' },
  ORACLE_SCENARIO_EVENT: { label: 'ORÁCULO — EVENTO DE ESCENARIO', color: 'fuchsia', type: 'scenario' },
  ORACLE_CANONICAL_AWAKENING: { label: 'ORÁCULO — DESPERTAR CANÓNICO', color: 'amber', type: 'awakening' },
  ORACLE_TRANSCENDENT_WHAT_IF: { label: 'ORÁCULO — DESPERTAR TRASCENDENTE', color: 'purple', type: 'awakening' },
  ORACLE_CANONICAL_FUSION: { label: 'ORÁCULO — FUSIÓN CANÓNICA', color: 'emerald', type: 'fusion' },
  ORACLE_WHATIF_FUSION: { label: 'ORÁCULO — FUSIÓN WHAT-IF HÍBRIDA', color: 'violet', type: 'fusion' },
  ORACLE_FORBIDDEN_FINISHER: { label: 'ORÁCULO — FINISHER LIBERADO', color: 'rose', type: 'finisher' },
  ORACLE_EVENT_ENTITY: { label: 'ORÁCULO — ENTIDAD TEMPORAL', color: 'blue', type: 'entity' },
  SIMULATION_OUTCOME: { label: 'SIMULACIÓN — CONSECUENCIA NO PERSISTENTE', color: 'slate', type: 'outcome' },
  CAMPAIGN_SAVED: { label: 'CAMPAÑA — CONSECUENCIA GUARDADA', color: 'gold', type: 'campaign' }
};

/**
 * 2. THE 4 ORACLE FAMILIES
 */
export const ORACLE_FAMILIES = {
  ENVIRONMENT_PHYSICS: {
    id: 'environment_physics',
    name: 'Entorno y Física',
    icon: 'Globe',
    events: [
      {
        id: 'arena-collapse-zero-gravity',
        slug: 'map_collapse',
        name: 'Colapso de Arena & Gravedad Cero',
        phase: 3,
        risk: 'Medio',
        mechanicalEffect: 'Destrucción total del suelo firme. Microgravedad 0G, penaliza desplazamiento terrestre y premia vuelo cósmico.',
        narrativeDesc: 'La arena sufre un colapso tectónico-gravitatorio masivo.',
        duration: 'Resto del combate',
        persistence: 'simulation_only'
      },
      {
        id: 'localized-time-dilation',
        slug: 'time_dilation',
        name: 'Dilatación Temporal Localizada',
        phase: 3,
        risk: 'Medio',
        mechanicalEffect: 'Burbuja de tiempo desacoplado. Desfase de iniciativa del 50% entre zonas de combate.',
        narrativeDesc: 'El flujo cronológico se desincroniza abruptamente.',
        duration: '30 segundos / 2 turnos',
        persistence: 'simulation_only'
      },
      {
        id: 'space-time-failure',
        slug: 'dimensional_shift',
        name: 'Falla Espacio-Temporal',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Ruptura del tejido dimensional. Salto de escenario o distorsión de proyectiles.',
        narrativeDesc: 'Se abre una fisura en el tejido dimensional.',
        duration: 'Inmediata con secuela',
        persistence: 'simulation_only'
      },
      {
        id: 'runaway-ki-supernova',
        slug: 'energy_supernova',
        name: 'Supernova de Ki Desbocado',
        phase: 3,
        risk: 'Catastrófico',
        mechanicalEffect: 'Detonación global de energía. Daño de área masivo que exige guardia perfecta o barrera.',
        narrativeDesc: 'Puntos calientes de energía condensada estallan simultáneamente.',
        duration: 'Instantáneo',
        persistence: 'simulation_only'
      },
      {
        id: 'corruption-berserk-miasma',
        slug: 'miasma_corruption',
        name: 'Miasma de Corrupción / Berserk',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Niebla de energía hostil. +30% AP ofensivo a costa de perder guardia y control defensivo.',
        narrativeDesc: 'Una bruma corrosiva invade el entorno incitando violencia ciega.',
        duration: 'Fase 3 completa',
        persistence: 'simulation_only'
      }
    ]
  },
  CHARACTER_INTERVENTION: {
    id: 'character_intervention',
    name: 'Intervención de Personajes',
    icon: 'Users',
    events: [
      {
        id: 'same-verse-canon-invader',
        slug: 'same_verse_reinforcement',
        name: 'Invasor del Mismo Verso (Canon)',
        phase: 3,
        risk: 'Medio',
        mechanicalEffect: 'Aparición de un guerrero canónico compatible. Evalúa lealtad, asiste a un bando o ataca a todos.',
        narrativeDesc: 'Un combatiente de la misma franquicia irrumpe en el escenario.',
        duration: 'Hasta resolución o expulsión',
        persistence: 'simulation_only'
      },
      {
        id: 'multiversal-surprise-warrior',
        slug: 'multiverse_random_fighter',
        name: 'Guerrero Multiversal Sorpresa',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Incursión crossover de otra dimensión. Introduce dinámicas impredecibles de scaling.',
        narrativeDesc: 'Una fractura dimensional deposita a un contendiente imprevisto.',
        duration: 'Hasta resolución o expulsión',
        persistence: 'simulation_only'
      },
      {
        id: 'third-faction-invader',
        slug: 'third_party',
        name: 'Invasor de 3ra Facción / Titán Cósmico',
        phase: 3,
        risk: 'Catastrófico',
        mechanicalEffect: 'Entidad colosal o kaiju hostil a ambos bandos. Fuerza treguas temporales o esquivas coordinadas.',
        narrativeDesc: 'Una monstruosidad cósmica o facción enemiga invade el campo.',
        duration: 'Fases 3 y 4',
        persistence: 'simulation_only'
      },
      {
        id: 'mirror-paradox-doppelganger',
        slug: 'shadow_clone',
        name: 'Paradoja del Espejo (Doppelgänger)',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Manifiesta una réplica oscura temporal con 50% de HP/stamina y arsenal reflejo.',
        narrativeDesc: 'El espacio refleja una silueta idéntica pero hostil de uno de los combatientes.',
        duration: '2 turnos de clímax',
        persistence: 'simulation_only'
      }
    ]
  },
  POWER_EVOLUTION: {
    id: 'power_evolution',
    name: 'Evolución y Poder',
    icon: 'Zap',
    events: [
      {
        id: 'canonical-awakening',
        slug: 'miracle_form_canon',
        name: 'Despertar Canónico (+1 Forma Lógica de Saga)',
        phase: 3,
        risk: 'Medio',
        mechanicalEffect: 'Desbloquea temporalmente la forma inmediata siguiente coherente con la saga del combatiente.',
        narrativeDesc: 'Al borde del colapso, el guerrero despierta el siguiente estadio de su línea de transformación.',
        duration: 'Resto del combate',
        persistence: 'simulation_only'
      },
      {
        id: 'transcendent-awakening',
        slug: 'miracle_form_transcendent',
        name: 'Despertar Trascendente (Forma Máxima / What-If)',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Ruptura de límites de era: acceso a forma divina o suprema apex-custom.',
        narrativeDesc: 'Una trascendencia mística rompe los techos de poder convencionales.',
        duration: 'Fase 3 y Clímax (desgaste crítico)',
        persistence: 'simulation_only'
      },
      {
        id: 'forbidden-finisher-awakening',
        slug: 'miracle_technique_awakening',
        name: 'Despertar de Super Técnica / Finisher Prohibido',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Liberación de técnica suprema de uso único con alto coste de stamina y riesgo de rebote.',
        narrativeDesc: 'Se ejecuta un juramento marcial o maniobra prohibida definitiva.',
        duration: '1 solo impacto / turno 11-16',
        persistence: 'simulation_only'
      },
      {
        id: 'divine-blessing-shield',
        slug: 'divine_blessing',
        name: 'Bendición Divina (Escudo 1 Uso)',
        phase: 3,
        risk: 'Bajo',
        mechanicalEffect: 'Intervención de una deidad superior que anula un impacto letal o crítico.',
        narrativeDesc: 'Un aura sagrada absorbe un golpe fatal protegiendo el núcleo vital.',
        duration: '1 solo uso',
        persistence: 'simulation_only'
      },
      {
        id: 'temporary-hax-nullification',
        slug: 'hax_failure',
        name: 'Anulación Catastrófica de Hax (30s)',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Supresión de habilidades conceptuales, dominios y magia: el duelo se resuelve en puro físico.',
        narrativeDesc: 'Una onda de choque anti-sobrenatural apaga los poderes conceptuales.',
        duration: '30 segundos / 2 turnos',
        persistence: 'simulation_only'
      }
    ]
  },
  FUSION_ABSORPTION_ALTERATION: {
    id: 'fusion_absorption_alteration',
    name: 'Fusión, Absorción y Alteración',
    icon: 'Flame',
    events: [
      {
        id: 'canonical-fusion',
        slug: 'fusion_protocol_canon',
        name: 'Fusión Canónica en Batalla (Potara / Metamoru)',
        phase: 3,
        risk: 'Medio',
        mechanicalEffect: 'Unión de 2 aliados mediante pendientes Potara o danza Metamoru con fórmula determinista fija.',
        narrativeDesc: 'Bajo presión crítica, los aliados coordinan una fusión legendaria.',
        duration: '30 min ficticios o resto del combate',
        persistence: 'simulation_only'
      },
      {
        id: 'what-if-hybrid-fusion',
        slug: 'fusion_protocol_whatif',
        name: 'Fusión What-If Híbrida',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Fusión crossover de combatientes sin vínculo canónico previo. Suma de arsenales con riesgo de desfusión.',
        narrativeDesc: 'Una combinación hipotética crea un ser compuesto inédito.',
        duration: 'Inestable / 10 turnos',
        persistence: 'simulation_only'
      },
      {
        id: 'cell-absorption',
        slug: 'cell_bio_absorption',
        name: 'Absorción Anatómica de Cell',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Bio-absorción de biomasa o androides para evolución morfológica condicional con opción de escape.',
        narrativeDesc: 'El aguijón bio-mecánico atrapa y consume a su presa para ascender de forma.',
        duration: 'Permanente dentro de la simulación',
        persistence: 'simulation_only'
      },
      {
        id: 'majin-buu-absorption',
        slug: 'buu_viscous_absorption',
        name: 'Absorción de Majin Buu',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Envoltura viscosa con asimilación de técnicas y vestimenta del objetivo absorbido.',
        narrativeDesc: 'Un fragmento desprendido de masa rosada envuelve y fagocita al oponente.',
        duration: 'Reversible por corte de antenas',
        persistence: 'simulation_only'
      },
      {
        id: 'baby-parasitation',
        slug: 'baby_tsufur_parasitism',
        name: 'Parasitación & Súbditos Tsufur de Baby',
        phase: 3,
        risk: 'Alto',
        mechanicalEffect: 'Infección celular por heridas abiertas. Control biomecánico condicional sobre el huésped.',
        narrativeDesc: 'El parásito Tsufur se licúa y penetra en las incisiones corporales de su víctima.',
        duration: 'Condicional a purificación o extracción',
        persistence: 'simulation_only'
      }
    ]
  }
};

/**
 * 3. DETERMINISTIC PRNG (Mulberry32)
 */
export function createDeterministicPRNG(seedInput) {
  let a;
  if (typeof seedInput === 'number') {
    a = seedInput >>> 0;
  } else if (typeof seedInput === 'string') {
    let hash = 0;
    for (let i = 0; i < seedInput.length; i++) {
      hash = ((hash << 5) - hash + seedInput.charCodeAt(i)) | 0;
    }
    a = hash >>> 0;
  } else {
    a = 123456789;
  }

  return function next() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 4. FACTORY: SimulationSnapshotV2 (Frozen pre-simulation state)
 */
export function createSimulationSnapshotV2({
  simulationId = ('sim-' + Date.now()),
  rosterHash = null,
  rulesetVersion = RULESET_VERSION_V2,
  mode = 'MODO VS',
  objective = 'Victoria por incapacitación o sumisión',
  arena = {},
  verseEqualization = { speed: 'canon', stats: 'canon', energy: 'isolated' },
  teamConfiguration = { format: '1v1', teamASize: 1, teamBSize: 1 },
  participants = [],
  selectedRosterForms = {},
  selectedExternalEntities = {},
  scenarioModifiers = {},
  oracleEvents = [],
  customOracleCondition = '',
  forbiddenActions = [],
  randomSeed = Math.floor(Math.random() * 1000000),
  narrativeIntensity = 'Equilibrado',
  outcomePersistence = PERSISTENCE_MODES.SIMULATION_ONLY
} = {}) {
  const validatedParticipants = participants.map((p, idx) => ({
    participantId: p.participantId || p.id || ('p-' + idx),
    recordId: p.recordId || p.id || ('char-' + idx),
    displayName: p.displayName || p.name || Combatiente ,
    continuity: p.continuity || p.universe || 'Dragon Ball',
    selectedFormId: p.selectedFormId || p.formId || 'base',
    selectedFormName: p.selectedFormName || p.formName || 'Forma Base',
    rosterKiNumeric: p.rosterKiNumeric || p.baseKiNumeric || 0,
    rosterKiDisplay: p.rosterKiDisplay || p.apexKiDisplay || '—',
    rosterTier: p.rosterTier || p.tier || '10-C',
    rosterMultiplier: p.rosterMultiplier || p.formMultiplier || 1,
    allowedArsenal: Array.isArray(p.allowedArsenal) ? p.allowedArsenal : (p.arsenal || []),
    allowedHax: Array.isArray(p.allowedHax) ? p.allowedHax : (p.haxTags || []),
    allowedExternalEntities: Array.isArray(p.allowedExternalEntities) ? p.allowedExternalEntities : [],
    initialHp: typeof p.initialHp === 'number' ? p.initialHp : 100,
    initialStamina: typeof p.initialStamina === 'number' ? p.initialStamina : 100,
    teamId: p.teamId || (idx === 0 ? 'team-a' : 'team-b'),
    role: p.role || 'striker',
    sourceType: SOURCE_TYPES.CANON_ROSTER_FACT,
    persistence: PERSISTENCE_MODES.PERMANENT_ROSTER,
    mutableDuringSimulation: false
  }));

  return Object.freeze({
    simulationId,
    createdAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION_V2,
    rosterVersion: ROSTER_VERSION_CANONICAL,
    rosterHash: rosterHash || 'ROSTER_V25_CANONICAL',
    rulesetVersion,
    mode,
    objective,
    arena: {
      name: arena.name || 'Arena Neutral Estándar',
      universe: arena.universe || 'Neutro',
      gravity: arena.gravity || '1G',
      terrainEffect: arena.terrainEffect || 'Sin peligros adicionales',
      temperature: arena.temperature || 'Templada (22°C)'
    },
    verseEqualization,
    teamConfiguration,
    participants: validatedParticipants,
    selectedRosterForms,
    selectedExternalEntities,
    scenarioModifiers,
    oracleEvents: Array.isArray(oracleEvents) ? oracleEvents : [],
    customOracleCondition: String(customOracleCondition || '').trim(),
    forbiddenActions: Array.isArray(forbiddenActions) ? forbiddenActions : [],
    randomSeed,
    narrativeIntensity,
    outcomePersistence,
    sourceType: SOURCE_TYPES.ORACLE_SCENARIO_EVENT
  });
}

/**
 * 5. FACTORY: CombatState (Unified runtime state)
 */
export function createCombatState({
  hp = 100,
  maxHp = 100,
  stamina = 100,
  maxStamina = 100,
  kiReserve = 100,
  activeForm = 'base',
  activePowerTree = 'standard',
  activeBuffs = [],
  activeDebuffs = [],
  injuries = [],
  combatCapabilities = {
    canUseTwoHands: true,
    movementEfficiency: 1.0,
    perceptionEfficiency: 1.0,
    reactionEfficiency: 1.0
  },
  haxStates = {},
  externalEntities = [],
  objectiveStatus = 'in_progress',
  timelineStatus = 'stable'
} = {}) {
  return {
    hp: Math.max(0, Math.min(maxHp, hp)),
    maxHp,
    stamina: Math.max(0, Math.min(maxStamina, stamina)),
    maxStamina,
    kiReserve,
    activeForm,
    activePowerTree,
    activeBuffs: [...activeBuffs],
    activeDebuffs: [...activeDebuffs],
    injuries: [...injuries],
    combatCapabilities: { ...combatCapabilities },
    haxStates: { ...haxStates },
    externalEntities: [...externalEntities],
    objectiveStatus,
    timelineStatus
  };
}

/**
 * 6. FACTORY: TemporalAwakeningState (Canonical or Transcendent Phase 3)
 */
export function createTemporalAwakeningState({
  eventFormId,
  displayName,
  source = SOURCE_TYPES.ORACLE_CANONICAL_AWAKENING,
  phase = 3,
  logicalSagaStep = null,
  activationReason = 'Punto crítico de supervivencia en Fase 3',
  baseReference = null,
  calculationFormula = null,
  temporaryMultiplier = 1,
  temporaryKi = null,
  temporaryTier = null,
  durationPolicy = 'Clímax de simulación (Fases 3 y 4)',
  staminaCost = 35,
  injuryTradeoff = 'Agotamiento severo al disiparse',
  reasoningSummary = ''
}) {
  const isCanonical = source === SOURCE_TYPES.ORACLE_CANONICAL_AWAKENING;
  return {
    eventFormId: eventFormId || ('awakening-' + Date.now()),
    displayName,
    source,
    label: isCanonical ? UI_BADGES.ORACLE_CANONICAL_AWAKENING.label : UI_BADGES.ORACLE_TRANSCENDENT_WHAT_IF.label,
    phase,
    logicalSagaStep,
    activationReason,
    baseReference,
    calculationFormula: calculationFormula || ((baseReference || 'Base') + ' × ' + temporaryMultiplier),
    temporaryMultiplier,
    temporaryKi,
    temporaryTier,
    durationPolicy,
    staminaCost,
    injuryTradeoff,
    reasoningSummary,
    temporary: true,
    persistsToRoster: false,
    persistsToTimeline: false,
    persistence: PERSISTENCE_MODES.SIMULATION_ONLY
  };
}

export const FUSION_NAME_ORIGINS = {
  CANONICAL_ALIAS: 'canonical_alias',
  USER_NAMED: 'user_named',
  DETERMINISTIC_GENERATED: 'deterministic_generated',
  ORACLE_WHAT_IF_NAME: 'oracle_what_if_name'
};

export const FUSION_IDENTITY_STATUS = {
  VALID_CANONICAL: 'VALID_CANONICAL',
  VALID_USER_NAMED: 'VALID_USER_NAMED',
  VALID_DETERMINISTIC: 'VALID_DETERMINISTIC',
  VALID_WHAT_IF: 'VALID_WHAT_IF',
  CORRECTED_MISMATCH: 'CORRECTED_MISMATCH'
};

export function isGokuOrKakarotto(identifier = '') {
  const s = String(identifier).toLowerCase();
  return (s.includes('goku') || s.includes('kakarotto') || s.includes('kakaroto')) &&
         !s.includes('gokua') && !s.includes('black');
}

export function isVegeta(identifier = '') {
  const s = String(identifier).toLowerCase();
  return s.includes('vegeta') && !s.includes('tarble') && !s.includes('rey') && !s.includes('king');
}

export function isRaditz(identifier = '') {
  const s = String(identifier).toLowerCase();
  return s.includes('raditz');
}

export function isGoten(identifier = '') {
  const s = String(identifier).toLowerCase();
  return s.includes('goten') && !s.includes('gotenks');
}

export function isTrunks(identifier = '') {
  const s = String(identifier).toLowerCase();
  return s.includes('trunks');
}

export function isKale(identifier = '') {
  const s = String(identifier).toLowerCase();
  return s.includes('kale');
}

export function isCaulifla(identifier = '') {
  const s = String(identifier).toLowerCase();
  return s.includes('caulifla');
}

export function validateKnownFusionAlias(nameToCheck = '', ids = [], names = [], method = 'potara') {
  const s = String(nameToCheck).toLowerCase();
  const allIdentifiers = [...ids, ...names].map(x => String(x).toLowerCase());

  const hasGoku = allIdentifiers.some(isGokuOrKakarotto);
  const hasVegeta = allIdentifiers.some(isVegeta);
  const hasGoten = allIdentifiers.some(isGoten);
  const hasTrunks = allIdentifiers.some(isTrunks);
  const hasKale = allIdentifiers.some(isKale);
  const hasCaulifla = allIdentifiers.some(isCaulifla);

  const m = String(method).toLowerCase();
  const isMetamoru = m.includes('metamoru') || m.includes('dance');
  const isPotara = m.includes('potara');

  if (s.includes('vegetto') || s.includes('vegito')) {
    if (!hasGoku || !hasVegeta) {
      return { valid: false, required: 'Goku/Kakarotto + Vegeta', reason: 'Componentes incompatibles para alias Vegetto/Vegito' };
    }
    if (!isPotara && !m.includes('fusion')) {
      return { valid: false, required: 'Método Potara', reason: 'Vegetto requiere método Potara' };
    }
    return { valid: true, alias: 'Vegetto' };
  }

  if (s.includes('gogeta')) {
    if (!hasGoku || !hasVegeta) {
      return { valid: false, required: 'Goku/Kakarotto + Vegeta', reason: 'Componentes incompatibles para alias Gogeta' };
    }
    if (!isMetamoru) {
      return { valid: false, required: 'Método Metamoru (Danza Fusión)', reason: 'Gogeta requiere método Metamoru' };
    }
    return { valid: true, alias: 'Gogeta' };
  }

  if (s.includes('gotenks')) {
    if (!hasGoten || !hasTrunks) {
      return { valid: false, required: 'Goten + Trunks', reason: 'Componentes incompatibles para alias Gotenks' };
    }
    return { valid: true, alias: 'Gotenks' };
  }

  if (s.includes('kefla') || s.includes('kafla')) {
    if (!hasKale || !hasCaulifla) {
      return { valid: false, required: 'Kale + Caulifla', reason: 'Componentes incompatibles para alias Kefla' };
    }
    return { valid: true, alias: 'Kefla' };
  }

  return { valid: true, alias: null };
}

export function deriveDeterministicFusionName({
  componentRecordIds = [],
  componentDisplayNames = [],
  fusionMethod = 'potara',
  userDefinedName = null,
  isWhatIf = false,
  universeTag = ''
}) {
  if (userDefinedName && typeof userDefinedName === 'string' && userDefinedName.trim().length > 0) {
    return {
      derivedFusionName: userDefinedName.trim(),
      nameOrigin: FUSION_NAME_ORIGINS.USER_NAMED,
      identityValidationStatus: FUSION_IDENTITY_STATUS.VALID_USER_NAMED
    };
  }

  const ids = Array.isArray(componentRecordIds) ? componentRecordIds : [];
  const names = Array.isArray(componentDisplayNames) ? componentDisplayNames : [];
  const allIdentifiers = [...ids, ...names].map(x => String(x).toLowerCase());

  const hasGoku = allIdentifiers.some(isGokuOrKakarotto);
  const hasVegeta = allIdentifiers.some(isVegeta);
  const hasRaditz = allIdentifiers.some(isRaditz);
  const hasGoten = allIdentifiers.some(isGoten);
  const hasTrunks = allIdentifiers.some(isTrunks);
  const hasKale = allIdentifiers.some(isKale);
  const hasCaulifla = allIdentifiers.some(isCaulifla);

  const m = String(fusionMethod || 'potara').toLowerCase();
  const isPotara = m.includes('potara');
  const isMetamoru = m.includes('metamoru') || m.includes('dance');
  const methodLabel = isPotara ? 'Potara' : (isMetamoru ? 'Metamoru' : (isWhatIf ? 'Fusión What-If Híbrida' : 'Fusión'));

  const uTag = universeTag ? ` ${universeTag}` : '';

  // Canonical Goku + Vegeta
  if (hasGoku && hasVegeta && ids.length <= 2) {
    if (isPotara) {
      return {
        derivedFusionName: `Vegetto${uTag} (Potara)`,
        nameOrigin: FUSION_NAME_ORIGINS.CANONICAL_ALIAS,
        identityValidationStatus: FUSION_IDENTITY_STATUS.VALID_CANONICAL
      };
    } else if (isMetamoru) {
      return {
        derivedFusionName: `Gogeta${uTag} (Metamoru)`,
        nameOrigin: FUSION_NAME_ORIGINS.CANONICAL_ALIAS,
        identityValidationStatus: FUSION_IDENTITY_STATUS.VALID_CANONICAL
      };
    } else {
      return {
        derivedFusionName: `Vegetto${uTag} (${methodLabel})`,
        nameOrigin: FUSION_NAME_ORIGINS.CANONICAL_ALIAS,
        identityValidationStatus: FUSION_IDENTITY_STATUS.VALID_CANONICAL
      };
    }
  }

  // Canonical Goten + Trunks
  if (hasGoten && hasTrunks && ids.length <= 2) {
    return {
      derivedFusionName: `Gotenks${uTag} (${methodLabel})`,
      nameOrigin: FUSION_NAME_ORIGINS.CANONICAL_ALIAS,
      identityValidationStatus: FUSION_IDENTITY_STATUS.VALID_CANONICAL
    };
  }

  // Canonical Kale + Caulifla
  if (hasKale && hasCaulifla && ids.length <= 2) {
    return {
      derivedFusionName: `Kefla${uTag} (${methodLabel})`,
      nameOrigin: FUSION_NAME_ORIGINS.CANONICAL_ALIAS,
      identityValidationStatus: FUSION_IDENTITY_STATUS.VALID_CANONICAL
    };
  }

  // Kakarotto / Goku + Raditz
  if (hasGoku && hasRaditz && ids.length <= 2) {
    return {
      derivedFusionName: `Kakaditz${uTag} (${methodLabel})`,
      nameOrigin: isWhatIf ? FUSION_NAME_ORIGINS.ORACLE_WHAT_IF_NAME : FUSION_NAME_ORIGINS.DETERMINISTIC_GENERATED,
      identityValidationStatus: isWhatIf ? FUSION_IDENTITY_STATUS.VALID_WHAT_IF : FUSION_IDENTITY_STATUS.VALID_DETERMINISTIC
    };
  }

  // Vegeta + Raditz
  if (hasVegeta && hasRaditz && ids.length <= 2) {
    return {
      derivedFusionName: `Raditzgeta${uTag} (${methodLabel})`,
      nameOrigin: isWhatIf ? FUSION_NAME_ORIGINS.ORACLE_WHAT_IF_NAME : FUSION_NAME_ORIGINS.DETERMINISTIC_GENERATED,
      identityValidationStatus: isWhatIf ? FUSION_IDENTITY_STATUS.VALID_WHAT_IF : FUSION_IDENTITY_STATUS.VALID_DETERMINISTIC
    };
  }

  // Generic deterministic portmanteau
  const cleanA = (names[0] || ids[0] || 'Guerrero1').replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '').trim();
  const cleanB = (names[1] || ids[1] || 'Guerrero2').replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '').trim();
  const partA = cleanA.slice(0, Math.max(3, Math.ceil(cleanA.length / 2)));
  const partB = cleanB.slice(Math.floor(cleanB.length / 2));
  const generated = `${partA}${partB}`;

  return {
    derivedFusionName: `${generated}${uTag} (${methodLabel})`,
    nameOrigin: isWhatIf ? FUSION_NAME_ORIGINS.ORACLE_WHAT_IF_NAME : FUSION_NAME_ORIGINS.DETERMINISTIC_GENERATED,
    identityValidationStatus: isWhatIf ? FUSION_IDENTITY_STATUS.VALID_WHAT_IF : FUSION_IDENTITY_STATUS.VALID_DETERMINISTIC
  };
}

/**
 * 7. FACTORY: FusionCombatState (Potara, Metamoru or What-If Hybrid)
 * Reinforced with strict semantic identity, component validation, and alias anti-hijacking.
 */
export function createFusionCombatState({
  fusionId,
  displayName,
  components = [],
  componentRecordIds = [],
  componentDisplayNames = [],
  derivedFusionName = null,
  nameOrigin = null,
  identityValidationStatus = null,
  appearanceRecipe = null,
  inheritedAbilityMap = null,
  userDefinedName = null,
  fusionMethod = 'potara',
  phase = 3,
  baseCalculation = 'Suma armónica de bases Saiyajin',
  fusionMultiplier = 40,
  temporaryKi = null,
  temporaryTier = null,
  inheritedForms = [],
  inheritedArsenal = [],
  inheritedHax = [],
  inheritedLimitations = [],
  durationPolicy = '30 minutos de tiempo de combate o agotamiento masivo de Ki',
  staminaPolicy = 'Reserva dual fusionada con drenaje x2 en formas supremas',
  regenerationPolicy = 'Hereda factor de curación del componente dominante',
  defeatPolicy = 'Desfusión inmediata o incapacitación simultánea',
  universeTag = ''
}) {
  const isWhatIf = fusionMethod === 'what_if_hybrid';

  // 1. Resolve component IDs and Display Names
  const resolvedRecordIds = [...componentRecordIds];
  const resolvedDisplayNames = [...componentDisplayNames];

  if (resolvedRecordIds.length === 0 && Array.isArray(components)) {
    components.forEach(comp => {
      if (typeof comp === 'string') {
        resolvedDisplayNames.push(comp);
        resolvedRecordIds.push(comp.toLowerCase().replace(/\s+/g, '-'));
      } else if (comp && typeof comp === 'object') {
        const id = comp.id || comp.recordId || comp.combatantId || 'unknown-id';
        const name = comp.name || comp.displayName || id;
        resolvedRecordIds.push(id);
        resolvedDisplayNames.push(name);
      }
    });
  }

  // Detect universe tag if present in names (e.g. U13)
  let uTag = universeTag;
  if (!uTag) {
    const hasU13 = resolvedDisplayNames.some(n => String(n).includes('13')) || resolvedRecordIds.some(id => String(id).includes('u13'));
    if (hasU13) uTag = 'U13';
  }

  // 2. Derive deterministic name and check aliases
  const derived = deriveDeterministicFusionName({
    componentRecordIds: resolvedRecordIds,
    componentDisplayNames: resolvedDisplayNames,
    fusionMethod,
    userDefinedName,
    isWhatIf,
    universeTag: uTag
  });

  let finalDisplayName = displayName || derived.derivedFusionName;
  let finalDerivedName = derivedFusionName || derived.derivedFusionName;
  let finalNameOrigin = nameOrigin || derived.nameOrigin;
  let finalValidationStatus = identityValidationStatus || derived.identityValidationStatus;
  let correctionReport = null;

  // 3. Validation against illegal known alias hijacking (Vegetto, Gogeta, Gotenks, Kefla)
  const aliasCheck = validateKnownFusionAlias(finalDisplayName, resolvedRecordIds, resolvedDisplayNames, fusionMethod);
  if (!aliasCheck.valid) {
    correctionReport = {
      mismatchDetected: true,
      prohibitedNameRequested: finalDisplayName,
      substitutionName: finalDerivedName,
      reason: aliasCheck.reason,
      requiredComponents: aliasCheck.required
    };
    finalDisplayName = finalDerivedName;
    finalValidationStatus = FUSION_IDENTITY_STATUS.CORRECTED_MISMATCH;
  }

  // 4. Build appearance recipe if not provided
  let finalAppearance = appearanceRecipe;
  if (!finalAppearance) {
    if (fusionMethod === 'potara') {
      finalAppearance = `Pendientes Potara de los Kaio-Shin en las orejas, vestimenta combinada de ${resolvedDisplayNames[0] || 'Componente 1'} y ${resolvedDisplayNames[1] || 'Componente 2'} con aura unificada.`;
    } else if (fusionMethod === 'metamoru') {
      finalAppearance = `Chaleco Metamoru negro y dorado con hombreras acolchadas, pantalón blanco de tela y aura flameante de la Danza de la Fusión.`;
    } else {
      finalAppearance = `Fusión híbrida What-If: amalgama anatómica y fisonómica entrelazada de ${resolvedDisplayNames[0] || 'Guerrero 1'} y ${resolvedDisplayNames[1] || 'Guerrero 2'}.`;
    }
  }

  // 5. Build inherited ability map if not provided
  let finalAbilityMap = inheritedAbilityMap;
  if (!finalAbilityMap || Object.keys(finalAbilityMap).length === 0) {
    finalAbilityMap = {};
    resolvedRecordIds.forEach((id, idx) => {
      const name = resolvedDisplayNames[idx] || id;
      finalAbilityMap[id] = [`Arsenal característico de ${name}`, `Frecuencia de Ki de ${name}`];
    });
  }

  return {
    fusionId: fusionId || ('fusion-' + Date.now()),
    displayName: finalDisplayName,
    derivedFusionName: finalDerivedName,
    nameOrigin: finalNameOrigin,
    identityValidationStatus: finalValidationStatus,
    componentRecordIds: resolvedRecordIds,
    componentDisplayNames: resolvedDisplayNames,
    components: resolvedDisplayNames.length > 0 ? [...resolvedDisplayNames] : [...components],
    appearanceRecipe: finalAppearance,
    inheritedAbilityMap: finalAbilityMap,
    correctionReport,
    fusionMethod,
    source: SOURCE_TYPES.ORACLE_SCENARIO_EVENT,
    label: isWhatIf ? UI_BADGES.ORACLE_WHATIF_FUSION.label : UI_BADGES.ORACLE_CANONICAL_FUSION.label,
    phase,
    baseCalculation,
    fusionMultiplier,
    temporaryKi,
    temporaryTier,
    inheritedForms: [...inheritedForms],
    inheritedArsenal: [...inheritedArsenal],
    inheritedHax: [...inheritedHax],
    inheritedLimitations: [...inheritedLimitations],
    durationPolicy,
    staminaPolicy,
    regenerationPolicy,
    defeatPolicy,
    temporary: true,
    persistsToRoster: false,
    persistsToTimeline: false,
    persistence: PERSISTENCE_MODES.SIMULATION_ONLY,
    // ── COMPONENT AVAILABILITY STATUS ──────────────────────────────────────
    // Marks each component combatant as CONSUMED by the fusion.
    // Once merged, Goku and Vegeta DO NOT EXIST as independent actors.
    // Rule 15: engine must reject any combat action from these recordIds
    //          while this fusion entity is alive and active.
    componentAvailabilityStatus: resolvedRecordIds.map(id => ({
      recordId: id,
      status: 'fused',
      unavailableAsIndividualActor: true,
      unavailableUntilDefusion: true,
      canContributeToGenkidama: false,
      canActIndependently: false,
      reason: `Absorbido en fusión: ${fusionId}. Solo existe como parte de la entidad fusionada.`
    }))
  };
}

/**
 * 8. FACTORY: EventEntityState (Dr. Raichi Broly/Hatchiyack in Oracle Mode)
 */
export function createEventEntityState({
  entityId,
  oracleEventId = 'multiverse_random_fighter',
  displayName,
  combatRole = 'external_striker_or_raid_threat',
  temporaryKiPolicy = 'Aislado por completo del cuerpo de su invocador',
  temporaryTierPolicy = 'Escala individual fija según feat canónico',
  counterplay = 'Destruir el orbe o núcleo de manifestación',
  ownerRecordId = null
}) {
  return {
    entityId: entityId || ('event-entity-' + Date.now()),
    entityType: 'event_entity',
    source: SOURCE_TYPES.ORACLE_SCENARIO_EVENT,
    label: UI_BADGES.ORACLE_EVENT_ENTITY.label,
    oracleEventId,
    displayName,
    combatRole,
    ownerRecordId,
    temporaryKiPolicy,
    temporaryTierPolicy,
    counterplay,
    temporary: true,
    simulationDesignOnly: true,
    bodyStatIsolation: true,
    canMutateOwnerBodyStats: false,
    persistsToRoster: false,
    persistence: PERSISTENCE_MODES.SIMULATION_ONLY
  };
}


/**
 * 8b. FACTORY: AbsorptionState (Bio-Absorption by Majin Buu or similar entities)
 * When a character is absorbed, they cease to exist as independent actors.
 * Rule 16: engine must refuse any independent action from absorbedRecordId.
 */
export function createAbsorptionState({
  absorberRecordId,
  absorbedRecordId,
  absorbedDisplayName,
  absorberDisplayName,
  resultantEntityId = null,
  resultantEntityDisplayName = null,
  absorptionMethod = 'buu_viscous'
}) {
  return {
    absorberRecordId,
    absorbedRecordId,
    absorbedDisplayName,
    absorberDisplayName,
    resultantEntityId: resultantEntityId || (absorberRecordId + '-post-' + absorbedRecordId.replace(/[^a-z0-9]/gi, '')),
    resultantEntityDisplayName: resultantEntityDisplayName || (absorberDisplayName + ' [Absorbido: ' + absorbedDisplayName + ']'),
    absorptionMethod,
    // ── STATUS FLAGS ──────────────────────────────────────────────────────────
    absorbedActorStatus: 'absorbed',
    absorbedIndependentActorAvailable: false,
    absorbedCanActIndependently: false,
    absorbedCanUseTechniques: false,
    absorbedCanContributeEnergy: false,
    absorbedPresenceAs: 'inner_voice_only',
    absorbedPhysicalAutonomy: false,
    // The absorber GAINS a power boost from the absorbed entity's essence.
    // This is reflected narratively, not as a separate actor.
    absorberGainsPowerEssence: true,
    absorberEssenceBoostDescription: `Majin Buu absorbe la esencia y poderes de ${absorbedDisplayName}, incrementando su poder base.`,
    source: SOURCE_TYPES.ORACLE_SCENARIO_EVENT,
    label: UI_BADGES.ORACLE_EVENT_ENTITY.label,
    temporary: true,
    persistsToRoster: false,
    persistence: PERSISTENCE_MODES.SIMULATION_ONLY
  };
}

/**
 * 9. FACTORY: CampaignState (Isolated persistent chronicle)
 */
export function createCampaignState({
  campaignId = ('campaign-' + Date.now()),
  name = 'Crónica Multiversal Guardada',
  baseRosterVersion = ROSTER_VERSION_CANONICAL,
  baseRosterHash = 'ROSTER_V25_CANONICAL',
  selectedBranch = 'alfa',
  persistentParticipantsState = [],
  persistentWorldState = {},
  chronicleEntries = []
}) {
  return {
    campaignId,
    name,
    baseRosterVersion,
    baseRosterHash,
    selectedBranch,
    persistentParticipantsState: [...persistentParticipantsState],
    persistentWorldState: { ...persistentWorldState },
    chronicleEntries: [...chronicleEntries],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    persistence: PERSISTENCE_MODES.CAMPAIGN_SAVED,
    mutatesRoster: false,
    label: UI_BADGES.CAMPAIGN_SAVED.label
  };
}

/**
 * 10. ANATOMICAL INJURY RESOLVER
 */
export function resolveAnatomicalPenalty(injuryType) {
  const norm = String(injuryType || '').toLowerCase();
  if (norm.includes('brazo') || norm.includes('hombro') || norm.includes('antebrazo') || norm.includes('codo')) {
    return {
      type: 'arm_disablement',
      description: 'Extremidad superior inutilizada',
      guardPenalty: 0.35,
      canUseTwoHands: false,
      staminaDrainFactor: 1.15
    };
  }
  if (norm.includes('costilla') || norm.includes('neumotorax') || norm.includes('pulmon') || norm.includes('respiraci')) {
    return {
      type: 'thoracic_compromise',
      description: 'Compromiso torácico y ventilatorio',
      guardPenalty: 0.20,
      staminaDrainFactor: 1.60,
      canUseTwoHands: true
    };
  }
  if (norm.includes('femoral') || norm.includes('pierna') || norm.includes('rodilla') || norm.includes('tobillo')) {
    return {
      type: 'lower_extremity_fracture',
      description: 'Pérdida severa de movilidad terrestre y amortiguación',
      movementEfficiency: 0.40,
      guardPenalty: 0.25,
      staminaDrainFactor: 1.30
    };
  }
  if (norm.includes('ocular') || norm.includes('ojo') || norm.includes('vision') || norm.includes('ceguera')) {
    return {
      type: 'visual_impairment',
      description: 'Pérdida de percepción espacial y lectura de vectores',
      perceptionEfficiency: 0.45,
      reactionEfficiency: 0.50,
      guardPenalty: 0.30
    };
  }
  if (norm.includes('neurologico') || norm.includes('conmocion') || norm.includes('craneal')) {
    return {
      type: 'neurological_lag',
      description: 'Retardo de sinapsis y pérdida de reflejos',
      reactionEfficiency: 0.35,
      movementEfficiency: 0.60,
      staminaDrainFactor: 1.40
    };
  }
  return {
    type: 'general_trauma',
    description: 'Trauma anatómico general',
    guardPenalty: 0.15,
    staminaDrainFactor: 1.15
  };
}

/**
 * 11. CANONICAL TECHNIQUE & SAGA RESTRICTIONS
 * Structural enforcement table for the LLM prompt (Golden Rule 2 machine-readable complement).
 * Validators and the prompt generator can import this to cross-check technique usage.
 */
export const CANONICAL_TECHNIQUE_SAGA_RESTRICTIONS = {
  'kaio-ken': {
    allowedOnForms: ['base', 'normal', 'human_base'],
    forbiddenOnForms: ['ssj1', 'super-saiyan', 'ssj2', 'super-saiyan-2', 'ssj3', 'super-saiyan-3', 'ssj4', 'super-saiyan-4'],
    allowedInEras: ['Dragon Ball Z', 'Dragon Ball Super'],
    exceptionForms: ['ssgss', 'ssj-blue', 'super-saiyan-blue', 'super-saiyan-god-super-saiyan'],
    // In DBS only Goku explicitly uses SSBKaioken; in DBZ it is ONLY base form
    eraBaseRuleMap: {
      'Dragon Ball Z': { allowedOnForms: ['base', 'normal'], exceptionForms: [] },
      'Dragon Ball Super': { allowedOnForms: ['base', 'normal', 'ssgss', 'ssj-blue'], exceptionForms: ['ssgss', 'ssj-blue'] }
    },
    characterWhitelist: ['goku', 'son-goku'],
    reason: 'Kaiō-ken es biológicamente incompatible con SSJ en la era DBZ. Solo Goku SSB lo domina en DBS.'
  },
  'shunkan-ido': {
    characterWhitelist: [
      'goku', 'son-goku',         // From Androids Saga onward
      'vegeta',                   // Moro Arc (DBS manga) onward ONLY
      'cell', 'perfect-cell', 'super-perfect-cell',  // Super Perfect form only
      'jimizu', 'pybara'          // Yardrat natives
    ],
    forbiddenCharacters: [
      'piccolo', 'gohan', 'trunks', 'future-trunks', 'krilin', 'krillin',
      'freezer', 'frieza', 'broly', 'beerus', 'bills', 'whis'
    ],
    reason: 'Shunkan Idō es exclusivo de entrenados en Yardrat. El resto usa Bukūjutsu o velocidad pura.'
  },
  'kai-kai': {
    characterWhitelist: ['kaioshin', 'kibito', 'kibitoshin', 'shin', 'gowasu', 'east-kaioshin'],
    reason: 'Kai Kai es exclusivo de Kaio-shins y deidades del Reino Sagrado.'
  },
  'hakai': {
    characterWhitelist: ['beerus', 'bills', 'champa', 'sidra', 'belmod', 'mosco', 'rumsshi', 'quitela', 'arak', 'liquir', 'goku-mastered-ultra-instinct', 'toppo-god-of-destruction'],
    reason: 'Hakai es privativo de los Hakaishin y entidades que expresamente lo han aprendido.'
  },
  'ultra-instinct': {
    characterWhitelist: ['goku', 'son-goku', 'whis', 'merus'],
    forbiddenInSagas: ['Dragon Ball Z', 'Dragon Ball GT'],
    reason: 'Ultra Instinto es exclusivo de DBS era Torneo del Poder en adelante.'
  },
  'ultra-ego': {
    characterWhitelist: ['vegeta'],
    forbiddenInSagas: ['Dragon Ball Z', 'Dragon Ball GT'],
    reason: 'Ultra Ego es exclusivo de Vegeta en la saga Granolah y posterior (DBS manga).'
  }
};

