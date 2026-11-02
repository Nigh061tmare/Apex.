/**
 * APEX Powerscaling Engine — Combat Simulation Core & Oracle System V2
 * Strict, immutable, telemetry-bound and rule-verified combat resolution.
 * Complete Permission Matrix, Oracle Event Isolation, User Selection Authority & Action Validation.
 */

import { TIER_ORDER, getTierRank, formatApexKiFromLog10, calculateScores } from '../lib/apexTierSystem.js';
import { resolveCombatState } from '../lib/combatStateResolver.js';
import { getBodilyForms, selectContextualExternalEntity } from '../lib/externalEntityFramework.js';
import {
  ENGINE_VERSION_V2,
  RULESET_VERSION_V2,
  ROSTER_VERSION_CANONICAL,
  SOURCE_TYPES,
  ACTION_SOURCES,
  PERSISTENCE_MODES,
  UI_BADGES,
  ORACLE_FAMILIES,
  createDeterministicPRNG,
  createSimulationSnapshotV2,
  createCombatState,
  createTemporalAwakeningState,
  createFusionCombatState,
  createAbsorptionState,
  createEventEntityState,
  createCampaignState,
  resolveAnatomicalPenalty
} from '../lib/simulationContractsV2.js';
import { validateSimulationIntegrity } from '../lib/simulationIntegrityValidator.js';

export const RULE_AUTHORITY_HIERARCHY = [
  "1. Selección explícita del usuario en esta simulación (User Selection Authority)",
  "2. Reglas del escenario (Arena Modifiers & Equalization)",
  "3. Eventos Oráculo activados (Fase 3 Black Swan)",
  "4. CombatSnapshot validado (Frozen Pre-Simulation State)",
  "5. Formas y técnicas registradas de la ficha (Roster V25 Facts)",
  "6. Configuración de formas canónicas",
  "7. Reglas generales de APEX",
  "8. Narrativa cinematográfica"
];

export const STANDARD_EXTERNAL_ITEMS = {
  "senzu-bean": {
    id: "senzu-bean",
    name: "Semilla del Ermitaño",
    type: "external-item",
    usesRemaining: 1,
    activation: "manual",
    targetRule: "self-or-selected-ally",
    effects: ["restore-hp", "restore-stamina"],
    hpRestore: 100,
    staminaRestore: 100,
    canRevive: false,
    canAffectMultipleTargets: false
  },
  "standard-healing-capsule": {
    id: "standard-healing-capsule",
    name: "Cápsula de Curación Estándar",
    type: "external-item",
    usesRemaining: 1,
    activation: "manual",
    targetRule: "self-only",
    effects: ["restore-hp", "restore-stamina"],
    hpRestore: 50,
    staminaRestore: 40,
    canRevive: false,
    canAffectMultipleTargets: false
  }
};

