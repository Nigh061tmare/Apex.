// APEX Powerscaling Engine — Combat Core v1.0 (Master Engine Specification)
// Núcleo Operativo de Resolución, Recursos, Verse Equalization, Capas de Resistencia, Bosses y Memoria Persistente.

/**
 * 1. ORDEN UNIVERSAL DE RESOLUCIÓN DE COMBATE (Fase 0 a Fase 11)
 */
export const COMBAT_RESOLUTION_ORDER = [
  "Fase 0 — Validación de Escena (Presencia física, consciencia, bandos, distancias, collateral_risk y rehenes/civiles)",
  "Fase 1 — Estados de Inicio de Turno (Aplicación de DoTs, sangrados, drenajes de energía y penalizaciones)",
  "Fase 2 — Pasivas Automáticas (Regeneración base, auras, absorción continua, divine_resonance, sin anulación total gratuita)",
  "Fase 3 — Campo de Batalla y Entorno (Hazard zones, space_folded, containment_field, radiación, clima y oxígeno)",
  "Fase 4 — Iniciativa, Velocidad y Percepción (Cálculo de velocidad cinética/relativa, precognición y emboscadas)",
  "Fase 5 — Sinergias de Equipo (Validación de tags, miembros conscientes, rango métrico y roles tácticos)",
  "Fase 6 — Declaración de Acción (Validación de restricciones: focus_broken, transformation_locked, joint_lock, cooldowns)",
  "Fase 7 — Validación de Combo (Comprobación de triggers, recursos de todos los integrantes y counter-tags del rival)",
  "Fase 8 — Resolución de Defensas por Capas (Posición -> Física -> Barrera -> Energía -> Biología -> Mente -> Alma -> Espacio -> Causalidad)",
  "Fase 9 — Daño, Estados y Consecuencias (Daño directo, daño a barreras, lesiones anatómicas, exposición de núcleos y entorno)",
  "Fase 10 — Transformaciones y Fases de Boss (Limit break, berserker_escalation, desperation_protocol y transición de Boss)",
  "Fase 11 — Fin de Turno (Regeneración con coste real, recuperación parcial, decremento de cooldowns y actualización de Combat Log)"
];

/**
 * 2. MODELO DE RECURSOS UNIVERSALES
 */
export const UNIFIED_RESOURCE_POOLS = {
  hp: {
    name: "Integridad Física / Anatómica (HP)",
    desc: "100-70% Normal · 69-40% Heridas visibles · 39-20% Crítico moderado · 19-6% Crítico (Last Stand / Limit Break) · 5-1% Acción final · 0% Incapacitado/Destruido.",
    defaultMax: 100
  },
  stamina: {
    name: "Stamina / Capacidad Física",
    desc: "Gasto en CQC pesado (10-25), esquivas consecutivas (5-15), grappling (10/turno) y combos marciales (25-45). Si <20% aplica exhaustion_state.",
    defaultMax: 100
  },
  primary_energy: {
    name: "Energía Primaria del Verso",
    desc: "Ki (DB), Energía Maldita (JJK), Nen (HxH), Energía Cósmica (Marvel/DC), Speed Force (DC), Carga de Reactor (Sci-fi) o Sangre/Contrato (CSM).",
    defaultMax: 100
  },
  focus: {
    name: "Focus / Concentración Técnica",
    desc: "Requerido para Dominios, Mafūba, sellos, rituales, tiros de precisión y análisis. Si llega a 0 aplica focus_broken.",
    defaultMax: 100
  },
  resolve: {
    name: "Resolve / Voluntad Narrativa",
    desc: "Resistencia al miedo cósmico y dolor. Si <20% riesgo de morale_break o panic_state. Si 0% requiere apoyo o riesgo de rendición/congelamiento.",
    defaultMax: 100
  },
  transformation_charge: {
    name: "Carga de Transformación",
    desc: "Medidor para ascender a formas Super Saiyan, Ultra Ego, transformaciones malditas, Hellbat o Limit Break.",
    defaultMax: 100
  },
  ultimate_charge: {
    name: "Carga de Ataque Definitivo",
    desc: "Medidor para liberar Finishers o Expansión de Dominio.",
    defaultMax: 100
  },
  armor_integrity: {
    name: "Integridad de Armadura / Escudo",
    desc: "Resistencia estructural de armaduras tecnológicas o barreras mágicas.",
    defaultMax: 100
  },
  summon_capacity: {
    name: "Capacidad de Invocación",
    desc: "Control para sostener shikigamis, diablos contratados, clones o familiares.",
    defaultMax: 100
  }
};

