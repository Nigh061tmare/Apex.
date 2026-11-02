/**
 * APEX Engine - Biological & Racial Passives Resolver (v1.0.0)
 * =============================================================
 * Capa DETERMINISTA de reglas fisiologicas canonicas, derivada de los
 * Dragon Ball Compendios (Chozenshu 1-4). NO muta el baseline V22:
 * envuelve `resolveCombatState()` mediante `augmentCombatState()`.
 *
 * Filosofia:
 *  - Todo dato es DECLARATIVO (registry) + ejecutable por funciones puras.
 *  - Cero aleatoriedad: la variacion individual ya la aporta
 *    `getCharacterSignatureVariance()` del scouterEngine.
 *  - Toda regla declara `source` (tomo/pagina) y `counterplay` (contra-juego).
 *
 * Fuentes canonicas citadas:
 *  - Chozenshu 4 (Superenciclopedia), Columna 2, pp.30-31: multiplicadores
 *    de Oozaru (x10), Puno Kaio (x2..x20) y Supersaiyano (x50), Zenkai
 *    ("aumento exponencial tras la unidad terapeutica"), energia ilimitada
 *    de androides, regeneracion de Piccolo/Cell/Buu.
 */

// ---------------------------------------------------------------------------
// CONSTANTES TUNING (documentadas; ajustables por balance, nunca por azar)
// ---------------------------------------------------------------------------
export const PASSIVE_CONSTANTS = Object.freeze({
  ZENKAI_HP_THRESHOLD: 0.10,     // debe sobrevivir con <= 10% de HP
  ZENKAI_MAX_GAIN_PER_EVENT: 4.0, // +400% maximo por un solo Zenkai
  ZENKAI_CUMULATIVE_CAP: 40.0,    // limite acumulado de la vida del personaje (x)
  ZENKAI_K: 1.85,                 // coeficiente de severidad
  ZENKAI_MIN_RECOVERY_TURNS: 1,   // recuperacion requerida
  NAMEK_REGEN_KI_COST: 0.25,      // 25% del Ki maximo por miembro regenerado
  NAMEK_REGEN_STAMINA_COST: 18,   // coste de stamina (escala con el tier)
  NAMEK_REGEN_COOLDOWN_TURNS: 2,
  NAMEK_REGEN_MIN_STAMINA: 0.20,  // por debajo no puede regenerar
  ANDROID_KI_GROWTH: 0.0,         // energia perpetua: no crece por aura/entrenamiento
  ANDROID_FATIGUE_MULTIPLIER: 0.0, // su rendimiento nunca cae por cansancio
  BIO_ABSORB_KI_SHARE: 1.0,       // Cell absorbe el 100% del Ki base del objetivo
  MAJIN_ABSORB_KI_SHARE: 0.8,     // Buu absorbe el 80% + hereda tecnicas
  FREEZER_CORE_SURVIVAL_KI: 0.05, // sobrevive a disparos letales si queda nucleo y >=5% Ki
  OOZARU_MULTIPLIER: 10.0,
  SUPER_SAIYAN_MULTIPLIER: 50.0
});

// ---------------------------------------------------------------------------
// REGISTRY DE PASIVAS
// ---------------------------------------------------------------------------
/**
 * @typedef {Object} PassiveRule
 * @property {string} id
 * @property {string} name
 * @property {'saiyan'|'namekian'|'android'|'bio'|'majin'|'frost-demon'|'hax'} category
 * @property {string} source   Cita canonica (tomo/pagina)
 * @property {string} effect   Descripcion funcional para el prompt del LLM
 * @property {string[]} counterplay
 * @property {(c:Object)=>boolean} matches  Predicado sobre el personaje/roster
 */
export const SAIYAN_TOKENS = Object.freeze([
  'son-goku', 'goku', 'vegeta', 'son-gohan', 'gohan', 'son-goten', 'goten',
  'trunks', 'broly', 'bardock', 'raditz', 'nappa', 'kakarotto', 'bejita',
  'kale', 'caulifla', 'cabba', 'paragus', 'rey-vegeta', 'king-vegeta',
  'tarble', 'gine', 'pan-gt', 'tullece', 'turles', 'gogeta', 'vegito',
  'gotenks', 'super-saiyano'
]);