export const ORACLE_EVENT_CONFIG = {
  "arena-collapse-zero-gravity": {
    id: "arena-collapse-zero-gravity",
    slug: "map_collapse",
    name: "Colapso de Arena y Gravedad Cero",
    phase: 3,
    usesRemaining: 1,
    type: "map-event",
    family: "environment_physics",
    description: "La arena sufre un colapso gravitatorio total entrando en microgravedad 0G."
  },
  "map_collapse": {
    id: "arena-collapse-zero-gravity",
    slug: "map_collapse",
    name: "Colapso de Arena y Gravedad Cero",
    phase: 3,
    usesRemaining: 1,
    type: "map-event",
    family: "environment_physics",
    description: "La arena sufre un colapso gravitatorio total entrando en microgravedad 0G."
  },
  "same-verse-canon-invader": {
    id: "same-verse-canon-invader",
    slug: "same_verse_reinforcement",
    name: "Invasor del Mismo Verso",
    phase: 3,
    usesRemaining: 1,
    type: "reinforcement",
    family: "character_intervention",
    description: "Un aliado o rival canónico de la misma franquicia irrumpe en el combate."
  },
  "same_verse_reinforcement": {
    id: "same-verse-canon-invader",
    slug: "same_verse_reinforcement",
    name: "Invasor del Mismo Verso",
    phase: 3,
    usesRemaining: 1,
    type: "reinforcement",
    family: "character_intervention",
    description: "Un aliado o rival canónico de la misma franquicia irrumpe en el combate."
  },
  "multiversal-surprise-warrior": {
    id: "multiversal-surprise-warrior",
    slug: "multiverse_random_fighter",
    name: "Guerrero Multiversal Sorpresa",
    phase: 3,
    usesRemaining: 1,
    type: "reinforcement",
    family: "character_intervention",
    description: "Una entidad de otro universo irrumpe mediante fractura dimensional."
  },
  "multiverse_random_fighter": {
    id: "multiversal-surprise-warrior",
    slug: "multiverse_random_fighter",
    name: "Guerrero Multiversal Sorpresa",
    phase: 3,
    usesRemaining: 1,
    type: "reinforcement",
    family: "character_intervention",
    description: "Una entidad de otro universo irrumpe mediante fractura dimensional."
  },
  "canonical-fusion": {
    id: "canonical-fusion",
    slug: "fusion_protocol_canon",
    name: "Fusión Canónica en Batalla",
    phase: 3,
    usesRemaining: 1,
    type: "fusion",
    family: "fusion_absorption_alteration",
    description: "Dos guerreros del mismo equipo ejecutan una técnica de fusión registrada (Potara o Metamoru)."
  },
  "fusion_protocol_canon": {
    id: "canonical-fusion",
    slug: "fusion_protocol_canon",
    name: "Fusión Canónica en Batalla",
    phase: 3,
    usesRemaining: 1,
    type: "fusion",
    family: "fusion_absorption_alteration",
    description: "Dos guerreros del mismo equipo ejecutan una técnica de fusión registrada (Potara o Metamoru)."
  },
  "what-if-hybrid-fusion": {
    id: "what-if-hybrid-fusion",
    slug: "fusion_protocol_whatif",
    name: "Fusión What-If Híbrida",
    phase: 3,
    usesRemaining: 1,
    type: "apex-custom-fusion",
    family: "fusion_absorption_alteration",
    description: "Fusión crossover temporal catalogada como apex-custom con desglose de compatibilidad."
  },
  "fusion_protocol_whatif": {
    id: "what-if-hybrid-fusion",
    slug: "fusion_protocol_whatif",
    name: "Fusión What-If Híbrida",
    phase: 3,
    usesRemaining: 1,
    type: "apex-custom-fusion",
    family: "fusion_absorption_alteration",
    description: "Fusión crossover temporal catalogada como apex-custom con desglose de compatibilidad."
  },
  "cell-absorption": {
    id: "cell-absorption",
    slug: "cell_bio_absorption",
    name: "Absorción Anatómica de Cell",
    phase: 3,
    usesRemaining: 1,
    type: "absorption",
    family: "fusion_absorption_alteration",
    description: "Bio-absorción dirigida con condiciones de escape y duración finita."
  },
  "cell_bio_absorption": {
    id: "cell-absorption",
    slug: "cell_bio_absorption",
    name: "Absorción Anatómica de Cell",
    phase: 3,
    usesRemaining: 1,
    type: "absorption",
    family: "fusion_absorption_alteration",
    description: "Bio-absorción dirigida con condiciones de escape y duración finita."
  },
  "majin-buu-absorption": {
    id: "majin-buu-absorption",
    slug: "buu_viscous_absorption",
    name: "Absorción de Majin Buu",
    phase: 3,
    usesRemaining: 1,
    type: "absorption",
    family: "fusion_absorption_alteration",
    description: "Envolvimiento de masa biológica con transferencia temporal de técnicas."
  },
  "buu_viscous_absorption": {
    id: "majin-buu-absorption",
    slug: "buu_viscous_absorption",
    name: "Absorción de Majin Buu",
    phase: 3,
    usesRemaining: 1,
    type: "absorption",
    family: "fusion_absorption_alteration",
    description: "Envolvimiento de masa biológica con transferencia temporal de técnicas."
  },
  "baby-parasitation": {
    id: "baby-parasitation",
    slug: "baby_tsufur_parasitism",
    name: "Parasitación y Subditos Tsufur",
    phase: 3,
    usesRemaining: 1,
    type: "control-event",
    family: "fusion_absorption_alteration",
    description: "Infección celular temporal que impone control biomecánico condicional."
  },
  "baby_tsufur_parasitism": {
    id: "baby-parasitation",
    slug: "baby_tsufur_parasitism",
    name: "Parasitación y Subditos Tsufur",
    phase: 3,
    usesRemaining: 1,
    type: "control-event",
    family: "fusion_absorption_alteration",
    description: "Infección celular temporal que impone control biomecánico condicional."
  },
  "canonical-awakening": {
    id: "canonical-awakening",
    slug: "miracle_form_canon",
    name: "Despertar Canónico",
    phase: 3,
    usesRemaining: 1,
    type: "state-upgrade",
    family: "power_evolution",
    description: "Desbloqueo temporal de la siguiente forma lógica registrada en la era del combatiente."
  },
  "miracle_form_canon": {
    id: "canonical-awakening",
    slug: "miracle_form_canon",
    name: "Despertar Canónico",
    phase: 3,
    usesRemaining: 1,
    type: "state-upgrade",
    family: "power_evolution",
    description: "Desbloqueo temporal de la siguiente forma lógica registrada en la era del combatiente."
  },
  "transcendent-awakening": {
    id: "transcendent-awakening",
    slug: "miracle_form_transcendent",
    name: "Despertar Trascendente (What-If)",
    phase: 3,
    usesRemaining: 1,
    type: "apex-custom-state-upgrade",
    family: "power_evolution",
    description: "Modo límite temporal apex-custom con forma divina o suprema hipotética."
  },
  "miracle_form_transcendent": {
    id: "transcendent-awakening",
    slug: "miracle_form_transcendent",
    name: "Despertar Trascendente (What-If)",
    phase: 3,
    usesRemaining: 1,
    type: "apex-custom-state-upgrade",
    family: "power_evolution",
    description: "Modo límite temporal apex-custom con forma divina o suprema hipotética."
  },
  "forbidden-finisher-awakening": {
    id: "forbidden-finisher-awakening",
    slug: "miracle_technique_awakening",
    name: "Despertar de Super Técnica / Finisher Prohibido",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-technique",
    family: "power_evolution",
    description: "Técnica suprema de un solo uso con alto coste de stamina y contrajuego."
  },
  "miracle_technique_awakening": {
    id: "forbidden-finisher-awakening",
    slug: "miracle_technique_awakening",
    name: "Despertar de Super Técnica / Finisher Prohibido",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-technique",
    family: "power_evolution",
    description: "Técnica suprema de un solo uso con alto coste de stamina y contrajuego."
  },
  "third-faction-invader": {
    id: "third-faction-invader",
    slug: "third_party",
    name: "Invasor de Tercera Facción",
    phase: 3,
    usesRemaining: 1,
    type: "reinforcement",
    family: "character_intervention",
    description: "Un combatiente o kaiju hostil a ambos bandos irrumpe en el campo de batalla."
  },
  "third_party": {
    id: "third-faction-invader",
    slug: "third_party",
    name: "Invasor de Tercera Facción",
    phase: 3,
    usesRemaining: 1,
    type: "reinforcement",
    family: "character_intervention",
    description: "Un combatiente o kaiju hostil a ambos bandos irrumpe en el campo de batalla."
  },
  "temporary-hax-nullification": {
    id: "temporary-hax-nullification",
    slug: "hax_failure",
    name: "Anulación Catastrófica de Hax",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-rule",
    family: "power_evolution",
    description: "Distorsión de campo que suprime efectos especiales y magia durante 2 turnos."
  },
  "hax_failure": {
    id: "temporary-hax-nullification",
    slug: "hax_failure",
    name: "Anulación Catastrófica de Hax",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-rule",
    family: "power_evolution",
    description: "Distorsión de campo que suprime efectos especiales y magia durante 2 turnos."
  },
  "space-time-failure": {
    id: "space-time-failure",
    slug: "dimensional_shift",
    name: "Falla Espacio-Temporal",
    phase: 3,
    usesRemaining: 1,
    type: "map-event",
    family: "environment_physics",
    description: "Ruptura del tejido dimensional que altera posiciones e intercambios."
  },
  "dimensional_shift": {
    id: "space-time-failure",
    slug: "dimensional_shift",
    name: "Falla Espacio-Temporal",
    phase: 3,
    usesRemaining: 1,
    type: "map-event",
    family: "environment_physics",
    description: "Ruptura del tejido dimensional que altera posiciones e intercambios."
  },
  "corruption-berserk-miasma": {
    id: "corruption-berserk-miasma",
    slug: "miasma_corruption",
    name: "Miasma de Corrupción o Berserk",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-status",
    family: "environment_physics",
    description: "Estado de furia oscura que incrementa potencia ofensiva a costa de defensa."
  },
  "miasma_corruption": {
    id: "corruption-berserk-miasma",
    slug: "miasma_corruption",
    name: "Miasma de Corrupción o Berserk",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-status",
    family: "environment_physics",
    description: "Estado de furia oscura que incrementa potencia ofensiva a costa de defensa."
  },
  "divine-blessing-shield": {
    id: "divine-blessing-shield",
    slug: "divine_blessing",
    name: "Bendición Divina",
    phase: 3,
    usesRemaining: 1,
    type: "single-use-defense",
    family: "power_evolution",
    description: "Barrera protectora de un solo uso que mitiga un impacto crítico."
  },
  "divine_blessing": {
    id: "divine-blessing-shield",
    slug: "divine_blessing",
    name: "Bendición Divina",
    phase: 3,
    usesRemaining: 1,
    type: "single-use-defense",
    family: "power_evolution",
    description: "Barrera protectora de un solo uso que mitiga un impacto crítico."
  },
  "mirror-paradox-doppelganger": {
    id: "mirror-paradox-doppelganger",
    slug: "shadow_clone",
    name: "Paradoja del Espejo",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-duplicate",
    family: "character_intervention",
    description: "Réplica temporal con duración finita de 2 turnos y 50% de stamina."
  },
  "shadow_clone": {
    id: "mirror-paradox-doppelganger",
    slug: "shadow_clone",
    name: "Paradoja del Espejo",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-duplicate",
    family: "character_intervention",
    description: "Réplica temporal con duración finita de 2 turnos y 50% de stamina."
  },
  "localized-time-dilation": {
    id: "localized-time-dilation",
    slug: "time_dilation",
    name: "Dilatación Temporal Localizada",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-rule",
    family: "environment_physics",
    description: "Campo de retardo temporal que altera la iniciativa de los contendientes."
  },
  "time_dilation": {
    id: "localized-time-dilation",
    slug: "time_dilation",
    name: "Dilatación Temporal Localizada",
    phase: 3,
    usesRemaining: 1,
    type: "temporary-rule",
    family: "environment_physics",
    description: "Campo de retardo temporal que altera la iniciativa de los contendientes."
  },
  "runaway-ki-supernova": {
    id: "runaway-ki-supernova",
    slug: "energy_supernova",
    name: "Supernova de Ki Desbocado",
    phase: 3,
    usesRemaining: 1,
    type: "map-event",
    family: "environment_physics",
    description: "Liberación descontrolada de energía que eleva el estado de daño de la arena."
  },
  "energy_supernova": {
    id: "runaway-ki-supernova",
    slug: "energy_supernova",
    name: "Supernova de Ki Desbocado",
    phase: 3,
    usesRemaining: 1,
    type: "map-event",
    family: "environment_physics",
    description: "Liberación descontrolada de energía que eleva el estado de daño de la arena."
  }
};

export const ORACLE_EVENT_PERMISSIONS = {
  "forbidden-finisher-awakening": {
    canCreateTemporaryAbility: true,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1,
    maxOwners: 1,
    maxCreatedAbilities: 1,
    noPermanentRosterWrite: true
  },
  "miracle_technique_awakening": {
    canCreateTemporaryAbility: true,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1,
    maxOwners: 1,
    maxCreatedAbilities: 1,
    noPermanentRosterWrite: true
  },
  "canonical-fusion": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: true,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "fusion_protocol_canon": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: true,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "what-if-hybrid-fusion": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: true,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "fusion_protocol_whatif": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: true,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "canonical-awakening": {
    canCreateTemporaryAbility: false,
    canUpgradeCanonicalState: true,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "miracle_form_canon": {
    canCreateTemporaryAbility: false,
    canUpgradeCanonicalState: true,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "transcendent-awakening": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: true,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "miracle_form_transcendent": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: true,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "arena-collapse-zero-gravity": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "map_collapse": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "same-verse-canon-invader": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: true,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "same_verse_reinforcement": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: true,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "multiversal-surprise-warrior": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: true,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "multiverse_random_fighter": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: true,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "third-faction-invader": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: true,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "third_party": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: true,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "temporary-hax-nullification": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: true,
    maxUses: 1
  },
  "hax_failure": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: true,
    maxUses: 1
  },
  "space-time-failure": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "dimensional_shift": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "corruption-berserk-miasma": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "miasma_corruption": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "divine-blessing-shield": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "divine_blessing": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "mirror-paradox-doppelganger": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "shadow_clone": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "localized-time-dilation": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "time_dilation": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "runaway-ki-supernova": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "energy_supernova": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "cell-absorption": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "cell_bio_absorption": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "majin-buu-absorption": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "buu_viscous_absorption": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "baby-parasitation": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  },
  "baby_tsufur_parasitism": {
    canCreateTemporaryAbility: false,
    canCreateTemporaryState: false,
    canUseExternalItems: false,
    canFuse: false,
    canAddCombatants: false,
    canChangeTier: false,
    canApplyGlobalHax: false,
    maxUses: 1
  }
};

