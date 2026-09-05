/**
 * APEX Powerscaling Engine — Chronicle System V1 (Versión Expandida)
 * 
 * Continuous, open-ended narrative campaigns ("seguir y seguir").
 * 12 Scene Types, Dynamic Factions, Campaign NPCs, Relationship Matrix,
 * Training Progression (linked to Normal Super Saiyan), History Compaction (every 10 chapters),
 * and strict isolation from Canon Roster V25.
 */

import { ROSTER_VERSION_CANONICAL, PERSISTENCE_MODES } from './simulationContractsV2.js';

export const CHRONICLE_VERSION = '1.0.0';

export const CHRONICLE_CONTINUITY_MODES = {
  CANON_PLUS: 'canon_plus',
  WHAT_IF_MULTIVERSE: 'what_if_multiverse',
  TOURNAMENT_OPEN: 'tournament_open',
  AU_ALTERNATE_TIMELINE: 'au_alternate_timeline'
};

export const SCENE_TYPES = {
  STORY_DIALOGUE: { id: 'story_dialogue', name: 'Historia / Diálogo', icon: 'MessageSquare', color: 'blue' },
  TRAINING: { id: 'training', name: 'Entrenamiento & Superación', icon: 'Dumbbell', color: 'amber' },
  EXPLORATION: { id: 'exploration', name: 'Exploración de Entorno', icon: 'Compass', color: 'emerald' },
  INVESTIGATION: { id: 'investigation', name: 'Investigación & Misterio', icon: 'Search', color: 'indigo' },
  POLITICAL_FACTION: { id: 'political_faction', name: 'Política & Facciones', icon: 'Landmark', color: 'purple' },
  DIPLOMATIC_NEGOTIATION: { id: 'diplomatic_negotiation', name: 'Diplomacia & Negociación', icon: 'Handshake', color: 'teal' },
  FAMILY_PERSONAL: { id: 'family_personal', name: 'Familiar & Lazos Personales', icon: 'Heart', color: 'rose' },
  REST_RECOVERY: { id: 'rest_recovery', name: 'Descanso & Recuperación', icon: 'Coffee', color: 'cyan' },
  TOURNAMENT_MATCH: { id: 'tournament_match', name: 'Combate de Torneo', icon: 'Trophy', color: 'yellow' },
  BRIEF_COMBAT: { id: 'brief_combat', name: 'Combate Breve / Escaramuza', icon: 'Swords', color: 'orange' },
  ETERNITY_ORACLE_BATTLE: { id: 'eternity_oracle_battle', name: 'Duelo Mayor de Eternidad', icon: 'Flame', color: 'red' },
  CUSTOM_USER: { id: 'custom_user', name: 'Escena Libre Personalizada', icon: 'Sparkles', color: 'fuchsia' }
};

export const RELATIONSHIP_TYPES = [
  'ally', 'rival', 'mentor', 'disciple', 'family',
  'debt', 'betrayal', 'respect', 'fear', 'pact', 'factional_enemy'
];

export const CHRONICLE_TONES = [
  'Épico y Competitivo',
  'Táctico y Político',
  'Filosófico y Marcial',
  'Grimdark y Supervivencia Extrema',
  'Cósmico y Mitológico',
  'Aventura Shonen Clásica',
  'Conspiración y Traición',
  'Investigación & Misterio Interdimensional'
];