/**
 * 3. ESCALA GRADUADA DE RESISTENCIAS (0 a 150)
 */
export const RESISTANCE_SCALE = {
  0: "Ninguna (Vulnerabilidad absoluta / Daño pleno)",
  25: "Baja (Mitigación leve / Sufre efectos secundarios)",
  50: "Moderada (Resistencia estándar / Mitiga 50% del efecto)",
  75: "Alta (Resistencia superior / Solo vulnerable a ataques concentrados)",
  100: "Inmunidad Condicional (Requiere bypass o hax de nivel superior)",
  150: "Inmunidad Superior / Autoridad Primordial (Supera y anula el efecto)"
};

export const STANDARD_RESISTANCES_LIST = [
  "physical_damage", "energy_damage", "heat_cold", "poison_disease", "radiation",
  "mind_control", "illusion", "fear_pressure", "soul_damage", "body_manipulation",
  "sealing", "regeneration_negation", "time_manipulation", "space_manipulation",
  "causality_manipulation", "reality_warping", "existence_erasure",
  "energy_absorption", "technology_hacking"
];

/**
 * 4. COUNTER-TAGS ESTÁNDAR
 */
export const STANDARD_COUNTER_TAGS = [
  "anti_regeneration", "anti_machine", "anti_magic", "anti_domain", "anti_aerial",
  "anti_speedster", "anti_teleport", "anti_soul", "anti_time", "anti_space",
  "anti_causality", "anti_reality", "energy_nullification", "barrier_breaker",
  "mind_calm_user", "purification_user", "truth_sight"
];

/**
 * 5. JERARQUÍA DE HAX EN 8 CAPAS
 */
export const HAX_LAYERS_HIERARCHY = [
  { layer: 1, name: "Capa 1: Daño Físico & Cinético", counters: ["invulnerable_armor", "intangibility", "super_durability"] },
  { layer: 2, name: "Capa 2: Daño Energético & Proyectiles", counters: ["energy_absorption", "barrier_user", "energy_nullification"] },
  { layer: 3, name: "Capa 3: Daño Biológico, Veneno & Negación de Regeneración", counters: ["biological_immunity", "regenerator", "adaptive_evolution"] },
  { layer: 4, name: "Capa 4: Mente, Percepción, Sentidos & Ilusión", counters: ["mind_calm_user", "truth_sight", "telepathic_shield"] },
  { layer: 5, name: "Capa 5: Alma, Maldición, Posesión & Daño Espiritual", counters: ["soul_anchor", "divine_resonance", "reverse_cursed_technique"] },
  { layer: 6, name: "Capa 6: Espacio, Gravedad, Tiempo & Dimensión", counters: ["space_manipulator", "time_anchor", "dimensional_traveler"] },
  { layer: 7, name: "Capa 7: Causalidad, Destino, Probabilidad & Realidad", counters: ["causality_manipulator", "causal_anchor", "reality_warper"] },
  { layer: 8, name: "Capa 8: Autoridad Cosmológica & Borrado Primordial", counters: ["supreme_authority", "tier_0_authority", "omnipresence"] }
];

/**
 * 6. VERSE EQUALIZATION INTEGRAL
 */