export const NO_KI_SENSE_TOKENS = Object.freeze([
  'androide', 'android', 'a-16', 'a-17', 'a-18', 'a-19', 'a-20',
  'buu', 'majin', 'freezer', 'cooler', 'chilled', 'rey-cold', 'king-cold'
]);

/** Predicado robusto: NO basta con que el id contenga "saiyan" (aparece en nombres de saga). */
export function isSaiyan(c) {
  if (!c) return false;
  if (c.race) return String(c.race).toLowerCase() === 'saiyan';
  const idn = String(c.id || '').toLowerCase();
  if (/piccolo|namekian|namekiano|dende|nail|slug|androide|android|buu|majin|cell|freezer|cooler|chilled/.test(idn)) return false;
  return SAIYAN_TOKENS.some((t) => idn.includes(t));
}

export const GOD_KI_TOKENS = Object.freeze([
  'ssj-blue', 'super-saiyano-blue', 'super-saiyan-blue', 'blue-evolucionado',
  'ultra-instinto', 'ultra-instinct', 'ultra-ego', 'super-saiyano-dios',
  'super-saiyan-god', 'goku-black', 'zamasu', 'beerus', 'champa', 'whis',
  'jiren', 'toppo', 'hit-dbs', 'belmod', 'rumsshi', 'grand-priest'
]);

/* ---------------------------------------------------------------------------
 * LIMITES CANONICOS DE TECNOLOGIA (Chozenshu 1, Tomo 04 p.300)
 * ------------------------------------------------------------------------- */

export const CANON_LIMITS = Object.freeze({
  /** Los modelos ANTIGUOS de Scouter no leen por encima de 22.000 unidades. */
  SCOUTER_ANTIGUO_MAX: 22000,
  /** La unidad terapeutica cura a un herido critico en poco mas de media hora. */
  UNIDAD_TERAPEUTICA_MIN: 30,
  /** Record de Mister Satan en la maquina de medicion de fuerza (24a edicion). */
  PUNETAZO_MR_SATAN: 139,
  /** Sixinglong eleva su cuerpo hasta esta temperatura. */
  SIXINGLONG_TEMPERATURA_C: 6000
});

/**
 * Lectura de un Scouter canonico. Los modelos antiguos SATURAN al alcanzar el
 * tope: el canon indica que no pueden detectar fuerzas superiores a 22.000.
 * @param {number} baseKi fuerza de combate real
 * @param {'antiguo'|'nuevo'} model
 */
export function readScouter(baseKi, model = 'nuevo') {
  const ki = Number(baseKi) || 0;
  if (model === 'antiguo' && ki > CANON_LIMITS.SCOUTER_ANTIGUO_MAX) {
    return { reading: CANON_LIMITS.SCOUTER_ANTIGUO_MAX, saturated: true, note: 'Modelo antiguo: tope 22.000 (Chozenshu 1, p.300).' };
  }
  return { reading: ki, saturated: false, note: 'Los modelos nuevos leen por encima de 22.000.' };
}

