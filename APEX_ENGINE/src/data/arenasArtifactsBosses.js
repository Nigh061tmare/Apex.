// APEX Powerscaling Engine — Compendio de Arenas, Artefactos y Raid Bosses v1.0
// Integración con Combat Core v1.0 y Orden de Resolución en 12 Fases.

/**
 * 1. CATÁLOGO DE ARENAS Y ESCENARIOS DINÁMICOS (10 ARENAS)
 */
export const DYNAMIC_ARENAS = [
  {
    id: "arena-torneo-del-poder",
    name: "Plataforma del Torneo del Poder — Katchin Primordial",
    type: "Dimensional / Sagrado / Deshabitado / Torneo",
    tierRange: "Tier 3-A a Tier 2-B (Contiene output universal/multiversal bajo)",
    modifiers: "Gravedad x3; atmósfera estable creada artificialmente; plataforma de Katchin extremadamente resistente; vacío dimensional más allá del borde; visibilidad total; ausencia de cobertura natural.",
    initialStates: ["battlefield_open", "ring_out_rule_active", "no_civilian_risk", "high_visibility"],
    hazardZone: "Ser lanzado fuera de la plataforma aplica ring_out_pending. El combatiente tiene una única reacción de vuelo, teletransporte o rescate de aliado para volver; si falla, queda expulsado de la arena.",
    collateralRisk: "Bajo para civiles; alto para coherencia dimensional si un universal_threat rompe el Katchin creando space_folded o grietas de vacío.",
    tagInteractions: {
      flight_user: "Ignora riesgo normal de caída pero respeta reglas si están activas.",
      space_manipulator: "Rescata aliados pero no abre salida dimensional si ring_out_rule_active lo prohíbe.",
      bruiser: "Beneficio de superficie rígida para rebotes.",
      ranged_specialist: "Líneas de tiro abiertas sin cobertura.",
      boss_phase_entity: "Puede destruir secciones creando hazard_zone: void_exposure."
    },
    counterTags: ["teleportation_user", "flight_user", "space_manipulator", "ring_out_resistance"]
  },
  {
    id: "arena-shibuya-ruinas",
    name: "Shibuya en Ruinas — Distrito Sellado",
    type: "Urbano / Maldito / Sellado",
    tierRange: "Tier 9-A a Tier 6-C (Escala si intervienen Dominios o Grado Especial)",
    modifiers: "Visibilidad reducida por polvo y humo; calles bloqueadas; túneles de metro; edificios con riesgo de colapso; energía maldita residual; comunicaciones irregulares.",
    initialStates: ["cursed_residue", "battlefield_disadvantage", "civilian_evacuation_active", "stealth_advantage"],
    hazardZone: "Túneles inundados, vagones aplastados y barreras malditas. Ser lanzado contra una estructura aplica internal_trauma, buried_state o focus_broken.",
    collateralRisk: "Alto. Civiles atrapados, infraestructura ferroviaria y pánico. Ataques de área activan collateral_risk inmediatamente.",
    tagInteractions: {
      domain_user: "Disputa o refuerza barreras del distrito.",
      cursed_energy_user: "+5% recuperación si controla cursed_residue.",
      assassin: "Beneficio de túneles, humo y ángulos muertos.",
      tactical_genius: "Uso estratégico de metro, azoteas y rutas de evacuación.",
      sealer: "Cierra rutas de maldiciones o aísla intersecciones."
    },
    counterTags: ["truth_sight", "energy_sensing", "flight_user", "barrier_breaker", "purification_user"]
  },
  {
    id: "arena-namek-colapso",
    name: "Planeta Namek — Colapso Tectónico Final",
    type: "Planetario / Natural / En colapso",
    tierRange: "Tier 5-B a Tier 3-A",
    modifiers: "Gravedad similar a Tierra; océanos agitados; roca volcánica; tormentas de ceniza; energía geotérmica; el planeta pierde estabilidad progresivamente.",
    initialStates: ["planetary_instability", "hazard_zone: magma", "hazard_zone: oceanic_pressure", "countdown_to_destruction"],
    hazardZone: "Caer en magma aplica burning y daño continuo. El océano aplica penalización de movimiento. Grietas tectónicas separan equipos aplicando battlefield_disadvantage.",
    collateralRisk: "Máximo planetario. Destrucción de refugios, Dragon Balls y naves. Cada ultimate planetaria acelera planetary_collapse.",
    tagInteractions: {
      namekian: "Familiaridad territorial y mejor percepción de Ki local.",
      flight_user: "Ignora grietas pero no explosiones tectónicas masivas.",
      space_manipulator: "Evacuación dimensional de emergencia.",
      destroyer_god: "Requiere suppressed_form para evitar destruir el planeta.",
      regenerator: "Resistencia a ambientes hostiles sin inmunidad total a magma."
    },
    counterTags: ["planetary_survival", "flight_user", "space_manipulator", "heat_resistance", "containment_field"]
  },
  {
    id: "arena-camara-del-tiempo",
    name: "Cámara del Tiempo — Cámara Hiperdimensional",
    type: "Dimensional / Aislado / Sagrado",
    tierRange: "Cualquier Tier (Entrenamiento, duelos o preparación de Boss)",
    modifiers: "Gravedad x10; aire seco; temperatura extrema día/noche; horizonte blanco infinito; percepción temporal alterada (1 año interno = 1 día externo).",
    initialStates: ["high_gravity", "time_dilation", "resource_pressure", "isolation_state"],
    hazardZone: "Alejarse del centro causa desorientación, falta de oxígeno o temporal_lag. La ruptura del portal aplica dimensional_exile permanente hasta rescate.",
    collateralRisk: "Bajo para civiles; alto para ocupantes si se destruye la puerta o colapsa la dimensión.",
    tagInteractions: {
      saiyan: "Adaptación y escalado de entrenamiento masivo.",
      time_manipulator: "Interfiere con dilatación pero arriesga time_paradox_risk.",
      space_manipulator: "Rescate dimensional superando resistencia de la cámara.",
      tactical_genius: "Convierte el entrenamiento en preparación contra Boss."
    },
    counterTags: ["dimension_escape", "time_manipulator", "space_manipulator", "high_gravity_adaptation"]
  },
  {
    id: "arena-metropolis-evacuacion",
    name: "Metrópolis — Sector de Evacuación Parcial",
    type: "Urbano / Civil / Infraestructura crítica",
    tierRange: "Tier 9-A a Tier 2-C",
    modifiers: "Rascacielos de cristal, tráfico detenido, tren elevado, red eléctrica, hospitales y civiles evacuando.",
    initialStates: ["collateral_risk: high", "civilian_evacuation_active", "urban_cover", "infrastructure_vulnerability"],
    hazardZone: "Colapso de fachadas o puentes. Fuego eléctrico crea hazard_zone: electrified_debris; colapsos aplican buried_state.",
    collateralRisk: "Crítico. Ataques de área requieren suppressed_form o containment_field para héroes.",
    tagInteractions: {
      team_leader: "Coordina evacuación y mitiga pánico.",
      flight_user: "Rescate aéreo y bypass de calles bloqueadas.",
      speedforce_user: "Evacuación masiva ultrarrápida controlando ondas de choque.",
      tech_armor_user: "Intervención de redes eléctricas y defensa urbana."
    },
    counterTags: ["containment_field", "reality_repair_user", "rescue_specialist", "flight_user", "speedster"]
  },
  {
    id: "arena-hueco-mundo",
    name: "Hueco Mundo — Desierto de Luna Blanca",
    type: "Dimensional / Deshabitado / Hostil",
    tierRange: "Tier 7-B a Tier 2-C",
    modifiers: "Noche perpetua, luna artificial, arena de partículas espirituales, estructuras huecas, aire seco y distancias engañosas.",
    initialStates: ["low_visibility_distance", "spiritual_particle_field", "battlefield_open", "no_civilian_risk"],
    hazardZone: "Pozos de arena espiritual y grietas que aplican dimensional_exile o soul_wounded sin ancla espiritual.",
    collateralRisk: "Bajo para población; alto para estabilidad dimensional si se abren grietas permanentes.",
    tagInteractions: {
      soul_manipulator: "Mayor lectura de presencia espiritual.",
      space_manipulator: "Apertura de portales con riesgo de fractura de campo.",
      assassin: "Aprovecha sombras largas y dunas.",
      ranged_specialist: "Líneas de tiro largas sin cobertura."
    },
    counterTags: ["soul_anchor", "dimension_escape", "truth_sight", "flight_user"]
  },
  {
    id: "arena-valhalla-coliseo",
    name: "Arena del Valhalla — Coliseo de Volund",
    type: "Sagrado / Torneo / Mitológico",
    tierRange: "Tier 4-B a Tier 2-C",
    modifiers: "Plataforma ritual, audiencia divina, armas Volund vinculadas, barreras de contención y presión de testigos.",
    initialStates: ["witness_pressure", "volund_link_active", "duel_rule_active", "divine_authority_field"],
    hazardZone: "Romper el borde expone al vacío sagrado o gradas, aplicando ring_out_pending o weapon_disarmed.",
    collateralRisk: "Moderado. La audiencia no debe morir; el resultado altera moral divina/humana.",
    tagInteractions: {
      ragnarok_fighter: "+10% Resolve bajo la mirada de la audiencia.",
      sentient_weapon_user: "Estabilidad en el vínculo de Volund.",
      martial_artist: "Máximo beneficio en duelos 1v1.",
      assassin: "Penalizado por visibilidad total y reglas rituales."
    },
    counterTags: ["duel_breaker", "sealer", "space_manipulator", "authority_resistance"]
  },
  {
    id: "arena-kaioshin-jardin",
    name: "Mundo de los Kaiōshin — Jardín de las Esferas Antiguas",
    type: "Sagrado / Planetario / Ritual",
    tierRange: "Tier 4-C a Tier 2-B",
    modifiers: "Ki divino ligero, vegetación resistente, ruinas rituales, gravedad estable, baja población y energía de creación.",
    initialStates: ["divine_resonance", "ritual_amplification", "low_collateral_risk", "sacred_ward"],
    hazardZone: "Altares rotos liberan ritual_backlash o space_folded. Destruir árboles sagrados reduce curación y buffs divinos.",
    collateralRisk: "No hay civiles, pero destruir tejido sagrado corta rutas de teletransporte y rituales de creación.",
    tagInteractions: {
      divine_ki: "+10-20% eficiencia en técnicas y rituales.",
      cursed_energy_user: "Resistencia ambiental moderada contra energías corruptas.",
      reality_warper: "Disputa de leyes sagradas."
    },
    counterTags: ["divine_resonance", "purification_user", "space_manipulator", "reality_repair_user"]
  },
  {
    id: "arena-z-city-colmena",
    name: "Colmena de Z-City — Subterráneo de Monstruos",
    type: "Subterráneo / Biológico / Urbano destruido",
    tierRange: "Tier 8-A a Tier 3-A",
    modifiers: "Túneles estrechos, cámaras gigantes, cuerpos monstruosos, baja visibilidad, presión subterránea y techos inestables.",
    initialStates: ["low_ceiling", "hazard_zone: collapse", "monster_residue", "ambush_advantage"],
    hazardZone: "Derrumbes aplican buried_state; charcos biológicos aplican poisoned, corrosion o mutation_risk; techos bajos limitan vuelo.",
    collateralRisk: "Bajo en el subsuelo, pero un colapso masivo puede hundir distritos enteros de la superficie.",
    tagInteractions: {
      bruiser: "Uso de paredes y columnas con riesgo de colapso.",
      assassin: "Máximo beneficio de emboscada y túneles oscuros.",
      ranged_specialist: "Penalizado por techos y columnas.",
      battlefield_control: "Sella túneles o aísla enemigos."
    },
    counterTags: ["flight_user", "earth_manipulator", "space_manipulator", "purification_user", "hazard_resistance"]
  },
  {
    id: "arena-zona-cero-antimonitor",
    name: "Zona Cero del Anti-Monitor — Universo en Colapso",
    type: "Multiversal / Dimensional / Catástrofe",
    tierRange: "Tier 2-C a Tier 1-C",
    modifiers: "Antimateria, fragmentos de realidades rotas, tiempo irregular, gravedad variable, ausencia de oxígeno y realidades superpuestas.",
    initialStates: ["world_breaking_pressure", "reality_instability", "time_paradox_risk", "hazard_zone: antimatter", "collateral_risk: multiversal"],
    hazardZone: "Contacto con antimateria aplica existence_erosion (pérdida de presencia y habilidades). Grietas aplican dimensional_exile a realidades aleatorias.",
    collateralRisk: "Máximo absoluto. Cada Finisher puede borrar líneas temporales o Tierras alternativas; requiere containment_field obligatorio.",
    tagInteractions: {
      multiversal_entity: "Operación con relativa normalidad.",
      tactical_genius: "Identificación de anclas de realidad estables.",
      sealer: "Cierre de micro-grietas.",
      speedforce_user: "Resistencia parcial a anomalías temporales."
    },
    counterTags: ["existence_erasure_resistance", "reality_anchor", "time_anchor", "space_manipulator", "supreme_authority"]
  }
];