export const VERSE_EQUALIZATION_RULES = {
  "ki_vs_cursed_energy": "Ki y CE se detectan como presencia y chocan en proyectiles. Ki puede dañar barreras malditas con output suficiente. CE afecta el cuerpo/alma si la técnica lo declara. Ki no otorga Dominio ni RCT; CE no se transforma en Ki.",
  "ki_vs_nen": "Ki y Nen interactúan en masa física y lectura de aura. El Nen conserva estrictamente sus votos, restricciones y Hax conceptual. Un usuario de Ki no copia Hatsu por mera observación.",
  "ki_vs_cosmic_energy": "Chocan y generan ondas de escala planetaria/universal, pero no son reservas intercambiables sin un artefacto o sinergia explícita.",
  "cursed_energy_vs_soul": "Técnicas malditas dañan el cuerpo pero solo dañan directamente el alma si el usuario posee percepción explícita del alma (soul_manipulator). RCT cura biología, pero no borrado existencial ni causalidad.",
  "speedforce_vs_time": "Speed Force resiste ralentización y micro-desfases, pero no otorga inmunidad a Time Stop absoluto o Time Anchor de autoridad superior.",
  "domain_vs_reality_space": "Un Dominio impone reglas locales; un Reality Warper o Space Manipulator puede disputar la barrera según diferencia de Tier y concentración. Simple Domain / Anti-Domain disputan el Sure-Hit desde dentro.",
  "tech_vs_magic_hax": "Armaduras tecnológicas analizan firmas de energía pero no replican magia/alma sin módulos explícitos. Technology Hacking solo afecta androides, cibernética o armaduras tecnológicas vulnerables."
};

/**
 * 7. REGLAS DE DIFERENCIA DE TIERS & ANTI-ABUSO
 */
export const TIER_DIFFERENCE_RULES = {
  0: { label: "Diferencia 0 — Combate Equilibrado", desc: "Decidido por Battle IQ, gestión de Stamina, ventajas de Hax, terreno y sinergias." },
  1: { label: "Diferencia 1 — Ventaja Significativa", desc: "El superior domina intercambios frontales; el inferior puede ganar con estrategia, counter-tags o sellado." },
  2: { label: "Diferencia 2 — Ventaja Dominante", desc: "El daño frontal del inferior rara vez basta; requiere condición clara: alma, realidad, sellado o ayuda de equipo." },
  3: { label: "Diferencia 3 — Brecha Extrema", desc: "Confrontación directa inviable; el inferior busca sobrevivir, retrasar, sellar parcialmente o cumplir objetivos." },
  4: { label: "Diferencia 4+ — Amenaza de Nivel Boss", desc: "El combate directo no es el objetivo; requiere mecánicas de Boss, artefactos, causalidad, sacrificio o fallo del antagonista." }
};

export const ANTI_ABUSE_TIER_ASCENSION_TRIGGERS = [
  "limit_break_ready", "unlimited_growth", "mentor_support", "potential_unlock",
  "fusion", "external_artifact", "boss_weakness_exposed", "verse_specific_transformation",
  "sacrifice_cost"
];

/**
 * 8. REGLAS DE ULTIMATES & ANTI-SPAM
 */
export const ULTIMATE_REQUIREMENTS = [
  "Alto coste de recurso (>=40% Ki/CE/Stamina)",
  "Cooldown largo (standard: 2-3t, major: 4-6t, ultimate: 1 vez por combate)",
  "Tiempo de carga o preparación vulnerable",
  "Riesgo de interrupción por focus_broken",
  "Daño colateral ambiental o retroceso de autodaño",
  "Ventana posterior de vulnerabilidad (-20% defensa)",
  "Counter-tags definidos para permitir contrajuego"
];

/**
 * 9. SISTEMA DE BOSSES EN 3 FASES (Anti-Boss Invencible)
 */