export const CHRONICLE_PRESET_TEMPLATES = [
  {
    templateId: 'torneo_multiversal',
    title: 'Torneo Interdimensional de los Universos',
    premise: 'Guerreros de realidades alternas convergen en una arena cósmica donde las alianzas entre bastidores importan tanto como las artes marciales.',
    tone: 'Épico y Competitivo',
    continuityMode: CHRONICLE_CONTINUITY_MODES.TOURNAMENT_OPEN,
    suggestedCast: ['son-goku-u18-dbm', 'vegeta-u18-dbm', 'dr-raichi-dbm-u3'],
    startingLocation: 'Arena del Estadio Interuniversal (Universo 0)',
    recommendedFactions: ['Guerreros del Universo 18', 'Fuerzas del Dr. Raichi U3', 'Imperio Helioda U19'],
    initialArtifacts: [
      { id: 'art-senzu-1', name: 'Bolsa de Semillas Senzu (3 uds)', type: 'consumible', effect: 'Restaura 100% de salud, cura traumatismos y remueve fatiga', uses: 3 },
      { id: 'art-medtank-1', name: 'Tanque Médico Capsule Corp (Líquido Regenerativo)', type: 'medico', effect: 'Cura traumatismos críticos, fracturas óseas y estabiliza el Ki al 100%', uses: 2 },
      { id: 'art-radar-1', name: 'Radar Multiversal Vargas', type: 'herramienta', effect: 'Detecta fluctuaciones de Ki y combatientes ocultos', uses: 99 }
    ]
  },
  {
    templateId: 'guerra_facciones',
    title: 'Guerra Civil en el Núcleo del Cosmos',
    premise: 'La destrucción de un sello dimensional desata tensiones entre el Reino de los Demonios, los Guerreros del Universo 18 y facciones rebeldes.',
    tone: 'Táctico y Político',
    continuityMode: CHRONICLE_CONTINUITY_MODES.CANON_PLUS,
    suggestedCast: ['vegeta-u18-dbm', 'son-goku-u18-dbm', 'dabra-u11-dbm'],
    startingLocation: 'Palacio de los Kaio-Shin Antiguos',
    recommendedFactions: ['Alianza de los Kaio-Shin', 'Huestes de Dabra y Babidi', 'Vanguardia Saiyan Independiente'],
    initialArtifacts: [
      { id: 'art-potara-1', name: 'Pendientes Potara de Emergencia', type: 'reliquia', effect: 'Permite fusión táctica de 1 hora en situaciones límite', uses: 1 }
    ]
  },
  {
    templateId: 'entrenamiento_maestros',
    title: 'El Sendero del Dominio Puro: Normal Super Saiyan',
    premise: 'Goku y Vegeta U18 se internan en dimensiones hiperbólicas extremas para pulir el Normal Super Saiyan y erradicar la vulnerabilidad de su activación.',
    tone: 'Filosófico y Marcial',
    continuityMode: CHRONICLE_CONTINUITY_MODES.CANON_PLUS,
    suggestedCast: ['son-goku-u18-dbm', 'vegeta-u18-dbm'],
    startingLocation: 'Cámara del Tiempo Hiperdimensional Avanzada',
    recommendedFactions: ['Escuela Tortuga de Veteranos', 'Orgullo Real de Vegeta'],
    initialArtifacts: [
      { id: 'art-gravity-1', name: 'Dispositivo Gravitacional Capsule Corp (500G)', type: 'entrenamiento', effect: 'Acelera la ganancia de maestría y reduce turnos de activación', uses: 99 }
    ]
  },
  {
    templateId: 'cruzada_black_freezer',
    title: 'La Herejía de Black Freezer & El Asedio al Trono Divino',
    premise: 'Habiendo dominado su forma definitiva en la Habitación del Espíritu y el Tiempo, Freezer reúne una armada intergaláctica para desafiar la jerarquía de los Hakaishin.',
    tone: 'Grimdark y Supervivencia Extrema',
    continuityMode: CHRONICLE_CONTINUITY_MODES.CANON_PLUS,
    suggestedCast: ['freezer-resurreccion-f', 'son-goku-saga-super-dragon-ball-super-732', 'vegeta-saga-super-dragon-ball-super-454'],
    startingLocation: 'Borde Exterior del Séptimo Universo — Sistema Conquistado',
    recommendedFactions: ['Imperio Cósmico de Freezer', 'Defensores de la Tierra', 'Patrulla Galáctica'],
    initialArtifacts: [
      { id: 'art-scouter-dark', name: 'Rastreador Cuántico Imperial', type: 'tecnologia', effect: 'Analiza firmas de Ki divino y vulnerabilidades anatómicas', uses: 99 }
    ]
  },
  {
    templateId: 'rebelion_babidi_u16',
    title: 'La Noche de la Rebelión: Majin Bra & El Juicio del U16',
    premise: 'Bajo el influjo del hechicero Babidi, la guerrera más letal del Universo 16 desata una carnicería en el asteroide del torneo, forzando a aliados a luchar por su vida.',
    tone: 'Conspiración y Traición',
    continuityMode: CHRONICLE_CONTINUITY_MODES.WHAT_IF_MULTIVERSE,
    suggestedCast: ['son-bra-dbm-u16', 'gohan-u16-dbm-espectador', 'piccolo-u16-dbm-espectador'],
    startingLocation: 'Pasillos Aislados del Asteroide del Torneo DBM',
    recommendedFactions: ['Controlados por la M de Babidi', 'Supervivientes del Universo 16', 'Fuerza de Choque Vargas'],
    initialArtifacts: [
      { id: 'art-barrier-vargas', name: 'Generador de Barrera Anti-Ki Vargas', type: 'defensa', effect: 'Crea un campo temporal que anula ataques de rango inferior a Tier 3-C', uses: 2 }
    ]
  },
  {
    templateId: 'invasion_makaioshin',
    title: 'La Invasión de los Reinos Oscuros: Makaioshin & Demonios',
    premise: 'Grietas interdimensionales conectan el Reino de los Demonios con las realidades mortales. Los Makaioshin buscan cosechar la energía Kiri de los campeones de cada saga.',
    tone: 'Cósmico y Mitológico',
    continuityMode: CHRONICLE_CONTINUITY_MODES.WHAT_IF_MULTIVERSE,
    suggestedCast: ['dabura-saga-buu-107', 'son-goku-saga-buu-saga-buu-646', 'vegeta-saga-buu-saga-buu-213'],
    startingLocation: 'Fisura de la Dimensión Demoniaca — Portal Kaio',
    recommendedFactions: ['Reino de los Demonios', 'Corte Celestial Kaio-Shin', 'Guerreros Z'],
    initialArtifacts: [
      { id: 'art-sacred-water', name: 'Agua Ultra Sagrada Pura', type: 'consumible', effect: 'Purifica maldiciones oscuras y otorga inmunidad temporal a control mental', uses: 2 }
    ]
  },
  {
    templateId: 'batalla_real_universos_borrados',
    title: 'Supervivencia Cósmica: Retorno de los Seis Universos Borrados',
    premise: 'El deseo de las Super Dragon Balls al final del Torneo del Poder revivió no solo los universos eliminados en el certamen, sino también los Universos 13 al 18 borrados eones atrás.',
    tone: 'Épico y Competitivo',
    continuityMode: CHRONICLE_CONTINUITY_MODES.CANON_PLUS,
    suggestedCast: ['son-goku-saga-super-dragon-ball-super-732', 'jiren-dbs-torneo-del-poder', 'hit-dbs-torneo-u6-u7'],
    startingLocation: 'Plataforma del Mundo de la Nada Reconstruida',
    recommendedFactions: ['Vanguardia de los Universos Primitivos (13-18)', 'Alianza de los 12 Universos Renacidos'],
    initialArtifacts: [
      { id: 'art-super-radar', name: 'Sensor de Resonancia de Super Esferas', type: 'herramienta', effect: 'Rastrea fragmentos de energía de Super Shenron', uses: 99 }
    ]
  },
  {
    templateId: 'patrulla_tiempo_heroes',
    title: 'Crisis Temporal: La Prisión Planetaria de Fu',
    premise: 'Fu ha encadenado siete planetas en una prisión sellada con cadenas cósmicas para realizar su experimento definitivo de energía temporal.',
    tone: 'Aventura Shonen Clásica',
    continuityMode: CHRONICLE_CONTINUITY_MODES.AU_ALTERNATE_TIMELINE,
    suggestedCast: ['trunks-del-futuro-l-nea-temporal-futura-879', 'son-goku-saga-super-dragon-ball-super-732', 'vegeta-saga-super-dragon-ball-super-454'],
    startingLocation: 'Prisión Planetaria — Planeta Babari Aislado',
    recommendedFactions: ['Patrulla del Tiempo Xeno', 'Investigadores de Fu', 'Prisioneros Cósmicos'],
    initialArtifacts: [
      { id: 'art-time-ring', name: 'Fragmento de Anillo del Tiempo', type: 'reliquia', effect: 'Permite estabilizar líneas temporales y evitar paradojas', uses: 3 }
    ]
  },
  {
    templateId: 'conclave_hakaishin',
    title: 'El Cónclave de los Hakaishin: El Juicio del Gran Sacerdote',
    premise: 'Una sospecha de favoritismo de los Reyes de Todo hacia los mortales desata un desacuerdo secreto entre Bills, Quitela, Belmod y los doce Dioses de la Destrucción.',
    tone: 'Táctico y Político',
    continuityMode: CHRONICLE_CONTINUITY_MODES.CANON_PLUS,
    suggestedCast: ['son-goku-saga-super-dragon-ball-super-732', 'vegeta-saga-super-dragon-ball-super-454', 'piccolo-dbs-superhero'],
    startingLocation: 'Templo Neutral de los Ángeles Guía',
    recommendedFactions: ['Facción de Bills y Wiss', 'Facción de Quitela y Champa', 'Observadores Neutrales de Daishinkan'],
    initialArtifacts: [
      { id: 'art-angel-seal', name: 'Sello de Energía Hakai Contenida', type: 'defensa', effect: 'Reduce en un 50% el daño recibido por técnicas de borrado Hakai', uses: 1 }
    ]
  },
  {
    templateId: 'colision_omniverso',
    title: 'Crisis Omniversal: Convergencia de Realidades (Anime, Marvel & DC)',
    premise: 'Un cataclismo en el tejido de la ficción fusiona la Tierra de los Guerreros Z con realidades de héroes, mutantes, Stands y héroes de la Clase 1-A.',
    tone: 'Épico y Competitivo',
    continuityMode: CHRONICLE_CONTINUITY_MODES.AU_ALTERNATE_TIMELINE,
    suggestedCast: ['son-goku-saga-super-dragon-ball-super-732', 'vegeta-saga-super-dragon-ball-super-454', 'dr-raichi-dbm-u3'],
    startingLocation: 'Mega-Metrópolis Fusionada (Neo-Tokyo / Nueva York / West City)',
    recommendedFactions: ['Sindicato Cósmico de Héroes', 'Alianza de Villanos Multiversal', 'Guardianes de la Realidad'],
    initialArtifacts: [
      { id: 'art-dimension-beacon', name: 'Faro de Estabilidad de Realidad', type: 'herramienta', effect: 'Evita que los combatientes se desintegren por colapso dimensional', uses: 99 }
    ]
  }
];

