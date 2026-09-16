/**
 * APEX ENGINE — SIMULATION CORE BRIDGE v1.0
 * ---------------------------------------------------------------------------
 * Puente determinista entre el núcleo de combate (combatResolutionEngine +
 * arenasArtifactsBosses) y el prompt del motor LLM (simulationEngine).
 *
 * PROBLEMA QUE RESUELVE:
 *   El proyecto contiene ~2.850 líneas de reglas estructuradas (orden de
 *   resolución de 12 fases, 9 pools de recursos, jerarquía de 8 capas de Hax,
 *   48 estados persistentes, reglas de diferencia de tier, balance de arenas,
 *   bosses, artefactos y reglas de verse equalization) que estaban importadas
 *   pero INERTES: nunca llegaban al prompt. Resultado: el LLM improvisaba
 *   mecánicas que ya existían formalizadas.
 *
 * Este módulo convierte esas estructuras en bloques de prosa-dirigida listos
 * para inyectar en el prompt maestro, garantizando que la simulación respete
 * el motor canónico APEX.
 */

import {
  COMBAT_RESOLUTION_ORDER,
  UNIFIED_RESOURCE_POOLS,
  HAX_LAYERS_HIERARCHY,
  TIER_DIFFERENCE_RULES,
  PERSISTENT_COMBAT_STATUSES,
  BOSS_SYSTEM_STRUCTURE,
  ULTIMATE_REQUIREMENTS,
  COOLDOWN_TIERS,
  VERSE_EQUALIZATION_RULES,
  COMBAT_TURN_CHECKLIST,
  GOLDEN_DESIGN_RULE,
  RESISTANCE_SCALE,
  STANDARD_COUNTER_TAGS
} from '../data/combatResolutionEngine';

import {
  DYNAMIC_ARENAS,
  RAID_BOSSES_PROFILES,
  LEGENDARY_ARTIFACTS,
  ARENA_BALANCE_RULES
} from '../data/arenasArtifactsBosses';

// ---------------------------------------------------------------------------
// Utilidades internas
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(['de', 'la', 'el', 'en', 'y', 'del', 'los', 'las', 'un', 'una', 'al', 'a', 'o', 'the']);

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t && !STOPWORDS.has(t));
}