export const BOSS_SYSTEM_STRUCTURE = {
  phase1: {
    name: "Fase 1: Máscara de Control & Observación",
    mechanic: "boss_analysis",
    effect: "El Boss reduce daño de técnicas repetidas en un 20%. No conoce técnicas ocultas ni combinaciones crossover."
  },
  phase2: {
    name: "Fase 2: Quiebre de Contención & Escalada",
    trigger: "HP < 60% o daño al orgullo del Boss",
    mechanic: "world_breaking_pressure / hazard_zone",
    effect: "Aumento de AP pero pérdida de precisión milimétrica y exposición de anclaje de recurso."
  },
  phase3: {
    name: "Fase 3: Protocolo de Desesperación / Forma Verdadera",
    trigger: "HP < 25%",
    mechanic: "desperation_protocol",
    effect: "+35% AP, +20% velocidad, acceso a Finisher final.",
    mandatoryWeakness: "exposed_core obligatorio, patrón predecible, coste de energía creciente o reducción de defensa."
  }
};

/**
 * 10. CATÁLOGO COMPLETO DE ESTADOS PERSISTENTES (48 ESTADOS)
 */
export const PERSISTENT_COMBAT_STATUSES = [
  // Físicos & Biomecánicos
  { id: "posture_break", name: "Postura Rota", category: "physical", duration: 2, effect: "-20% defensa física y -15% precisión en melee." },
  { id: "guard_broken", name: "Guardia Destruida", category: "physical", duration: 1, effect: "La siguiente defensa activa vale 50% menos." },
  { id: "joint_lock", name: "Llave Articular", category: "physical", duration: 1, effect: "Extremidad bloqueada; si falla escape evoluciona a joint_damage." },
  { id: "joint_damage", name: "Lesión Articular Persistente", category: "injury", duration: 4, effect: "-25% velocidad/precisión en acciones de la extremidad dañada." },
  { id: "internal_trauma", name: "Trauma Interno", category: "injury", duration: 4, effect: "Reduce recuperación de stamina y añade riesgo de recoil." },
  { id: "fractured", name: "Fractura Ósea", category: "injury", duration: 4, effect: "Penalización severa de movilidad y dolor biomecánico." },
  { id: "bleeding", name: "Hemorragia Activa", category: "injury", duration: 3, effect: "Pérdida continua de HP por turno (-3% a -8% HP)." },
  { id: "exhaustion_state", name: "Agotamiento Físico", category: "physical", duration: 2, effect: "-20% velocidad, -15% AP y bloqueo de formas de control fino." },
  { id: "adrenal_overdrive", name: "Sobrecarga de Adrenalina", category: "buff_risk", duration: 2, effect: "Ignora dolor temporalmente; al expirar los estados vuelven +1 turno." },

  // Recursos & Energía
  { id: "energy_drained", name: "Energía Drenada", category: "resource", duration: 3, effect: "-10% recuperación de energía por stack (máx 4 -> output_instability)." },
  { id: "output_instability", name: "Inestabilidad de Output", category: "resource", duration: 2, effect: "35% riesgo de dispersión de técnicas o doble coste." },
  { id: "overcharged", name: "Sobrecarga de Núcleo", category: "resource", duration: 2, effect: "+30% AP de energía; al expirar se convierte en core_overheat." },
  { id: "core_overheat", name: "Sobrecalentamiento de Núcleo", category: "resource", duration: 3, effect: "-20% defensa, -15% precisión y bloqueo de sobrecarga." },
  { id: "divine_resonance", name: "Resonancia Divina", category: "resource", duration: 5, effect: "Inmune a drenajes estándar y -50% eficacia de maldiciones." },
  { id: "divine_sync", name: "Sincronía Divina", category: "resource", duration: 3, effect: "Coste divino -15%; +20% precisión en Finishers combinados." },
  { id: "cursed_energy_overflow", name: "Desbordamiento de CE", category: "resource", duration: 2, effect: "+25% output de CE y +15% precisión (Black Flash Chain)." },
  { id: "energy_signature_revealed", name: "Firma de Energía Revelada", category: "resource", duration: 3, effect: "Anula sigilo; rivales anticipan ataques con +15% evasión." },

  // Hax & Espiritual
  { id: "domain_locked", name: "Dominio Bloqueado", category: "hax", duration: 2, effect: "Incapacidad temporal de desplegar Dominio o barreras completas." },
  { id: "sure_hit_mark", name: "Marca de Golpe Seguro", category: "hax", duration: 1, effect: "+40% precisión en el siguiente ataque guiado o Finisher." },
  { id: "soul_wounded", name: "Herida de Alma", category: "hax", duration: 5, effect: "La regeneración biológica no repara la esencia; -20% defensa espiritual." },
  { id: "soul_anchor", name: "Ancla de Alma", category: "hax", duration: 3, effect: "Inmunidad a posesión, robo de cuerpo o reescritura de alma." },
  { id: "curse_mark", name: "Marca Maldita", category: "hax", duration: 3, effect: "Pérdida de energía por turno; a 3 stacks detona curse_burst." },
  { id: "curse_burst", name: "Detonación Maldita", category: "hax", duration: 1, effect: "Daño masivo interno e interrupción de técnicas activas." },
  { id: "cursed_residue", name: "Residuo Maldito", category: "hax", duration: 3, effect: "Hechiceros aliados +5% CE/turno; enemigos -10% precisión." },
  { id: "time_anchor", name: "Ancla Temporal", category: "hax", duration: 2, effect: "Bloquea retroceso temporal, salto a líneas paralelas y desfasaje." },
  { id: "temporal_lag", name: "Retraso Temporal", category: "hax", duration: 1, effect: "-25% evasión; incapacidad de reaccionar a ataques en dos fases." },
  { id: "space_folded", name: "Espacio Plegado", category: "hax", duration: 3, effect: "Distancias distorsionadas; duplica el recorrido de aproximación." },
  { id: "dimensional_exile", name: "Exilio Dimensional", category: "hax", duration: 2, effect: "Expulsado temporalmente de la arena principal." },
  { id: "causal_debt", name: "Deuda Causal", category: "hax", duration: 4, effect: "Acumula 1 carga por evasión milagrosa; a 3 cargas la siguiente evasión falla." },

  // Escenario
  { id: "battlefield_advantage", name: "Ventaja de Terreno", category: "field", duration: 3, effect: "+15% evasión y +10% precisión desde posiciones preparadas." },
  { id: "battlefield_disadvantage", name: "Desventaja de Terreno", category: "field", duration: 3, effect: "-15% movilidad y +10% coste de stamina." },
  { id: "hazard_zone", name: "Zona de Peligro Ambiental", category: "field", duration: 3, effect: "Daño elemental continuo por fuego/veneno/radiación/magma." },
  { id: "containment_field", name: "Campo de Contención", category: "field", duration: 2, effect: "Reduce el daño colateral ambiental en un 60%." },
  { id: "collateral_risk", name: "Riesgo de Daño Colateral", category: "field", duration: 4, effect: "Técnicas de área conllevan catástrofe y víctimas civiles." },
  { id: "world_breaking_pressure", name: "Presión de Colapso Mundial", category: "field", duration: 4, effect: "Fallas tectónicas, gravedad caótica y fractura de arena." },

  // Información & Táctica
  { id: "analyzed", name: "Patrón Analizado", category: "info", duration: 3, effect: "+20% precisión o penetración contra las debilidades del rival." },
  { id: "false_reading", name: "Lectura Falsa Inducida", category: "info", duration: 2, effect: "30% de riesgo de que la siguiente contra-técnica enemiga falle." },
  { id: "exposed_core", name: "Núcleo Expuesto", category: "info", duration: 1, effect: "+50% eficacia de ataques perforantes, sellos o golpes de precisión." },
  { id: "hidden_technique", name: "Técnica Oculta", category: "info", duration: 4, effect: "+30% eficacia sorpresa en el primer uso de la técnica." },
  { id: "focus_broken", name: "Foco Mental Roto", category: "info", duration: 1, effect: "Cancela cargas de rituales, dominios, sellos y tiros de precisión." },
  { id: "barrier_cracked", name: "Barrera Agrietada", category: "info", duration: 2, effect: "Cada impacto posterior ignora un 25% adicional de absorción." },

  // Transformación & Boss
  { id: "transformation_locked", name: "Transformación Bloqueada", category: "transformation", duration: 2, effect: "Incapacidad temporal de cambiar de forma o ascender." },
  { id: "suppressed_form", name: "Forma Suprimida", category: "transformation", duration: 99, effect: "-30 a -70% AP para proteger el escenario; +20% precisión." },
  { id: "limit_break_ready", name: "Límite Superado", category: "transformation", duration: 2, effect: "Acceso inmediato a la siguiente forma sin coste de preparación." },
  { id: "berserker_escalation", name: "Furia Berserker", category: "transformation", duration: 4, effect: "+8% AP por carga (a 5 cargas entra en control_instability)." },
  { id: "control_instability", name: "Descontrol / Furia Ciega", category: "transformation", duration: 2, effect: "Ataques indiscriminados con riesgo de dañar aliados o arena." },
  { id: "team_formation_active", name: "Formación de Equipo Activa", category: "team", duration: 3, effect: "Reacción menor adicional de cobertura o disparo de apoyo." },
  { id: "shared_target_lock", name: "Foco de Asalto Concentrado", category: "team", duration: 1, effect: "+15% precisión y +10% AP para el remate del aliado." },
  { id: "protective_link", name: "Vínculo Protector", category: "team", duration: 2, effect: "El protector absorbe hasta el 50% de daño dirigido a un aliado crítico." },
  { id: "morale_break", name: "Quiebre de Moral", category: "team", duration: 2, effect: "-15% coordinación por caída de líder o aliado clave." },
  { id: "vengeful_focus", name: "Foco Vengativo", category: "team", duration: 2, effect: "+25% AP contra el agresor del aliado caído (-15% defensa)." },
  { id: "boss_analysis", name: "Análisis de Boss", category: "boss", duration: 3, effect: "Reducción de daño de técnicas repetidas por el equipo." },
  { id: "phase_threshold_reached", name: "Umbral de Fase de Boss", category: "boss", duration: 1, effect: "Transición de Fase de Boss hacia nuevas mecánicas." },
  { id: "desperation_protocol", name: "Protocolo de Desesperación", category: "boss", duration: 3, effect: "+35% AP, +20% velocidad y Finisher con exposed_core." }
];