/**
 * Factory: TrainingProgressState (Enlace a Normal Super Saiyan)
 */
export function createTrainingProgressState({
  characterId,
  trainingFocus = 'Dominio de Flujo de Ki y Contención',
  mentorId = null,
  progressMilestones = [
    'Estabilidad inicial de respiración',
    'Sellado de fuga periférica de Ki',
    'Reducción de la ventana de concentración vulnerable',
    'Activación reactiva sin preparación extensa'
  ],
  completedMilestones = [],
  narrativeBenefits = 'Mayor temple en combate prolongado',
  temporaryCampaignBenefits = {
    reducedActivationVulnerability: true,
    activationWindowModifier: '0.5x tiempo de concentración'
  },
  unlockConditions = '3 sesiones de entrenamiento meditativo intensivo',
  fatigue = 15,
  injuryRisk = 'Bajo',
  campaignOnly = true
} = {}) {
  return {
    characterId,
    trainingFocus,
    mentorId,
    progressMilestones: [...progressMilestones],
    completedMilestones: [...completedMilestones],
    narrativeBenefits,
    temporaryCampaignBenefits: { ...temporaryCampaignBenefits },
    unlockConditions,
    fatigue,
    injuryRisk,
    campaignOnly
  };
}

/**
 * Factory: FactionState
 */
export function createFactionState({
  factionId,
  name,
  alignment = 'Neutral Táctico',
  controlledLocations = [],
  resources = 'Reservas estándar de energía y suministros',
  relationsToOtherFactions = {},
  leaderRecordId = null
} = {}) {
  return {
    factionId: factionId || ('faction-' + Date.now()),
    name,
    alignment,
    controlledLocations: [...controlledLocations],
    resources,
    relationsToOtherFactions: { ...relationsToOtherFactions },
    leaderRecordId,
    campaignOnly: true
  };
}

/**
 * Factory: NPCState (PNJ exclusivo de campaña)
 */
export function createNPCState({
  npcId,
  name,
  role = 'Informante / Consejero',
  approxPowerDescription = 'Nivel intermedio no combatiente o guerrero de soporte táctico',
  relationships = {},
  status = 'Activo'
} = {}) {
  return {
    npcId: npcId || ('npc-' + Date.now()),
    name,
    role,
    approxPowerDescription,
    relationships: { ...relationships },
    status,
    campaignOnly: true
  };
}

/**
 * Factory: ChronicleScene
 */