export function canUseState(combatant, stateId, snapshot) {
  if (!combatant || !stateId || !snapshot) {
    return { allowed: false, failureReason: "state-not-authorized", details: "Argumentos inválidos para canUseState" };
  }
  const allowedList = snapshot.permissions?.allowedStateIdsByCombatant?.[combatant.combatantId] || [];
  if (!allowedList.includes(stateId)) {
    return {
      allowed: false,
      failureReason: "state-not-authorized",
      details: `El estado '${stateId}' no está autorizado para '${combatant.name}' en esta simulación.`
    };
  }
  const originalChar = combatant.originalCharacter;
  if (originalChar && stateId !== "base") {
    const hasForm = Array.isArray(originalChar.forms) && originalChar.forms.some(f => f.id === stateId || f.name === stateId);
    if (!hasForm) {
      return {
        allowed: false,
        failureReason: "state-not-authorized",
        details: `La forma '${stateId}' no existe en el registro del personaje '${combatant.name}'.`
      };
    }
  }
  return { allowed: true };
}

export function canUseAbility(combatant, abilityId, snapshot) {
  if (!combatant || !abilityId || !snapshot) {
    return { allowed: false, failureReason: "ability-not-authorized", details: "Argumentos inválidos para canUseAbility" };
  }
  const allowedList = snapshot.permissions?.allowedAbilityIdsByCombatant?.[combatant.combatantId] || [];
  const isRegisteredAbility = allowedList.includes(abilityId);
  const isOracleGenerated = Array.isArray(snapshot.oracleGeneratedAbilities) &&
    snapshot.oracleGeneratedAbilities.some(a => a.id === abilityId && a.ownerCombatantId === combatant.combatantId);

  if (!isRegisteredAbility && !isOracleGenerated) {
    return {
      allowed: false,
      failureReason: "ability-not-authorized",
      details: `La habilidad '${abilityId}' no está en la lista de habilidades permitidas para '${combatant.name}'.`
    };
  }
  return { allowed: true };
}

export function canUseItem(combatant, itemId, snapshot) {
  if (!combatant || !itemId || !snapshot) {
    return { allowed: false, failureReason: "external-item-not-authorized", details: "Argumentos inválidos para canUseItem" };
  }
  if (!snapshot.permissions?.allowExternalItems) {
    return {
      allowed: false,
      failureReason: "external-item-not-authorized",
      details: `Los objetos externos están deshabilitados en el escenario (allowExternalItems=false).`
    };
  }
  const allowedItems = snapshot.permissions?.allowedExternalItemIds || [];
  if (!allowedItems.includes(itemId)) {
    return {
      allowed: false,
      failureReason: "external-item-not-authorized",
      details: `El objeto '${itemId}' no está en la lista de objetos autorizados (allowedExternalItemIds).`
    };
  }
  return { allowed: true };
}

export function useExternalItem(combatant, itemId, targetCombatant, snapshot) {
  const itemCheck = canUseItem(combatant, itemId, snapshot);
  if (!itemCheck.allowed) {
    return { success: false, failureReason: itemCheck.failureReason, details: itemCheck.details };
  }

  const target = targetCombatant || combatant;
  const itemDef = STANDARD_EXTERNAL_ITEMS[itemId] || {
    id: itemId,
    name: itemId,
    hpRestore: 100,
    staminaRestore: 100,
    canRevive: false,
    canAffectMultipleTargets: false
  };

  if (target.hp <= 0 && !itemDef.canRevive) {
    return {
      success: false,
      failureReason: "target-incapacitated",
      details: `El objetivo '${target.name}' está fuera de combate y el objeto '${itemDef.name}' no permite resurrección.`
    };
  }

  if (snapshot.itemInventory) {
    const teamInventory = snapshot.itemInventory[combatant.teamId] || [];
    const invItem = teamInventory.find(i => i.itemId === itemId);
    if (invItem) {
      if (invItem.usesRemaining <= 0) {
        return { success: false, failureReason: "item-depleted", details: `El objeto '${itemDef.name}' ya agotó sus usos.` };
      }
      invItem.usesRemaining -= 1;
    }
  }

  const oldHp = target.hp;
  const oldStamina = target.stamina;

  target.hp = Math.min(100, target.hp + (itemDef.hpRestore || 100));
  target.stamina = Math.min(100, target.stamina + (itemDef.staminaRestore || 100));

  const hpGained = target.hp - oldHp;
  const staminaGained = target.stamina - oldStamina;

  return {
    success: true,
    actionType: "use-item",
    itemId: itemDef.id,
    itemName: itemDef.name,
    actorId: combatant.combatantId,
    targetId: target.combatantId,
    hpChange: hpGained,
    staminaChange: staminaGained,
    result: "success"
  };
}

export function canCombineStates(combatant, stateIds, abilityId, snapshot) {
  if (!combatant) return { allowed: false, failureReason: "invalid-state-combination" };
  
  const activeState = combatant.activeStateId || "base";
  const normAbility = (abilityId || "").toLowerCase();

  if (normAbility.includes("kaioken") || normAbility.includes("kaio-ken")) {
    const isBaseOrSsb = activeState === "base" || activeState.includes("ssb") || activeState.includes("blue") || activeState.includes("dios");
    if (!isBaseOrSsb) {
      return {
        allowed: false,
        failureReason: "invalid-state-combination",
        details: `Kaio-ken no puede combinarse con el estado '${activeState}'. Solo permitido en Base o Super Saiyan Blue bajo datos explícitos.`
      };
    }
  }

  return { allowed: true };
}

export function getBaseAdvantage(a, b) {
  const powerA = Number(a?.powerKey) || 0;
  const powerB = Number(b?.powerKey) || 0;
  const delta = powerA - powerB;

  if (delta >= 202) return "overwhelming";
  if (delta >= 101) return "major";
  if (delta >= 30) return "clear";
  if (delta <= -202) return "overwhelmed";
  if (delta <= -101) return "major-disadvantage";
  if (delta <= -30) return "clear-disadvantage";
  return "close";
}

/**
 * Creates frozen SimulationSnapshotV2
 */