/**
 * 2. PERFILES DE RAID BOSSES EN 3 FASES (5 GRANDES ANTAGONISTAS)
 */
export const RAID_BOSSES_PROFILES = [
  {
    id: "boss-moro-planet-eater",
    name: "Moro — Devorador de Planetas",
    tags: ["boss_phase_entity", "power_absorber", "energy_drainer", "regenerator", "magic_user", "universal_threat"],
    resistances: { energy: 80, physical: 75, sealing: 50, soul: 40 },
    structuralWeakness: "Dependencia de absorción continua de vida y Ki para mantener formas robadas.",
    phases: {
      phase1: {
        name: "Fase 1: Hambre Calculada",
        mechanic: "boss_analysis: acumula 1 carga por tipo de energía recibido; a 3 cargas +15% resistencia a ese sistema.",
        style: "Rango medio, drena energía de aliados débiles y evita contra-hax evidente.",
        appliedStates: ["energy_drained", "output_instability", "energy_signature_revealed"],
        counterplay: "Ocultar output, alternar energía física/espiritual o forzar CQC rápido."
      },
      phase2: {
        name: "Fase 2: Raíz Planetaria",
        trigger: "HP < 60% o absorción de fuente planetaria masiva",
        mechanic: "planetary_life_drain: -5% a -10% recuperación por turno a usuarios de Ki en el planeta.",
        hazardZone: "Suelo y océanos se vuelven conductos de drenaje; añade stacks de energy_drained.",
        threat: "planetary_instability en el escenario.",
        counterplay: "Volar, plataformas aisladas, cortar vínculo con el suelo o evacuar dimensión."
      },
      phase3: {
        name: "Fase 3: Cuerpo de Mundo Robado",
        trigger: "HP < 25% o ruptura de fuente de absorción",
        buffs: "+35% AP, +20% regeneración y técnica robada de alto nivel.",
        finisher: "Planet Eater Cataclysm: concentra vida planetaria en esfera que detona el núcleo.",
        exposedCore: "exposed_core visible en pecho/frente; anti_regeneration, sealer y piercing_attack ganan +50% eficacia.",
        counterTags: ["energy_nullification", "sealer", "anti_regeneration", "space_manipulator", "divine_ki"]
      }
    }
  },
  {
    id: "boss-sukuna-king-of-curses",
    name: "Ryomen Sukuna — Rey de las Maldiciones",
    tags: ["boss_phase_entity", "cursed_energy_user", "domain_user", "soul_manipulator", "battle_genius", "regenerator"],
    resistances: { cursed_energy: 85, soul: 80, physical: 75, domain: 85, sealing: 50 },
    structuralWeakness: "Dependencia de sellos manuales, cánticos, boca secundaria y gestión de CE para máxima potencia.",
    phases: {
      phase1: {
        name: "Fase 1: Santuario del Depredador",
        mechanic: "boss_analysis: reduce eficacia de técnicas repetidas por lectura táctica.",
        style: "Cortes precisos, presión psicológica y búsqueda de focus_broken en selladores.",
        appliedStates: ["curse_mark", "soul_wounded", "guard_broken", "fear_pressure"],
        counterplay: "Variar técnicas, ataques no lineales y aislarlo de información."
      },
      phase2: {
        name: "Fase 2: Malevolent Shrine Abierto",
        trigger: "HP < 60% o daño a núcleo de alma",
        mechanic: "open_domain_slaughter_zone: Dominio sin barrera cerrada que corta en radio amplio.",
        hazardZone: "Toda la zona marcada aplica bleeding, soul_wounded o barrier_cracked.",
        threat: "Destrucción total de infraestructura y coberturas urbanas.",
        counterplay: "Simple Domain, anti-domain, contención espacial o interrupción durante cánticos."
      },
      phase3: {
        name: "Fase 3: Protocolo de Calamidad Encarnada",
        trigger: "HP < 25% o colapso de Dominio",
        buffs: "+35% AP, +20% velocidad y mayor alcance de corte.",
        finisher: "Furnace of the King: acumulación de calor maldito y explosión masiva de fuego/cortes.",
        exposedCore: "exposed_core en postura de manos y cánticos; focus_broken o joint_lock anulan el Finisher y aplican cursed_energy_overflow inverso.",
        counterTags: ["anti_domain", "soul_anchor", "barrier_user", "time_manipulator", "sealer", "reverse_cursed_technique"]
      }
    }
  },
  {
    id: "boss-darkseid-anti-life",
    name: "Darkseid — Avatar de la Ecuación Anti-Vida",
    tags: ["boss_phase_entity", "cosmic_entity", "multiversal_entity", "reality_warper", "soul_manipulator", "universal_threat"],
    resistances: { physical: 95, energy: 90, mind: 85, space: 85, soul: 80 },
    structuralWeakness: "El avatar puede ser desestabilizado; la entidad verdadera requiere condiciones multiversales.",
    phases: {
      phase1: {
        name: "Fase 1: Avatar de Piedra y Voluntad",
        mechanic: "boss_analysis sobre liderazgo y eslabones emocionales del equipo.",
        style: "Fuerza física y Omega Beams de prueba para quebrar Resolve y dispersar.",
        appliedStates: ["fear_pressure", "morale_break", "energy_signature_revealed"],
        counterplay: "Liderazgo activo, protección mental y rotación de roles."
      },
      phase2: {
        name: "Fase 2: Ecuación Anti-Vida Parcial",
        trigger: "HP < 60% o resistencia sostenida del equipo",
        mechanic: "anti_life_field: drena Resolve por turno; command_breakdown en vínculos débiles.",
        hazardZone: "Sombras cósmicas que aplican soul_wounded y morale_break.",
        threat: "El escenario se vuelve gris y hostil; civiles y aliados pasan a control narrativo.",
        counterplay: "soul_anchor, team_leader, unbreakable_will y Speed Force."
      },
      phase3: {
        name: "Fase 3: Omega Sanction: Ciclo de Derrota",
        trigger: "HP < 25% o ruptura del avatar",
        buffs: "+35% AP; Omega Beams con seguimiento multidimensional y daño de alma.",
        finisher: "Omega Sanction: atrapa al objetivo en una secuencia de vidas alternativas (prisión causal).",
        exposedCore: "exposed_core en el ancla de la Ecuación; destruirla aplica authority_feedback (-30% AP) y abre ventana de expulsión.",
        counterTags: ["causality_manipulator", "reality_warper", "speedforce_user", "soul_anchor", "supreme_authority"]
      }
    }
  },
  {
    id: "boss-cell-max-unleashed",
    name: "Cell Max — Bioarma Descontrolada",
    tags: ["boss_phase_entity", "bio_android", "regenerator", "bruiser", "energy_user", "adaptive_evolution"],
    resistances: { physical: 90, energy: 80, poison: 85, soul: 25 },
    structuralWeakness: "Núcleo craneal expuesto, falta de intelecto táctico y patrón de furia lineal.",
    phases: {
      phase1: {
        name: "Fase 1: Calibración Brutal",
        mechanic: "boss_analysis simplificado que ajusta blindaje contra ataques físicos repetidos.",
        style: "Cargas de masa, rayos de boca y ondas de choque.",
        appliedStates: ["posture_break", "internal_trauma", "battlefield_disadvantage", "burning"],
        counterplay: "Movilidad, fintas de precisión y ataques al núcleo craneal."
      },
      phase2: {
        name: "Fase 2: Protocolo de Furia Bioenergética",
        trigger: "HP < 60% o 3 impactos de precisión en la cabeza",
        mechanic: "bio_energy_storm: rayos erráticos y escombros levitando.",
        hazardZone: "hazard_zone: unstable_energy que sobrecarga androides (core_overheat).",
        threat: "Destrucción indiscriminada de terreno aumentando collateral_risk.",
        counterplay: "Barreras, vuelo y ataques a distancia con señuelos."
      },
      phase3: {
        name: "Fase 3: Núcleo de Aniquilación Abierto",
        trigger: "HP < 25%",
        buffs: "+35% AP, +20% regeneración limitada y ráfagas de alta densidad.",
        finisher: "Maximum Bio-Impact: explosión direccional masiva desde el núcleo.",
        exposedCore: "exposed_core craneal totalmente visible; piercing_attack, anti_machine y sealer ganan +50% eficacia.",
        counterTags: ["anti_machine", "piercing_attack_user", "space_manipulator", "ranged_specialist", "containment_field"]
      }
    }
  },
  {
    id: "boss-fused-zamasu-decay",
    name: "Zamasu Fusionado — Inmortalidad en Descomposición",
    tags: ["boss_phase_entity", "divine_ki", "regenerator", "immortal", "reality_warper", "space_manipulator", "time_manipulator"],
    resistances: { physical: 95, energy: 85, time: 85, mind: 85, sealing: 45 },
    structuralWeakness: "Inestabilidad biológica entre la mitad inmortal y la mitad mortal; fragmentación de voluntad.",
    phases: {
      phase1: {
        name: "Fase 1: Justicia Inmortal",
        mechanic: "boss_analysis registra sellos, borrados o ataques de alma.",
        style: "Ki divino, barreras y contraataques dejando que el rival gaste energía contra su inmortalidad.",
        appliedStates: ["divine_pressure", "energy_drained", "barrier_cracked"],
        counterplay: "No gastar Finishers prematuros; preparar sellado o paradojas temporales."
      },
      phase2: {
        name: "Fase 2: Corrupción del Cielo Divino",
        trigger: "HP < 60% o intento de sellado",
        mechanic: "divine_reality_corruption: extensiones de su cuerpo en cielo y espacio.",
        hazardZone: "Grietas divinas aplican soul_wounded, temporal_lag o expulsión menor.",
        threat: "Ataques multidireccionales desde cualquier superficie de la arena.",
        counterplay: "Sellar focos de corrupción, usar anclas temporales y atacar manifestaciones simultáneas."
      },
      phase3: {
        name: "Fase 3: Justicia Sin Forma",
        trigger: "HP < 25% o colapso del cuerpo físico",
        buffs: "+35% AP; +20% alcance espacial; proliferación de rostros en la realidad.",
        finisher: "Divine World Infection: fusión con el espacio-tiempo local.",
        exposedCore: "exposed_core en ancla de identidad (anillo temporal o grieta); time_anchor + sealer + soul_manipulator provocan reality_instability y anulan proliferación.",
        counterTags: ["sealer", "time_manipulator", "causality_manipulator", "soul_manipulator", "reality_warper", "supreme_authority"]
      }
    }
  }
];