/**
 * 11. GENERADOR DE COMBAT LOG SNAPSHOT PERSISTENTE
 */
export function buildCombatLogSnapshot(encounterId, round, battlefield = {}, teamA = [], teamB = [], activeField = {}, comboWindows = {}, bossState = null) {
  return {
    header: "[APEX COMBAT LOG]",
    encounterId: encounterId || "encounter-alpha",
    round: round || 1,
    location: battlefield.name || "Planicies Devastadas",
    battlefieldState: battlefield.status || "Estable",
    collateralRisk: battlefield.collateralRisk || "moderate",
    teamA: teamA.map(c => ({
      name: c.name,
      hp: c.hp ?? 100,
      stamina: c.stamina ?? 100,
      primaryEnergy: c.primaryEnergy ?? 100,
      focus: c.focus ?? 100,
      resolve: c.resolve ?? 100,
      currentTier: c.tier || "Tier 4-B",
      position: c.position || "Vanguardia",
      activeStates: c.activeStates || [],
      cooldowns: c.cooldowns || {},
      transformation: c.transformation || "Base",
      knownEnemyData: c.knownEnemyData || []
    })),
    teamB: teamB.map(c => ({
      name: c.name,
      hp: c.hp ?? 100,
      stamina: c.stamina ?? 100,
      primaryEnergy: c.primaryEnergy ?? 100,
      focus: c.focus ?? 100,
      resolve: c.resolve ?? 100,
      currentTier: c.tier || "Tier 4-B",
      position: c.position || "Vanguardia",
      activeStates: c.activeStates || [],
      cooldowns: c.cooldowns || {},
      transformation: c.transformation || "Base",
      knownEnemyData: c.knownEnemyData || []
    })),
    battlefieldHazards: activeField.hazards || [],
    battlefieldBarriers: activeField.barriers || [],
    comboWindows: {
      available: comboWindows.available || [],
      charging: comboWindows.charging || [],
      interrupted: comboWindows.interrupted || []
    },
    bossState: bossState ? {
      currentPhase: bossState.currentPhase || 1,
      phaseTriggerProgress: bossState.progress || "0%",
      knownWeakness: bossState.knownWeakness || "Ninguna expuesta",
      unknownMechanic: bossState.unknownMechanic || "Reserva de Fase 3"
    } : null
  };
}