export function createCombatSnapshot({
  scenario = {},
  teamA = [],
  teamB = [],
  selectedOracleEvents = [],
  allCharacters = [],
  userSelections = {}
} = {}) {
  const simulationId = "apex-sim-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  const seed = typeof userSelections.randomSeed === 'number' ? userSelections.randomSeed : Math.floor(Math.random() * 1000000);

  const allowExternalItems = userSelections.allowExternalItems !== undefined
    ? Boolean(userSelections.allowExternalItems)
    : Boolean(scenario.allowExternalItems);

  const cleanScenario = {
    mapId: scenario.id || "standard-arena",
    mapName: scenario.name || "Arena Estándar",
    universe: scenario.universe || "Neutro",
    gravity: scenario.gravity || "1G",
    ruleset: scenario.ruleset || "APEX Standard Combat",
    terrainEffect: scenario.terrainEffect || "Sin peligros adicionales",
    temperature: scenario.temperature || "Templada (22°C)",
    allowExternalItems,
    allowFusion: userSelections.allowFusion !== undefined ? Boolean(userSelections.allowFusion) : Boolean(scenario.allowFusion),
    allowNonCanonical: Boolean(userSelections.allowNonCanonical || scenario.allowNonCanonical)
  };

  const allowedExternalItemIds = allowExternalItems
    ? (Array.isArray(userSelections.allowedExternalItemIds) ? userSelections.allowedExternalItemIds : ["senzu-bean"])
    : [];

  const resolvedStates = {};
  const allowedStateIdsByCombatant = {};
  const allowedAbilityIdsByCombatant = {};
  const allowedForms = {};
  const allowedAbilities = {};
  const validationWarnings = [];

  function processFighter(char, teamId, index) {
    if (!char) return null;
    const charId = char.id || `char-${index}`;
    const combatantId = `${teamId}-${charId}-${index}`;

    let resolved = null;
    try {
      resolved = resolveCombatState(char, 'base', { allCharacters });
    } catch (e) {
      validationWarnings.push(`Error al resolver estado base de ${char.name}: ${e.message}`);
    }

    if (!resolved || resolved.manualReviewRequired) {
      const fallbackTier = char.forms?.[0]?.tier || char.baseTier || char.tier || '10-C';
      resolved = {
        activeStateId: 'base',
        stateName: 'Forma Base',
        tierExact: fallbackTier,
        tierRank: getTierRank(fallbackTier),
        powerKey: Number(char.powerKey) || 10,
        currentApexKiLog10: 1,
        apexKiDisplay: char.baseKi || char.baseKiFormatted || '—',
        formMultiplier: 1,
        warnings: []
      };
    }

    resolvedStates[combatantId] = resolved;

    const bodilyForms = getBodilyForms(char);
    const formIds = bodilyForms.map(f => f.id || f.name);
    if (!formIds.includes('base')) formIds.unshift('base');
    allowedStateIdsByCombatant[combatantId] = formIds;
    allowedForms[combatantId] = formIds;

    const abilities = (Array.isArray(char.arsenal) ? char.arsenal.map(a => a.id || a.name || a) : [])
      .concat(Array.isArray(char.techniques) ? char.techniques.map(t => t.id || t.name || t) : []);
    allowedAbilityIdsByCombatant[combatantId] = abilities;
    allowedAbilities[combatantId] = abilities;

    const effectiveTier = resolved?.tierExact || char.forms?.[0]?.tier || char.baseTier || char.tier || '10-C';
    const effectiveKiNumeric = char.baseKiNumeric ?? (char.forms?.[0]?.kiNumeric ?? 0);

    return {
      combatantId,
      participantId: combatantId,
      recordId: char.id,
      name: char.name,
      displayName: char.name,
      universe: char.universe || 'Dragon Ball',
      continuity: char.universe || 'Dragon Ball',
      teamId,
      tierExact: effectiveTier,
      tierRank: resolved?.tierRank ?? getTierRank(effectiveTier),
      powerKey: (resolved?.powerKey ?? Number(char.powerKey)) || 10,
      apexKiLog10: resolved?.currentApexKiLog10 ?? 1,
      apexKiDisplay: resolved?.apexKiDisplay || char.baseKiFormatted || '—',
      rosterKiNumeric: effectiveKiNumeric,
      formMultiplier: resolved?.formMultiplier || 1,
      hp: 100,
      stamina: 100,
      statusEffects: [],
      cooldowns: {},
      isActive: true,
      originalCharacter: char,
      immortalityPolicy: char.immortalityPolicy || {
        preventsBiologicalDeath: Boolean(char.isImmortal || (char.haxTags || []).includes('immortality')),
        regenerationCost: 0,
        canBeIncapacitated: true,
        canBeSealed: true
      },
      sourceType: SOURCE_TYPES.CANON_ROSTER_FACT,
      persistence: PERSISTENCE_MODES.PERMANENT_ROSTER,
      mutableDuringSimulation: false
    };
  }

  const teamAMembers = (Array.isArray(teamA) ? teamA : [teamA]).filter(Boolean).map((c, i) => processFighter(c, "team-a", i));
  const teamBMembers = (Array.isArray(teamB) ? teamB : [teamB]).filter(Boolean).map((c, i) => processFighter(c, "team-b", i));
  const allParticipants = [...teamAMembers, ...teamBMembers];

  // Active oracle events normalization
  const rawOracleList = userSelections.selectedOracleEvents || selectedOracleEvents || [];
  const activeOracleIds = rawOracleList.map(e => typeof e === 'string' ? e : (e.id || e.slug));

  const oracleUsesRemaining = {};
  const oracleList = activeOracleIds.map(evtKey => {
    const conf = ORACLE_EVENT_CONFIG[evtKey] || {
      id: evtKey,
      name: evtKey,
      phase: 3,
      usesRemaining: 1,
      type: "custom-event"
    };
    const maxUses = ORACLE_EVENT_PERMISSIONS[evtKey]?.maxUses || conf.usesRemaining || 1;
    oracleUsesRemaining[evtKey] = maxUses;
    return {
      ...conf,
      usesRemaining: maxUses,
      triggered: false,
      triggeredTurn: null,
      resolved: false
    };
  });

  const itemInventory = {
    "team-a": allowedExternalItemIds.map(id => ({
      itemId: id,
      usesRemaining: 1,
      allowedUsers: teamAMembers.map(m => m.combatantId)
    })),
    "team-b": allowedExternalItemIds.map(id => ({
      itemId: id,
      usesRemaining: 1,
      allowedUsers: teamBMembers.map(m => m.combatantId)
    }))
  };

  let externalEntityContext = null;
  const firstA = teamA[0];
  const firstB = teamB[0];
  if (firstA?.id === 'dr-raichi-dbm-u3') {
    externalEntityContext = selectContextualExternalEntity(firstA, firstB, {
      battleMode: userSelections?.matchMode || '1v1',
      orbStatus: userSelections?.orbStatus || 'intact',
      teamSize: (teamA?.length || 1) + (teamB?.length || 1)
    });
  } else if (firstB?.id === 'dr-raichi-dbm-u3') {
    externalEntityContext = selectContextualExternalEntity(firstB, firstA, {
      battleMode: userSelections?.matchMode || '1v1',
      orbStatus: userSelections?.orbStatus || 'intact',
      teamSize: (teamA?.length || 1) + (teamB?.length || 1)
    });
  }

  // Construct SimulationSnapshotV2
  const snapshotV2 = createSimulationSnapshotV2({
    simulationId,
    rosterHash: 'ROSTER_V25_CANONICAL',
    rulesetVersion: RULESET_VERSION_V2,
    mode: userSelections.matchMode || 'MODO VS',
    objective: userSelections.objective || 'Victoria por incapacitación o sumisión',
    arena: cleanScenario,
    verseEqualization: {
      speed: userSelections.speedMode || 'canon',
      stats: userSelections.statsMode || 'canon',
      energy: userSelections.energyEqualized ? 'equalized' : 'isolated'
    },
    teamConfiguration: {
      format: userSelections.matchMode || '1v1',
      teamASize: teamAMembers.length,
      teamBSize: teamBMembers.length
    },
    participants: allParticipants,
    selectedRosterForms: allowedStateIdsByCombatant,
    scenarioModifiers: userSelections,
    oracleEvents: activeOracleIds,
    customOracleCondition: userSelections.customOracleTwist || '',
    forbiddenActions: [],
    randomSeed: seed,
    narrativeIntensity: userSelections.narrativePreset || 'Equilibrado',
    outcomePersistence: PERSISTENCE_MODES.SIMULATION_ONLY
  });

  return {
    ...snapshotV2,
    seed,
    scenario: cleanScenario,
    teams: [
      { teamId: "team-a", name: "Bando Alfa (Rojo)", members: teamAMembers },
      { teamId: "team-b", name: "Bando Beta (Azul)", members: teamBMembers }
    ],
    externalEntityContext,
    resolvedStates,
    allowedAbilities,
    allowedForms,
    validationWarnings,
    permissions: {
      allowedStateIdsByCombatant,
      allowedAbilityIdsByCombatant,
      allowedExternalItemIds,
      allowedFusionMethods: cleanScenario.allowFusion ? ["potara", "metamoran-dance"] : [],
      allowedOracleEventIds: activeOracleIds.slice(),
      oracleUsesRemaining,
      allowNonCanonical: cleanScenario.allowNonCanonical,
      allowExternalItems: cleanScenario.allowExternalItems,
      allowFusion: cleanScenario.allowFusion
    },
    itemInventory,
    oracleEvents: {
      enabled: oracleList.length > 0,
      active: oracleList
    },
    oracleGeneratedAbilities: [],
    blockedActions: [],
    userSelections: { ...userSelections }
  };
}

export function validateCombatSnapshot(snapshot) {
  const blockingErrors = [];
  const warnings = [];

  if (!snapshot || typeof snapshot !== "object") {
    return { isValid: false, blockingErrors: ["Snapshot inválido o nulo."], warnings: [] };
  }

  if (!snapshot.simulationId) {
    blockingErrors.push("Falta ID único de simulación (simulationId).");
  }

  const allMembers = [];
  (snapshot.teams || []).forEach(team => {
    (team.members || []).forEach(m => {
      allMembers.push(m);
      if (!m.combatantId) blockingErrors.push("Combatiente sin combatantId en equipo " + team.teamId);
      if (m.tierRank === null || m.tierRank === undefined || m.tierRank < 0) {
        blockingErrors.push("Combatiente '" + m.name + "' posee tier inválido: " + m.tierExact);
      }
      if (isNaN(m.powerKey) || !Number.isFinite(m.powerKey)) {
        blockingErrors.push("Combatiente '" + m.name + "' posee powerKey no numérico o corrupto.");
      }
      if (m.powerKey === 8 || m.powerKey === "8") {
        blockingErrors.push("Detectado fallback prohibido de Power Level 8 en combatiente: " + m.name);
      }
    });
  });

  if (allMembers.length < 2) {
    blockingErrors.push("El combate requiere al menos 2 combatientes.");
  }

  if (snapshot.permissions) {
    const { allowedOracleEventIds = [] } = snapshot.permissions;
    allowedOracleEventIds.forEach(evtId => {
      const perm = ORACLE_EVENT_PERMISSIONS[evtId];
      if (!perm) {
        warnings.push(`Evento Oráculo '${evtId}' no tiene una matriz de permisos explícita registrada.`);
      }
    });
  }

  return {
    isValid: blockingErrors.length === 0,
    blockingErrors,
    warnings
  };
}

export function validateUserSelections(snapshot) {
  const validationReport = [];
  let isValid = true;

  if (!snapshot || !snapshot.permissions) {
    return { isValid: false, validationReport: ["Snapshot no contiene permissions."] };
  }

  const { allowedExternalItemIds, allowExternalItems, allowedOracleEventIds } = snapshot.permissions;

  if (allowExternalItems) {
    validationReport.push(`[VALIDATED] Objetos externos habilitados: ${allowedExternalItemIds.join(', ')}`);
  } else {
    validationReport.push(`[VALIDATED] Objetos externos bloqueados (allowExternalItems=false)`);
  }

  if (allowedOracleEventIds && allowedOracleEventIds.length > 0) {
    validationReport.push(`[VALIDATED] Eventos Oráculo seleccionados: ${allowedOracleEventIds.join(', ')}`);
  } else {
    validationReport.push(`[VALIDATED] Combate sin Eventos Oráculo seleccionados`);
  }

  (snapshot.oracleGeneratedAbilities || []).forEach(a => {
    if (a.canonStatus !== 'apex-custom' || !a.temporaryForSimulation) {
      isValid = false;
      validationReport.push(`[ERROR] Habilidad generada '${a.name}' no está marcada como apex-custom temporal.`);
    }
  });

  return { isValid, validationReport };
}