export const PASSIVE_REGISTRY = [
  {
    id: 'zenkai', name: 'Zenkai', category: 'saiyan',
    source: 'Chozenshu 4, p.31 (Columna 2): "aumento exponencial tras la unidad terapeutica"',
    effect: 'Al sobrevivir a un combate con <=10% de HP, el poder base crece de forma no lineal.',
    counterplay: ['Negar la recuperacion (Danio Continuo)', 'Ejecutar el remate antes de que se recupere', 'Sellos de Ki'],
    matches: (c) => isSaiyan(c)
  },
  {
    id: 'namekian-regeneration', name: 'Regeneracion Namekiana', category: 'namekian',
    source: 'Chozenshu 4 (Piccolo/Cell/Slug): la regeneracion de miembros consume una cantidad severa de Ki',
    effect: 'Regenera miembros amputados a coste de Ki maximo; no regenera la cabeza ni el nucleo.',
    counterplay: ['Destruir cabeza/nucleo', 'Forzar el gasto de Ki', 'Danio de area continuo'],
    matches: (c) => {
      if (!c) return false;
      const idn = `${c.id || ''} ${c.name || ''} ${c.universe || ''}`;
      // Solo namekianos reales (Piccolo, Dende, Nail, Slug, Katattsu...).
      if (/piccolo|dende|nail|slug|katattsu|namekiano|namekian/i.test(idn)) return true;
      return /namekiano|namekian/i.test(idn) && !/saga-namek/i.test(c.id || '');
    }
  },
  {
    id: 'android-perpetual', name: 'Energia Perpetua Androide', category: 'android',
    source: 'Chozenshu 4: "no tienen energia detectable"; A-17/A-18 rinden sin cansarse jamas',
    effect: 'Stamina infinita (drenaje 0); Ki base indetectable; NO puede incrementar poder por auras ni entrenamiento.',
    counterplay: ['Absorcion energetica (A-19/A-20/Cell)', 'Fuerza bruta que supere su techo estatico', 'Hax que no dependa de ki'],
    matches: (c) => c && (/-(a-1[6-9]|a-2[01]|17|18|19|20)\b/i.test(c.id || '') || /androide|android/i.test((c.universe || '') + (c.name || '')))
  },
  {
    id: 'bio-absorption', name: 'Absorcion de Biomasa Celular', category: 'bio',
    source: 'Chozenshu 4: Cell absorbe A-17 y A-18 con la cola para completar su evolucion',
    effect: 'Absorbe al objetivo inmovilizado: suma su Ki base y desbloquea su forma evolutiva.',
    counterplay: ['Inmovilizar la cola', 'Barreras de ki', 'Ataques a distancia con Makankosappo/Kienzan'],
    matches: (c) => c && /cell/i.test(c.id || '')
  },
  {
    id: 'majin-absorption', name: 'Absorcion Majin', category: 'majin',
    source: 'Chozenshu 4: Buu convierte al rival en chocolate o lo absorbe ganando sus poderes',
    effect: 'Convierte o absorbe al rival: +80% de su Ki base y herencia de una tecnica firma.',
    counterplay: ['No ser comestible/hallado', 'Potara/Fusion para superar el techo', 'Genkidama planetaria'],
    matches: (c) => c && /buu|majin/i.test(c.id || '')
  },
  {
    id: 'frost-demon-core', name: 'Nucleo de Supervivencia Frost Demon', category: 'frost-demon',
    source: 'Chozenshu 4 (Freezer): sobrevive al Genkidama y a la amputacion conservando el nucleo',
    effect: 'Sobrevive a un ataque letal si conserva el nucleo y >=5% de Ki; regeneracion costosa.',
    counterplay: ['Desintegrar por completo el cuerpo', 'Rayo Mortal al nucleo', 'Tajo circular de aura'],
    matches: (c) => c && /freezer|cooler|frost|chilled|king-cold/i.test(c.id || '')
  },
  {
    id: 'blutz-transformation', name: 'Transformacion Blutz (Oozaru)', category: 'saiyan',
    source: 'Chozenshu 4, p.30: "Su fuerza de combate se multiplica por 10" (Ohzaru = 100 desde base 10)',
    effect: 'Requiere cola + luna llena u ondas Blutz; x10 de poder y perdida de control sin entrenamiento.',
    counterplay: ['Cortar la cola', 'Destruir la luna/generador', 'Esperar el amanecer'],
    matches: (c) => isSaiyan(c)
  },
  {
    id: 'saiyan-ki-sense', name: 'Sentido del Ki', category: 'saiyan',
    source: 'Chozenshu 4: los terrestres aprenden a percibir el Ki; inutil contra androides y dioses',
    effect: 'Detecta y rastrea firmas de ki a escala planetaria. NO detecta androides ni ki divino.',
    counterplay: ['Androides (firma nula)', 'Ki divino (Undetectable)', 'Supresion total de ki'],
    matches: (c) => {
      if (!c) return false;
      const idn = String(c.id || '').toLowerCase();
      return !NO_KI_SENSE_TOKENS.some((t) => idn.includes(t));
    }
  },
  {
    id: 'god-ki', name: 'Ki Divino', category: 'hax',
    source: 'Chozenshu 4, Columna 3: el dios supersaiyano nace de la union de seis saiyanos de corazon puro',
    effect: 'Ki de naturaleza divina: indetectable por el sentido del ki mortal y con bypass de resistencias mundanas.',
    counterplay: ['Otro portador de ki divino', 'Hakai', 'Rituales de sellado'],
    matches: (c) => {
      if (!c) return false;
      const idn = String(c.id || '').toLowerCase();
      if (/androide|android|a-1[6-9]|a-20/.test(idn)) return false;
      return GOD_KI_TOKENS.some((t) => idn.includes(t));
    }
  },
  {
    id: 'perfect-regeneration', name: 'Regeneracion Perfecta (Bio/Majin)', category: 'hax',
    source: 'Chozenshu 4: Buu y Cell regeneran mientras su nucleo/semilla permanezca intacto',
    effect: 'Restaura HP completo a coste de stamina moderado mientras el nucleo exista.',
    counterplay: ['Hakai / borrado total', 'Absorcion del nucleo', 'Danio continuo superior a la tasa de regeneracion'],
    matches: (c) => c && (/cell|buu|majin/i.test(c.id || ''))
  }
];

