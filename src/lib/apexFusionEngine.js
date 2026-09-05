/**
 * APEX Fusion Engine — Laboratorio de Fusiones & Sinergias Multiversales
 * Permite la fusión matemática y narrativa de cualquier par de combatientes del Roster.
 */

import { TIER_ORDER, SCOUTER_ENERGY_ANCHORS } from './apexTierSystem.js';

export const FUSION_METHODS = {
  METAMORAN: {
    id: 'metamoran',
    name: 'Danza Metamorana',
    multiplier: 24, // (Ki_min + Ki_min) * 12
    duration: '30 Minutos (Combate de Alta Intensidad)',
    outfit: 'Chaleco Metamorano clásico con bordes dorados, faja turquesa y pantalones blancos holgados.',
    compatibilityRule: 'Requiere que el combatiente de mayor poder reduzca y sincronice su Ki exactamente con el del compañero.',
    energyType: 'Ki Armónico Sincronizado'
  },
  POTARA: {
    id: 'potara',
    name: 'Pendientes Pothala (Potara)',
    multiplier: 25, // (Ki_A + Ki_B) * 25
    duration: '1 Hora para mortales / Ilimitada para deidades',
    outfit: 'Fusión de las prendas de ambos portadores con pendientes Pothala luminosos en las orejas.',
    compatibilityRule: 'Multiplicación acumulativa total sin restricción de reducción de poder. Bonus x1.25 por rivalidad ancestral.',
    energyType: 'Energía Divina Pothala'
  },
  QUANTUM: {
    id: 'quantum',
    name: 'Convergencia Cuántica / Dimensional',
    multiplier: 18, // sqrt(Ki_A * Ki_B) * 18
    duration: 'Duración por Estabilidad Dimensional (Variable)',
    outfit: 'Entrelazamiento estético hiper-espacial con auras duales superpuestas y geometría sagrada.',
    compatibilityRule: 'Diseñada para armonizar universos distintos (Ki con Chakra, Stands, Reiatsu, Magia o Fuerza).',
    energyType: 'Energía Híbrida Dimensional'
  }
};

/**
 * Genera un nombre de fusión canónico e ingenioso a partir de dos nombres
 */
export function generateFusedName(nameA = '', nameB = '', method = 'potara') {
  const cleanA = (nameA || '').replace(/\(.*?\)/g, '').replace(/—.*?$/g, '').trim();
  const cleanB = (nameB || '').replace(/\(.*?\)/g, '').replace(/—.*?$/g, '').trim();

  const pairKey = [cleanA.toLowerCase(), cleanB.toLowerCase()].sort().join('___');
  const canonicalMap = {
    'goku___vegeta': method === 'metamoran' ? 'Gogeta' : 'Vegetto',
    'son goku___vegeta': method === 'metamoran' ? 'Gogeta' : 'Vegetto',
    'son goku u18 dbm___vegeta u18 dbm': method === 'metamoran' ? 'Gogeta U18' : 'Vegetto U18',
    'goten___trunks': 'Gotenks',
    'naruto___sasuke': method === 'metamoran' ? 'Narusuke' : 'Sasuto',
    'naruto uzumaki___sasuke uchiha': 'Sasuto Uchiha-Uzumaki',
    'alucard___dio': 'Diocard',
    'dio brando___alucard': 'Diocard',
    'saitama___son goku': 'Gokutama',
    'goku___saitama': 'Gokutama'
  };

  if (canonicalMap[pairKey]) return canonicalMap[pairKey];

  const wordsA = cleanA.split(' ');
  const wordsB = cleanB.split(' ');
  const firstA = wordsA[wordsA.length > 1 ? 1 : 0] || cleanA;
  const firstB = wordsB[wordsB.length > 1 ? 1 : 0] || cleanB;

  const halfA = firstA.slice(0, Math.ceil(firstA.length / 2));
  const halfB = firstB.slice(Math.floor(firstB.length / 2));

  let fused = '';
  if (method === 'metamoran') {
    fused = `${halfA}${halfB}`;
  } else if (method === 'potara') {
    fused = `${halfB.charAt(0).toUpperCase() + halfB.slice(1)}${halfA.toLowerCase()}`;
  } else {
    fused = `${halfA}-${halfB} Primus`;
  }

  return fused.charAt(0).toUpperCase() + fused.slice(1);
}

