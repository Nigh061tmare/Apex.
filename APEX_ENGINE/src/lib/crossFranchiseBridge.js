/**
 * APEX Cross-Franchise Scaling Bridge (Protocolo de Choque Inter-Dimensional)
 * Reglas de arbitraje sistemático para enfrentamientos entre distintas franquicias.
 */

import { TIER_ORDER } from './apexTierSystem.js';

export const DEFAULT_BRIDGE_CONFIG = {
  energyEquivalence: true,       // Ki = Chakra = Reiatsu = Nen = Magia = Haki = Maldición
  kiSupremacyOverHax: true,      // El Ki colosal puede forzar resistencia/anulación de Hax convencional
  standInteraction: 'spiritual_equivalence', // 'strict' | 'spiritual_equivalence' | 'ap_bleed'
  speedMode: 'canon',            // 'canon' | 'equalized' | 'reaction_scaled'
  dimensionalAoeVulnerability: true // Ataques masivos atómicos/espaciales vulneran intangibilidad básica
};

export const ENERGY_SYSTEM_MAP = {
  'Dragon Ball': { name: 'Ki', nature: 'Energía vital y espiritual pura, destructiva y de refuerzo físico.' },
  'Naruto': { name: 'Chakra', nature: 'Fusión de energía física y espiritual moldeada mediante sellos.' },
  'Bleach': { name: 'Reiatsu / Reiryoku', nature: 'Presión y poder espiritual que ataca directamente el alma.' },
  'One Piece': { name: 'Haki', nature: 'Manifestación de la fuerza de voluntad e intimidación del espíritu.' },
  'Jujutsu Kaisen': { name: 'Energía Maldita', nature: 'Energía nacida de las emociones negativas de los seres vivos.' },
  'Hunter x Hunter': { name: 'Nen', nature: 'Aura vital refinada mediante los principios del Ten, Zetsu, Ren y Hatsu.' },
  'JoJo': { name: 'Hamon / Stand', nature: 'Manifestación física del alma y del espíritu combativo.' },
  'Fate': { name: 'Od / Mana', nature: 'Circuitos mágicos y energía del entorno para canalizar misterios.' },
  'DC Comics': { name: 'Fuerza de Aceleración / Magia / Fisiología Cósmica', nature: 'Conceptos arquetípicos y radiaciones multiversales.' },
  'Marvel': { name: 'Fuerza Fénix / Poder Cósmico / Magia del Caos', nature: 'Entrelazamiento cuántico y fuerzas fundamentales.' }
};

/**
 * Calcula la distancia en sub-tiers entre dos personajes
 */
export function getTierDistance(tierA = '7-B', tierB = '7-B') {
  const cleanA = (tierA || '').replace('Tier ', '').trim();
  const cleanB = (tierB || '').replace('Tier ', '').trim();
  const idxA = TIER_ORDER.indexOf(cleanA);
  const idxB = TIER_ORDER.indexOf(cleanB);
  if (idxA === -1 || idxB === -1) return 0;
  return idxA - idxB;
}

/**
 * Evalúa las ventajas, mitigaciones y reglas de arbitraje entre dos combatientes
 */
export function evaluateInterdimensionalModifiers(charA, charB, bridgeConfig = DEFAULT_BRIDGE_CONFIG) {
  const config = { ...DEFAULT_BRIDGE_CONFIG, ...bridgeConfig };
  const tierDiff = getTierDistance(charA.tier, charB.tier);

  const modifiersA = {
    haxSuppressionBonus: 0,
    spiritualSight: false,
    speedFactor: 1.0,
    intangibilityPierce: false,
    rulesApplied: []
  };

  const modifiersB = {
    haxSuppressionBonus: 0,
    spiritualSight: false,
    speedFactor: 1.0,
    intangibilityPierce: false,
    rulesApplied: []
  };

  // 1. Equivalencia Energética
  if (config.energyEquivalence) {
    modifiersA.rulesApplied.push('Equivalencia Energética: Los sistemas de defensa y absorción interactúan bidireccionalmente.');
    modifiersB.rulesApplied.push('Equivalencia Energética: Los sistemas de defensa y absorción interactúan bidireccionalmente.');
  }

  // 2. Válvula de Ki / Fuerza Bruta vs Hax
  if (config.kiSupremacyOverHax) {
    if (tierDiff >= 2) {
      modifiersA.haxSuppressionBonus = Math.min(0.85, (tierDiff - 1) * 0.35);
      modifiersA.rulesApplied.push(`Supremacía de Ki (+${tierDiff} Tiers): Disipa el 85% de efectos de control mental, parálisis o transmutación de ${charB.name}.`);
    } else if (tierDiff <= -2) {
      modifiersB.haxSuppressionBonus = Math.min(0.85, (Math.abs(tierDiff) - 1) * 0.35);
      modifiersB.rulesApplied.push(`Supremacía de Ki (+${Math.abs(tierDiff)} Tiers): Disipa el 85% de efectos de control mental, parálisis o transmutación de ${charA.name}.`);
    }
  }

  // 3. Interacción con Stands y Espíritus
  const isJojoA = (charA.universe || '').toLowerCase().includes('jojo');
  const isJojoB = (charB.universe || '').toLowerCase().includes('jojo');

  if (config.standInteraction === 'spiritual_equivalence') {
    modifiersA.spiritualSight = true;
    modifiersB.spiritualSight = true;
    modifiersA.rulesApplied.push('Armonización Espiritual: Entidades metafísicas y Stands son perceptibles y tangibles ante ataques de alta densidad energética.');
    modifiersB.rulesApplied.push('Armonización Espiritual: Entidades metafísicas y Stands son perceptibles y tangibles ante ataques de alta densidad energética.');
  } else if (config.standInteraction === 'strict') {
    if (isJojoA && !isJojoB) {
      modifiersA.rulesApplied.push(`Regla Canónica de Stand: ${charB.name} no posee Stand y no puede dañar directamente al avatar espectral de ${charA.name}.`);
    }
    if (isJojoB && !isJojoA) {
      modifiersB.rulesApplied.push(`Regla Canónica de Stand: ${charA.name} no posee Stand y no puede dañar directamente al avatar espectral de ${charB.name}.`);
    }
  }

  // 4. Normalización de Velocidad
  if (config.speedMode === 'equalized') {
    modifiersA.speedFactor = 1.0;
    modifiersB.speedFactor = 1.0;
    modifiersA.rulesApplied.push('Speed Equalization Activa: La velocidad base se iguala; el combate se define por reflejos, Hax y Battle IQ.');
    modifiersB.rulesApplied.push('Speed Equalization Activa: La velocidad base se iguala; el combate se define por reflejos, Hax y Battle IQ.');
  }

  // 5. Intangibilidad vs Ataque Masivo
  if (config.dimensionalAoeVulnerability) {
    if (tierDiff >= 3) {
      modifiersA.intangibilityPierce = true;
      modifiersA.rulesApplied.push(`Impacto Macro-Dimensional: La envergadura del ataque de ${charA.name} colapsa el plano de fase o la intangibilidad convencional.`);
    }
    if (tierDiff <= -3) {
      modifiersB.intangibilityPierce = true;
      modifiersB.rulesApplied.push(`Impacto Macro-Dimensional: La envergadura del ataque de ${charB.name} colapsa el plano de fase o la intangibilidad convencional.`);
    }
  }

  return {
    modifiersA,
    modifiersB,
    tierGap: tierDiff,
    summary: `${charA.name} (${charA.tier}) vs ${charB.name} (${charB.tier}) bajo protocolo interdimensional APEX.`
  };
}