/**
 * 12. CHECKLIST DE VALIDACIÓN DE TURNO (14 REGLAS MAESTRAS)
 */
export const COMBAT_TURN_CHECKLIST = [
  "1. ¿Se validó presencia física, consciencia, bando y posición métrica?",
  "2. ¿Se aplicaron primero estados persistentes (DoTs, drenajes, debuffs)?",
  "3. ¿Las pasivas tienen trigger declarado y límite claro sin anulación total gratuita?",
  "4. ¿El escenario modifica realmente las opciones disponibles (oxígeno, gravedad, ruinas)?",
  "5. ¿La iniciativa respeta velocidad relativa, percepción y hax temporal?",
  "6. ¿Las sinergias cumplen tags requeridos, rango y estado consciente?",
  "7. ¿Cada combo tiene trigger, coste de recursos y posibilidad de interrupción?",
  "8. ¿Las resistencias se aplicaron por capas jerárquicas (Física -> Hax -> Causalidad)?",
  "9. ¿El daño dejó consecuencias anatómicas, energéticas o de entorno persistentes?",
  "10. ¿Se activó una transformación o fase de Boss solo si tenía trigger previo?",
  "11. ¿Se redujeron cooldowns y se actualizaron recursos unificados?",
  "12. ¿El Combat Log conserva heridas, objetos, estados y datos conocidos?",
  "13. ¿La diferencia de tier se trató como ventaja y no como victoria automática?",
  "14. ¿Verse Equalization permitió interacción sin borrar las reglas propias de cada verso?"
];

/**
 * 13. REGLA DE ORO DE DISEÑO DE MECÁNICAS (LAS 5 PREGUNTAS)
 */
export const GOLDEN_DESIGN_RULE = {
  q1: "¿Qué tag funcional la activa?",
  q2: "¿Qué ventaja concreta ofrece?",
  q3: "¿Qué recurso, cooldown o riesgo la limita?",
  q4: "¿Qué estado deja o qué estado explota?",
  q5: "¿Qué contra-tag, decisión táctica o condición de escena puede disputarla?",
  principle: "Si una habilidad no tiene coste, counterplay, condición o consecuencia, no es una mecánica: es una sentencia de victoria."
};

export const COOLDOWN_TIERS = {
  minor: { turns: 1, desc: "1 turno (técnicas de control o golpes tácticos)" },
  standard: { turns: 2, desc: "2-3 turnos (supertécnicas intermedias y combos)" },
  major: { turns: 4, desc: "4-6 turnos (ataques definitivos y dominios)" },
  ultimate: { turns: 999, desc: "1 vez por combate (Finishers absolutos)" },
  arc_level: { turns: 9999, desc: "1 vez por arco o misión" },
  catastrophic: { turns: 99999, desc: "Solo por condición narrativa extrema" }
};