function tokenScore(a, b) {
  const A = new Set(normalizeText(a));
  const B = new Set(normalizeText(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach(t => { if (B.has(t)) inter++; });
  return inter / (A.size + B.size - inter);
}

/** Mapas de franquicia -> marco energético canónico (para Verse Equalization). */
const FRANCHISE_FRAMEWORKS = {
  'dragon ball': ['ki'],
  'jujutsu kaisen': ['cursed_energy', 'soul'],
  'hunter x hunter': ['nen'],
  'marvel comics': ['cosmic_energy'],
  'dc comics': ['cosmic_energy', 'speedforce', 'time'],
  'invincible': ['cosmic_energy'],
  'chainsaw man': ['soul'],
  'demon slayer': ['blood'],
  'jojo': ['stand'],
  'one punch man': ['physical'],
  'my hero academia': ['quirk'],
  'baki': ['physical'],
  'record of ragnarok': ['divine'],
  'the boys': ['compound_v', 'tech'],
  'spy x family': ['physical']
};

function frameworksFor(char) {
  if (!char) return [];
  const fr = String(char.franchise || char.universe || '').toLowerCase();
  for (const key of Object.keys(FRANCHISE_FRAMEWORKS)) {
    if (fr.includes(key)) return FRANCHISE_FRAMEWORKS[key];
  }
  return [];
}

// ---------------------------------------------------------------------------
// 1. PROTOCOLO DE RESOLUCIÓN DETERMINISTA (12 FASES)
// ---------------------------------------------------------------------------

export function buildResolutionProtocolBlock() {
  const lines = COMBAT_RESOLUTION_ORDER.map(step => `- ${step}`);
  return `### 🧮 PROTOCOLO DE RESOLUCIÓN DETERMINISTA — ORDEN OBLIGATORIO DE 12 FASES (Fase 0 → Fase 11)
Todo intercambio de un turno/ronda se resuelve SIEMPRE en este orden. No alteres la secuencia ni resuelvas daño antes de validar el entorno y la iniciativa:
${lines.join('\n')}
> **Invariante:** el daño jamás se aplica antes de resolver defensas por capas (Fase 8) ni consecuencias anatómicas (Fase 9).`;
}

// ---------------------------------------------------------------------------
// 2. MODELO UNIFICADO DE RECURSOS
// ---------------------------------------------------------------------------

export function buildResourceModelBlock() {
  const pools = Object.entries(UNIFIED_RESOURCE_POOLS).map(([id, p]) => `- **${p.name} [${id}]:** ${p.desc}`).join('\n');
  return `### 🧪 MODELO UNIFICADO DE RECURSOS (9 POOLS)
Cada combatiente gestiona estos recursos de forma explícita y acumulativa durante los relevos y capítulos:
${pools}
> **Regla:** ningún recurso supera 100 ni se recarga gratis. Las técnicas consumen recurso real; el desgaste entre fases se conserva y se muestra en la telemetría.`;
}

// ---------------------------------------------------------------------------
// 3. JERARQUÍA DE HAX EN 8 CAPAS (DEFENSAS POR CAPAS)
// ---------------------------------------------------------------------------

export function buildHaxLayersBlock() {
  const layers = HAX_LAYERS_HIERARCHY.map(l => `- **${l.name}** → contrarrestado por: ${l.counters.join(', ')}.`).join('\n');
  const resScale = Object.entries(RESISTANCE_SCALE).map(([v, d]) => `${v}=${d}`).join(' | ');
  return `### 🌀 JERARQUÍA DE HAX EN 8 CAPAS (RESOLUCIÓN DE DEFENSAS POR CAPAS)
Una técnica con hax SOLO prevalece si supera la capa correspondiente. Orden defensivo: Posición → Física → Barrera → Energía → Biología → Mente → Alma → Espacio → Causalidad.
${layers}
**Escala de resistencia (0-150):** ${resScale}
> **Regla de interacción:** una capa superior no anula automáticamente una inferior si la inferior tiene anclaje de rango suficiente (ej: resistencia de alma alta bloquea control mental aunque el atacante tenga más AP bruto).`;
}

// ---------------------------------------------------------------------------
// 4. DIFERENCIA DE TIERS (ANTI-ABUSO)
// ---------------------------------------------------------------------------

export function buildTierDifferenceBlock(tierGapLevel = null) {
  const entries = Object.entries(TIER_DIFFERENCE_RULES).map(([k, v]) => `- **${v.label}:** ${v.desc}`).join('\n');
  const focus = (tierGapLevel !== null && TIER_DIFFERENCE_RULES[tierGapLevel])
    ? `\n> ⚠️ **APLICABLE A ESTE COMBATE (Diferencia ${tierGapLevel}):** ${TIER_DIFFERENCE_RULES[tierGapLevel].desc}`
    : '';
  return `### 📐 REGLAS DE DIFERENCIA DE TIERS (LA VENTAJA NO ES VICTORIA AUTOMÁTICA)
${entries}${focus}
> El tier inferior conserva SIEMPRE vía de victoria: counter-tags, sellado, hax de capa superior, entorno, sinergia, condición de escena o sacrificio. Cero "stomps" perezosos.`;
}

// ---------------------------------------------------------------------------
// 5. CATÁLOGO DE ESTADOS PERSISTENTES
// ---------------------------------------------------------------------------

export function buildStatusCatalogBlock() {
  const byCat = {};
  for (const s of PERSISTENT_COMBAT_STATUSES) {
    (byCat[s.category] = byCat[s.category] || []).push(`${s.id}(d${s.duration}): ${s.effect}`);
  }
  const lines = Object.entries(byCat).map(([cat, arr]) => `- **${cat}:** ${arr.join(' · ')}`).join('\n');
  return `### 🩹 CATÁLOGO CANÓNICO DE ESTADOS PERSISTENTES (48 ESTADOS — USA LOS ID EXACTOS)
Los estados se declaran con su id exacto y se arrastran entre turnos con su duración real:
${lines}
> **Regla:** los estados tienen trigger, duración y expiración explícitos. Un estado no puede curarse sin coste (recurso, técnica o fase de recuperación real).`;
}

// ---------------------------------------------------------------------------
// 6. ANTI-SPAM DE ULTIMATES
// ---------------------------------------------------------------------------

export function buildAntiSpamBlock() {
  const reqs = ULTIMATE_REQUIREMENTS.map(r => `- ${r}`).join('\n');
  const cd = Object.entries(COOLDOWN_TIERS).map(([k, v]) => `${k}: ${v.desc}`).join(' | ');
  return `### ⛔ REQUISITOS DE ULTIMATES & ANTI-SPAM
Un Finisher solo es válido si cumple TODOS estos requisitos:
${reqs}
**Cooldowns por categoría:** ${cd}
> **Prohibido:** spam de ultimates consecutivos, técnicas sin coste declarado o repetir una ultimate sin cooldown transcurrido.`;
}

// ---------------------------------------------------------------------------
// 7. SISTEMA DE BOSS (3 FASES)
// ---------------------------------------------------------------------------

export function buildBossSystemBlock() {
  const p = BOSS_SYSTEM_STRUCTURE;
  return `### 👑 SISTEMA DE BOSS EN 3 FASES (ANTI-BOSS INVENCIBLE)
- **${p.phase1.name}** [mecánica: ${p.phase1.mechanic}] → ${p.phase1.effect}
- **${p.phase2.name}** [trigger: ${p.phase2.trigger}] [mecánica: ${p.phase2.mechanic}] → ${p.phase2.effect}
- **${p.phase3.name}** [trigger: ${p.phase3.trigger}] [mecánica: ${p.phase3.mechanic}] → ${p.phase3.effect}
  * Debilidad OBLIGATORIA en Fase 3: ${p.phase3.mandatoryWeakness}
> Un Boss solo escala si se cumple su trigger explícito. La Fase 3 siempre expone una debilidad explotable: nunca es invencible.`;
}

export function getRaidBossProfile(nameOrId) {
  if (!nameOrId) return null;
  const target = String(nameOrId).toLowerCase();
  return RAID_BOSSES_PROFILES.find(b =>
    target.includes(String(b.name).toLowerCase().split('—')[0].trim()) ||
    String(b.id).toLowerCase() === target
  ) || null;
}

// ---------------------------------------------------------------------------
// 8. VERSE EQUALIZATION
// ---------------------------------------------------------------------------

export function buildVerseEqualizationBlock(charA, charB) {
  const fwA = frameworksFor(charA);
  const fwB = frameworksFor(charB);
  const active = new Set([...fwA, ...fwB]);

  const relevant = Object.entries(VERSE_EQUALIZATION_RULES).filter(([key]) => {
    const parts = key.split('_vs_');
    if (parts.length !== 2) return true;
    const hasA = parts.some(p => p.split('_').some(t => active.has(t)));
    return hasA || active.size === 0;
  });

  const chosen = relevant.length ? relevant : Object.entries(VERSE_EQUALIZATION_RULES);
  const lines = chosen.map(([k, v]) => `- **${k.replace(/_/g, ' ')}:** ${v}`).join('\n');

  const labelA = charA?.name || 'A';
  const labelB = charB?.name || 'B';
  return `### 🔀 VERSE EQUALIZATION (INTERACCIÓN ENTRE SISTEMAS DE ENERGÍA)
Interacción canónica aplicable a **${labelA}** (${fwA.join(', ') || 'físico'}) vs **${labelB}** (${fwB.join(', ') || 'físico'}):
${lines}
> **Regla:** la ecualización permite que las energías interactúen SIN borrar las reglas propias de cada verso. Ningún sistema se vuelve intercambiable ni se copia por observación.`;
}

// ---------------------------------------------------------------------------
// 9. ARENAS — CAPA MECÁNICA (initialStates, hazardZone, tagInteractions)
// ---------------------------------------------------------------------------

const HAZARD_INFERENCE = [
  { re: /(gravedad|gravity)/i, tags: ['gravity_anomaly'] },
  { re: /(magma|volcan|lava|incandescente)/i, tags: ['hazard_zone: magma', 'burning'] },
  { re: /(criog|hielo|glacial|g[eé]lido)/i, tags: ['hazard_zone: freezing'] },
  { re: /(radiaci[oó]n)/i, tags: ['hazard_zone: radiation'] },
  { re: /(veneno|[aá]cido|t[oó]xico)/i, tags: ['hazard_zone: poison'] },
  { re: /(vac[ií]o|espacio|ingravidez|0g|zero|orbita|[oó]rbita)/i, tags: ['zero_gravity', 'void_exposure'] },
  { re: /(oc[eé]ano|agua|inundad|marino)/i, tags: ['hazard_zone: drowning'] },
  { re: /(ruina|colaps|derrum|escombro)/i, tags: ['collapsing_structures', 'battlefield_disadvantage'] },
  { re: /(rayo|el[eé]ctric|est[aá]tic|tormenta)/i, tags: ['hazard_zone: electrocution'] },
  { re: /(torneo|coliseo|arena|ring|plataforma)/i, tags: ['ring_out_rule_active', 'high_visibility'] },
  { re: /(oscur|noche|noir|niebla|humo)/i, tags: ['low_visibility'] },
  { re: /(dominio|sellad|barrera|maldit)/i, tags: ['domain_pressure', 'cursed_residue'] },
  { re: /(civil|poblaci|ciudad)/i, tags: ['civilian_risk', 'collateral_risk'] },
  { re: /(infierno|infernal|alma)/i, tags: ['soul_drain', 'battlefield_disadvantage'] }
];

function inferArenaStates(text) {
  const states = [];
  const src = String(text || '');
  for (const rule of HAZARD_INFERENCE) {
    if (rule.re.test(src)) states.push(...rule.tags);
  }
  return [...new Set(states)];
}

/**
 * Empareja el escenario seleccionado con una arena mecánica del compendio.
 * Devuelve la arena enriquecida (con initialStates/hazardZone/tagInteractions)
 * o null si no hay coincidencia suficiente.
 */
export function matchDynamicArena(scenario) {
  if (!scenario) return null;
  const name = typeof scenario === 'string' ? scenario : (scenario.name || '');
  const id = typeof scenario === 'string' ? '' : (scenario.id || '');

  // Coincidencia directa por id
  const direct = DYNAMIC_ARENAS.find(a => a.id === id || a.id === `arena-${id}`);
  if (direct) return direct;

  // Coincidencia difusa por nombre
  let best = null;
  let bestScore = 0;
  for (const a of DYNAMIC_ARENAS) {
    const s = tokenScore(name, a.name);
    if (s > bestScore) { bestScore = s; best = a; }
  }
  return bestScore >= 0.34 ? best : null;
}

export function buildArenaMechanicsBlock(scenario) {
  if (!scenario) return '';
  const scenObj = typeof scenario === 'string' ? { name: scenario } : scenario;
  const name = scenObj.name || 'Arena de Combate';

  const matched = matchDynamicArena(scenario);
  const signals = [
    scenObj.desc, scenObj.sensory, scenObj.terrainEffect,
    scenObj.gravity, scenObj.temperature, matched?.modifiers, matched?.hazardZone
  ].filter(Boolean).join(' ');

  const inferred = inferArenaStates(signals);

  const initialStates = matched?.initialStates?.length ? matched.initialStates : inferred;
  const hazard = matched?.hazardZone || (inferred.some(s => s.startsWith('hazard_zone'))
    ? `El entorno impone ${inferred.filter(s => s.startsWith('hazard_zone')).join(', ')}. Toda exposición prolongada aplica daño continuo y penalización de movilidad.`
    : 'Sin zona de peligro ambiental dominante; el terreno favorece el combate técnico directo.');
  const collateral = matched?.collateralRisk || (inferred.includes('civilian_risk')
    ? 'Riesgo civil ACTIVO: los ataques de área activan collateral_risk y víctimas.'
    : 'Riesgo colateral moderado; el terreno absorbe parte del daño estructural.');
  const tagInteractions = matched?.tagInteractions
    ? Object.entries(matched.tagInteractions).map(([k, v]) => `  · ${k} → ${v}`).join('\n')
    : '  · Usa los tags funcionales del roster para decidir ventajas/penalizaciones de terreno.';
  const counterTags = matched?.counterTags?.length
    ? matched.counterTags.join(', ')
    : (inferred.length ? inferred.join(', ') : 'ninguno específico');
  const tierRange = matched?.tierRange || '';

  return `### 🏟️ CAPA MECÁNICA DE LA ARENA: ${name}
- **Estados iniciales del campo:** ${initialStates.length ? initialStates.join(', ') : 'battlefield_open'}
- **Zona de peligro (hazardZone):** ${hazard}
- **Riesgo colateral:** ${collateral}${tierRange ? `\n- **Rango de Tier admitido:** ${tierRange}` : ''}
- **Interacciones por tag funcional:**
${tagInteractions}
- **Counter-tags de terreno:** ${counterTags}
> El escenario DEBE modificar las opciones reales de los combatientes (cobertura, oxígeno, gravedad, colapso, civiles). No es decorado: es mecánica activa.`;
}

// ---------------------------------------------------------------------------
// 10. ARTEFACTOS LEGENDARIOS & BALANCE
// ---------------------------------------------------------------------------

export function buildArtifactsBlock() {
  const arts = LEGENDARY_ARTIFACTS.slice(0, 12).map(a => `- **${a.name}** [${a.type || 'Artefacto'}]${a.effect ? `: ${a.effect}` : ''}`).join('\n');
  const rules = ARENA_BALANCE_RULES.map(r => `- ${r}`).join('\n');
  return `### 🗡️ ECONOMÍA DE ARTEFACTOS LEGENDARIOS & BALANCE DE ESCENARIO
Artefactos disponibles (requieren posesión previa o condición de trama — NUNCA aparecen de la nada):
${arts}
**Reglas maestras de balance:**
${rules}
> Un artefacto sin coste narrativo no es un artefacto: es un deus ex machina. Cada uno exige posesión, riesgo o precio.`;
}

// ---------------------------------------------------------------------------
// 11. CHECKLIST DE VALIDACIÓN DE TURNO
// ---------------------------------------------------------------------------

export function buildTurnChecklistBlock() {
  return `### ✅ CHECKLIST DE VALIDACIÓN DE TURNO (14 PUNTOS — AUTOCONTROL ANTES DE NARRAR)
${COMBAT_TURN_CHECKLIST.map(c => `- ${c}`).join('\n')}
> **Regla de oro de diseño:** ${GOLDEN_DESIGN_RULE.principle}
> Preguntas obligatorias por mecánica nueva: ${GOLDEN_DESIGN_RULE.q1} ${GOLDEN_DESIGN_RULE.q2} ${GOLDEN_DESIGN_RULE.q3} ${GOLDEN_DESIGN_RULE.q4} ${GOLDEN_DESIGN_RULE.q5}`;
}

// ---------------------------------------------------------------------------
// 12. ENSAMBLADOR PRINCIPAL
// ---------------------------------------------------------------------------

/**
 * Construye el bloque determinista completo a inyectar en el prompt maestro.
 * @param {object} opts
 * @param {object|string} opts.scenario - Arena seleccionada.
 * @param {object} opts.modifiers - Modificadores de simulación.
 * @param {number|null} opts.tierGapLevel - Diferencia de tier detectada (0-4+).
 * @param {object} opts.charA - Combatiente A.
 * @param {object} opts.charB - Combatiente B.
 * @param {boolean} opts.isBossMode - Si el combate es un Boss Raid.
 * @param {string} [opts.bossName] - Nombre del Boss.
 */
export function buildCombatCoreBlock(opts = {}) {
  const {
    scenario, modifiers = {}, tierGapLevel = null, charA = null, charB = null,
    isBossMode = false, bossName = '', bossMultiplier = 1.35,
    isTeamsMode = false, isBattleRoyale = false, participants = [], teamA = [], teamB = []
  } = opts;

  const sections = [
    buildResolutionProtocolBlock(),
    buildResourceModelBlock(),
    buildHaxLayersBlock(),
    buildTierDifferenceBlock(tierGapLevel)
  ];

  const arenaBlock = buildArenaMechanicsBlock(scenario);
  if (arenaBlock) sections.push(arenaBlock);

  sections.push(buildStatusCatalogBlock());
  sections.push(buildAntiSpamBlock());

  if (isBossMode) {
    const multLabel = `${Number(bossMultiplier).toFixed(2)}x`;
    sections.push(buildBossSystemBlock());
    sections.push(`### 🐉 ESCALADO DE JEFE ACTIVO: ${multLabel}\nEl Boss opera con rendimiento multiplicado por ${multLabel} respecto a su línea base. Las fases de escalado SOLO se activan por triggers canónicos (umbral de daño, tiempo, pérdida de aliados o uso de ultimate), nunca por conveniencia narrativa.`);
    const profile = getRaidBossProfile(bossName || charB?.name || scenario);
    if (profile) {
      sections.push(`### 👹 PERFIL DE RAID BOSS: ${profile.name}\n- ${profile.desc || profile.type || ''}\n- Fases declaradas: ${profile.phases ? Object.keys(profile.phases).join(' → ') : '3 fases estándar'}`);
    }
  }

  if (isTeamsMode) {
    const nA = (teamA || []).length || '?';
    const nB = (teamB || []).length || '?';
    sections.push(`### ⚔️ PROTOCOLO DE FACCIÓN / EQUIPOS (${nA} vs ${nB} FACCIONES)
- Los aliados de una misma facción actúan de forma coordinada con sinergias REALES (ataques combinados, cobertura y relevos), no como combatientes independientes.
- Ventaja numérica: aplica presión y flanqueo, pero NO garantiza la victoria ante una diferencia de tier abrumadora.
- Cada baja reduce la capacidad de equipo y cambia el control del campo; muéstralo gradualmente.`);
  }

  if (isBattleRoyale) {
    const n = (participants || []).length || '?';
    sections.push(`### 🎯 PROTOCOLO BATTLE ROYALE (TODOS CONTRA TODOS — ${n} COMBATIENTES)
- Nadie es aliado permanente: las alianzas son tácticas, frágiles y se rompen cuando conviene.
- Prohibido narrar un 1v1 limpio mientras hay ${n} combatientes vivos: el resto maniobra, observa y ataca a los debilitados.
- El entorno y el desgaste delatan al más fuerte: el exceso de poder atrae agresión múltiple.`);
  }

  sections.push(buildVerseEqualizationBlock(charA, charB));
  sections.push(buildArtifactsBlock());
  sections.push(buildTurnChecklistBlock(participants));

  return sections.join('\n\n');
}

export { STANDARD_COUNTER_TAGS };

export default {
  buildCombatCoreBlock,
  buildResolutionProtocolBlock,
  buildResourceModelBlock,
  buildHaxLayersBlock,
  buildTierDifferenceBlock,
  buildStatusCatalogBlock,
  buildAntiSpamBlock,
  buildBossSystemBlock,
  buildVerseEqualizationBlock,
  buildArenaMechanicsBlock,
  buildArtifactsBlock,
  buildTurnChecklistBlock,
  matchDynamicArena,
  getRaidBossProfile
};