// ---------------------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------------------
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function tierToIndex(tier) {
  if (typeof tier === 'number' && Number.isFinite(tier)) return clamp(tier, 0, 12);
  const m = String(tier || '').match(/(\d+)/);
  const n = m ? parseInt(m[1], 10) : 6;
  return clamp((10 - n) + 2, 0, 12); // 10-C -> bajo ; 1-A -> alto
}

/** Hash determinista FNV-1a (sin dependencias, estable entre sesiones). */
export function stableHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < String(str).length; i++) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// ---------------------------------------------------------------------------
// API PUBLICA
// ---------------------------------------------------------------------------
/** Lista de pasivas que aplican a un personaje (sin evaluar costes). */
export function resolvePassiveIds(character) {
  return PASSIVE_REGISTRY.filter((r) => {
    try { return !!r.matches(character); } catch { return false; }
  }).map((r) => r.id);
}

export function getPassive(id) {
  return PASSIVE_REGISTRY.find((r) => r.id === id) || null;
}

/**
 * ZENKAI: calculo determinista del boost.
 * Formula (documentada):
 *   gain = ZENKAI_K * s * (1 + t/12) * log10(1 + (baseKi / max(1, apexKi)))
 *   donde s = severidad (1 - hpRatio) in [0.9, 1], t = indice de tier (0..12)
 *   gain = clamp(gain, 0, ZENKAI_MAX_GAIN_PER_EVENT)
 * @returns {{gain:number, newBaseKi:number, applied:boolean, reason:string}}
 */
export function computeZenkai({ hpRatio, baseKi = 0, apexKi = null, tier = 6, survived = true, cumulative = 0 }) {
  if (!survived) return { gain: 0, newBaseKi: baseKi, applied: false, reason: 'no-supervivio' };
  if (hpRatio > PASSIVE_CONSTANTS.ZENKAI_HP_THRESHOLD) {
    return { gain: 0, newBaseKi: baseKi, applied: false, reason: 'hp-por-encima-del-umbral' };
  }
  if (cumulative >= PASSIVE_CONSTANTS.ZENKAI_CUMULATIVE_CAP) {
    return { gain: 0, newBaseKi: baseKi, applied: false, reason: 'techo-acumulado-alcanzado' };
  }
  const s = clamp(1 - hpRatio, 0, 1);
  const t = tierToIndex(tier);
  const ref = Math.max(1, Number(apexKi) || Number(baseKi) || 1);
  const ratioTerm = Math.log10(1 + (Number(baseKi) || 0) / ref);
  let gain = PASSIVE_CONSTANTS.ZENKAI_K * s * (1 + t / 12) * ratioTerm;
  gain = clamp(gain, 0, PASSIVE_CONSTANTS.ZENKAI_MAX_GAIN_PER_EVENT);
  const remaining = PASSIVE_CONSTANTS.ZENKAI_CUMULATIVE_CAP - cumulative;
  gain = Math.min(gain, remaining);
  return {
    gain: Number(gain.toFixed(4)),
    newBaseKi: Math.round((Number(baseKi) || 0) * (1 + gain)),
    applied: gain > 0,
    reason: gain > 0 ? 'zenkai-aplicado' : 'sin-ganancia-calculable'
  };
}

/**
 * REGENERACION NAMEKIANA: coste severo.
 * @returns {{allowed:boolean, kiCost:number, staminaCost:number, reason:string}}
 */