/**
 * Calcula el Ki numérico resultante de la fusión
 */
export function calculateFusionKi(kiA = 0, kiB = 0, method = 'potara', areRivals = false) {
  const valA = Number(kiA) || 1000;
  const valB = Number(kiB) || 1000;

  if (method === 'metamoran') {
    const minKi = Math.min(valA, valB);
    return minKi * 2 * 12;
  }

  if (method === 'potara') {
    const sum = valA + valB;
    const baseMult = 25;
    const rivalBonus = areRivals ? 1.25 : 1.0;
    return Math.round(sum * baseMult * rivalBonus);
  }

  const geometricMean = Math.sqrt(Math.max(1, valA) * Math.max(1, valB));
  return Math.round(geometricMean * 18);
}

/**
 * Determina el Tier de la fusión a partir del Ki y de los Tiers de origen
 */
export function deriveFusionTier(tierA = '7-B', tierB = '7-B', calculatedKi = 0) {
  const cleanA = (tierA || '').replace('Tier ', '').trim();
  const cleanB = (tierB || '').replace('Tier ', '').trim();

  const idxA = TIER_ORDER.indexOf(cleanA);
  const idxB = TIER_ORDER.indexOf(cleanB);

  const baseIdx = Math.max(idxA !== -1 ? idxA : 14, idxB !== -1 ? idxB : 14);

  let boost = 3;
  if (calculatedKi > 1e12) boost = 4;
  if (calculatedKi > 1e15) boost = 5;

  const targetIdx = Math.min(TIER_ORDER.length - 1, baseIdx + boost);
  return `Tier ${TIER_ORDER[targetIdx]}`;
}

/**
 * Combina y forja técnicas híbridas únicas entre ambos combatientes
 */
export function forgeHybridTechniques(charA, charB, fusedName) {
  const techA = [
    ...(charA.arsenal?.superAttacks || []),
    ...(charA.arsenal?.ultimateAttacks || [])
  ];
  const techB = [
    ...(charB.arsenal?.superAttacks || []),
    ...(charB.arsenal?.ultimateAttacks || [])
  ];

  const hybridSupers = [];
  const hybridUltimates = [];

  const name1 = techA[0]?.name || techA[0] || 'Ataque de Energía';
  const name2 = techB[0]?.name || techB[0] || 'Golpe Concentrado';
  const name3 = techA[1]?.name || techA[1] || 'Ráfaga Destructiva';
  const name4 = techB[1]?.name || techB[1] || 'Técnica Definitiva';

  hybridSupers.push({
    name: `${name1} + ${name2} (Sincronía Dual)`,
    type: 'Energía / Impacto Híbrido',
    cost: 'Medio',
    description: `Combina el vector primario de ${charA.name} con la cadencia de ${charB.name}, duplicando la velocidad de impacto y anulando defensas menores.`
  });

  hybridSupers.push({
    name: `Destello Cósmico de ${fusedName}`,
    type: 'Proyectil Perforante Cósmico',
    cost: 'Medio-Alto',
    description: `Concentración masiva de energía en la punta de los dedos que desata una descarga simultánea en abanico con detonación interna.`
  });

  hybridUltimates.push({
    name: `Gran Juicio de ${fusedName}: ${name3} Celestial`,
    type: 'Ataque Conceptual Definitivo',
    cost: 'Extremo (Agotador)',
    description: `La máxima manifestación ofensiva de la fusión: atrapa al oponente en un nexo espacial antes de descargar una explosión total que desintegra la materia a nivel subatómico.`
  });

  return {
    basicAttacks: `Secuencias marciales combinadas de ${charA.name} y ${charB.name} con velocidad y reflejos optimizados al unísono.`,
    superAttacks: hybridSupers,
    ultimateAttacks: hybridUltimates,
    passives: [
      'Fusión de Voluntades: Inmunidad a intimidación y alta resistencia a ilusiones o parálisis mental.',
      'Resonancia de Sistemas: Recuperación acelerada de energía al enlazar ambos núcleos de poder.'
    ],
    actives: [
      'Ignición de Aura Fused: Desata el 100% de la presión de Ki/Energía durante 60 segundos con incremento masivo de velocidad.'
    ]
  };
}

/**
 * Ejecuta la fusión completa entre charA y charB
 */