export function createChronicleScene({
  sceneId,
  chapterNumber = 1,
  sceneNumber = 1,
  sceneType = 'story_dialogue',
  title = 'Encuentro Inicial',
  location = 'Punto de Encuentro Neutral',
  narrativeText = '',
  activeParticipants = [],
  openThreadUpdates = [],
  relationshipModifications = [],
  consequences = {},
  possibleNextActions = [],
  advanceChapter = false
} = {}) {
  return {
    sceneId: sceneId || (`scene-c${chapterNumber}-s${sceneNumber}-${Date.now()}`),
    chapterNumber,
    sceneNumber,
    sceneType,
    title,
    location,
    narrativeText,
    activeParticipants: [...activeParticipants],
    openThreadUpdates: [...openThreadUpdates],
    relationshipModifications: [...relationshipModifications],
    consequences: { ...consequences },
    possibleNextActions: [...possibleNextActions],
    advanceChapter,
    createdAt: new Date().toISOString()
  };
}

/**
 * Factory: ChronicleState
 */
export function createChronicleState({
  chronicleId,
  campaignId,
  title = 'Nueva Crónica Multiversal',
  premise = 'Una historia viva en constante expansión sin final predeterminado.',
  tone = 'Épico y Estratégico',
  continuityMode = CHRONICLE_CONTINUITY_MODES.CANON_PLUS,
  currentLocation = 'Planeta Sagrado Kaio-Shin',
  currentArc = 'Prólogo: El Despertar de la Nueva Era',
  initialCast = [],
  allCharacters = []
} = {}) {
  const cId = chronicleId || (`chronicle-${Date.now()}`);
  const campId = campaignId || (`campaign-${Date.now()}`);

  const characterStates = {};
  initialCast.forEach(id => {
    const foundChar = allCharacters.find(c => c.id === id);
    const isU18Saiyan = id === 'son-goku-u18-dbm' || id === 'vegeta-u18-dbm';

    characterStates[id] = {
      recordId: id,
      name: foundChar?.name || id,
      campaignStatus: 'active',
      location: currentLocation,
      partyId: 'party-main',
      relationships: {},
      currentGoal: isU18Saiyan ? 'Perfeccionar el Normal Super Saiyan y expandir límites' : 'Explorar y asegurar supremacía táctica',
      shortTermCondition: 'Óptimo',
      longTermCondition: 'Saludable',
      injuries: [],
      recoveryProgress: 100,
      trainingProgress: isU18Saiyan ? createTrainingProgressState({ characterId: id }) : null,
      temporaryFormsHistory: [],
      activeTemporaryForms: [],
      equipment: [],
      externalEntities: [],
      unresolvedConflicts: [],
      knowledgeFlags: {},
      reputationFlags: {}
    };
  });

  return {
    chronicleId: cId,
    campaignId: campId,
    version: CHRONICLE_VERSION,
    title,
    premise,
    tone,
    continuityMode,
    baseRosterVersion: ROSTER_VERSION_CANONICAL,
    baseRosterHash: 'ROSTER_V25_CANONICAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentDate: 'Año 794 (Cronología Multiversal)',
    currentLocation,
    currentArc,
    chapterNumber: 1,
    sceneNumber: 1,
    activeCast: [...initialCast],
    worldState: {
      locationStatus: 'Estable con anomalías dimensionales menores',
      factionControl: 'Neutro',
      politicalTension: 'Moderada',
      planetCondition: 'Intacto',
      availableResources: 'Abundantes',
      activeThreats: [],
      knownSecrets: [],
      timelineFlags: { normalSuperSaiyanDiscovered: true }
    },
    relationshipState: {},
    characterStates,
    openThreads: [
      {
        threadId: 'thread-init-1',
        title: 'El Dominio de la Energía sin Fugas',
        sourceEvent: 'Inicio de Crónica',
        urgency: 'Media',
        participants: initialCast.slice(0, 2),
        status: 'Abierto',
        possibleResolutions: ['Dominio pleno de Normal Super Saiyan', 'Descubrimiento de nueva anomalía']
      }
    ],
    eventLog: [
      {
        eventId: 'evt-init-1',
        timestamp: new Date().toISOString(),
        chapter: 1,
        scene: 1,
        summary: `Inicio de la Crónica: ${title}`
      }
    ],
    chapterArchive: [],
    oracleHistory: [],
    combatHistory: [],
    timelinePersistence: 'chronicle_isolated',
    historyDigest: '',
    digestLastCompactedAtChapter: 0,
    factions: [
      createFactionState({
        factionId: 'faction-universo-18',
        name: 'Guerreros del Universo 18',
        alignment: 'Héroes Protectores',
        controlledLocations: ['Tierra U18', 'Planeta Supremo U18'],
        resources: 'Semillas del Ermitaño limitadas, naves de Capsule Corp.'
      })
    ],
    npcs: [
      createNPCState({
        npcId: 'npc-cronista-supremo',
        name: 'Vargas Archivista V-12',
        role: 'Observador Interuniversal',
        approxPowerDescription: 'Civil con tecnología de monitoreo interdimensional'
      })
    ]
  };
}

/**
 * Advances a scene in the chronicle, updating state, logs and triggering compaction if needed
 */