export function computeNamekianRegeneration({ maxKi = 0, staminaRatio = 1, tier = 6, membersLost = 1, cooldownTurns = 0 }) {
  const C = PASSIVE_CONSTANTS;
  if (cooldownTurns > 0) return { allowed: false, kiCost: 0, staminaCost: 0, reason: 'en-enfriamiento' };
  if (staminaRatio < C.NAMEK_REGEN_MIN_STAMINA) return { allowed: false, kiCost: 0, staminaCost: 0, reason: 'stamina-insuficiente' };
  const t = tierToIndex(tier);
  const kiCost = Math.round((Number(maxKi) || 0) * C.NAMEK_REGEN_KI_COST * (1 + t / 24) * membersLost);
  const staminaCost = Math.round(C.NAMEK_REGEN_STAMINA_COST * (1 + t / 12) * membersLost);
  return { allowed: true, kiCost, staminaCost, reason: 'regeneracion-viable', cooldownAfter: C.NAMEK_REGEN_COOLDOWN_TURNS };
}

/**
 * ENERGIA PERPETUA ANDROIDE: economia de stamina y topes.
 */
export function computeAndroidEconomy({ baseKi = 0, stamina = 100 }) {
  const C = PASSIVE_CONSTANTS;
  return {
    staminaDrain: 0,
    recoveryRate: Infinity,
    kiGrowthMultiplier: C.ANDROID_KI_GROWTH,
    kiDetectable: false,
    fatigueApplied: 0,
    // El techo es estatico: el Ki operativo jamas supera el Ki base registrado.
    hardCeiling: Number(baseKi) || 0,
    staminaNormalized: stamina
  };
}

/**
 * ABSORCION (Cell 100% / Buu 80%): suma poder y hereda tecnicas.
 */
export function computeAbsorption({ absorberBaseKi = 0, targetBaseKi = 0, kind = 'bio', targetFormIds = [] }) {
  const share = kind === 'majin' ? PASSIVE_CONSTANTS.MAJIN_ABSORB_KI_SHARE : PASSIVE_CONSTANTS.BIO_ABSORB_KI_SHARE;
  const gained = Math.round((Number(targetBaseKi) || 0) * share);
  return {
    gained,
    newBaseKi: (Number(absorberBaseKi) || 0) + gained,
    inheritedForms: kind === 'majin' ? targetFormIds.slice(0, 1) : [],
    note: kind === 'majin'
      ? 'Buu hereda rasgos fisicos y una tecnica firma; su personalidad se degrada.'
      : 'Cell desbloquea la siguiente forma al completar la cuenta de androides.'
  };
}

/**
 * SUPERVIVENCIA FROST DEMON (Freezer): nucleo intacto.
 */
export function computeFrostDemonSurvival({ kiRatio = 1, coreIntact = true, damageType = 'physical' }) {
  const lethal = ['hakai', 'borrado-total', 'desintegracion'].includes(damageType);
  if (!coreIntact || lethal) return { survived: false, reason: lethal ? 'ataque-de-borrado' : 'nucleo-destruido' };
  if (kiRatio < PASSIVE_CONSTANTS.FREEZER_CORE_SURVIVAL_KI) return { survived: false, reason: 'ki-insuficiente' };
  return { survived: true, reason: 'nucleo-intacto', postState: 'cuerpo-reconstruido-parcial' };
}

// ---------------------------------------------------------------------------
// INTEGRACION NO INVASIVA CON combatStateResolver
// ---------------------------------------------------------------------------
/**
 * Enriquece un estado ya resuelto SIN mutar el baseline V22.
 * @param {Object} combatState  salida de resolveCombatState(...)
 * @param {Object} character    ficha del roster (V22, solo lectura)
 * @param {Object} ctx          { staminaRatio, hpRatio, cumulativeZenkai, events:[] }
 */