export function fuseCharacters(charA, charB, methodId = 'potara', areRivals = false) {
  if (!charA || !charB) {
    throw new Error('Se requieren dos combatientes válidos para iniciar la fusión.');
  }

  const method = FUSION_METHODS[methodId.toUpperCase()] || FUSION_METHODS.POTARA;
  const fusedName = generateFusedName(charA.name, charB.name, method.id);

  const kiValA = charA.ki || charA.sourceKiCurrent || SCOUTER_ENERGY_ANCHORS[charA.tier?.replace('Tier ', '')] || 5000000;
  const kiValB = charB.ki || charB.sourceKiCurrent || SCOUTER_ENERGY_ANCHORS[charB.tier?.replace('Tier ', '')] || 5000000;

  const resultKi = calculateFusionKi(kiValA, kiValB, method.id, areRivals);
  const resultTier = deriveFusionTier(charA.tier, charB.tier, resultKi);

  const haxSet = new Set([
    ...(charA.haxTags || []),
    ...(charB.haxTags || []),
    'Fusión de Almas / Consciencia Dual',
    'Aura Sobrenatural de Alta Presión'
  ]);

  const arsenal = forgeHybridTechniques(charA, charB, fusedName);
  const fusedId = `fused-${(charA.id || 'a').slice(0, 8)}-${(charB.id || 'b').slice(0, 8)}-${method.id}`;

  const fusedCharacter = {
    id: fusedId,
    name: `${fusedName} (${method.name})`,
    universe: charA.universe === charB.universe ? charA.universe : `🌌 Nexo Multiversal (${charA.universe} × ${charB.universe})`,
    version: `Fusión Oficial APEX [${method.name}]`,
    tier: resultTier,
    ki: resultKi,
    sourceKiCurrent: resultKi,
    ap: `Supera con creces el poder combinado de ${charA.name} y ${charB.name}, escalando a ${resultTier}.`,
    durability: `Cuerpo reforzado por la densidad del nexo energético. Resiste impactos directos de escala ${resultTier}.`,
    speed: {
      combat: 'MFTL+ / Trascendente en combates de corta distancia',
      reaction: 'Instantánea / Ultra Instintiva combinada',
      travel: 'Vuelo a velocidad cósmica / Teletransporte inter-orbital',
      attack: 'Ineludible para combatientes de menor rango'
    },
    strength: {
      striking: `Capaz de resquebrajar el tejido dimensional con cada golpe en ${resultTier}`,
      lifting: 'Clase Galáctica / Inconmensurable'
    },
    stamina: method.duration,
    intelligence: 'Genio Marcial Combinado (Estrategia y Adaptación Absoluta)',
    experience: 'Suma y armonización total de todas las vidas y batallas de ambos guerreros',
    tactics: 'Ofensiva arrolladora con lectura milimétrica de debilidades enemigas',
    weaknesses: `Límite de tiempo estricto: ${method.duration}. Un consumo excesivo de energía puede precipitar la defusión prematura.`,
    avatar: charA.avatar || charB.avatar,
    haxTags: Array.from(haxSet),
    arsenal,
    abilities: [
      `Técnicas de ${charA.name}: Acceso total al catálogo de habilidades de origen.`,
      `Técnicas de ${charB.name}: Acceso total al catálogo de habilidades de origen.`,
      'Técnicas Exclusivas de Fusión: Movimientos que sólo pueden ejecutarse con dos almas en resonancia.'
    ],
    forms: [
      {
        id: 'base-fused',
        name: 'Forma Base Fused',
        multiplier: 1,
        tier: resultTier,
        ki: resultKi,
        description: 'Estado inicial tras completarse el enlace corporal y espiritual.'
      },
      {
        id: 'max-power-fused',
        name: 'Máximo Poder Desatado',
        multiplier: 2.5,
        tier: deriveFusionTier(resultTier, resultTier, resultKi * 2.5),
        ki: Math.round(resultKi * 2.5),
        description: 'Liberación total del aura y desbordamiento de energía acumulada.'
      }
    ],
    fusionMeta: {
      method: method.name,
      parentA: { id: charA.id, name: charA.name, tier: charA.tier },
      parentB: { id: charB.id, name: charB.name, tier: charB.tier },
      areRivals,
      generatedAt: new Date().toISOString()
    }
  };

  return fusedCharacter;
}