export function advanceChronicleScene(chronicleState, sceneData) {
  if (!chronicleState) throw new Error('chronicleState requerido');

  const scene = createChronicleScene({
    ...sceneData,
    chapterNumber: chronicleState.chapterNumber,
    sceneNumber: chronicleState.sceneNumber
  });

  // Archive scene
  chronicleState.chapterArchive.push(scene);

  // Update open threads
  (scene.openThreadUpdates || []).forEach(update => {
    const existing = chronicleState.openThreads.find(t => t.threadId === update.threadId);
    if (existing) {
      existing.status = update.status || existing.status;
      if (update.summary) existing.lastUpdate = update.summary;
    } else if (update.threadId && update.title) {
      chronicleState.openThreads.push({
        threadId: update.threadId,
        title: update.title,
        sourceEvent: `Capítulo ${chronicleState.chapterNumber}`,
        urgency: update.urgency || 'Media',
        participants: update.participants || [],
        status: update.status || 'Abierto',
        possibleResolutions: update.possibleResolutions || []
      });
    }
  });

  // Update relationships
  (scene.relationshipModifications || []).forEach(rel => {
    const key = [rel.charA, rel.charB].sort().join('___');
    chronicleState.relationshipState[key] = {
      charA: rel.charA,
      charB: rel.charB,
      type: rel.type || 'respect',
      intensity: rel.intensity || 'Alta',
      lastModifiedChapter: chronicleState.chapterNumber
    };
  });

  // Log event
  chronicleState.eventLog.push({
    eventId: `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    chapter: chronicleState.chapterNumber,
    scene: chronicleState.sceneNumber,
    summary: scene.title || `Escena ${scene.sceneNumber}`
  });

  // Advance counters
  chronicleState.sceneNumber += 1;
  if (scene.advanceChapter) {
    chronicleState.chapterNumber += 1;
    chronicleState.sceneNumber = 1;

    // Decay persistent biomechanical conditions across all active characters
    if (chronicleState.characterStates) {
      Object.values(chronicleState.characterStates).forEach(charState => {
        if (Array.isArray(charState.injuries) && charState.injuries.length > 0) {
          charState.injuries = charState.injuries.map(injury => ({
            ...injury,
            chaptersRemaining: (injury.chaptersRemaining != null ? injury.chaptersRemaining : 2) - 1
          })).filter(injury => injury.chaptersRemaining > 0);

          if (charState.injuries.length === 0) {
            charState.shortTermCondition = 'Óptimo (Heridas Superadas)';
            charState.recoveryProgress = 100;
          } else {
            charState.shortTermCondition = `Herido (${charState.injuries.map(i => `${i.name} [${i.chaptersRemaining} cap]`).join(', ')})`;
          }
        }
      });
    }
  }

  chronicleState.updatedAt = new Date().toISOString();

  // Automatic Compaction check (every 10 chapters)
  const chaptersSinceCompaction = chronicleState.chapterNumber - (chronicleState.digestLastCompactedAtChapter || 0);
  if (chaptersSinceCompaction >= 10) {
    compactChronicleHistory(chronicleState);
  }

  return scene;
}

/**
 * Compacts history into historyDigest every 10 chapters
 * Retains entire chapterArchive for reading and export.
 */
export function compactChronicleHistory(chronicleState) {
  if (!chronicleState) return;

  const currentChapter = chronicleState.chapterNumber;
  const lastCompacted = chronicleState.digestLastCompactedAtChapter || 0;
  const scenesToCompact = chronicleState.chapterArchive.filter(
    s => s.chapterNumber > lastCompacted && s.chapterNumber < currentChapter
  );

  if (scenesToCompact.length === 0) return;

  const keyEvents = scenesToCompact.map(
    s => `[Cap. ${s.chapterNumber}, Esc. ${s.sceneNumber}] ${s.title}: ${(s.narrativeText || '').slice(0, 120)}`
  ).join('\n');

  const activeThreadsSummary = chronicleState.openThreads
    .filter(t => t.status === 'Abierto')
    .map(t => `• ${t.title} (Participantes: ${t.participants.join(', ')})`)
    .join('\n');

  const newDigestSection = `
=== RESUMEN COMPACTADO (CAPÍTULOS ${lastCompacted + 1} A ${currentChapter - 1}) ===
Fecha de Compactación: ${new Date().toLocaleDateString()}
Hitos Narrativos:
${keyEvents}
Hilos Activos en Continuidad:
${activeThreadsSummary}
`;

  chronicleState.historyDigest = (chronicleState.historyDigest ? (chronicleState.historyDigest + '\n\n') : '') + newDigestSection.trim();
  chronicleState.digestLastCompactedAtChapter = currentChapter - 1;
  return chronicleState.historyDigest;
}

/**
 * Generates an executive narrative recap combining historyDigest and recent chapters
 */
export function generateChronicleRecap(chronicleState) {
  if (!chronicleState) return 'No hay crónica activa para recapitular.';

  const recentScenes = chronicleState.chapterArchive.slice(-5);
  const recentSummary = recentScenes.map(
    s => `• Capítulo ${s.chapterNumber} — ${s.title}: ${(s.narrativeText || '').slice(0, 200)}...`
  ).join('\n\n');

  let output = `# ❖ RECAPITULACIÓN OFICIAL: ${chronicleState.title.toUpperCase()}\n`;
  output += `**Premisa:** ${chronicleState.premise}\n`;
  output += `**Capítulo Actual:** ${chronicleState.chapterNumber} · **Escena:** ${chronicleState.sceneNumber}\n`;
  output += `**Ubicación:** ${chronicleState.currentLocation} · **Arco:** ${chronicleState.currentArc}\n\n`;

  if (chronicleState.historyDigest) {
    output += `### 📜 HISTORIAL CONDENSADO (CAPÍTULOS ANTERIORES):\n${chronicleState.historyDigest}\n\n`;
  }

  output += `### ⚡ ACONTECIMIENTOS RECIENTES:\n${recentSummary || 'La crónica se encuentra en su fase inicial.'}\n\n`;

  output += `### 🧵 HILOS ABIERTOS EN DISPUTA:\n`;
  chronicleState.openThreads.forEach(t => {
    output += `- **${t.title}** [${t.urgency}]: ${t.status}\n`;
  });

  return output;
}

export const CHRONICLE_RULES_PRESETS = [
  { id: 'standard', name: 'Estándar Shonen / Canónico', permadeath: false, kiFatigue: 'Normal', haxRestricted: false },
  { id: 'hardcore_survival', name: 'Supervivencia Hardcore (Permadeath & Agotamiento)', permadeath: true, kiFatigue: 'Extrema', haxRestricted: true },
  { id: 'tournament_rules', name: 'Reglas de Torneo (Sin matar / Ring-Out / Arbitraje)', permadeath: false, kiFatigue: 'Moderada', haxRestricted: false },
  { id: 'war_attrition', name: 'Guerra de Desgaste Cósmica', permadeath: true, kiFatigue: 'Alta', haxRestricted: false }
];

/**
 * Generates 4 rich branching narrative choices for each chapter/scene
 */
export function generateSceneBranchOptions(chronicleState, currentSceneType = 'combate_rapido') {
  const cast = chronicleState?.activeCast || [];
  const loc = chronicleState?.currentLocation || 'el campo de batalla';

  return [
    {
      id: 'opt_aggression',
      badge: '⚔️ Asalto Frontal',
      title: `Lanzar ofensiva total en ${loc}`,
      desc: `Desplegar las transformaciones superiores y forzar el desenlace por poder bruto y contundencia física.`,
      sceneType: 'duelo_titanes',
      risk: 'Alto consumo de reservas de Ki, pero resolución directa del conflicto.'
    },
    {
      id: 'opt_tactics',
      badge: '🧠 Maniobra Estratégica',
      title: `Analizar patrones y tender emboscada`,
      desc: `Estudiar la cinemática y hax del enemigo para buscar una apertura táctica o flanqueo.`,
      sceneType: 'combate_rapido',
      risk: 'Requiere alta concentración y tiempo, pero mitiga el riesgo de heridas graves.'
    },
    {
      id: 'opt_diplomacy',
      badge: '🤝 Negociación / Pacto',
      title: `Proponer una tregua o intercambio de información`,
      desc: `Abrir diálogo con facciones neutrales o enemigas para alterar el equilibrio político del arco.`,
      sceneType: 'negociacion_diplomatica',
      risk: 'Peligro de emboscada o traición velada, pero abre rutas de alianzas cósmicas.'
    },
    {
      id: 'opt_training',
      badge: '🧘 Retirada Táctica & Superación',
      title: `Reagruparse y entrenar en aislamiento dimensional`,
      desc: `Ceder el frente temporalmente para sanar heridas, meditar y pulir el control de Ki y técnicas maestras.`,
      sceneType: 'entrenamiento_solitario',
      risk: 'Cede iniciativa al rival en la arena, pero recupera stamina y eleva el nivel de dominio.'
    }
  ];
}

/**
 * ============================================================================
 * CONDICIONES BIOMECÁNICAS PERSISTENTES (DURACIÓN: 2 CAPÍTULOS)
 * ============================================================================
 */
export const BIOMECHANICAL_CONDITIONS = {
  TRAUMATISMO_CRITICO: {
    id: 'traumatismo_critico',
    name: 'Traumatismo Crítico',
    severity: 'Grave',
    durationChapters: 2,
    statPenalty: '-30% Potencia y Resistencia',
    description: 'Fisuras óseas o hemorragia interna que desestabilizan el flujo sostenido de Ki.'
  },
  BRAZO_FRACTURADO: {
    id: 'brazo_fracturado',
    name: 'Brazo Fracturado / Inutilizado',
    severity: 'Moderada-Grave',
    durationChapters: 2,
    statPenalty: '-25% Velocidad de Guardia y Desvío',
    description: 'Incapacidad de realizar técnicas de doble apoyo o desvíos pesados de ráfagas.'
  },
  AGOTAMIENTO_SEVERO_KI: {
    id: 'agotamiento_severo_ki',
    name: 'Agotamiento Severo de Ki',
    severity: 'Crítica',
    durationChapters: 2,
    statPenalty: '-40% Reservas y Estamina',
    description: 'Sobrecarga en los meridianos de energía; riesgo inminente de perder la transformación.'
  },
  CONMOCION_SENSORIAL: {
    id: 'conmocion_sensorial',
    name: 'Conmoción Sensorial',
    severity: 'Moderada',
    durationChapters: 2,
    statPenalty: '-20% Reflejos y Percepción de Ki',
    description: 'Impacto contundente al cráneo o tímpanos reventados por onda expansiva supersónica.'
  }
};

/**
 * Aplica una condición biomecánica persistente a un personaje de campaña
 */
export function applyBiomechanicalInjury(chronicleState, characterId, conditionKeyOrObj, customDesc = '') {
  if (!chronicleState || !characterId || !chronicleState.characterStates?.[characterId]) return null;
  const charState = chronicleState.characterStates[characterId];
  if (!Array.isArray(charState.injuries)) charState.injuries = [];

  const conditionDef = typeof conditionKeyOrObj === 'string'
    ? (BIOMECHANICAL_CONDITIONS[conditionKeyOrObj] || BIOMECHANICAL_CONDITIONS.TRAUMATISMO_CRITICO)
    : conditionKeyOrObj;

  const injuryRecord = {
    id: `injury-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    conditionId: conditionDef.id,
    name: conditionDef.name,
    severity: conditionDef.severity,
    statPenalty: conditionDef.statPenalty,
    description: customDesc || conditionDef.description,
    chaptersRemaining: conditionDef.durationChapters || 2,
    inflictedChapter: chronicleState.chapterNumber
  };

  charState.injuries.push(injuryRecord);
  charState.shortTermCondition = `Herido (${charState.injuries.map(i => `${i.name} [${i.chaptersRemaining} cap]`).join(', ')})`;
  charState.recoveryProgress = Math.max(30, (charState.recoveryProgress || 100) - 35);

  return injuryRecord;
}

/**
 * Cura de inmediato todas las condiciones persistentes usando un artefacto o descanso
 */
export function healCharacterInjuries(chronicleState, characterId, healSource = 'Semilla Senzu') {
  if (!chronicleState || !characterId || !chronicleState.characterStates?.[characterId]) return false;
  const charState = chronicleState.characterStates[characterId];
  const hadInjuries = (charState.injuries || []).length > 0;

  charState.injuries = [];
  charState.shortTermCondition = `Óptimo (Restaurado por ${healSource})`;
  charState.recoveryProgress = 100;

  return hadInjuries;
}

/**
 * ============================================================================
 * SISTEMA DE TIRADAS DE CONTINGENCIA & TÁCTICAS (D20 HÍBRIDO)
 * Total = D20 + Modificador BIQ + Modificador Entorno + Brecha de Tier (±5)
 * ============================================================================
 */
export const TACTICAL_ACTIONS = [
  {
    id: 'emboscada',
    name: 'Emboscada en Punto Ciego',
    icon: 'EyeOff',
    difficulty: 11,
    biqBonus: 2,
    description: 'Suprimir el Ki hasta cero absoluto y asestar un golpe demoledor durante la guardia rota.',
    criticalSuccessDesc: 'Impacto fulminante inadvertido que ignora la durabilidad pasiva del rival.',
    successDesc: 'Golpe limpio en punto vital; el oponente pierde la iniciativa y queda aturdido.',
    partialDesc: 'El rival roza el impacto pero sufre daño periférico y retroceso forzado.',
    fumbleDesc: 'El rival anticipa el punto ciego y responde con un contraataque a quemarropa devastador.'
  },
  {
    id: 'sellado_mafuba',
    name: 'Sellado Dimensional / Mafuba',
    icon: 'PackageCheck',
    difficulty: 14,
    biqBonus: 3,
    description: 'Canalizar un vórtice místico o cápsula de confinamiento para atrapar rivales de Tiers inalcanzables.',
    criticalSuccessDesc: 'El objetivo queda sellado herméticamente sin importar su superioridad de poder destructivo.',
    successDesc: 'El vórtice succiona con éxito al enemigo, dejándolo inmovilizado o confinado en la matriz.',
    partialDesc: 'El sello desgarra el aura del adversario pero este escapa fracturando el contenedor.',
    fumbleDesc: 'El sello se refleja contra el ejecutor, dejándolo exhausto y al borde del desmayo.'
  },
  {
    id: 'sobrecarga_ki',
    name: 'Sobrecarga de Ki / Kaiō-ken Límite',
    icon: 'Flame',
    difficulty: 12,
    biqBonus: 1,
    description: 'Forzar una erupción instantánea por encima del límite biológico para romper una ventaja estática.',
    criticalSuccessDesc: 'Estallido titánico que pulveriza la técnica enemiga y lanza al rival al horizonte.',
    successDesc: 'Aceleración y golpe contundente que quiebra la guardia rival con éxito táctico.',
    partialDesc: 'Se logra quebrar la defensa enemiga, pero el usuario sufre desgarro y dolor muscular agudo.',
    fumbleDesc: 'Colapso vascular del flujo de Ki; el usuario cae de rodillas sufriendo Traumatismo Crítico.'
  },
  {
    id: 'ventaja_terreno',
    name: 'Explotación Táctica del Terreno',
    icon: 'Mountain',
    difficulty: 10,
    biqBonus: 2,
    description: 'Manipular placas tectónicas, asteroides o gravedad para cortar las trayectorias de vuelo rivales.',
    criticalSuccessDesc: 'El enemigo queda atrapado en un laberinto de compresión que neutraliza su velocidad.',
    successDesc: 'Ventaja posicional impecable; se restringe el rango de ataque del contendiente.',
    partialDesc: 'Efecto parcial; el rival gasta reservas extras para evadir la trampa ambiental.',
    fumbleDesc: 'El terreno colapsa en falso sobre el usuario, aplastando su flanco de combate.'
  },
  {
    id: 'finta_desvio',
    name: 'Finta Instantánea & Contragolpe',
    icon: 'Sparkles',
    difficulty: 10,
    biqBonus: 2,
    description: 'Fingir una retirada para atraer el ataque decisivo del oponente y desviarlo con mínima energía.',
    criticalSuccessDesc: 'Desvío milimétrico con un contragolpe a bocajarro al plexo solar rival.',
    successDesc: 'La finta descoloca al rival, permitiendo encadenar una combinación letal sin respuesta.',
    partialDesc: 'Desvío apresurado; ambos combatientes rebotan sufriendo daño superficial.',
    fumbleDesc: 'El rival lee el amago a la perfección y asesta un golpe limpio en pleno movimiento falso.'
  }
];

export const ENVIRONMENTAL_HAZARDS = [
  {
    id: 'ninguno',
    name: 'Entorno Neutral Estándar',
    modifier: 0,
    description: 'Condiciones atmosféricas y gravitacionales estables sin perturbaciones externas.'
  },
  {
    id: 'gravedad_500g',
    name: 'Gravedad Hiperbólica (500G)',
    modifier: -2,
    description: 'La inercia multiplica la masa corporal; fatiga extrema para guerreros sin bio-adaptación pesada.'
  },
  {
    id: 'vacio_espacial',
    name: 'Vacío Cósmico Sin Oxígeno',
    modifier: -3,
    description: 'Exige barrera de Ki permanente para respirar; letal para combatientes terrestres o biológicos puros.'
  },
  {
    id: 'atmosfera_toxica',
    name: 'Miasma Tóxico & Radiación',
    modifier: -2,
    description: 'Corroe la concentración y los tejidos expuestos durante la respiración marcial.'
  },
  {
    id: 'distorsion_dimensional',
    name: 'Fisuras de Espacio-Tiempo',
    modifier: -1,
    description: 'Distorsión de vectores físicos que desvía ráfagas y provoca micro-paradojas cinéticas.'
  },
  {
    id: 'campo_sellado_ki',
    name: 'Campo Tecnológico Anti-Ki',
    modifier: -3,
    description: 'Nanopartículas de absorción o frecuencias Vargas que sofocan la emanación energética.'
  }
];

/**
 * Resuelve una tirada D20 híbrida de contingencia táctica
 */
export function rollTacticalContingency({
  actorChar = null,
  targetChar = null,
  tacticId = 'emboscada',
  hazardId = 'ninguno'
}) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const tactic = TACTICAL_ACTIONS.find(t => t.id === tacticId) || TACTICAL_ACTIONS[0];
  const hazard = ENVIRONMENTAL_HAZARDS.find(h => h.id === hazardId) || ENVIRONMENTAL_HAZARDS[0];

  // Battle IQ modifier
  let biqMod = tactic.biqBonus || 1;
  const actorBiq = (actorChar?.battleIQ || '').toLowerCase();
  if (actorBiq.includes('genio') || actorBiq.includes('omnisciente') || actorBiq.includes('maestro')) {
    biqMod += 3;
  } else if (actorBiq.includes('alto') || actorBiq.includes('estratega')) {
    biqMod += 2;
  }

  // Tier Difference Modifier (clamped between -5 and +5)
  let tierDiff = 0;
  if (actorChar?.tier && targetChar?.tier) {
    const tierRanks = [
      '11-C', '11-B', '11-A', '10-C', '10-B', '10-A', '9-C', '9-B', '9-A',
      '8-C', 'High 8-C', '8-B', '8-A', '7-C', 'Low 7-B', '7-B', '7-A', 'High 7-A',
      '6-C', 'High 6-C', 'Low 6-B', '6-B', 'High 6-B', '6-A', 'High 6-A',
      '5-B', '5-A', 'High 5-A', 'Low 4-C', '4-C', 'High 4-C', '4-B', '4-A',
      '3-C', '3-B', '3-A', 'High 3-A', 'Low 2-C', '2-C', '2-B', '2-A',
      'Low 1-C', '1-C', 'High 1-C', '1-B', 'High 1-B', 'Low 1-A', '1-A', 'High 1-A', '0'
    ];
    const cleanA = (actorChar.tier || '').replace('Tier ', '').trim();
    const cleanB = (targetChar.tier || '').replace('Tier ', '').trim();
    const rankA = tierRanks.indexOf(cleanA);
    const rankB = tierRanks.indexOf(cleanB);
    if (rankA !== -1 && rankB !== -1) {
      tierDiff = Math.max(-5, Math.min(5, Math.round((rankA - rankB) / 2)));
    }
  }

  const hazardMod = hazard.modifier || 0;
  const total = d20 + biqMod + hazardMod + tierDiff;

  const isNat1 = (d20 === 1);
  const isNat20 = (d20 === 20);

  let outcomeType = 'fallo'; // 'pifia', 'fallo', 'parcial', 'exito', 'critico'
  let outcomeLabel = 'Fallo Táctico';
  let outcomeBadge = '❌ Fallo';
  let outcomeDesc = tactic.fumbleDesc;
  let injuryToApply = null;

  if (isNat1) {
    outcomeType = 'pifia';
    outcomeLabel = 'Pifia Catastrófica (1 Natural)';
    outcomeBadge = '💀 Pifia Catastrófica';
    outcomeDesc = `¡Desastre crítico! ${tactic.fumbleDesc} El actor sufre consecuencias inmediatas.`;
    injuryToApply = { target: 'actor', condition: 'TRAUMATISMO_CRITICO', desc: `Traumatismo por pifia en ${tactic.name}` };
  } else if (isNat20) {
    outcomeType = 'critico';
    outcomeLabel = 'Éxito Crítico Legendario (20 Natural)';
    outcomeBadge = '⭐ Éxito Crítico';
    outcomeDesc = `¡Hazaña sobrehumana! ${tactic.criticalSuccessDesc} La brecha de poder queda anulada.`;
    injuryToApply = { target: 'target', condition: 'TRAUMATISMO_CRITICO', desc: `Impacto crítico devastador recibido por ${tactic.name}` };
  } else if (total >= (tactic.difficulty + 4)) {
    outcomeType = 'exito';
    outcomeLabel = 'Éxito Táctico Pleno';
    outcomeBadge = '🎯 Éxito Pleno';
    outcomeDesc = tactic.successDesc;
    injuryToApply = { target: 'target', condition: 'BRAZO_FRACTURADO', desc: `Lesión en combate por ${tactic.name}` };
  } else if (total >= tactic.difficulty) {
    outcomeType = 'parcial';
    outcomeLabel = 'Éxito Parcial';
    outcomeBadge = '⚡ Éxito Parcial';
    outcomeDesc = tactic.partialDesc;
  } else {
    outcomeType = 'fallo';
    outcomeLabel = 'Fallo Táctico';
    outcomeBadge = '⚠️ Fallo Táctico';
    outcomeDesc = `La maniobra no supera la dificultad de ${tactic.difficulty}. El oponente bloquea o esquiva sin desgaste.`;
  }

  return {
    d20,
    isNat1,
    isNat20,
    biqMod,
    hazardMod,
    tierDiff,
    total,
    tactic,
    hazard,
    outcomeType,
    outcomeLabel,
    outcomeBadge,
    outcomeDesc,
    injuryToApply,
    actorName: actorChar?.name || 'Iniciador',
    targetName: targetChar?.name || 'Objetivo',
    timestamp: new Date().toISOString()
  };
}