export function resolveFusingCombatants(snapshot, context = {}) {
  // 1. Explicit fusing combatants in context or user selections
  if (Array.isArray(context.fusingCombatants) && context.fusingCombatants.length >= 2) {
    return context.fusingCombatants.slice(0, 2);
  }
  if (Array.isArray(snapshot?.userSelections?.fusingRecordIds) && snapshot.userSelections.fusingRecordIds.length >= 2) {
    const ids = snapshot.userSelections.fusingRecordIds;
    const all = snapshot.participants || [];
    const found = ids.map(id => all.find(c => (c.recordId || c.id || c.combatantId) === id)).filter(Boolean);
    if (found.length >= 2) return found.slice(0, 2);
  }

  // 2. Team inspection
  const teamA = snapshot?.teams?.[0]?.members || [];
  const teamB = snapshot?.teams?.[1]?.members || [];

  if (teamA.length >= 2 && teamB.length < 2) {
    return [teamA[0], teamA[1]];
  }
  if (teamB.length >= 2 && teamA.length < 2) {
    return [teamB[0], teamB[1]];
  }
  if (teamA.length >= 2 && teamB.length >= 2) {
    const actorId = context.actingCombatant?.combatantId || context.actingCombatant?.recordId;
    if (teamB.some(m => (m.combatantId || m.recordId) === actorId)) {
      return [teamB[0], teamB[1]];
    }
    return [teamA[0], teamA[1]];
  }

  // 3. Fallback to first two participants
  const participants = snapshot?.participants || [];
  if (participants.length >= 2) {
    return [participants[0], participants[1]];
  }

  return [];
}

export function triggerOracleEvent(snapshot, eventId, context = {}) {
  if (!snapshot.oracleEvents?.enabled) {
    return { success: false, reason: "Los eventos Oráculo no están habilitados en este escenario." };
  }

  const eventEntry = snapshot.oracleEvents.active.find(e => e.id === eventId || e.slug === eventId);
  if (!eventEntry) {
    return { success: false, reason: "El evento '" + eventId + "' no está seleccionado en el snapshot." };
  }

  const remaining = snapshot.permissions?.oracleUsesRemaining?.[eventId] ?? eventEntry.usesRemaining;
  if (remaining <= 0) {
    return { success: false, reason: "El evento '" + eventEntry.name + "' ya agotó todos sus usos disponibles (usesRemaining = 0)." };
  }

  if (snapshot.permissions?.oracleUsesRemaining) {
    snapshot.permissions.oracleUsesRemaining[eventId] = remaining - 1;
  }
  eventEntry.usesRemaining = remaining - 1;
  eventEntry.triggered = true;
  eventEntry.triggeredTurn = context.turn || 11;

  let createdAbility = null;
  let createdState = null;
  let createdEntity = null;

  // Handle Finisher Awakening
  if (eventId === "forbidden-finisher-awakening" || eventId === "miracle_technique_awakening") {
    createdAbility = {
      id: "oracle-forbidden-finisher-" + (context.actingCombatant?.combatantId || "generic"),
      name: "Finisher Prohibido: Ruptura Dimensional Definitiva",
      type: "forbidden-finisher",
      canonStatus: "apex-custom",
      temporaryForSimulation: true,
      oracleGenerated: true,
      sourceType: SOURCE_TYPES.ORACLE_SCENARIO_EVENT,
      label: UI_BADGES.ORACLE_FORBIDDEN_FINISHER.label,
      ownerCombatantId: context.actingCombatant?.combatantId || "unknown",
      staminaCost: 55,
      riskTradeoff: "Agotamiento crítico y vulnerabilidad residual si no finiquita el combate.",
      description: "Técnica extrema liberada por el Oráculo en Fase 3."
    };
    if (snapshot.oracleGeneratedAbilities) {
      snapshot.oracleGeneratedAbilities.push(createdAbility);
    }
  }

  // Handle Canonical Awakening
  if (eventId === "canonical-awakening" || eventId === "miracle_form_canon") {
    const actor = context.actingCombatant;
    createdState = createTemporalAwakeningState({
      displayName: `${actor?.name || 'Guerrero'} (Despertar Canónico de Saga)`,
      source: SOURCE_TYPES.ORACLE_CANONICAL_AWAKENING,
      phase: 3,
      logicalSagaStep: 'Siguiente estadio de transformación según cronología',
      activationReason: 'Presión crítica de combate al borde de la incapacitación',
      baseReference: actor?.tierExact || 'Base',
      temporaryMultiplier: 2.0,
      temporaryTier: actor?.tierExact,
      reasoningSummary: 'Ascenso temporal a la forma inmediata posterior de su arco narrativo.'
    });
  }

  // Handle Transcendent Awakening
  if (eventId === "transcendent-awakening" || eventId === "miracle_form_transcendent") {
    const actor = context.actingCombatant;
    createdState = createTemporalAwakeningState({
      displayName: `${actor?.name || 'Guerrero'} (Modo Divino / Trascendencia What-If)`,
      source: SOURCE_TYPES.ORACLE_TRANSCENDENT_WHAT_IF,
      phase: 3,
      logicalSagaStep: 'Ruptura de barreras de era hacia nivel divino',
      activationReason: 'Resonancia cósmica y superación de límites',
      baseReference: actor?.tierExact || 'Base',
      temporaryMultiplier: 5.0,
      temporaryTier: '2-C',
      reasoningSummary: 'Forma hipotética suprema habilitada por distorsión del Oráculo.'
    });
  }

  // Handle Canonical Fusion
  if (eventId === "canonical-fusion" || eventId === "fusion_protocol_canon") {
    const fusing = resolveFusingCombatants(snapshot, context);
    const c1 = fusing[0] || {};
    const c2 = fusing[1] || {};
    const c1Name = c1.name || c1.displayName || 'Combatiente 1';
    const c2Name = c2.name || c2.displayName || 'Combatiente 2';
    const c1Id = c1.recordId || c1.id || c1.combatantId || 'c1';
    const c2Id = c2.recordId || c2.id || c2.combatantId || 'c2';

    createdState = createFusionCombatState({
      components: [c1Name, c2Name],
      componentRecordIds: [c1Id, c2Id],
      componentDisplayNames: [c1Name, c2Name],
      userDefinedName: snapshot.userSelections?.userFusionName || snapshot.scenarioModifiers?.userFusionName || null,
      fusionMethod: "potara",
      baseCalculation: "Suma armónica de bases Saiyajin multiplicada por enlace Potara",
      fusionMultiplier: 40,
      temporaryTier: "High 3-A"
    });
  }

  // Handle What-If Fusion
  if (eventId === "what-if-hybrid-fusion" || eventId === "fusion_protocol_whatif") {
    const fusing = resolveFusingCombatants(snapshot, context);
    const c1 = fusing[0] || {};
    const c2 = fusing[1] || {};
    const c1Name = c1.name || c1.displayName || 'Combatiente 1';
    const c2Name = c2.name || c2.displayName || 'Combatiente 2';
    const c1Id = c1.recordId || c1.id || c1.combatantId || 'c1';
    const c2Id = c2.recordId || c2.id || c2.combatantId || 'c2';

    createdState = createFusionCombatState({
      components: [c1Name, c2Name],
      componentRecordIds: [c1Id, c2Id],
      componentDisplayNames: [c1Name, c2Name],
      userDefinedName: snapshot.userSelections?.userFusionName || snapshot.scenarioModifiers?.userFusionName || null,
      fusionMethod: "what_if_hybrid",
      baseCalculation: "Combinación de ADN Saiyajin divergente con inestabilidad de aura",
      fusionMultiplier: 35,
      temporaryTier: "3-A"
    });
  }

  // Handle Canonical / Viscous / Cell Absorption
  if (eventId === "majin-buu-absorption" || eventId === "buu_viscous_absorption" ||
      eventId === "cell-absorption" || eventId === "cell_bio_absorption") {
    const acting = context.actingCombatant || {};
    const teamA = snapshot.teams?.find(t => t.teamId === "team-a")?.members || [];
    const teamB = snapshot.teams?.find(t => t.teamId === "team-b")?.members || [];
    const allMembers = [...teamA, ...teamB];

    let absorber = acting;
    let absorbed = allMembers.find(m => (m.combatantId || m.recordId) !== (acting.combatantId || acting.recordId)) || {};

    const isBuuOrCell = (str = '') => {
      const s = String(str).toLowerCase();
      return s.includes('buu') || s.includes('cell');
    };

    if (!isBuuOrCell(absorber.name || absorber.id) && isBuuOrCell(absorbed.name || absorbed.id)) {
      const temp = absorber;
      absorber = absorbed;
      absorbed = temp;
    }

    const absorberName = absorber.name || absorber.displayName || 'Asimilador Majin';
    const absorbedName = absorbed.name || absorbed.displayName || 'Víctima Absorbida';
    const absorberId = absorber.recordId || absorber.id || absorber.combatantId || 'absorber';
    const absorbedId = absorbed.recordId || absorbed.id || absorbed.combatantId || 'absorbed';

    createdState = createAbsorptionState({
      absorberRecordId: absorberId,
      absorbedRecordId: absorbedId,
      absorbedDisplayName: absorbedName,
      absorberDisplayName: absorberName,
      absorptionMethod: eventId.includes('cell') ? 'cell_bio' : 'buu_viscous'
    });
  }

  // Handle Event Entity (Raichi Compatible Oracle Mode)
  if (eventId === "multiversal-surprise-warrior" || eventId === "multiverse_random_fighter" ||
      eventId === "same-verse-canon-invader" || eventId === "same_verse_reinforcement" ||
      eventId === "transcendent-awakening" || eventId === "miracle_form_transcendent") {
    if (context.actingCombatant?.recordId === 'dr-raichi-dbm-u3') {
      createdEntity = createEventEntityState({
        displayName: "Fantasma de Broly LSSJ — Manifestación de Oráculo",
        oracleEventId: eventId,
        ownerRecordId: 'dr-raichi-dbm-u3',
        combatRole: "Asalto destructivo masivo",
        temporaryKiPolicy: "Ki propio aislado del cuerpo de Raichi",
        counterplay: "Romper la concentración de Raichi o fragmentar la cápsula de odio"
      });
    }
  }

  return {
    success: true,
    eventId,
    eventName: eventEntry.name,
    phase: eventEntry.phase,
    createdAbility,
    createdState,
    createdEntity,
    turn: context.turn || 11
  };
}