export function augmentCombatState(combatState, character, ctx = {}) {
  if (!combatState || typeof combatState !== 'object') {
    return { ...ctx, passives: [], warnings: ['augmentCombatState: estado invalido'] };
  }
  const ids = resolvePassiveIds(character);
  const warnings = [];
  const active = [];

  if (ids.includes('zenkai') && Number.isFinite(ctx.hpRatio)) {
    const z = computeZenkai({
      hpRatio: ctx.hpRatio,
      baseKi: character?.baseKiNumeric ?? combatState.baseKiNumeric ?? 0,
      apexKi: combatState.apexKiNumeric ?? null,
      tier: character?.baseTier ?? combatState.tier ?? 6,
      survived: ctx.survived !== false,
      cumulative: ctx.cumulativeZenkai || 0
    });
    active.push({ id: 'zenkai', ...z });
    if (z.applied) warnings.push(`Zenkai: baseKi escalado x${(1 + z.gain).toFixed(2)}`);
  }
  if (ids.includes('android-perpetual')) {
    active.push({ id: 'android-perpetual', ...computeAndroidEconomy({ baseKi: character?.baseKiNumeric ?? 0 }) });
    warnings.push('Androide: stamina infinita y Ki indetectable; techo de poder estatico.');
  }
  if (ids.includes('namekian-regeneration')) {
    active.push({ id: 'namekian-regeneration', ...computeNamekianRegeneration({
      maxKi: character?.baseKiNumeric ?? 0,
      staminaRatio: ctx.staminaRatio ?? 1,
      tier: character?.baseTier ?? 6,
      membersLost: ctx.membersLost || 1,
      cooldownTurns: ctx.cooldownTurns || 0
    }) });
  }
  return {
    ...combatState,
    passiveIds: ids,
    passivesResolved: active,
    warnings: [...(combatState.warnings || []), ...warnings]
  };
}

/**
 * Bloque de texto compacto para inyectar en el prompt de simulacion (LLM).
 */
export function summarizePassivesForPrompt(character) {
  const rules = PASSIVE_REGISTRY.filter((r) => { try { return !!r.matches(character); } catch { return false; } });
  if (!rules.length) return '';
  const lines = rules.map((r) => `- [${r.id}] ${r.name}: ${r.effect} Contrajuego: ${r.counterplay.join(' / ')}.`);
  return `PASIVAS BIOLOGICAS CANONICAS (Chozenshu 1-4):\n${lines.join('\n')}`;
}

/** Autotest determinista (ejecutable con `node --input-type=module`). */
export function selfTest() {
  const out = [];
  const goku = { id: 'son-goku-llegada-dbz-saga-saiyan-169', baseTier: '5-A', baseKiNumeric: 8000, universe: 'Dragon Ball' };
  const a17 = { id: 'a-17-dbs', baseTier: '4-C', baseKiNumeric: 1e12, universe: 'Dragon Ball', name: 'Androide 17' };
  out.push(['passives(goku) contiene zenkai', resolvePassiveIds(goku).includes('zenkai')]);
  out.push(['passives(a17) contiene android-perpetual', resolvePassiveIds(a17).includes('android-perpetual')]);
  const z1 = computeZenkai({ hpRatio: 0.05, baseKi: 1000000, apexKi: 1000000, tier: 5, cumulative: 0 });
  out.push(['zenkai aplica con 5% HP', z1.applied === true]);
  out.push(['zenkai no aplica con 50% HP', computeZenkai({ hpRatio: 0.5, baseKi: 1000 }).applied === false]);
  const z2 = computeZenkai({ hpRatio: 0.01, baseKi: 1000000, apexKi: 1000000, tier: 1, cumulative: 0 });
  out.push(['zenkai respeta techo por evento', z2.gain <= PASSIVE_CONSTANTS.ZENKAI_MAX_GAIN_PER_EVENT + 1e-9]);
  const r = computeNamekianRegeneration({ maxKi: 1000000, staminaRatio: 0.5, tier: 4, membersLost: 1 });
  out.push(['regeneracion namekiana permitida', r.allowed === true && r.kiCost > 0]);
  out.push(['regeneracion bloqueada sin stamina', computeNamekianRegeneration({ maxKi: 1000, staminaRatio: 0.05 }).allowed === false]);
  const a = computeAbsorption({ absorberBaseKi: 100, targetBaseKi: 1000, kind: 'majin' });
  out.push(['absorcion majin 80%', a.gained === 800]);
  out.push(['determinismo de zenkai', JSON.stringify(computeZenkai({ hpRatio: 0.03, baseKi: 5000, apexKi: 9000, tier: 7 })) === JSON.stringify(computeZenkai({ hpRatio: 0.03, baseKi: 5000, apexKi: 9000, tier: 7 }))]);
  const failed = out.filter(([, ok]) => !ok);
  return { passed: out.length - failed.length, total: out.length, failed: failed.map(([n]) => n), results: out };
}

export default {
  PASSIVE_CONSTANTS, PASSIVE_REGISTRY, resolvePassiveIds, getPassive,
  computeZenkai, computeNamekianRegeneration, computeAndroidEconomy,
  computeAbsorption, computeFrostDemonSurvival, augmentCombatState,
  summarizePassivesForPrompt, stableHash, selfTest
};