/**
 * 3. ARTEFACTOS, CONSUMIBLES Y HERRAMIENTAS LEGENDARIAS (10 OBJETOS)
 */
export const LEGENDARY_ARTIFACTS = [
  {
    id: "art-senzu-bean",
    name: "Semilla del Ermitaño (Senzu Bean)",
    type: "Consumible",
    tags: ["healer_support", "ki_user", "martual_artist", "last_stand"],
    useCondition: "Acción completa, mano funcional y capacidad de ingerir (o administrar a rango melee).",
    effect: "Restaura HP, Stamina y Ki al 100% base; elimina exhaustion_state, internal_trauma menor y focus_broken por fatiga.",
    limitations: "No cura soul_wounded, curse_mark, causal_debt, transformation_locked ni heridas de alma. Máximo 1 por combatiente.",
    counterTags: ["item_seal", "disarm", "speedster", "poisoned"]
  },
  {
    id: "art-potara-earrings",
    name: "Pendientes Pothala (Potara Earrings)",
    type: "Objeto Ritual / Equipo Divino",
    tags: ["fusion_candidate", "divine_artifact_user", "ki_user", "divine_ki"],
    useCondition: "Dos portadores compatibles en proximidad y conscientes.",
    effect: "Activa potara_fusion combinando reservas, técnicas y resistencias en una entidad de Tier superior a la suma lineal.",
    limitations: "1 uso por par. Temporal para mortales, permanente para deidades. Riesgo de fusion_instability si las voluntades chocan.",
    counterTags: ["sealer", "fusion_breaker", "space_manipulator", "reality_warper"]
  },
  {
    id: "art-mafuba-vessel",
    name: "Vasija de Sellado Mafūba",
    type: "Objeto Ritual / Contenedor",
    tags: ["sealer", "ki_user", "focus_user"],
    useCondition: "Técnica Mafūba, línea de visión y vasija intacta.",
    effect: "Si el objetivo falla resistencia a sellado, recibe sealed_state y queda retirado de la escena.",
    limitations: "No mata; la vasija puede romperse o abrirse. El usuario paga 30-50% de Ki/Focus.",
    counterTags: ["sealing_resistance", "space_manipulator", "dimension_escape", "super_strength"]
  },
  {
    id: "art-inverted-spear-heaven",
    name: "Lanza Invertida del Cielo (Inverted Spear of Heaven)",
    type: "Arma Maldita / Cursed Tool",
    tags: ["cursed_tool_user", "assassin", "anti_magic", "anti_domain"],
    useCondition: "Impacto físico en técnica, barrera o cuerpo protegido sobrenaturalmente.",
    effect: "Aplica technique_nullification instantánea al punto de contacto forzando la desactivación de barreras y técnicas activas.",
    limitations: "Rango CQC; no otorga fuerza física por sí misma para atravesar durabilidad extrema.",
    counterTags: ["absolute_speed", "space_manipulator", "weapon_disarm", "super_durability"]
  },
  {
    id: "art-hellbat-armor",
    name: "Armadura Hellbat",
    type: "Equipo Tecnológico / Armadura de Última Instancia",
    tags: ["tech_armor_user", "tactical_genius", "cosmic_entity_counter"],
    useCondition: "Activación previa o protocolo de emergencia. Consume armor_integrity y metabolismo vital.",
    effect: "Otorga hellbat_overdrive: salto de Tier temporal, vuelo cósmico, armamento de alto output y velocidad extrema.",
    limitations: "Consume HP/Resolve cada turno; a los 3-5 turnos activa user_metabolic_collapse. No protege de daño de alma o causal.",
    counterTags: ["anti_machine", "energy_absorption", "technology_hacking", "soul_damage"]
  },
  {
    id: "art-sealed-blood-flask",
    name: "Frasco de Sangre Sellada",
    type: "Consumible Ritual / Bioenergético",
    tags: ["devil_hybrid", "blood_manipulator", "regenerator", "devil_contract_user"],
    useCondition: "Romper, ingerir o aplicar sobre herida (acción menor).",
    effect: "Restaura 20-35% HP a híbridos/demonios compatibles y activa blood_construct_ready.",
    limitations: "Inútil para humanos comunes. Sangre incompatible provoca corruption o control_instability.",
    counterTags: ["purification_user", "blood_seal", "anti_regeneration", "soul_wounded"]
  },
  {
    id: "art-speedforce-ring",
    name: "Anillo de la Fuerza de la Velocidad (Speedforce Ring)",
    type: "Equipo Dimensional / Ancla de Velocidad",
    tags: ["speedforce_user", "speedster", "time_manipulator"],
    useCondition: "Sincronizado con un velocista; consume Focus para estabilizar.",
    effect: "Otorga speedforce_anchor: -50% eficacia de temporal_lag, extracción de emergencia de aliados y resistencia a time_anchor menor.",
    limitations: "No otorga velocidad a no-velocistas. Alterar eventos pasados añade causal_debt.",
    counterTags: ["time_manipulator", "causality_manipulator", "speedforce_drain"]
  },
  {
    id: "art-black-spider-scope",
    name: "Ojo de la Araña Negra (Black Spider Scope)",
    type: "Equipo Tecnológico / Herramienta de Análisis",
    tags: ["tactical_genius", "ranged_specialist", "tech_armor_user"],
    useCondition: "1 turno de observación continua con línea de visión; consume Focus.",
    effect: "Aplica analyzed revelando patrones de guardia, núcleos tecnológicos, frecuencias de barrera o puntos débiles de movilidad.",
    limitations: "No analiza alma, causalidad ni seres con power_concealment. Solo 1 lectura profunda activa a la vez.",
    counterTags: ["illusion_user", "shapeshifter", "power_concealment", "false_reading"]
  },
  {
    id: "art-solar-nichirin-sword",
    name: "Nichirin Solar de Herencia",
    type: "Arma / Espada Ritual",
    tags: ["nichirin_user", "swordsman", "anti_regeneration", "breathing_user"],
    useCondition: "Portador entrenado con respiración estable; corte en zona vital o cuello.",
    effect: "Aplica regeneration_suppressed durante 2 turnos a demonios, maldiciones o regeneradores vulnerables a energía solar.",
    limitations: "No corta automáticamente seres de Tier superior; menor eficacia contra seres sin anatomía celular.",
    counterTags: ["regeneration_superior", "shapeshifter", "soul_anchor", "weapon_disarm"]
  },
  {
    id: "art-fragmented-reality-cube",
    name: "Cubo de Realidad Fragmentada",
    type: "Objeto Cósmico / Ritual Dimensional",
    tags: ["reality_warper", "space_manipulator", "causality_manipulator", "multiversal_entity"],
    useCondition: "40% Focus o Energía Cósmica y acción de canalización; declara 1 variable a alterar.",
    effect: "Crea space_folded, containment_field, time_anchor menor o reality_stabilized durante 2 turnos.",
    limitations: "Solo 1 variable alterada. Usar más de una vez por combate genera reality_instability. No borra entidades superiores.",
    counterTags: ["supreme_authority", "reality_warper", "causality_manipulator"]
  }
];

/**
 * 4. REGLAS MAESTRAS DE BALANCE DE ARENAS & ARTEFACTOS
 */
export const ARENA_BALANCE_RULES = [
  "1. Un artefacto nunca debe borrar una ventaja de Boss sin coste, counterplay o condición de uso.",
  "2. Una arena no mata automáticamente salvo caída en Hazard Zone de escala claramente superior sin counter-tag.",
  "3. Un Boss siempre revela una debilidad en Fase 3: exposed_core, ritual, patrón o coste.",
  "4. collateral_risk modifica decisiones, rutas, intervención heroica y condiciones de victoria.",
  "5. Combatientes de Tier alto en zonas urbanas deben evaluar suppressed_form o containment_field.",
  "6. Cuando una arena cambia por ultimate, el Combat Log registra qué fue destruido y qué Hazard Zone apareció.",
  "7. Los objetos consumibles se descuentan inmediatamente tras la Fase 9 de resolución.",
  "8. Artefactos de nivel cósmico tienen narrativeRisk: catastrophic y requieren causa de trama o inventario previo."
];
