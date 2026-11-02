/**
 * APEX ENGINE - Narrative Formatter & Cohesion Engine
 * Mejora la redacción, fluidez narrativa y cohesión de los registros de combate y resúmenes What-If.
 * Preserva 100% las reglas, multiplicadores y tiers mecánicos.
 */

export const NARRATIVE_TEMPLATES = {
  STRIKE_HEAVY: [
    "{actor} desata una arremetida colosal contra {target}, descargando una fuerza de impacto de nivel {tier} que hace temblar el terreno.",
    "Aprovechando su velocidad de reacción superior, {actor} conecta una seguidilla de golpes directos sobre {target}, obligándolo a retroceder.",
    "Con precisión milimétrica, {actor} canaliza su potencia física y propina un impacto demoledor al centro de masa de {target}."
  ],
  ENERGY_BLAST: [
    "{actor} concentra una masiva descarga de energía ({attackName}) y la dispara a quemarropa hacia {target}, envolviendo el entorno en un resplandor cegador.",
    "Canalizando su reserva de poder, {actor} proyecta su técnica insignia '{attackName}', obligando a {target} a desplegar sus defensas al límite.",
    "El aire se distorsiona cuando {actor} libera '{attackName}', una ráfaga devastadora que impacta de lleno contra {target}."
  ],
  HAX_ABILITY: [
    "Activando su arsenal más temible, {actor} despliega {abilityName}, alterando la dinámica del combate y poniendo en jaque la estrategia de {target}.",
    "{actor} ejecuta con maestría '{abilityName}', desafiando la lógica física convencional y forzando a {target} a una posición crítica.",
    "Con un despliegue táctico trascendente, {actor} manifiesta '{abilityName}', neutralizando temporalmente las ventajas de {target}."
  ],
  TRANSFORMATION: [
    "¡El campo de batalla se estremece! {actor} rompe sus límites y despierta su forma '{formName}', elevando su energía hasta los {kiDisplay}.",
    "Un torrente imparable de poder envuelve a {actor}, manifestando la imponente presencia de '{formName}' y reescribiendo la escala del duelo.",
    "Liberando el 100% de su potencial contenido, {actor} transiciona a '{formName}', consolidando su estatus en Tier {tier}."
  ],
  DEFENSE_GUARD: [
    "{target} anticipa la trayectoria del ataque y levanta una barrera defensiva inexpugnable, amortiguando gran parte del impacto.",
    "Gracias a su durabilidad de nivel {tier}, {target} resiste la ofensiva de pie, manteniendo su postura de combate intacta.",
    "{target} lee las intenciones de su rival y desvía el vector del golpe en el último instante mediante reflejos sobrehumanos."
  ],
  VICTORY: [
    "Tras un choque titánico donde se pusieron a prueba todos sus límites, {winner} se alza con la victoria indiscutible frente a {loser}.",
    "El duelo culmina con la supremacía de {winner}, cuya superioridad en {factor} definió el desenlace definitivo ante la tenaz resistencia de {loser}.",
    "La balanza de poder se inclina irrevocablemente: {winner} asegura el triunfo consagrándose en el pináculo de la simulación frente a {loser}."
  ]
};

function getRandomTemplate(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Genera una línea narrativa fluida y cinematográfica para un evento de combate
 */
export function formatCombatEvent(event = {}) {
  const {
    type = 'strike',
    actorName = 'Gladiador',
    targetName = 'Oponente',
    tier = 'Nivel Desconocido',
    attackName = 'Técnica de Combate',
    abilityName = 'Habilidad Especial',
    formName = 'Forma Despertada',
    kiDisplay = 'Nivel Máximo',
    winnerName = '',
    loserName = '',
    factor = 'destreza y potencia'
  } = event;

  let template = '';

  switch (type) {
    case 'strike':
    case 'heavy_strike':
      template = getRandomTemplate(NARRATIVE_TEMPLATES.STRIKE_HEAVY);
      break;
    case 'energy':
    case 'beam':
      template = getRandomTemplate(NARRATIVE_TEMPLATES.ENERGY_BLAST);
      break;
    case 'hax':
    case 'special':
      template = getRandomTemplate(NARRATIVE_TEMPLATES.HAX_ABILITY);
      break;
    case 'transform':
    case 'awakening':
      template = getRandomTemplate(NARRATIVE_TEMPLATES.TRANSFORMATION);
      break;
    case 'defense':
    case 'parry':
      template = getRandomTemplate(NARRATIVE_TEMPLATES.DEFENSE_GUARD);
      break;
    case 'victory':
      template = getRandomTemplate(NARRATIVE_TEMPLATES.VICTORY);
      break;
    default:
      template = "{actor} ejecuta una maniobra decisiva contra {target}.";
  }

  return template
    .replace(/{actor}/g, actorName)
    .replace(/{target}/g, targetName)
    .replace(/{tier}/g, tier)
    .replace(/{attackName}/g, attackName)
    .replace(/{abilityName}/g, abilityName)
    .replace(/{formName}/g, formName)
    .replace(/{kiDisplay}/g, kiDisplay)
    .replace(/{winner}/g, winnerName || actorName)
    .replace(/{loser}/g, loserName || targetName)
    .replace(/{factor}/g, factor);
}

/**
 * Enriquece un resumen completo de combate con introducción y conclusión cinematográfica
 */
export function enrichMatchNarrative({ char1, char2, turns = [], winner, factor = '' }) {
  const intro = `⚔️ **PREFACIO DEL DUELO:** En una arena neutra de dimensiones colosales, **${char1?.name || 'Gladiador 1'}** (${char1?.tier || 'Tier ?'}) y **${char2?.name || 'Gladiador 2'}** (${char2?.tier || 'Tier ?'}) colisionan en un choque de voluntades y escalas destructivas sin precedentes.`;
  
  const formattedTurns = turns.map((t, idx) => {
    const turnText = t.narrative || t.description || t.text || (typeof t === 'string' ? t : `Turno ${idx + 1}: Intercambio de golpes.`);
    return `• **Ronda ${idx + 1}:** ${turnText}`;
  }).join('\n');

  const loserName = winner?.id === char1?.id ? char2?.name : char1?.name;
  const conclusion = winner
    ? `🏆 **VEREDICTO FINAL:** ${formatCombatEvent({ type: 'victory', winnerName: winner.name, loserName: loserName || 'su oponente', factor: factor || 'rendimiento sostenido y hax superior' })}`
    : `⚖️ **VEREDICTO FINAL:** Tras agotar sus reservas, ambos combatientes quedan en un empate técnico por desgaste mutuo.`;

  return `${intro}\n\n${formattedTurns}\n\n${conclusion}`;
}