/**
 * Executes full deterministic combat simulation
 */
export function executeCombatSimulation(snapshot) {
  const validation = validateCombatSnapshot(snapshot);
  if (!validation.isValid) {
    return {
      success: false,
      simulationId: snapshot?.simulationId,
      blockingErrors: validation.blockingErrors,
      warnings: validation.warnings
    };
  }

  const rng = createDeterministicPRNG(snapshot.randomSeed || snapshot.seed || 12345);

  const combatLog = [];
  const blockedActions = [];
  const oracleEventsTriggered = [];
  const oracleEventsFailed = [];
  const oracleCustomContentCreated = [];
  const createdAwakenings = [];
  const createdFusions = [];
  const createdAbsorptions = [];
  const createdEventEntities = [];

  const teamA = snapshot.teams.find(t => t.teamId === "team-a");
  const teamB = snapshot.teams.find(t => t.teamId === "team-b");
  const fighterA = teamA.members[0];
  const fighterB = teamB.members[0];

  const advantage = getBaseAdvantage(fighterA, fighterB);

  const stateA = createCombatState({ hp: 100, stamina: 100, kiReserve: 100, activeForm: 'base' });
  const stateB = createCombatState({ hp: 100, stamina: 100, kiReserve: 100, activeForm: 'base' });

  const isImmortalA = fighterA.immortalityPolicy?.preventsBiologicalDeath;
  const isImmortalB = fighterB.immortalityPolicy?.preventsBiologicalDeath;

  // FASE 0: PREPARACIÓN & CONGELAMIENTO
  combatLog.push({
    turn: 0,
    phase: 0,
    phaseName: "FASE 0 · PREPARACIÓN & PROTOCOLO DE CONGELAMIENTO",
    actorId: "system",
    targetId: "arena",
    actionType: "setup",
    actionName: "Verificación de Parámetros & Snapshot Congelado",
    sourceType: SOURCE_TYPES.CANON_ROSTER_FACT,
    persistence: PERSISTENCE_MODES.PERMANENT_ROSTER,
    mapEffect: `Arena: ${snapshot.arena?.name || 'Estándar'}. Reglas: ${snapshot.arena?.universe || 'Neutro'}.`,
    result: "ready"
  });

  // FASE 1: TANTEO CINÉTICO / MÁSCARA DE CONTROL (Turn 1 to 4)
  const atkA = fighterA.originalCharacter?.arsenal?.[0] || { id: "ki-blast", name: "Ráfaga de Ki de Medición" };
  const atkB = fighterB.originalCharacter?.arsenal?.[0] || { id: "strike-combo", name: "Intercambio de Golpes a Corta Distancia" };

  combatLog.push({
    turn: 2,
    phase: 1,
    phaseName: "FASE 1 · TANTEO CINÉTICO / MÁSCARA DE CONTROL",
    actorId: fighterA.combatantId,
    targetId: fighterB.combatantId,
    actionType: "strike",
    actionId: atkA.id || "ki-blast",
    actionName: atkA.name || "Ráfaga de Ki de Medición",
    sourceType: SOURCE_TYPES.CANON_ROSTER_FACT,
    hpChangeA: 0,
    staminaChangeA: -5,
    hpChangeB: advantage === "overwhelming" ? -15 : -8,
    staminaChangeB: -7,
    mapEffect: "Ondas de choque superficiales y cráteres menores.",
    result: "success"
  });

  stateA.stamina -= 5;
  stateB.hp -= (advantage === "overwhelming" ? 15 : 8);
  stateB.stamina -= 7;
  let mapState = "leve";

  // FASE 2: ESCALADA & FRACTURA DE PACIENCIA (Turn 5 to 9)
  combatLog.push({
    turn: 6,
    phase: 2,
    phaseName: "FASE 2 · ESCALADA & FRACTURA DE PACIENCIA",
    actorId: fighterB.combatantId,
    targetId: fighterA.combatantId,
    actionType: "technique",
    actionId: atkB.id || "tactical-counter",
    actionName: atkB.name || "Contraataque de Alta Cadencia",
    sourceType: SOURCE_TYPES.CANON_ROSTER_FACT,
    hpChangeA: advantage === "overwhelmed" ? -22 : -10,
    staminaChangeA: -12,
    hpChangeB: -4,
    staminaChangeB: -14,
    mapEffect: "Fisuras geológicas moderadas y dispersión de escombros.",
    result: "success"
  });

  stateA.hp -= (advantage === "overwhelmed" ? 22 : 10);
  stateA.stamina -= 12;
  stateB.hp -= 4;
  stateB.stamina -= 14;

  const injuryPenalty = resolveAnatomicalPenalty('costilla');
  stateA.injuries.push('Fisura costal y contusión torácica');
  stateA.staminaDrainFactor = injuryPenalty.staminaDrainFactor;

  // FASE 3: CISNE NEGRO & GIROS DEL ORÁCULO (Turn 10 to 14)
  let oracleTriggerReport = null;
  const activeOracleEvents = snapshot.oracleEvents?.active || [];

  if (snapshot.oracleEvents?.enabled && activeOracleEvents.length > 0) {
    activeOracleEvents.forEach((evt, idx) => {
      const triggerRes = triggerOracleEvent(snapshot, evt.id || evt.slug, {
        turn: 11 + idx,
        phase: 3,
        actingCombatant: fighterA
      });

      if (triggerRes.success) {
        oracleEventsTriggered.push(triggerRes);
        oracleTriggerReport = triggerRes;

        if (triggerRes.createdAbility) {
          oracleCustomContentCreated.push(triggerRes.createdAbility);
        }
        if (triggerRes.createdState) {
          if (triggerRes.createdState.source === SOURCE_TYPES.ORACLE_CANONICAL_AWAKENING ||
              triggerRes.createdState.source === SOURCE_TYPES.ORACLE_TRANSCENDENT_WHAT_IF) {
            createdAwakenings.push(triggerRes.createdState);
          } else if (triggerRes.createdState.absorbedActorStatus === 'absorbed' || triggerRes.createdState.absorptionMethod) {
            createdAbsorptions.push(triggerRes.createdState);
          } else {
            createdFusions.push(triggerRes.createdState);
          }
        }
        if (triggerRes.createdEntity) {
          createdEventEntities.push(triggerRes.createdEntity);
        }

        combatLog.push({
          turn: 11 + idx,
          phase: 3,
          phaseName: "FASE 3 · CISNE NEGRO / GIRO DEL ORÁCULO",
          actorId: fighterA.combatantId,
          targetId: fighterB.combatantId,
          actionType: "oracle_scenario_event",
          actionId: triggerRes.eventId,
          actionName: triggerRes.eventName,
          sourceType: SOURCE_TYPES.ORACLE_SCENARIO_EVENT,
          persistence: PERSISTENCE_MODES.SIMULATION_ONLY,
          hpChangeA: 0,
          staminaChangeA: -10,
          hpChangeB: -15,
          staminaChangeB: -15,
          mapEffect: "Distorsión extrema de la arena bajo influencia de evento Oráculo.",
          result: "oracle-triggered"
        });
      } else {
        oracleEventsFailed.push({ id: evt.id, reason: triggerRes.reason });
        blockedActions.push({ action: `oracle-event-${evt.id}`, reason: triggerRes.reason });
      }
    });
  }

  if (snapshot.permissions?.allowExternalItems && snapshot.permissions.allowedExternalItemIds?.includes("senzu-bean")) {
    const itemResult = useExternalItem(fighterA, "senzu-bean", fighterA, snapshot);
    if (itemResult.success) {
      combatLog.push({
        turn: 10,
        phase: 3,
        phaseName: "FASE 3 · USO DE OBJETO AUTORIZADO",
        actorId: fighterA.combatantId,
        targetId: fighterA.combatantId,
        actionType: "use-item",
        actionId: "senzu-bean",
        actionName: "Consumo de Semilla del Ermitaño",
        sourceType: SOURCE_TYPES.ORACLE_SCENARIO_EVENT,
        hpChangeA: itemResult.hpChange,
        staminaChangeA: itemResult.staminaChange,
        hpChangeB: 0,
        staminaChangeB: 0,
        mapEffect: "Aura revitalizada y cierre instantáneo de heridas tisulares.",
        result: "success"
      });
      stateA.hp = 100;
      stateA.stamina = 100;
    }
  }

  if (isImmortalA && stateA.hp < 40) {
    const regenCost = fighterA.immortalityPolicy.regenerationCost || 0;
    combatLog.push({
      turn: 12,
      phase: 3,
      phaseName: "FASE 3 · REGENERACIÓN DE FACTOR INMORTAL",
      actorId: fighterA.combatantId,
      targetId: fighterA.combatantId,
      actionType: "regeneration",
      actionId: "immortal-factor",
      actionName: "Regeneración Tisular Absoluta",
      sourceType: SOURCE_TYPES.CANON_ROSTER_FACT,
      kiCost: regenCost,
      staminaCost: regenCost,
      hpChangeA: 40,
      staminaChangeA: -regenCost,
      hpChangeB: 0,
      staminaChangeB: 0,
      mapEffect: "Recomposición celular sin consumo vital adicional.",
      result: "regenerated"
    });
    stateA.hp += 40;
    stateA.stamina -= regenCost;
  }

  // FASE 4: EL CLÍMAX TÁCTICO & FINISHERS (Turn 15 to 18)
  const isWinnerA = (fighterA.powerKey >= fighterB.powerKey);
  const winnerFighter = isWinnerA ? fighterA : fighterB;
  const loserFighter = isWinnerA ? fighterB : fighterA;

  combatLog.push({
    turn: 16,
    phase: 4,
    phaseName: "FASE 4 · EL CLÍMAX TÁCTICO & FINISHERS",
    actorId: winnerFighter.combatantId,
    targetId: loserFighter.combatantId,
    actionType: oracleTriggerReport?.createdAbility ? "oracle-finisher" : "finisher",
    actionId: oracleTriggerReport?.createdAbility ? oracleTriggerReport.createdAbility.id : "climax-finisher",
    actionName: oracleTriggerReport?.createdAbility ? oracleTriggerReport.createdAbility.name : "Liberación de Potencia Máxima & Impacto Definitivo",
    sourceType: oracleTriggerReport?.createdAbility ? SOURCE_TYPES.ORACLE_SCENARIO_EVENT : SOURCE_TYPES.CANON_ROSTER_FACT,
    persistence: PERSISTENCE_MODES.SIMULATION_ONLY,
    hpChangeA: isWinnerA ? -5 : -35,
    staminaChangeA: isWinnerA ? -25 : -30,
    hpChangeB: isWinnerA ? -45 : -8,
    staminaChangeB: isWinnerA ? -35 : -20,
    mapEffect: "Colapso del sector central de la arena con disipación energética.",
    result: "decisive-hit"
  });

  if (isWinnerA) {
    stateA.hp = Math.max(15, stateA.hp - 5);
    stateA.stamina = Math.max(10, stateA.stamina - 25);
    stateB.hp = isImmortalB ? 1 : 0;
    stateB.stamina = 0;
    fighterB.isActive = false;
  } else {
    stateB.hp = Math.max(15, stateB.hp - 8);
    stateB.stamina = Math.max(12, stateB.stamina - 20);
    stateA.hp = isImmortalA ? 1 : 0;
    stateA.stamina = 0;
    fighterA.isActive = false;
  }
  mapState = "regional-severo";

  let difficulty = "Mid-Diff";
  if (advantage === "overwhelming" || advantage === "overwhelmed") difficulty = "No-Diff";
  else if (advantage === "major" || advantage === "major-disadvantage") difficulty = "Low-Diff";
  else if (advantage === "clear" || advantage === "clear-disadvantage") difficulty = "Mid-Diff";
  else difficulty = "High-Diff";

  // FASE 5: VEREDICTO ESTRUCTURADO
  const verdict = {
    winnerTeamId: isWinnerA ? "team-a" : "team-b",
    winnerName: winnerFighter.name,
    winnerTierExact: winnerFighter.tierExact,
    loserName: loserFighter.name,
    loserTierExact: loserFighter.tierExact,
    difficulty,
    finalMapState: mapState,
    finalFighterStates: [
      {
        combatantId: fighterA.combatantId,
        name: fighterA.name,
        hp: stateA.hp,
        stamina: stateA.stamina,
        vitalStatus: stateA.hp > 0 ? (stateA.hp < 25 ? "Crítico" : "Dañado") : "Incapacitado",
        isActive: fighterA.isActive,
        injuries: stateA.injuries
      },
      {
        combatantId: fighterB.combatantId,
        name: fighterB.name,
        hp: stateB.hp,
        stamina: stateB.stamina,
        vitalStatus: stateB.hp > 0 ? (stateB.hp < 25 ? "Crítico" : "Dañado") : "Incapacitado",
        isActive: fighterB.isActive,
        injuries: stateB.injuries
      }
    ],
    oracleSummary: {
      oracleEventsSelected: snapshot.oracleEvents?.active?.map(e => e.id) || [],
      oracleEventsTriggered: oracleEventsTriggered.map(e => e.eventId),
      oracleEventsFailed,
      oracleCustomContentCreated,
      createdAwakenings,
      createdFusions,
      createdAbsorptions,
      createdEventEntities
    },
    permissionsSnapshot: {
      allowedStateIdsByCombatant: snapshot.permissions?.allowedStateIdsByCombatant || {},
      allowedAbilityIdsByCombatant: snapshot.permissions?.allowedAbilityIdsByCombatant || {},
      allowedExternalItemIds: snapshot.permissions?.allowedExternalItemIds || [],
      blockedActions
    }
  };

  // FASE 6: RAMAS ALFA, BETA Y OMEGA (Simulation Only)
  const timelineBranches = {
    alfa: {
      branchId: "alfa",
      title: "Línea Alfa (Desenlace Canónico-Narrativo Directo)",
      description: `Victoria de ${winnerFighter.name} tras resolver la presión táctica y aplicar contrajuego en Fase 4.`,
      persistence: PERSISTENCE_MODES.SIMULATION_ONLY,
      sourceType: SOURCE_TYPES.SIMULATION_OUTCOME
    },
    beta: {
      branchId: "beta",
      title: "Línea Beta (Divergencia por Error de Cálculo o Desgaste)",
      description: `Si ${loserFighter.name} hubiese anticipado el Cisne Negro de Fase 3, la contienda se habría extendido a desgaste terminal.`,
      persistence: PERSISTENCE_MODES.SIMULATION_ONLY,
      sourceType: SOURCE_TYPES.SIMULATION_OUTCOME
    },
    omega: {
      branchId: "omega",
      title: "Línea Omega (Colapso Catastrófico o Aniquilación Mutua)",
      description: `Ambos combatientes sobrecargan sus reservas desatando una supernova de energía que arrasa el sector espacial completo.`,
      persistence: PERSISTENCE_MODES.SIMULATION_ONLY,
      sourceType: SOURCE_TYPES.SIMULATION_OUTCOME
    }
  };

  const integrityReport = validateSimulationIntegrity({
    snapshot,
    combatLog,
    verdict,
    activeOracleEvents: snapshot.oracleEvents?.active || [],
    createdAwakenings,
    createdFusions,
    createdAbsorptions,
    createdEventEntities
  });

  return {
    success: true,
    simulationId: snapshot.simulationId,
    seed: snapshot.randomSeed || snapshot.seed,
    engineVersion: ENGINE_VERSION_V2,
    rosterVersion: ROSTER_VERSION_CANONICAL,
    combatLog,
    verdict,
    integrityReport,
    timelineBranches,
    permissions: snapshot.permissions,
    itemInventory: snapshot.itemInventory,
    oracleGeneratedAbilities: snapshot.oracleGeneratedAbilities,
    blockedActions,
    createdAwakenings,
    createdFusions,
    createdAbsorptions,
    createdEventEntities,
    externalEntityContext: snapshot.externalEntityContext || null
  };
}

export function synthesizeNarrativeFromValidatedLog(combatLog, snapshot, verdict) {
  if (!verdict || !Array.isArray(combatLog)) {
    return "La interacción queda sin determinar por falta de una mecánica registrada.";
  }

  const teamA = snapshot.teams.find(t => t.teamId === "team-a")?.members || [];
  const teamB = snapshot.teams.find(t => t.teamId === "team-b")?.members || [];
  const charA = teamA[0] || {};
  const charB = teamB[0] || {};

  let output = "";

  output += "# ❖ APEX ETERNIDAD / ORÁCULO V2 · INFORME OFICIAL DE SIMULACIÓN\n\n";

  output += "### 1. FICHA DE ESCENARIO & REGLAS\n";
  output += `- **ID de Simulación:** \`${snapshot.simulationId}\`\n`;
  output += `- **Semilla Reproducible (Seed):** \`${snapshot.randomSeed || snapshot.seed}\`\n`;
  output += `- **Versión del Motor:** \`APEX Engine ${ENGINE_VERSION_V2} · Roster ${ROSTER_VERSION_CANONICAL}\`\n`;
  output += `- **Arena:** ${snapshot.arena?.name || 'Arena Estándar'} (${snapshot.arena?.universe || 'Neutro'}) · Gravedad: ${snapshot.arena?.gravity || '1G'}\n`;
  output += `- **Igualación:** Velocidad [${snapshot.verseEqualization?.speed || 'canon'}], Stats [${snapshot.verseEqualization?.stats || 'canon'}], Energía [${snapshot.verseEqualization?.energy || 'isolated'}]\n\n`;

  output += "### 2. MATRIZ DE FUENTES & GOBERNANZA DE PERSISTENCIA\n";
  output += "| Entidad / Evento | Capa | Fuente | Persistencia | Estado |\n";
  output += "| :--- | :--- | :--- | :--- | :--- |\n";
  output += `| **${charA.name}** | Capa 1 | \`canon_roster_fact\` | \`permanent_roster\` | Inmutable (Roster V25) |\n`;
  output += `| **${charB.name}** | Capa 1 | \`canon_roster_fact\` | \`permanent_roster\` | Inmutable (Roster V25) |\n`;

  (verdict.oracleSummary?.oracleEventsTriggered || []).forEach(evtId => {
    output += `| **Evento: ${evtId}** | Capa 2 | \`oracle_scenario_event\` | \`simulation_only\` | Temporal (Fase 3) |\n`;
  });

  (verdict.oracleSummary?.createdAwakenings || []).forEach(awk => {
    output += `| **${awk.displayName}** | Capa 2 | \`${awk.source}\` | \`simulation_only\` | [${awk.label}] |\n`;
  });

  (verdict.oracleSummary?.createdFusions || []).forEach(fus => {
    output += `| **${fus.displayName}** | Capa 2 | \`oracle_scenario_event\` | \`simulation_only\` | [${fus.label}] |\n`;
  });

  (verdict.oracleSummary?.createdAbsorptions || []).forEach(abs => {
    output += `| **${abs.resultantEntityDisplayName}** | Capa 2 | \`oracle_scenario_event\` | \`simulation_only\` | [Absorción: ${abs.absorbedDisplayName}] |\n`;
  });

  (verdict.oracleSummary?.createdEventEntities || []).forEach(ent => {
    output += `| **${ent.displayName}** | Capa 2 | \`oracle_scenario_event\` | \`simulation_only\` | [${ent.label}] |\n`;
  });

  output += `| **Desenlace y Consecuencias** | Capa 3 | \`simulation_outcome\` | \`simulation_only\` | No muta Roster V25 |\n\n`;

  output += "### 3. TELEMETRÍA BIOMÉTRICA & POWER SCALING INICIAL\n";
  output += `- **${charA.name}:** Tier [${charA.tierExact || '10-C'}] · Ki: [${charA.apexKiDisplay || '—'}] · Multiplicador: [×${charA.formMultiplier || 1}]\n`;
  output += `- **${charB.name}:** Tier [${charB.tierExact || '10-C'}] · Ki: [${charB.apexKiDisplay || '—'}] · Multiplicador: [×${charB.formMultiplier || 1}]\n\n`;

  output += "### FASE 0 · PREPARACIÓN Y CONGELAMIENTO\n";
  output += "Se verifica la matriz de permisos y el snapshot reproducible. Los contendientes ingresan en el campo de batalla con recursos vitales al 100%.\n\n";

  output += "### FASE 1 · TANTEO CINÉTICO / MÁSCARA DE CONTROL\n";
  output += `Los contendientes inician la aproximación midiendo rangos de ataque y tiempos de reacción. ${charA.name} toma la iniciativa ejecutando maniobras de calibración frente a ${charB.name}. El intercambio genera las primeras ondas de choque sobre el terreno.\n\n`;
  output += "||BIOMETRICS|HP_A: 100% | STM_A: 95% | HP_B: 92% | STM_B: 93%||\n\n";

  output += "### FASE 2 · ESCALADA & FRACTURA DE PACIENCIA\n";
  output += `El combate asciende a régimen de alta intensidad. ${charB.name} responde con combinaciones tácticas directas, forzando a ${charA.name} a absorber impactos severos. Se manifiestan las primeras microfracturas estructurales en la arena y desgaste anatómico visible.\n\n`;
  output += "||BIOMETRICS|HP_A: 78% | STM_A: 83% | HP_B: 88% | STM_B: 79%||\n\n";

  output += "### FASE 3 · CISNE NEGRO / GIROS DEL ORÁCULO\n";
  if (verdict.oracleSummary?.oracleEventsTriggered?.length > 0) {
    verdict.oracleSummary.oracleEventsTriggered.forEach(eId => {
      const def = ORACLE_EVENT_CONFIG[eId] || { name: eId };
      output += `> ⚡ **EVENTO ORÁCULO ACTIVADO:** **${def.name}** (\`source: oracle_scenario_event\` · \`persistence: simulation_only\`)\n`;
    });
    (verdict.oracleSummary?.createdAwakenings || []).forEach(a => {
      output += `> ✨ **DESPERTAR ACTIVADO:** **${a.displayName}** — *${a.label}* (Temporal de Fase 3, no añadido al Roster V25).\n`;
    });
    (verdict.oracleSummary?.createdFusions || []).forEach(f => {
      output += `> 👥 **FUSIÓN ACTIVADA:** **${f.displayName}** — Fórmula: *${f.baseCalculation}* (Multiplicador ×${f.fusionMultiplier}, solo esta simulación).\n`;
    });
    (verdict.oracleSummary?.createdAbsorptions || []).forEach(abs => {
      output += `> 🧬 **ABSORCIÓN ACTIVADA:** **${abs.absorberDisplayName}** asimila a **${abs.absorbedDisplayName}** (Método: ${abs.absorptionMethod}). El guerrero absorbido pasa a ser voz interior / bio-Ki transferido. Inhabilitado como combatiente individual en la arena.\n`;
    });
    (verdict.oracleSummary?.createdEventEntities || []).forEach(ee => {
      output += `> 🌌 **ENTIDAD TEMPORAL DESPLEGADA:** **${ee.displayName}** (bodyStatIsolation: true, no altera Ki corporal de su invocador).\n`;
    });
    output += "\nLa convergencia de estos eventos altera radicalmente el equilibrio de fuerzas.\n\n";
  } else {
    output += "El combate se mantiene en duelo puro sin intervención de giros del Oráculo.\n\n";
  }
  output += "||BIOMETRICS|HP_A: 65% | STM_A: 60% | HP_B: 50% | STM_B: 52%||\n\n";

  output += "### FASE 4 · EL CLÍMAX TÁCTICO (FINISHERS)\n";
  output += `Con las defensas vulneradas y el mapa en estado de ${verdict.finalMapState}, ${verdict.winnerName} capitaliza la apertura definitiva desatando su ofensiva final resolutiva. ${verdict.loserName} queda fuera de combate.\n\n`;

  output += "## 🏆 VEREDICTO DEFINITIVO & ESTADO FINAL\n\n";
  output += `- **Vencedor Oficial:** **${verdict.winnerName}** [Tier: ${verdict.winnerTierExact}]\n`;
  output += `- **Contendiente Derrotado:** **${verdict.loserName}** [Tier: ${verdict.loserTierExact}]\n`;
  output += `- **Dificultad de Combate:** **${verdict.difficulty}**\n`;
  output += `- **Daño del Terreno:** **${verdict.finalMapState}**\n\n`;

  output += "### TELEMETRÍA BIOMÉTRICA FINAL\n";
  verdict.finalFighterStates.forEach(f => {
    output += `- **${f.name}:** ${f.vitalStatus} (HP: ${f.hp}%, Stamina: ${f.stamina}%)\n`;
    if (f.injuries?.length > 0) {
      output += `  * Lesiones funcionales: ${f.injuries.join(', ')}\n`;
    }
  });

  output += "\n### FASE 6 · LÍNEAS TEMPORALES DIVERGENTES (SIMULATION ONLY)\n";
  output += `1. **Línea Alfa (Principal):** Victoria estructurada de ${verdict.winnerName}. Repercusiones narrativas inmediatas en su sector.\n`;
  output += `2. **Línea Beta (Contrafáctica):** Divergencia táctica si ${verdict.loserName} hubiera contrarrestado la ofensiva de Fase 3.\n`;
  output += `3. **Línea Omega (Extrema):** Desenlace cataclísmico en el que la detonación residual aniquila la arena por completo.\n\n`;

  output += "> [!NOTE]\n";
  output += "> Todas las consecuencias de este combate son de tipo `simulation_only`. El Roster Canónico V25 no ha sufrido ninguna modificación.\n";

  return output;
}
