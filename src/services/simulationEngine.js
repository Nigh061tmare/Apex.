import { formatNeedsReviewSimulationNotice } from './needsReviewService';
import { DYNAMIC_ARENAS, RAID_BOSSES_PROFILES, LEGENDARY_ARTIFACTS, ARENA_BALANCE_RULES } from '../data/arenasArtifactsBosses';
import { COMBAT_RESOLUTION_ORDER, UNIFIED_RESOURCE_POOLS, HAX_LAYERS_HIERARCHY, VERSE_EQUALIZATION_RULES, TIER_DIFFERENCE_RULES, PERSISTENT_COMBAT_STATUSES, COOLDOWN_TIERS, buildCombatLogSnapshot } from '../data/combatResolutionEngine';
import { RAID_BOSS_TIERS, calculateSquadSynergy } from './synergyEngine';
import { detectNarrativeBossMechanics } from '../data/tagMechanicsSystem';
import { resolveCombatState } from '../lib/combatStateResolver';
import { selectContextualExternalEntity, getBodilyForms, getExternalEntities } from '../lib/externalEntityFramework';
import { createCombatSnapshot, validateCombatSnapshot, executeCombatSimulation, synthesizeNarrativeFromValidatedLog, ORACLE_EVENT_CONFIG } from './combatSimulationCore';
/**
 * Resuelve dinámicamente el límite máximo de tokens de salida según el modelo activo.
 * Desbloquea 65.536 tokens para Nemotron Ultra / Super y 131.072 tokens para MiniMax M3.
 */
export function resolveMaxOutputTokens(modelName = '') {
  const m = (modelName || '').toLowerCase();
  if (m.includes('minimax') || m.includes('mini-max')) return 131072;
  if (m.includes('nemotron') && (m.includes('ultra') || m.includes('super') || m.includes('550b'))) return 65536;
  if (m.includes('muse-spark')) return 131072;
  if (m.includes('glm-5') || m.includes('glm-4')) return 65536;
  if (m.includes('deepseek-v4') || m.includes('qwen3.8') || m.includes('opencode')) return 65536;
  if (m.includes('gemini-2.0') || m.includes('gemini-1.5')) return 32768;
  return 16384;
}


// Las claves de proveedores NO se incrustan en el código (riesgo de fuga).
// Se resuelven en tiempo de ejecución desde: config del usuario, localStorage
// (apex_provider_api_keys / apex_ai_config) y variables de entorno del servidor.
export const BUILTIN_OPENROUTER_KEYS = [];
export const BUILTIN_OPENCODE_KEYS = [];

export function resolveCandidateApiKeys(cfg, engine) {
  const keys = [];
  if (cfg?.apiKeys && typeof cfg.apiKeys === 'object') {
    const list = cfg.apiKeys[engine];
    if (Array.isArray(list)) {
      list.forEach(k => {
        if (k && typeof k === 'string' && k.trim() && !keys.includes(k.trim())) keys.push(k.trim());
      });
    }
  }
  if (cfg?.apiKey && typeof cfg.apiKey === 'string' && cfg.apiKey.trim()) {
    if (!keys.includes(cfg.apiKey.trim())) {
      keys.unshift(cfg.apiKey.trim());
    }
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const savedProviderKeys = localStorage.getItem('apex_provider_api_keys');
      if (savedProviderKeys) {
        const parsed = JSON.parse(savedProviderKeys);
        const list = parsed?.[engine];
        if (Array.isArray(list)) {
          list.forEach(k => {
            if (k && typeof k === 'string' && k.trim() && !keys.includes(k.trim())) {
              keys.push(k.trim());
            }
          });
        }
      }
      const savedAiCfg = localStorage.getItem('apex_ai_config');
      if (savedAiCfg) {
        const parsedCfg = JSON.parse(savedAiCfg);
        const sub = parsedCfg?.[engine] || parsedCfg?.simulationEngine || parsedCfg?.characterEngine;
        if (sub?.apiKey && typeof sub.apiKey === 'string' && sub.apiKey.trim() && !keys.includes(sub.apiKey.trim())) {
          keys.push(sub.apiKey.trim());
        }
      }
    }
  } catch (e) {}

  if (engine === 'openrouter') {
    BUILTIN_OPENROUTER_KEYS.forEach(k => {
      if (!keys.includes(k)) keys.push(k);
    });
  }

  if (engine === 'opencode') {
    BUILTIN_OPENCODE_KEYS.forEach(k => {
      if (!keys.includes(k)) keys.push(k);
    });
  }

  return keys.length > 0 ? keys : [''];
}

export const SimulationEngine = {
  generateMasterPrompt(charA, charB, scenario, modifiers = {}, teamA = [], teamB = [], battleRoyale = [], multiTeams = [], bossMinions = []) {
    // DETECCIÓN AUTOMÁTICA DE INTENCIÓN DEL USUARIO (modos de estructura/duración)
    const userText = `${charA?.name || ''} ${charB?.name || ''} ${scenario || ''}`.toLowerCase();
    if (!modifiers.simulationMode) {
      if (userText.includes('maratón') || userText.includes('maraton') || userText.includes('combate de resistencia') || userText.includes('pelea muy larga') || userText.includes('alargar mucho')) {
        modifiers.simulationMode = 'maraton';
      } else if (userText.includes('novela continua') || userText.includes('novela') || userText.includes('sin fases') || userText.includes('sin fase') || userText.includes('narrativa fluida')) {
        modifiers.simulationMode = 'novela_continua';
      } else if (userText.includes('épica extendida') || userText.includes('epica extendida') || userText.includes('combate extendido') || userText.includes('6 fases') || userText.includes('seis fases') || userText.includes('pelea más larga') || userText.includes('alarga la pelea')) {
        modifiers.simulationMode = 'epica_extendida';
      } else if (userText.includes('relámpago') || userText.includes('relampago') || userText.includes('combate rápido') || userText.includes('one-shot') || userText.includes('en segundos') || userText.includes('pelea corta')) {
        modifiers.simulationMode = 'relampago';
      } else if (userText.includes('resistencia infinita') || userText.includes('duelo infinito') || userText.includes('hasta el colapso') || userText.includes('sin límite de tiempo')) {
        modifiers.simulationMode = 'resistencia_infinita';
      } else if (userText.includes('ascensión') || userText.includes('ascension') || userText.includes('rondas de poder') || userText.includes('evolución de poder') || userText.includes('subiendo de nivel')) {
        modifiers.simulationMode = 'ascension';
      } else if (userText.includes('oleadas') || userText.includes('defensa infinita') || userText.includes('asalto por oleadas') || userText.includes('horda')) {
        modifiers.simulationMode = 'oleadas';
      } else if (userText.includes('psicológico') || userText.includes('psicologico') || userText.includes('guerra psicológica') || userText.includes('mind games') || userText.includes('mente sobre músculo')) {
        modifiers.simulationMode = 'psicologico';
      } else if (userText.includes('sparring') || userText.includes('entrenamiento') || userText.includes('sin muerte') || userText.includes('combate amistoso')) {
        modifiers.simulationMode = 'sparring';
      } else if (userText.includes('crónica') || userText.includes('cronica') || userText.includes('campaña') || userText.includes('por capítulos') || userText.includes('por capitulos')) {
        modifiers.simulationMode = 'cronica';
      } else if (userText.includes('episódico') || userText.includes('episodico') || userText.includes('por episodios') || userText.includes('cliffhanger')) {
        modifiers.simulationMode = 'episodico';
      } else if (userText.includes('torneo') || userText.includes('bracket') || userText.includes('eliminatoria') || userText.includes('con comentarista')) {
        modifiers.simulationMode = 'torneo_shonen';
      } else if (userText.includes('trilogía') || userText.includes('trilogia') || userText.includes('tres actos') || userText.includes('3 actos')) {
        modifiers.simulationMode = 'trilogia';
      }
    }
    const preset = modifiers.narrativePreset || 'Equilibrado';
    const matchMode = modifiers.matchMode || '1v1';
    const simRulesStr = modifiers.canonStrict ? 'STRICT CANON (No non-canon scaling)' : 'APEX CUSTOM (Multiversal Equalization)';
    const energyRulesStr = modifiers.energyEqualized ? 'EQUALIZED ENERGY SEEDS' : 'ISOLATED ENERGY SYSTEMS';

    const simulationRules = `
### =========================================================================
### APEX ETERNIDAD / ORÁCULO V2: GOBERNANZA DE TRES CAPAS INVIOLABLES
### =========================================================================
- CAPA 1 [ROSTER CANÓNICO V25]: Inmutable. Los datos de Ki, tiers, multiplicadores y fichas provienen exclusivamente del Roster V25 y permanecen congelados.
- CAPA 2 [ESCENARIO Y ORÁCULO DE ETERNIDAD]: Reglas y giros de Fase 3 temporales (persistence: simulation_only). Toda forma o técnica generada lleva badge explícito.
- CAPA 3 [RESULTADO DE SIMULACIÓN]: Desenlace, secuelas anatómicas y líneas Alfa/Beta/Omega aisladas (persistence: simulation_only). Prohibido mutar el Roster V25.
- NARRATIVE MODE: ${preset}
- COMBAT FORMAT: ${matchMode}
- SCALING RULES: ${simRulesStr}
- ENERGY MECHANICS: ${energyRulesStr}

### 🏷️ BADGES OFICIALES OBLIGATORIOS (USO EN RELATO Y TARJETAS):
- [ROSTER V25] · Hecho permanente del roster canónico.
- [ORÁCULO — EVENTO DE ESCENARIO] · Regla o giro de escenario en Fase 3.
- [ORÁCULO — DESPERTAR CANÓNICO] · Forma lógica de saga temporal (+1 escala).
- [ORÁCULO — DESPERTAR TRASCENDENTE] · Forma What-If máxima temporal.
- [ORÁCULO — FUSIÓN CANÓNICA] · Fusión Potara/Metamoru con fórmula determinista única.
- [ORÁCULO — FUSIÓN WHAT-IF HÍBRIDA] · Fusión hipotética temporal de aliados.
- [ORÁCULO — FINISHER LIBERADO] · Súper técnica prohibida de Fase 3 con alto coste de stamina.
- [ORÁCULO — ENTIDAD TEMPORAL] · Invocación o invasor temporal (bodyStatIsolation: true, no altera stats del owner).
- [SIMULACIÓN — CONSECUENCIA NO PERSISTENTE] · Desenlace no persistente.
- [CAMPAÑA — CONSECUENCIA GUARDADA] · Resultado promovido a crónica persistente separada.
### =========================================================================
`;

    // ─── TIER SCORING (tier-gap awareness) ────────────────────────────────
    const TIER_SCORE_ENGINE = (t) => {
      if (!t) return 10;
      const patterns = [
        [/High\s*1-A/i, 140], [/1-A/i, 130], [/1-B/i, 120], [/1-C/i, 115],
        [/2-A/i, 110], [/2-B/i, 105], [/2-C/i, 100],
        [/3-A/i, 95],  [/3-B/i, 90],  [/3-C/i, 85],
        [/4-A/i, 80],  [/4-B/i, 75],  [/4-C/i, 70],
        [/5-A/i, 65],  [/5-B/i, 60],  [/5-C/i, 55],
        [/6-A/i, 50],  [/6-B/i, 45],  [/6-C/i, 40],
        [/7-A/i, 35],  [/7-B/i, 30],  [/7-C/i, 25],
        [/8-A/i, 20],  [/8-B/i, 16],  [/8-C/i, 13],
        [/9-A/i, 10],  [/9-B/i, 8],   [/9-C/i, 6],
      ];
      for (const [p, s] of patterns) if (p.test(t)) return s;
      const m = t.match(/(\d+)/);
      return m ? Math.max(1, 80 - parseInt(m[1]) * 5) : 10;
    };

    const scoreCharA = TIER_SCORE_ENGINE(charA?.tier);
    const scoreCharB = TIER_SCORE_ENGINE(charB?.tier);
    const tierGap = Math.abs(scoreCharA - scoreCharB);

    let tierGapDirective = '';
    if (matchMode === '1v1' && charA && charB) {
      if (!modifiers.statsEqualized && tierGap > 20) {
        const stronger = scoreCharA > scoreCharB ? charA : charB;
        const weaker = scoreCharA < scoreCharB ? charA : charB;
        tierGapDirective = `
### ⚡ ANÁLISIS DE BRECHA DE TIERS (TIER GAP ${tierGap} pts):
Existe una diferencia de tier significativa entre ${stronger?.name} (superior: ${stronger?.tier}) y ${weaker?.name} (inferior: ${weaker?.tier}).
El combate NO debe resolverse trivialmente. El luchador inferior tiene oportunidades reales:
1. Sus hax específicos (${(weaker?.haxTags || []).join(', ') || 'ninguno destacado'}) pueden afectar al rival independientemente del AP puro.
2. La velocidad, el Battle IQ y el conocimiento del terreno compensan parcialmente la desventaja.
3. El desgaste de stamina del rival más poderoso es un factor real si el combate se prolonga.
Asegúrate de que ${weaker?.name} tenga momentos de gloria genuinos y opciones tácticas reales antes del desenlace.
`;
      } else {
        tierGapDirective = `
### ⚡ ANÁLISIS DE BRECHA DE TIERS & LEY DE JERARQUÍA CANÓNICA:
- Contendiente A: ${charA.name} [Tier: ${charA.tier || 'Desconocido'}]
- Contendiente B: ${charB.name} [Tier: ${charB.tier || 'Desconocido'}]
`;
      }
    }

    const currentMode = modifiers.mode || 'MODO VS';
    let coreModeDirective = "";
    if (currentMode === 'MODO WHAT-IF') {
      coreModeDirective = `
### 🌌 DIRECTIVA SUPREMA: MODO WHAT-IF (MULTIVERSO LITERARIO & DIVERGENCIA HISTÓRICA)
- Enfoque prioritario: Narrativa dramática, peso emocional, diálogos profundos y coherencia psicológica.
- Explora cómo este enfrentamiento altera la línea temporal de ambos universos.
- Al final del veredicto, expande OBLIGATORIAMENTE el 'Efecto Mariposa & Consecuencias Multiversales' (reacción de deidades, cambios geopolíticos y destino de los aliados).
`;
    } else if (currentMode === 'MODO HÍBRIDO') {
      coreModeDirective = `
### ⚡ DIRECTIVA SUPREMA: MODO HÍBRIDO (EL PUNTO ÓPTIMO APEX: RIGOR + ESPECTÁCULO)
- Enfoque prioritario: La unión perfecta entre el Power Scaling riguroso (escala de Tiers, cálculo de AP, velocidades y Hax) y la prosa literaria de máxima adrenalina.
- Los contendientes demuestran su poder destructivo matemático a través de coreografías espectaculares y telemetría de desgaste anatómico en tiempo real.
`;
    } else {
      coreModeDirective = `
### ⚖️ DIRECTIVA SUPREMA: MODO VS (ANÁLISIS DE FEATS & RESOLUCIÓN CANÓNICA PURA)
- Enfoque prioritario: Resolución técnica objetiva basada estrictamente en hazañas comprobadas (feats) y consistencia dimensional.
- Cero conveniencias argumentales (plot armor). La victoria se define por diferencias de Joules, velocidad de reacción, stamina y compatibilidad de Hax.
`;
    }

    let engineRules = coreModeDirective + `
### 🪐 LEYES FUNDAMENTALES DE POWER SCALING (VS BATTLES STANDARD OBLIGATORIO):
1. **ATTACK POTENCY (AP) VS DESTRUCTIVE CAPACITY (DC):** La potencia destructiva no siempre escala con el área de efecto. Un personaje Multiversal o Planetario puede concentrar su AP en golpes físicos sin destruir su entorno. Respeta el AP por encima del daño colateral visible.
2. **ESCALADO DE VELOCIDADES:** Divide estrictamente la velocidad en 3 tipos: **Velocidad de Reacción** (esquivar), **Velocidad de Combate** (intercambios cuerpo a cuerpo) y **Velocidad de Desplazamiento** (moverse largas distancias). Diferencias extremas (ej. Relativista vs Inconmensurable) resultan en "Speed Blitzing" absoluto.
3. **INTELIGENCIA MARCIAL (BATTLE IQ) VS INTELECTO ACADÉMICO:** Prioriza cómo leen el combate, sus reflejos musculares y la predicción en batalla por encima del intelecto general.
4. **FILTRO ANTI-OUTLIERS Y PLOT-ARMOR:** Ignora inconsistencias canónicas provocadas por estupidez inducida por la trama (PIS). Haz que peleen en su máxima coherencia táctica.
5. **ECUALIZACIÓN DE ENERGÍAS (UNIVERSAL ENERGY SYSTEMS):** Ki, Chakra, Reiatsu, Haki y Magia interactúan en el mismo plano dimensional para barreras y anulaciones.
`;

    if (preset.includes('Mundo Vivo') || preset.includes('Grimdark')) {
      engineRules += `
### 🩸 REGLAS NARRATIVAS DE SIMULACIÓN "GRIMDARK / BRUTAL TOTAL":
1. **FÍSICA SENSORIAL Y ESTRAGOS BIOMECÁNICOS CRUDOS:** Los impactos tienen anatomía precisa. Menciona los tendones, astillas óseas (ej. vértebra C7, fémur), la hiper-tensión, el sangrado arterial y el gusto a óxido. 
2. **EFECTOS AMBIENTALES DE SINGULARIDAD:** El escenario sufre mutaciones físicas (escombros vitrificados, el oxígeno se quema en el vacío, el aire chirría por presión).
3. **DAÑO ACUMULATIVO Y STAMINA:** Los personajes merman. Detalla los microdesgarros musculares, la pérdida de ki o prana, y las contramedidas tácticas para sobrevivir.
4. **DIÁLOGOS EN COMBATE (ESTILO LITERARIO MASTER):** Utiliza guion largo (—) para las voces y cursivas para los pensamientos internos (*ej: "—No tienes escapatoria —dijo fríamente, sus nudillos goteando sangre."*).
5. **PROHIBIDOS CLICHÉS:** Usa descripciones adultas, directas y espectaculares. Prohibido: "el tiempo se detuvo", "se escuchó un sonido seco". Sé milimétricamente exacto.
6. **VEREDICTO GRIMDARK (OBLIGATORIO):** El desenlace debe reflejar la brutalidad del tono: no hay victorias "limpias"; incluso el ganador queda marcado (traumas permanentes, mutilaciones, cicatrices psicológicas, consecuencias irreversibles). El estado final detalla el coste humano real de la batalla, y los "ganadores" pagan un precio sangriento.
`;
    } else if (preset.includes('Torneo') || preset.includes('Budokai')) {
      engineRules += `
### 🏟️ REGLAS NARRATIVAS: MODO TORNEO ÉPICO CON COMENTARISTA
1. **ESTILO TORNEO SHŌNEN EXALTADO:** La batalla es un show brutal y espectacular. Las transformaciones provocan temblores en las gradas.
2. **COMENTARISTA EN VIVO Y PÚBLICO:** Usa un locutor con exclamaciones dinámicas ("—¡INCREÍBLE! ¡El cuadrilátero está cediendo!").
3. **CONCISO Y CINEMATOGRÁFICO:** Diálogos intensos (—) e intercambios marciales fluidos. 
4. **VEREDICTO HEROICO (OBLIGATORIO):** El desenlace debe honrar el espíritu de torneo: victoria gloriosa, respeto mutuo entre rivales, y exaltación del esfuerzo. El ganador avanza con orgullo y el perdedor cae con dignidad; la audiencia es parte del veredicto. Cierra exaltando el momento cumbre del combate.
`;
    } else if (preset.includes('VS Battles') || preset.includes('Técnico')) {
      engineRules += `
### 📊 MODO ANÁLISIS TÉCNICO (VS BATTLES STANDARD):
1. **RESOLUCIÓN ANALÍTICA PURA:** Concéntrate en la escala de Tiers, cálculo de Joules (AP), velocidades en Mach/c, e interacción directa de Hax.
2. **VEREDICTO BASADO EN FEATS:** Sin adornos dramáticos excesivos, justificación matemática y técnica de la victoria.
3. **VEREDICTO TÉCNICO (OBLIGATORIO):** El desenlace prioriza la exactitud del Power Scaling: cada golpe decisivo se justifica por AP, velocidad o hax, sin ambigüedad narrativa. El veredicto es la conclusión lógica del diferencial de poder, no un giro dramático.
`;
    } else {
      engineRules += `
### 🎬 REGLAS NARRATIVAS: CINEMATOGRÁFICO / TONO SEGÚN ESTILO DE AUTOR
1. **COREOGRAFÍA DE IMPACTO EXTREMO:** Narra los choques de energía y las artes marciales con peso, velocidad y descripciones espaciales dinámicas.
2. **DESGASTE Y SUPERACIÓN:** Muestra cómo las técnicas gastan Stamina. Los diálogos deben usar (—) y reflejar la personalidad canónica del guerrero al límite.
3. **CLÍMAX SEGÚN EL ESTILO DE AUTOR:** Colisiona los ataques definitivos con lujo de detalle (densidad del ki, el color del fuego, la distorsión del aire) respetando el ESTILO LITERARIO de autor seleccionado.
4. **VEREDICTO COHERENTE CON EL TONO (OBLIGATORIO):** El desenlace honra el ESTILO LITERARIO elegido (heroico en Shōnen, opresivo en Cosmic/Survival Horror, solemne en Épica Homérica, sobrio en Noir, frenético en Blockbuster). El estado final equilibra el coste físico con la resolución del conflicto.
`;
    }

    engineRules += `
### 🧬 REGLA DE ORO 1: PASIVAS DE BOSS Y HAX CONTEXTUALES POR ESPECIE / LINAJE (ANTI-MUTACIONES GENÉRICAS)
Queda estrictamente prohibido asignar habilidades biológicas o mutaciones fuera de la naturaleza canónica del personaje:
- **Saiyajin / Híbridos Saiyan:** Sus pasivas son **Zenkai Reactivo, Voluntad Inquebrantable, Adaptación Marcial y Orgullo de Guerrero**. **PROHIBIDO TOTALMENTE cualquier tipo de "asimilación genética biológica", mutación celular o absorción digestiva de Ki ajeno**. Los Saiyans superan al enemigo elevando su propio Ki interior, rompiendo sus límites físicos o recolectando energía ambiental con la Genkidama/Espada de la Esperanza mediante técnica marcial espiritual, NUNCA mutando su ADN como si fueran monstruos.
- **Bio-Androides / Majin / Parásitos (Cell, Majin Buu, Moro, Baby):** ÚNICOS combatientes autorizados para **Absorción Celular / Genética, Asimilación de ADN, Regeneración Extrema Atómica y Mimetismo Biológico**.
- **Demonios / No-Muertos / Maldiciones (Muzan, Akaza, DIO, Sukuna, Mahito):** Regeneración Celular Maldita, Consumo de Sangre y Manipulación de Carne / Dominios.
- **Deidades / Ángeles / Hakaishin (Beerus, Whis, Zeno, Thor, Zeus):** Aura Divina Trascendental, Borrado Conceptual (Hakai), Juicio Cósmico e Inmunidad a Daño Convencional Mortal.
- **Artistas Marciales Puros / Humanos de Élite (Baki, Yujiro, Shibukawa, Garou, Batman):** Precognición Biomecánica (Lectura de Intención Sináptica), Golpes Quirúrgicos a Puntos de Presión (Ventrículo, Nervio Vago, Fémur) y Redirección Aiki.
- **Diablos / Cazadores (Chainsaw Man - Makima, Gun Devil, Pochita, Kishibe):** Préstamo de Miedo Colectivo, Contratos de Sacrificio y Autoridad Jerárquica Infernal.

### 📈 REGLA DE ORO 2: PROGRESIÓN ESTRICTA Y OBLIGATORIA DEL ÁRBOL DE TRANSFORMACIONES ('forms')
- La IA DEBE escalar cronológica y lógicamente a través de las transformaciones oficiales y canónicas registradas en la ficha del personaje ('forms') (ejemplo: Base ➔ SSJ1 ➔ SSJ2 ➔ SSJ3, Forma 1 ➔ Forma Final ➔ 100%).
- **PROHIBIDO TOTAL Y ABSOLUTAMENTE inventar multiplicadores no canónicos o suicidas como 'Kaiō-ken x10 sobre SSJ2 o SSJ3'**, INCLUSO SI SE ACTIVA UN CISNE NEGRO / BLACK SWAN / ORÁCULO. El Kaiō-ken solo se utiliza en sus estados canónicos permitidos (Base en DBZ, o SSB en DBS si la ficha lo contempla).
- **GESTIÓN DE ESCALADO POR DEMANDA (STAMINA INTELIGENTE — OBLIGATORIO):** La IA debe elegir el estado de transformación ADECUADO a la amenaza real. No despilfarres el estado máximo (ej. SSJ4 Full Power) contra oponentes triviales, PERO TAMPOCO te auto-flageles con trucos de bajo nivel (SSJ3 + Kaio-ken combinado) cuando el personaje tiene formas superiores eficientes disponibles en su árbol. Si el personaje posee un árbol completo (Base ➔ SSJ1 ➔ SSJ2 ➔ SSJ3 ➔ SSJ4 ➔ SSJ4 Full Power), escala de forma PROGRESIVA y usa el estado superior cuando la demanda del rival lo exige. Queda PROHIBIDO quemar la stamina vital con técnicas de sacrificio o multiplicadores inventados que el árbol de formas ('forms') de la ficha no contempla, especialmente en la Fase 3 donde el desgaste ya es crítico.

#### 📊 TABLA DE INCOMPATIBILIDADES CANÓNICAS DE KAIŌ-KEN (CONSTANTE BIOLÓGICA — NO ANULABLE POR ORÁCULO)
| Era | Forma activa | Kaiō-ken permitido | Motivo |
|---|---|---|---|
| Dragon Ball Z | Base / Normal | ✅ SÍ (x2 a x20) | Forma canónica de uso |
| Dragon Ball Z | SSJ1 | ❌ NO JAMÁS | Biológicamente incompatible — destruye el cuerpo Saiyan |
| Dragon Ball Z | SSJ2 | ❌ NO JAMÁS | Incompatible — destruye al usuario |
| Dragon Ball Z | SSJ3 | ❌ NO JAMÁS | Imposible fisiológicamente en era DBZ |
| Dragon Ball Super | Base / Normal | ✅ SÍ | Igual que en Z |
| Dragon Ball Super | SSGSS / SSB | ✅ SÍ (con control Ki) | Único caso excepcional canónico (Goku vs Hit, Torneo del Poder) |
| Dragon Ball Super | SSJ1-3 | ❌ NO | No tiene sentido — usa SSB directamente |

- **El Cisne Negro / Evento Oráculo NO puede saltarse esta tabla.** Es una constante biológica de los Saiyans, no una regla narrativa anulable.
- Si el escenario pide Kaiō-ken sobre SSJ en era DBZ, la IA debe IGNORARLO, CORREGIRLO y notificarlo en el veredicto como error canónico.

### 🚫 REGLA DE ORO 3: AISLAMIENTO ABSOLUTO DE TELEMETRÍA RPG (PROSA PURA Y DRAMÁTICA)
- **QUEDA TAXATIVAMENTE PROHIBIDO** incluir números o porcentajes de videojuego ('HP: +15%', 'Stamina: 20%', etc.) dentro de los diálogos, pensamientos internos ('🧠 Pensamiento Interno') o descripciones literarias en prosa de la novela.
- Los pensamientos internos deben reflejar **sensaciones físicas, análisis táctico visceral y psicología marcial** (*ejemplo: "—Mi pulmón derecho está colapsando; no podré sostener este ritmo de respiración más de diez segundos"*), NUNCA variables numéricas o porcentajes de RPG.
- Toda la información cuantitativa se reserva de manera exclusiva para los bloques de telemetría de fin de fase '||BIOMETRICS|...||' y la sección de Veredicto Final.

### 📜 REGLA DE ORO 4: RIGOR ABSOLUTO DE TÉCNICAS Y LORE (CERO TRANSFERENCIAS ILEGALES DE HAX)
- **Shunkan Idō (Teletransportación de Yardrat):**
  * **Son Goku:** ÚNICAMENTE a partir de su regreso de Yardrat (Saga de los Androides en adelante: Androides, Cell, Buu, GT, Super, Daima). Goku pre-Yardrat (Saga Saiyajin, Saga Namek) NO conoce la técnica.
  * **Vegeta:** ÚNICAMENTE a partir de su entrenamiento en Yardrat en la **Saga de Moro (Manga DBS)** y sagas posteriores (Granolah, Super Hero, Ultra Ego). En Z o antes de Moro, Vegeta NO la conoce.
  * **Cell:** ÚNICAMENTE en su forma **Super Perfecto (Super Perfect Cell)** tras asimilar la técnica en el planeta de Kaio-sama.
  * **Yadrats (Jimizu, Pybara):** Usuarios nativos.
- **Kai Kai (Teletransportación Divina Suprema):**
  * Exclusivo de **Kaio-shins, Shins, Kibito, Kibitoshin y deidades del Reino Sagrado**. Viajan instantáneamente a cualquier dimensión o planeta sin necesidad de fijar o rastrear firmas de Ki.
- **PROHIBICIÓN TOTAL de Teletransportación para el resto:** Piccolo, Gohan, Trunks del Futuro, Krilin, Freezer, etc., NO conocen la teletransportación; usan Bukūjutsu, Zanzōken o velocidad pura.
- **Cero Anacronismos / Spoilers de Futuras Sagas:** Un personaje perteneciente a una era (ejemplo: Goku Saga Buu / DBZ) **NO conoce técnicas, dioses ni conceptos de sagas futuras** (como Ultra Instinto, Ultra Ego, Bills, Whis o Hakaishin). Prohibido mencionar o anticipar el Ultra Instinto en combates de DBZ.
- **Fisiología de Regeneración Universal (Para TODO el Multiverso):**
  * Cualquier combatiente de cualquier franquicia (Saiyans, Humanos, Viltrumitas, Kriptonianos, Espadachines, etc.) que **NO posea explícitamente el tag o biología de regeneración celular**, si sufre la fractura, aplastamiento o amputación de un miembro, **queda incapacitado y sufre la lesión durante todo el combate**.
  * ÚNICAMENTE combatientes con biología regenerativa canónica (Namekianos como Piccolo, Majins como Buu, Bio-Androides como Cell, Demonios de Kimetsu como Akaza/Muzan, Maldiciones como Sukuna/Mahito, Deadpool, Wolverine, Hulk, Doomsday) pueden regenerar tejidos o miembros perdidos en pleno asalto.
  * El **Zenkai Saiyan** es un incremento de poder tras sobrevivir y sanar, NUNCA una regeneración mágica instantánea que hace crecer brazos durante un asalto.
- **CONTRIBUYENTES A LA GENKIDAMA (Regla de Lore Estricta):**
  * Solo pueden contribuir energía a la Genkidama los **actores individuales libres, conscientes y NO fusionados** que estén presentes en el campo de batalla o en el planeta.
  * **PROHIBIDO** que un combatiente fusionado (Gogeta, Vegetto, Gotenks) contribuya energía de forma separada de la entidad fusionada.
  * **PROHIBIDO** que un absorbido (Piccolo-dentro-de-Buu, Androide-17-dentro-de-Cell) contribuya energía independiente.
  * Los contribuyentes deben ser individuos operativos: no incapacitados, no muertos, no en otra dimensión.

### 📝 REGLA DE ORO 5: FORMATO LIMPIO DEL VEREDICTO Y ESTADO FINAL
- La etiqueta '🧠 Pensamiento Interno:' se utiliza **únicamente para monólogos mentales breves de los personajes en mitad del combate**.
- **PROHIBIDO** usar '🧠 Pensamiento Interno:' dentro de la sección de ESTADO FINAL DE LOS COMBATIENTES o VEREDICTO DEFINITIVO. El Estado Final debe usar listas claras con viñetas markdown (- Nombre: Daño anatómico, porcentaje HP, estado vital).

### 🏃 REGLA DE ORO 6: COHERENCIA DE RESULTADO, ESTADO VITAL Y RETIRADA (NO DECLARAR 0% HP SI ESCAPA O SIGUE CONSCIENTE)
- Si un combatiente o Raid Boss sobrevive, escapa mediante teletransportación/nave espacial, o queda con vida en estado crítico: **QUEDA ESTRICTAMENTE PROHIBIDO DECLARARLO A 0% HP**.
- Si escapa consciente: HP: 4–10%, Stamina: 0–5%, Estado Vital: alive-critical / consciente, Resultado de Misión: Victoria de la Escuadra por Retirada del Objetivo.
- El valor 0% HP se reserva ÚNICAMENTE para muerte biológica confirmada, desintegración total, borrado conceptual o K.O. médico irreversible en el suelo.

### 🩸 REGLA DE ORO 7: DAÑO ANATÓMICO FUNCIONAL Y PERSISTENTE (CONSECUENCIAS MECÁNICAS REALES)
- Las lesiones biomecánicas declaradas en el texto NO son cosméticas:
  * **Costillas / Esternón fracturados:** -25% velocidad de recuperación de Stamina y dolor punzante en cada golpe.
  * **Fémur / Pierna dañada:** Pérdida inmediata de desplazamiento y juego de pies; prohibidas las fintas acrobáticas sin compensación de Ki/vuelo.
  * **Brazo inutilizado / Nervio cortado:** El personaje debe luchar con guardia a una sola mano, perdiendo el 50% de sus opciones de bloqueo físico.
  * **Trauma Craneal / Conmoción:** Pérdida de percepción y lectura de fintas (Battle IQ reducido temporalmente).

### 🌿 REGLA DE ORO 8: GESTIÓN ESTRICTA DE ÍTEMS Y SEMILLAS SENZU (INVENTARIO Y VENTANA DE USO)
- **Inventario Finito:** Las Semillas Senzu o ítems curativos deben declararse con stock exacto (ej. Senzu: [1/1] ➔ Consumida en Fase 3 ➔ Restantes: [0/1]).
- **Ventana de Activación:** Ingerir un objeto requiere un micro-segundo de cobertura táctica. Si el rival está a quemarropa con iniciativa superior, puede interceptar o destruir el ítem.
- **Límites Biológicos:** Las Senzu restauran HP, Stamina y heridas físicas cerrando tejido, pero NO regeneran cabezas decapitadas, desintegración celular ni curan sellos de alma/hax conceptuales.

### 🟣 REGLA DE ORO 9: VEREDICTO DETERMINISTA SOBRE APEX-KI (ÚNICA FUENTE DE VERDAD)
- El vencedor se determina AL 100% por el **APEX-Ki púrpura canónico** declarado en la cabecera de parámetros (baseKiNumeric/APEX-Ki + multiplicadores de forma + jerarquía de Tier). Es la ÚNICA métrica de poder aceptada para la causalidad del desenlace.
- **PROHIBIDO** citar lecturas de "scouter verde" o valores verdes como factor decisivo: el scouter fue extirpado del motor. Si en la narrativa aparece un scouter, es solo color dramático del personaje (ej. Freezer consultando un número), pero NUNCA determina el ganador.
- **Si el APEX-Ki de A supera al de B**, A DEBE ganar salvo que exista una ventaja táctica/hax canónica documentada en las fichas (Battle IQ superior con diferencia de poder menor al 10%, hax específico con contraefecto canónico, desgaste acumulado narrativo). Cualquier excepción DEBE justificarse con argumento técnico de la ficha, nunca por "sorpresa sin motivo".
- La **CAUSALIDAD DEL DESENLACE** debe anclarse explícitamente a los valores APEX-Ki (ej. "con un APEX-Ki de 82 millones frente a 50 millones y el multiplicador x50 de SSJ, la brecha de poder selló el desenlace") y al desgaste biométrico narrado.

### ⚡ REGLA DE ORO 10: DILATACIÓN TEMPORAL MFTL Y FILTRO ANTI-CLICHÉS
- **Tiempo Subjetivo MFTL+:** Para personajes con velocidad Relativista, FTL o Masivamente FTL+, **PROHIBIDO medir los intercambios en 'milisegundos' o 'segundos' terrestres**. Narra la velocidad en función de marcos subjetivos (*"en una fracción de lapso sináptico", "en el tiempo que tarda un haz de luz en recorrer un milímetro", "a través de un vector cinético instantáneo"*).
- **Prohibición de Clichés Repetitivos:** Evita fórmulas recicladas como *"el tiempo pareció detenerse"*, *"un silencio sepulcral se apoderó del campo"*, *"su pulmón colapsó"* o *"choque gravitacional absoluto"*. Usa variedad descriptiva, coreografía marcial y física sensorial pura.

### 🌍 REGLA DE ORO 11: FÍSICA AMBIENTAL Y CÁLCULO SÍSMICO/CIVIL COHERENTE
- **Consistencia Geométrica:** Si el radio de destrucción es R, el área afectada es proporcional a pi*R^2 (un radio de 300 km genera un área de impacto de ~282,700 km²).
- **Bajas Civiles y Terremotos:** Si un ataque fractura la corteza planetaria con magnitud sísmica extrema (>8.0 Richter o tsunamis), las bajas o el colapso ambiental DEBEN ser proporcionales a la población (prohibido declarar '0 bajas civiles' en un cataclismo global a menos que el escenario sea un páramo deshabitado, dimensión de bolsillo o planeta desierto).

### 🚫 REGLA DE ORO 12: PROHIBICIÓN TOTAL DE HAX Y TÉCNICAS NO PRESENTES EN LA FICHA (CERO HAKAI O HAX INVENTADO)
- Queda **ESTRICTAMENTE PROHIBIDO** que un combatiente utilice técnicas divinas, hax o ataques supremos (ej. **Hakai, Expansión de Dominio, Ultra Instinto, Rasenshuriken, Getsuga, Mafuba, Borrado Conceptual**) que NO estén explícitamente listados en su arsenal o haxTags.
- Si el personaje no posee la técnica en su ficha de combatiente, la IA NO puede inventársela bajo ninguna circunstancia. Por ejemplo, en Dragon Ball Z/Super Resurrección de 'F', ni Gohan, ni Piccolo, ni Freezer, ni Krilin, ni Yamcha conocen el **Hakai**.

### 📑 REGLA DE ORO 13: DELIMITACIÓN LIMPIA DE FASES Y NO DUPLICACIÓN
- Cada fase debe comenzar ÚNICAMENTE con su título de nivel 3 (ej. '### FASE 1: TANTEO CINÉTICO').
- **PROHIBIDO** imprimir listas previas de índices ('Fase 1 Fase 2 Fase 3') antes del desarrollo real de las fases.
- La telemetría de vida de cada combatiente debe reflejarse con exactitud en el bloque final '||BIOMETRICS|...||' y en el bloque 'ESTADO BIOMÉTRICO FINAL DETALLADO POR BANDOS'.

### ⏳ REGLA DE ORO 14: REALISMO TEMPORAL ESTRICTO Y CERO ANACRONISMOS (PROHIBIDO EL METAGAMING Y SPOILERS FUTUROS)
- **Anclaje Temporal Inquebrantable:** Cada personaje está estrictamente restringido al conocimiento, experiencias, técnicas y relaciones de la **era, saga o momento cronológico de su ficha**:
  * Un personaje de una era temprana (ej. Goku en Namek o Vegeta en Saga Saiyajin) **NO CONOCE eventos, villanos, dioses ni conceptos de sagas futuras** (prohibido que mencionen a Bills, Whis, Zeno-sama, Multiverso, Super Saiyan Blue, Ultra Instinto, Cell, Majin Buu o fusiones si no habían ocurrido en su momento).
  * En Dragon Ball Super 'Resurrección de F', Gohan y Piccolo **NO conocen el Torneo del Poder, ni a Jiren, ni a Moro, ni a Granolah, ni la forma Beast, ni el Ultra Ego**.
  * En Jujutsu Kaisen / Naruto / Bleach / One Piece / Hunter x Hunter / etc., un personaje antes de un arco concreto **NO puede saber técnicas secretas que aprendió arcos después** (ej. Megumi pre-Shibuya no domina a Mahoraga como recurso casual; Kakashi pre-Shippuden no usa Kamui de forma libre; Luffy pre-Timeskip no conoce el Haki de armadura consciente).
- **Prohibido el Metagaming en Diálogos y Pensamientos:**
  * Los combatientes NO son omniscientes. No pueden predecir ni nombrar las habilidades o debilidades de rivales desconocidos o de otros universos a menos que las deduzcan en pleno asalto mediante observación y su Battle IQ.
  * Los diálogos deben sonar fieles a la mentalidad y personalidad del personaje en esa época concreta.

### 🛡️ REGLA DE ORO 15: LEY CANÓNICA ESTRICTA DE INTERVENCIONES, 3ER CONTENDIENTE, ASALTOS Y GIROS
- **PROHIBIDO TERMINANTEMENTE INVENTAR PERSONAJES GENÉRICOS O NOMBRES FICTICIOS:**
  * Queda estrictamente prohibido usar descripciones anónimas ("un villano metálico", "una sombra mística", "un ser oscuro") o nombres inventados por la IA (ej. "Azrath Malek", "Lord Xyros", etc.).
- **OBLIGATORIEDAD DE PERSONAJES CANÓNICOS REALES O DEL ROSTER APEX:**
  * Si la premisa, giro o modificador indica la aparición de un **3er Contendiente, Aliado Sorpresa, Dúo de Asalto o Boss**:
    1. **Debe ser un personaje CANÓNICO REAL y oficial** del universo de los contendientes (o un combatiente oficial del Roster APEX que encaje temáticamente y por escala de poder).
    2. **Debe nombrarse explícitamente desde su primer milisegundo de aparición** con su nombre propio real y forma exacta (ej. *"Metal Cooler (Cuerpo de Metal Puro / Estrella Big Gete)"*, *"Broly (Super Saiyan Legendario)"*, *"Bills (Dios de la Destrucción)"*, *"Ryomen Sukuna (20 Dedos)"*, *"Thanos (Guantelete del Infinito)"*, *"Doomsday (Criptoniano)"*, *"Toji Fushiguro"*, *"Goku Black & Zamasu"*).
    3. **Respeto Absoluto a su Escala y Arsenal:** Sus técnicas, multiplicadores, pasivas, hax y nivel de Tier deben corresponder fielmente a su ficha canónica o perfil APEX.

### 🔒 REGLA DE ORO 16: AISLAMIENTO ABSOLUTO DE COMBATIENTES FUSIONADOS
**Una fusión ELIMINA a sus componentes del espacio de combate individual.**
- En el momento en que **Goku y Vegeta** completan la Danza de la Fusión o se colocan los Pendientes Potara, **Goku y Vegeta DEJAN DE EXISTIR COMO ACTORES INDIVIDUALES** hasta la desfusión.
- **PROHIBIDO TERMINANTEMENTE** que los componentes de una fusión:
  1. Aparezcan en listas de acción como actores independientes.
  2. Contribuyan energía por separado a la Genkidama simultáneamente a la entidad fusionada.
  3. Aporten apoyo táctico como figuras separadas (ej.: "Goku apoya mientras Gogeta ataca" — ILEGAL).
  4. Sean mencionados en biometría individual mientras la fusión está activa.
- ✅ **Solo la entidad fusionada (Gogeta, Vegetto, Gotenks, Kefla)** actúa, tiene biometría y toma decisiones.
- ✅ Tras la desfusión, los componentes reaparecen en el estado físico en que estaban al fusionarse (agotados, heridos, etc.).
- **APLICA A:** Metamoru (30min), Potara (1h en DBZ; permanente para Kaio-Shin), fusiones What-If canónicas.

### 🌑 REGLA DE ORO 17: ENTIDADES ABSORBIDAS (ABSORCIÓN BUU / BIO-ANDROIDE)
**Un personaje absorbido por Majin Buu queda como conciencia atrapada, NO como actor.**
- Cuando Majin Buu absorbe a Piccolo, Gotenks, Gohan o cualquier combatiente:
  1. El absorbido **NO puede disparar técnicas propias** durante la absorción.
  2. El absorbido **NO puede actuar físicamente** ni desplazarse de forma autónoma.
  3. El absorbido **SOLO existe como voz interna / conciencia residual** dentro de Buu.
  4. Majin Buu **hereda las habilidades del absorbido** (ejemplo: Buucolo tiene antenas y mayor inteligencia táctica; Buutenks tiene las esferas y los ataques de Gotenks).
  5. El absorbido **NO tiene biometría individual** — sus estadísticas están fusionadas en las de Buu.
- **APLICA TAMBIÉN A:** Cell absorbiendo a Androides 17/18 (los Androides desaparecen como actores independientes).
- ✅ Liberación: cuando Goku/Vegeta extraen a los absorbidos, estos reaparecen con su estado físico propio.

### 🎭 REGLA DE ORO 18: PROHIBICIÓN DE META-COMENTARIOS, DUDAS Y RETRACTACIONES EN LA PROSA
- **PROHIBIDO TERMINANTEMENTE** que el narrador o los personajes incluyan correcciones en caliente, dudas, titubeos o meta-referencias a las reglas en el texto literario (por ejemplo: JAMÁS escribas "—esperad, están fusionados en Gogeta según la Regla 16...", ni "—no, Piccolo no tiene Shunkan Idō...", ni "recordemos que la regla prohíbe...").
- **Ejecución Silenciosa y Canónica:** Las restricciones canónicas y las reglas de oro deben aplicarse de forma 100% LIMPIA, natural y directa desde la primera palabra de cada escena. Si un personaje no tiene una técnica, jamás se menciona que intentó usarla; si hay una fusión, solo se narra a la fusión sin vacilar.

`;

    const formatSpeed = (spd) => {
      if (typeof spd === 'object' && spd !== null) {
        return `Combate: ${spd.combat} | Reacción: ${spd.reaction} | Desplazamiento: ${spd.travel} | Ataque: ${spd.attack}`;
      }
      return spd || 'Desconocida';
    };

    const formatStrength = (str) => {
      if (typeof str === 'object' && str !== null) {
        return `Impacto: ${str.striking} | Levantamiento: ${str.lifting}`;
      }
      return str || 'Desconocida';
    };

    const formatForms = (forms) => {
      if (!forms || forms.length === 0) return 'Ninguna';
      return forms.map(f => `${f.name} (${f.stats})`).join(' || ');
    };

    const formatArsenal = (char) => {
      if (!char.arsenal) return 'Arsenal estándar.';
      const superAttacks = char.arsenal.superAttacks?.map(s => `• ${s.name}: ${s.desc} [Coste: ${s.cost || 'N/A'}]`).join('\n') || 'Ninguno';
      const ultimateAttacks = char.arsenal.ultimateAttacks?.map(u => `★ ULTIMATE: ${u.name}: ${u.desc} [Coste: ${u.cost || 'N/A'}]`).join('\n') || 'Ninguno';
      const passives = char.arsenal.passives?.map(p => `✦ PASIVA: ${p.name}: ${p.desc}`).join('\n') || 'Ninguna';
      const actives = char.arsenal.actives?.map(a => `⚡ ACTIVA: ${a.name}: ${a.desc}`).join('\n') || 'Ninguna';

      return `
- Ataques Básicos: ${char.arsenal.basicAttacks || 'Golpes cuerpo a cuerpo y ráfagas estándar'}
- Súper Ataques:
${superAttacks}
- Ataques Definitivos (Ultimates / Finishers):
${ultimateAttacks}
- Habilidades Pasivas (Efecto Continuo):
${passives}
- Habilidades Activas / Buffs:
${actives}`;
    };

    const formatScenarioPhysics = (scen) => {
      let details = `- Nombre: ${scen.name} (${scen.universe || 'Universo Neutro'})\n- Descripción Sensorial: ${scen.sensory || 'Entorno de combate estándar.'}`;
      if (scen.gravity) details += `\n- Gravedad de la Arena: ${scen.gravity}`;
      if (scen.temperature || scen.climate) details += `\n- Temperatura/Clima: ${scen.temperature || scen.climate}`;
      if (scen.terrainEffect || scen.hazard) details += `\n- Peligros del Terreno: ${scen.terrainEffect || scen.hazard}`;
      return details;
    };

    const formatFullChar = (char, label) => {
      if (!char) return '';
      const activeFormIdx = char._activeFormIndex ?? 0;
      const activeFormId = char._activeFormId || char.forms?.[activeFormIdx]?.id || 'base';
      const combatState = resolveCombatState(char, activeFormId);
      const activeForm = char.forms?.find(f => f.id === activeFormId) || char.forms?.[activeFormIdx];
      const limitIdx = char._formLimitIndex;
      
      let activeFormLine = activeForm 
        ? `- Forma Activa Inicial: **${activeForm.name}** [Tier: ${combatState.tierExact || char.tier}] — ${typeof activeForm.stats === 'string' ? activeForm.stats : JSON.stringify(activeForm.stats || '')}`
        : `- Forma Activa Inicial: **Estado Base** [Tier: ${combatState.tierExact || char.tier}]`;
      
      if (limitIdx !== undefined && limitIdx !== null && char.forms) {
        activeFormLine += `\n- ⚠️ **RESTRICCIÓN DE TRANSFORMACIÓN (LÍMITE MÁXIMO)**: En esta simulación, ${char.name} NO TIENE PERMITIDO evolucionar ni usar ninguna transformación por encima de **"${char.forms[limitIdx]?.name || 'Límite fijado'}"**. Esta es su forma máxima para este combate por reglas del usuario.`;
      }
      
      const featsList = Array.isArray(char.feats)
        ? char.feats.map(f => typeof f === 'object' ? (f.desc || f.name || JSON.stringify(f)) : String(f)).join(' || ')
        : (char.feats || 'Sin hazañas documentadas.');
      
      const apexKiDisplay = combatState.apexKiDisplay || 'Calculado por motor';
      const scouterDisplay = combatState.sourceKiDisplay ? ` | Scouter Oficial DB: **${combatState.sourceKiDisplay}**` : '';
      const formMultDisplay = combatState.formMultiplier > 1 ? ` | Multiplicador de Forma: **${combatState.formMultiplier}x**` : '';

      return `
**[${label}] ${char.name}** (${char.universe || 'Universo Desconocido'})
- Nivel (Tier): ${combatState.tierExact || char.tier || 'Desconocido'}
- Nivel de Combate (APEX-Ki): **${apexKiDisplay}**${scouterDisplay}${formMultDisplay}
${activeFormLine}
- Attack Potency (AP): ${char.ap || 'No especificado'}
- Velocidad: ${formatSpeed(char.speed || char.speedCombate)}
- Fuerza Física (Striking & Lifting): ${formatStrength(char.strength)}
- Durabilidad y Blindaje: ${char.durability || 'Estándar'}
- Stamina / Reservas: ${char.stamina || 'Estándar'}
- Battle IQ / Táctica Marcial: ${char.battleIQ || 'Estándar'}
- Psicología del Personaje: ${char.psychology || 'Sin datos adicionales.'}
- HaxTags (Habilidades Especiales Conceptuales): ${(char.haxTags || []).join(' | ') || 'Ninguno registrado'}
- Hazañas Canónicas Comprobadas (Feats): ${featsList}
- Debilidades Explotables Conocidas: ${char.weaknesses || 'Sin debilidades conocidas.'}
- Transformaciones Corporales Disponibles: ${formatForms(getBodilyForms(char))}${(() => {
  if (char.id === 'dr-raichi-dbm-u3' || char.narrativeCombatProfile?.externalEntityController) {
    const opp = label.includes('A') ? charB : charA;
    const extContext = selectContextualExternalEntity(char, opp, {
      battleMode: matchMode,
      teamSize: (teamA?.length || 1) + (teamB?.length || 1),
      orbStatus: modifiers.orbStatus || 'intact'
    });
    const canonical = char.narrativeCombatProfile?.canonicalGhostArchive || [];
    const canonicalList = canonical.map(g => `${g.displayName} [${g.combatRole}]`).join(', ');
    return `\n- 🛡️ ENTIDADES EXTERNAS & ARCHIVO FANTASMA (bodyStatIsolation: STRICT):
  * Controlador: ${char.narrativeCombatProfile?.externalEntityController?.coreArtifact || 'Núcleo Psiónico'}
  * Estado de Despliegue Contextual: **${extContext?.summonState || 'scouting'}** (Resonancia: **${extContext?.resonanceLevel || 'low'}** — ${extContext?.resonanceCategory || 'estándar'})
  * Directiva Táctica: ${extContext?.recommendedAction || 'Despliegue estándar'}
  * Candidatos Canónicos DBM: ${canonicalList || 'Ninguno'}
  * Counterplay Visible: ${extContext?.counterplayVisible || 'Ataque al núcleo orbe'}
  * LEY CONSTITUCIONAL: Las entidades externas NO multiplican ni alteran el Ki corporal (24,518), Tier (7-A) ni durabilidad física de Dr. Raichi.
  * MODO NORMAL APEX: Broly LSSJ Fantasma es estrictamente legacy_reference_only y Hatchiyack permanece inactivo.
  * MODO ORÁCULO (solo bajo giro de escenario explícito): Broly / Hatchiyack se manifiestan como [ORÁCULO — ENTIDAD TEMPORAL] con bodyStatIsolation: true, combate individual y sin sumar estadísticas al cuerpo de Raichi.`;
  }
  return '';
})()}
- Arsenal y Habilidades Completas:
${formatArsenal(char)}`;
    };

    // Format Combatants depending on mode
    let combatantsSection = "";
    if (matchMode === 'teams') {
      const teamsToUse = (multiTeams && multiTeams.length >= 2) ? multiTeams : [
        { id: 'alfa', name: 'Equipo Alfa', color: 'red', members: teamA || [] },
        { id: 'beta', name: 'Equipo Beta', color: 'blue', members: teamB || [] }
      ];

      const teamsBlocks = teamsToUse.map((tm, tIdx) => {
        const syn = calculateSquadSynergy(tm.members || []);
        const membersText = (tm.members || []).map((c, i) => formatFullChar(c, `${tm.name.toUpperCase()}-${i + 1}`)).join('\n');

        return `--- ${tm.name.toUpperCase()} (Cohesión: ${syn.cohesion}% - ${syn.synergyTier}) ---
- BUFFS DE FACCIÓN ACTIVOS: ${syn.buffs.map(b => `${b.icon} ${b.name}: ${b.desc}`).join(' | ') || 'Estándar'}
- ATAQUES COMBINADOS DISPONIBLES: ${syn.combos.map(c => `${c.name} (${c.pair}): ${c.desc}`).join(' | ') || 'Ataques coordinados'}
${membersText}`;
      }).join('\n\n');

      combatantsSection = `
### III. FICHAS DE COMBATE POR EQUIPOS (${teamsToUse.length} FACCIONES EN GUERRA TOTAL)
${teamsBlocks}
`;
    } else if (matchMode === '1vN') {
      const bossMult = modifiers.bossMultiplier || 1.35;
      const bossTierInfo = RAID_BOSS_TIERS.find(t => t.multiplier === bossMult) || RAID_BOSS_TIERS[1];
      const squadSynergy = calculateSquadSynergy(teamB);
      const hasBossMinions = bossMinions && bossMinions.length > 0;
      const bossFactionSynergy = hasBossMinions ? calculateSquadSynergy([charA, ...bossMinions]) : null;

      const squadText = teamB.map((c, i) => formatFullChar(c, `ASALTANTE-${i + 1}`)).join('\n');
      const bossMinionsText = hasBossMinions ? bossMinions.map((m, i) => formatFullChar(m, `SUB-JEFE / ESBIRRO DEL BOSS ${i + 1}`)).join('\n') : '';
      const bossFullText = formatFullChar(charA, 'JEFE TITÁN SUPREMO');

      combatantsSection = `
### III. FICHAS DE COMBATE (BOSS RAID ASIMÉTRICO${hasBossMinions ? ` CON ${bossMinions.length} SUB-JEFES ALIADOS` : ''})
--- JEFE SUPREMO & DOMINIO (ESCALADO RAID: ${bossTierInfo.label} - ${bossTierInfo.badge}) ---
- MULTIPLICADOR DE AMENAZA BOSS RAID: ${bossMult}x (${bossTierInfo.desc} con ${bossTierInfo.aura})
- EFECTO ESPECIAL DE RAID: Durabilidad, HP y Attack Potency multiplicados por ${bossMult}x. Resistencia a aturdimiento masivo y capacidad para castigar a toda la escuadra simultáneamente con ataques de área.
${bossFullText}
${hasBossMinions ? `
- SINERGIA DE LA FACCIÓN DEL BOSS: Cohesión ${bossFactionSynergy.cohesion}% (${bossFactionSynergy.synergyTier})
- BUFFS DEL DOMINIO DEL BOSS: ${bossFactionSynergy.buffs.map(b => `${b.icon} ${b.name}`).join(' | ') || 'Aura del Titán'}
- ATAQUES COMBINADOS CON EL BOSS: ${bossFactionSynergy.combos.map(c => `${c.name} (${c.pair})`).join(' | ') || 'Fuego de asedio'}
- SUB-JEFES / ESBIRROS DE APOYO (${bossMinions.length}):
${bossMinionsText}` : ''}

--- ESCUADRA ASALTANTE DE ${teamB.length} LUCHADORES ---
- COHESIÓN TÁCTICA DE LA ESCUADRA: ${squadSynergy.cohesion}% (${squadSynergy.synergyTier})
- BUFFS DE EQUIPO ACTIVOS: ${squadSynergy.buffs.map(b => `${b.icon} ${b.name}: ${b.desc}`).join(' | ') || 'Sin buffs pasivos adicionales'}
- ATAQUES COMBINADOS DISPONIBLES: ${squadSynergy.combos.map(c => `${c.name} (${c.pair}): ${c.desc}`).join(' | ') || 'Asalto coordinado'}
${squadText}
`;
    } else if (matchMode === 'battle_royale') {
      const royaleText = battleRoyale.map((c, i) => formatFullChar(c, `GLADIADOR ${i + 1}`)).join('\n');

      combatantsSection = `
### III. GLADIADORES DEL BATTLE ROYALE (TODOS CONTRA TODOS)
${royaleText}
`;
    } else {
      combatantsSection = `
### III. FICHAS TÉCNICAS RIGUROSAS & ARSENAL DE COMBATE
${formatFullChar(charA, 'CONTENDIENTE A')}

${formatFullChar(charB, 'CONTENDIENTE B')}
`;
    }

    let modeDirective = "";
    if (matchMode === 'teams') {
      modeDirective = `\nMODO GUERRA DE EQUIPOS: Desarrolla ataques combinados obligatorios usando la sinergia táctica descrita, fuegos cruzados y la caída progresiva de integrantes hasta que un equipo prevalezca.`;
    } else if (matchMode === '1vN') {
      const bossMult = modifiers.bossMultiplier || 1.35;
      const bossMechanics = detectNarrativeBossMechanics(charA, teamB);
      
      modeDirective = `
MODO 1 VS VARIOS (BOSS RAID ASIMÉTRICO CON ESCALADO ${bossMult}x & SISTEMA DE BOSS NARRATIVO):
Narra la incursión épica de una escuadra cooperativa de ${teamB.length} luchadores coordinados contra el Jefe Supremo ("${charA.name}") potenciado por el buff de Raid ${bossMult}x.

ESTRUCTURA DE 3 FASES OBLIGATORIA DEL BOSS NARRATIVO:
- FASE 1: "MÁSCARA DE CONTROL" (100% a 70% HP): El Boss combate con desdén y moderación calculada (-30% de daño saliente oculto). Desprecia ataques menores.
- FASE 2: "QUIEBRE DE PACIENCIA" (70% a 25% HP): Activada por golpe irrespetuoso o 5 golpes acumulados de desgaste. Desata ataques de área devastadores y fija su atención en el estratega principal del grupo.
- FASE 3: "FORMA VERDADERA / DESESPERACIÓN CÓSMICA" (<25% HP): Desata su técnica prohibida o transformación final (+1 Tier temporal en AP), pero pierde su inmunidad a debuffs menores y sufre fatiga acelerada de energía.

MECÁNICAS DE AMENAZA COLECTIVA:
- Presión Colectiva de Amenaza Existencial: Tras 5 ataques combinados/desgaste continuo ignorados, el Boss se ve forzado a la transición de fase antes de tiempo.
- Desprecio Calculado: El Boss ignora debuffs de control menor de luchadores con 2+ tiers inferiores en las Fases 1 y 2.`;
    } else if (matchMode === 'battle_royale') {
      modeDirective = `\nMODO BATTLE ROYALE (TODOS CONTRA TODOS): Narra el caos absoluto de todos contra todos. Incluye alianzas temporales por conveniencia, traiciones a traición, fuegos cruzados de 3 o más vías y lleva el registro estricto del ORDEN DE ELIMINADOS hasta coronar al ÚNICO CAMPEÓN SUPERVIVIENTE.`;
    }

    let structureInstruction = "";

    // ============ CABECERA DE PARÁMETROS REUTILIZABLE (SALE EN TODOS LOS MODOS) ============
    const paramHeader = `
### ⚙️ PARÁMETROS & REGLAS ACTIVAS DE SIMULACIÓN
- **Modo de Simulación:** APEX Canon-Plus / Simulación Multiversal — ${matchMode === 'raid' ? 'Boss Raid Asimétrico' : matchMode === 'team' ? 'Combate por Equipos' : matchMode === 'battleRoyale' ? 'Battle Royale' : 'Duelo 1v1'}
- **Continuidad & Versiones Declaradas:**
  * Bando A: ${charA?.name || 'Contendiente Alfa'} [${charA?.universe || 'Canon'}, ${charA?.forms?.[0]?.name || 'Base'}]
  * Bando B: ${charB?.name || 'Contendiente Beta'} [${charB?.universe || 'Canon'}, ${charB?.forms?.[0]?.name || 'Base'}]
- **Reglas del Motor:**
  * Verse Equalization: ON (Energías interactúan según jerarquía de Tier y hax)
  * Modelo de Stamina: Dinámico (Base Upkeep + Gasto por Técnica)
  * Amplificación de Lesiones Funcionales: ON (Heridas limitan técnicas y movilidad)
  * Biología & Regeneración: Coste de Ki proporcional (Sin curación milagrosa gratuita)
  * Exclusividad Técnica: Técnicas insignia solo para su usuario canónico (Ryūken = Son Goku, Mafūba = Roshi/Tenshinhan, Final Flash = Vegeta, Hakai = Dioses de Destrucción, etc.)
  * Anclaje Temporal Estricto: Cada personaje conoce SOLO su era/saga. PROHIBIDO usar técnicas, formas, información o relaciones de sagas posteriores a su ficha. Los nombres se usan solo si el personaje los conoce en su era.
`;

if (modifiers.simulationMode === 'cronica') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO CRÓNICA CONTINUA / NOVELA ÉPICA MAGISTRAL
Narra la batalla como una novela sci-fi/fantasía de alto impacto, combinando el poder visceral de los combates cuerpo a cuerpo (huesos, músculos, oxígeno) con el Power Scaling cósmico (energía masiva, vitrificación, MFTL+).

DIRECTIVAS DE CRÓNICA FLUIDA (PROSA CONTINUA — CERO ENCABEZADOS DE FASE):
1. **PRIMERA LÍNEA:** Tras la cabecera de parámetros, NO escribas NINGÚN encabezado "FASE", "ACTO" ni "VEREDICTO". Empieza DIRECTAMENTE con la narración en prosa (un párrafo descriptivo que establece la atmósfera, el peso del momento y la tensión acumulada).
2. **FLUJO CONTINUO POR MINUTOS DE COMBATE:** Narra en párrafos conectados que avanzan en tiempo de combate (ej. "minuto 1", "minuto 4", "minuto 7"). La prosa fluye sin cortes de sección: cada párrafo termina en el punto exacto donde el siguiente continúa la acción.
3. **CHECKPOINTS BIOMÉTRICOS INLINE:** En los momentos dramáticos (cambio de rumbo, primera sangre, transformación, derribo), inserta la telemetría DENTRO del párrafo como un marcador compacto en su propia línea, sin encabezado:
   ||BIOMETRICS|HP_A:87|STM_A:79|HP_B:91|STM_B:84||
   Distribúyelos con ritmo narrativo (3-5 a lo largo de la crónica), nunca mecánicamente.
4. **PRECIO FÍSICO REAL:** El desgaste se acumula y duele: tendones que chirrían, hematomas que limitan la movilidad, respiración irregular. Los checkpoints reflejan ese desgaste decreciente.
5. **CIERRE ABIERTO:** No cierres con "FIN DE LA SIMULACIÓN"; deja la batalla en un punto vivo y continuable, con el estado parcial claro.

### 📖 DIRECTIVAS DE CRÓNICA CONTINUA (CAMPAÑA / NOVELA POR CAPÍTULOS):
6. **CONTINUIDAD NARRATIVA:** Esta escena forma parte de una crónica continua. Si recibes contexto de escenas anteriores (estado de los personajes, heridas arrastradas, relaciones, facciones), respétalo estrictamente: las heridas de capítulos previos duelen, las alianzas pesan y los arcos personales evolucionan.
7. **DESARROLLO DE PERSONAJES:** Cada escena avanza el arco interno de los protagonistas (una convicción puesta a prueba, un miedo enfrentado, una relación que cambia). La crónica no es solo combate: es historia contada a través del combate y el diálogo.
8. **GANCHOS A FUTURO:** Deja al menos UNA semilla narrativa para capítulos posteriores (un rival que observa, un misterio sin resolver, una alianza inestable). La crónica debe sentir que "continúa", no que termina.
9. **RELACIONES Y MATRIZ:** Refleja cómo el resultado modifica las relaciones entre participantes y facciones.
10. **TONO DE LA CAMPAÑA:** Mantén el tono declarado de la crónica sin cambiar de registro bruscamente.
`;
    } else if (modifiers.simulationMode === 'episodico') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO EPISÓDICO — ACTO 1 (APERTURA DEL ARC)
Narra el primer tercio del combate con ritmo crescendo, como si fuera el primer episodio de un arco de torneo shōnen.

REGLAS DE RITMO OBLIGATORIAS:
1. **Párrafos de 2-3 líneas máximo.** Prosa rápida, cinematográfica y de alto impacto visual.
2. Comienza con la atmósfera del escenario y el primer cruce de miradas/energías.
3. Desarrolla el encuentro inicial, la lectura táctica y los primeros intercambios reveladores.
4. **Revela UNA capacidad o forma sorpresiva** que eleve la tensión justo cuando el lector cree que entiende el matchup.
5. **TERMINA obligatoriamente en un CLIFFHANGER ABSOLUTO:** congela el frame en el momento de MÁXIMA tensión justo cuando un ataque decisivo está por impactar o un umbral de poder es franqueado. NO reveles resultado ni daño del golpe final.

FORMATO DE CIERRE OBLIGATORIO (copiado exactamente):
### ⏸️ CLIFFHANGER — CONTINUARÁ
[Descripción del instante congelado, máximo 2 líneas de alta tensión narrativa]
||BIOMETRICS|HP_A:<valor>|STM_A:<valor>|HP_B:<valor>|STM_B:<valor>||
`;
    } else if (modifiers.simulationMode === 'torneo_shonen') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO TORNEO SHŌNEN (BRACKET ELIMINATORIO CON COMENTARISTA)
Narra el combate como una eliminatoria de torneo de artes marciales con comentarista en vivo, rankings y público entregado.

REGLAS OBLIGATORIAS:
1. **COMENTARISTA EN VIVO (OBLIGATORIO):** Incluye un comentarista/narrador de torneo que exalta los momentos clave con apodos descriptivos ("¡El Príncipe de los Saiyans!", "¡El Dios de la Destrucción!", "¡La Bestia Legendaria!"). Sus intervenciones van entre guiones o como inserciones de color entre acciones.
2. **BRACKET Y RANKINGS (APERTURA):** Al inicio, muestra el contexto de la eliminatoria: Ronda actual, combate, puesto en el ranking de la arena y récords/fama de cada contendiente.
3. **PÚBLICO Y ATMÓSFERA:** Describe gradas llenas, pancartas, el rugido de la audiencia, la tensión del público que aplaude o abuchea. El escenario es una arena oficial de torneo con reglamento.
4. **RITMO SHŌNEN ESPECTACULAR:** Las transformaciones son revelaciones que hacen rugir al público; los golpes decisivos se narran con cámara lenta épica y exageración exaltada. Cada fase debe tener un momento "para el público".
5. **MARCADOR DE MOMENTUM:** Entre fases, indica quién lleva la ventaja táctica y quién "avanzaría" según el momento del combate.
6. **VEREDICTO DE TORNEO:** El ganador avanza de ronda; el comentarista despide el combate evaluando su futuro en el bracket. Cierra con el estado de la arena y el resultado oficial.
`;
    } else if (modifiers.simulationMode === 'trilogia') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO TRILOGÍA (3 ACTOS CONECTADOS CON EVOLUCIÓN DE STATS)
Narra el combate en tres actos cinematográficos conectados, donde el estado, las heridas y las técnicas evolucionan entre actos.

REGLAS OBLIGATORIAS:
1. **ACTO 1 — EL ENCUENTRO:** Presentación de ambos contendientes, atmósfera del escenario, primer intercambio de poder y lectura táctica. Cierra con el primer golpe de efecto que define el tono.
2. **ACTO 2 — LA ESCALADA:** Emergen las formas y técnicas superiores. El escenario se degrada visiblemente. Cada contendiente revela una carta nueva. Cierra con un punto de inflexión dramático (una forma desbloqueada, una herida grave, un giro táctico).
3. **ACTO 3 — LA RESOLUCIÓN:** El clímax absoluto. Finishers, choque de voluntades, y el desenlace definitivo con consecuencias emocionales y físicas duraderas.
4. **EVOLUCIÓN ENTRE ACTOS (OBLIGATORIO):** Entre actos, actualiza la telemetría BIOMETRICS con el nuevo estado, y narra cómo el desgaste del acto anterior condiciona el siguiente (fatiga acumulada, heridas que limitan técnicas, estrategias rotas). Los stats nunca "vuelven a 100" sin justificación (descanso, senzu, regeneración).
5. **EPÍLOGO:** Cierra con el estado final de los contendientes, las secuelas de la batalla y una semilla narrativa para una posible secuela o trilogía posterior.
`;
    } else if (modifiers.simulationMode === 'epica_extendida') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO ÉPICA EXTENDIDA (6 FASES DE COMBATE PROLONGADO)
Narra el combate con SEIS fases en lugar de cuatro, alargando la pelea con más intercambios, más vuelta de tuerca y mayor profundidad táctica.

REGLAS OBLIGATORIAS:
### FASE 1 — TANTEO Y MEDICIÓN
[Primeros intercambios, lectura de habilidades, pequeñas ventajas. Los contendientes se estudian.]
### FASE 2 — ESCALADA Y SÚPER ATAQUES
[Formas superiores, técnicas devastadoras, el escenario empieza a degradarse.]
### FASE 3 — EL GIRO TÁCTICO
[Primer gran punto de inflexión: una estrategia falla, una técnica se descubre, un hax se contrarresta.]
### FASE 4 — CRISIS Y DESGASTE
[Ambos bandos agotados; heridas graves que limitan movimientos. La resistencia se pone a prueba. Puede activarse el evento Cisne Negro aquí.]
### FASE 5 — RECUPERACIÓN O DESESPERACIÓN
[Un giro inesperado re-equilibra el combate: un recurso (senzu), una nueva forma, un aliado, una técnica prohibida. El clímax se prepara.]
### FASE 6 — CLÍMAX Y RESOLUCIÓN
[El duelo final. Finishers, choque de voluntades, desenlace definitivo.]
### VEREDICTO & ESTADO FINAL
VENCEDOR: <Nombre exacto>
DIFICULTAD: <Extreme-Diff | High-Diff | Mid-Diff | Low-Diff>
CAUSALIDAD DEL DESENLACE: <Argumentos técnicos>
ESTADO FINAL DE LOS COMBATIENTES: <Porcentajes + daño anatómico>
||BIOMETRICS|HP_A:<final>|STM_A:<final>|HP_B:<final>|STM_B:<final>||

REGLA DE DURACIÓN: Cada fase debe tener SUFICIENTE contenido (no resúmenes): intercambios detallados, diálogos, daño acumulado y evolución del escenario. La pelea debe sentirse LARGA y ÉPICA, no apresurada.
`;
    } else if (modifiers.simulationMode === 'maraton') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO MARATÓN (COMBATE DE RESISTENCIA PROLONGADO)
Narra un combate de resistencia extrema y larga duración, donde el desgaste físico y mental es el protagonista.

REGLAS OBLIGATORIAS:
1. **DURACIÓN EXTENDIDA:** El combate se desarrolla en 5-8 segmentos narrativos (no fases rígidas con los mismos nombres) que fluyen con la historia. Cada segmento avanza el desgaste de ambos bandos.
2. **DESGASTE ACUMULATIVO REAL:** La stamina se agota de forma visible y persistente: los golpes pesan más, las técnicas son más lentas, las respiraciones se entrecortan. Los contendientes YA NO pelean igual al principio que al final.
3. **CAMBIO DE ESTRATEGIA:** Al menos dos veces en el combate, un luchador debe cambiar radicalmente de estrategia por el desgaste (de atacante a defensor, de ofensivo a táctico, de técnica a cuerpo a cuerpo).
4. **MOMENTOS DE RESPIRACIÓN:** Incluye micro-pausas donde los luchadores se evalúan, dialogan o intercambian miradas, sin perder la tensión.
5. **PUNTOS DE TELEMETRÍA:** Muestra la BIOMETRICS en los momentos naturales (al menos 3 veces), reflejando el desgaste progresivo.
6. **CLÍMAX DE AGOTAMIENTO:** El final es una batalla de dos boxeadores al límite: el que resiste más gana, no el que golpea más fuerte.
7. **VEREDICTO:** Cierra con el estado final y el precio físico total del combate.
`;
    } else if (modifiers.simulationMode === 'novela_continua') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO NOVELA CONTINUA (SIN FASES RÍGIDAS)
Narra el combate como una escena de novela cinematográfica fluida, SIN encabezados de fase numerados.

REGLAS OBLIGATORIAS:
0. **PRIMERA LÍNEA:** Tras la cabecera de parámetros (⚙️ PARÁMETROS & REGLAS ACTIVAS), NO escribas NINGÚN encabezado "FASE" ni "Fase X" — empieza DIRECTAMENTE con la narración en prosa (párrafo descriptivo inicial).
1. **FLUJO CONTINUO:** NO uses encabezados "FASE 1/2/3/4". La narración fluye como un capítulo de novela, con párrafos conectados y transiciones naturales entre momentos de combate.
2. **TELEMETRÍA DISCRETA:** Inserta la BIOMETRICS solo en los momentos más dramáticos (cuando el combate cambia de rumbo), no de forma mecánica.
3. **PROSA LITERARIA:** La narración prioriza la calidad literaria: metáforas, ritmo de frases, clima emocional. Combina acción visceral con respiración narrativa.
4. **ARCO EMOCIONAL:** El combate debe tener un arco emocional (tensión creciente, picos de drama, respiros, clímax y resolución) sin depender de la estructura de fases.
5. **CIERRE ABIERTO:** NO cierres con desenlace definitivo ni "FIN DE LA SIMULACIÓN". Deja la batalla en un punto vivo y continuable (estado parcial claro, tensión sostenida) para que el usuario pueda continuar con el Modo Libro-Juego.
`;
    } else if (modifiers.simulationMode === 'relampago') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO COMBATE RELÁMPAGO (2 FASES ULTRA-RÁPIDAS)
Narra un combate decidido en SEGUNDOS, estilo one-shot de élite. La pelea es brutal, breve e intensa.

REGLAS OBLIGATORIAS:
### FASE 1 — LA CHISPA (0-3 SEGUNDOS)
[El primer y único intercambio técnico real. Lectura instantánea del rival, primer choque, una micro-ventaja se decide.]
### FASE 2 — LA DECISIÓN (3-10 SEGUNDOS)
[El golpe definitivo. Una técnica letal, un contraataque perfecto, un hax decisivo. La pelea termina con un resultado claro.]
### VEREDICTO
VENCEDOR: <Nombre>
DIFICULTAD: <Low-Diff | Mid-Diff | High-Diff>
TIEMPO TRANSCURRIDO: <X segundos>
CAUSALIDAD: <El momento exacto que decidió la pelea>

REGLAS DE RITMO:
1. **VELOCIDAD TOTAL:** Cada frase debe transmitir velocidad extrema (sin pausas largas, sin monólogos extensos).
2. **IMPACTO ÚNICO:** Solo hay UN intercambio decisivo; el resto son amagues y lecturas.
3. **PROSA INCISIVA:** Párrafos cortos y afilados. La tensión es un cuchillo.
4. **DESENLACE CLARO:** Sin ambigüedad: quién ganó y POR QUÉ en un instante.
`;
    } else if (modifiers.simulationMode === 'resistencia_infinita') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO DUELO DE RESISTENCIA INFINITA (SIN LÍMITE DE TIEMPO)
Narra un duelo sin límite de tiempo donde los contendientes se enfrentan HASTA EL COLAPSO TOTAL de uno de ellos.

REGLAS OBLIGATORIAS:
1. **CICLOS DE DESGASTE:** La narración avanza en CICLOS de resistencia (no fases): cada ciclo representa horas/días de combate continuo donde ambos se castigan sin tregua.
2. **REGENERACIÓN Y RECUPERACIÓN:** Si un contendiente tiene regeneración, curación o recuperación pasiva, muéstrala — el duelo se convierte en una guerra de recursos entre daño y curación.
3. **MONÓLOGOS INTERNOS DE AGOTAMIENTO:** Ambos luchadores reflexionan sobre el dolor, la fatiga y la voluntad de continuar. El duelo es tanto mental como físico.
4. **MARCAS DEL TIEMPO:** Al inicio de cada ciclo, indica cuánto tiempo ha pasado (Horas 1, 12, 24... días 2, 3...). El escenario se degrada con el tiempo (craters, clima alterado, terreno arrasado).
5. **EL COLAPSO:** El final no es una técnica espectacular — es el colapso de uno de los dos por agotamiento puro. Describe el momento en que el cuerpo dice "basta".
6. **VEREDICTO:** Cierra con el tiempo total del duelo, el estado de devastación y el precio físico del vencedor.
`;
    } else if (modifiers.simulationMode === 'ascension') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO ASCENSIÓN DE PODER (RONDAS DE EVOLUCIÓN)
Narra un combate donde los contendientes ASCIENDEN de poder ronda a ronda, desbloqueando formas y técnicas progresivamente.

REGLAS OBLIGATORIAS:
### RONDA 1 — ESTADO BASE
[Ambos luchan en su forma base, midiéndose sin transformaciones.]
### RONDA 2 — PRIMERA ASCENSIÓN
[Primer nivel de poder: transformación inicial, técnicas superiores.]
### RONDA 3 — ASCENSIÓN MEDIA
[Segunda forma o técnica intermedia; el combate se vuelve más agresivo.]
### RONDA 4 — CÚSPIDE
[Tercer nivel: la forma más poderosa de cada uno, o su mejor técnica.]
### RONDA FINAL — LA DECISIÓN
[El pico máximo combinado: el choque final entre los niveles más altos.]
### VEREDICTO
VENCEDOR: <Nombre>
RONDAS HASTA LA VICTORIA: <X>
CAUSALIDAD: <En qué ascensión se decidió y por qué>

REGLAS:
1. **PROGRESIÓN VISIBLE:** Cada ronda debe elevar el poder de forma clara (stats suben, aura cambia, escenario se degrada más).
2. **SIN RETROCESO:** Una vez ascendido, no se baja de nivel sin justificación (colapso, costo).
3. **TENSIÓN CRECIENTE:** La cúspide debe sentirse inevitable y apoteósica.
`;
    } else if (modifiers.simulationMode === 'oleadas') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO ASALTO POR OLEADAS (DEFENSA INFINITA)
Narra a una escuadra defendiéndose contra OLEADAS de enemigos cada vez más fuertes.

REGLAS OBLIGATORIAS:
### OLEADA 1 — CONTENCIÓN
[Enemigos de bajo nivel para medir a la escuadra. La defensa se organiza.]
### OLEADA 2 — PRESIÓN
[Enemigos más fuertes que fuerzan el uso de técnicas y recursos.]
### OLEADA 3 — CRISIS
[Un líder o enemigo élite aparece. La escuadra debe coordinarse o caer.]
### OLEADA 4 — ASEDIO FINAL
[El enemigo más fuerte de la oleada. Los recursos están casi agotados.]
### VEREDICTO
RESULTADO: <La escuadra aguanta o cae>
OLEADA MÁXIMA ALCANZADA: <X>
BAJAS: <Estado de cada miembro>

REGLAS:
1. **RECURSOS LIMITADOS:** Senzus, regeneración y stamina se gastan entre oleadas; muéstralo.
2. **SINERGIAS OBLIGATORIAS:** La escuadra debe usar ataques combinados y sinergias para sobrevivir.
3. **ESCALADA DE AMENAZA:** Cada oleada debe sentirse más peligrosa que la anterior.
4. **MOMENTOS DE RESPIRAÇÃO:** Entre oleadas, breves pausas para reorganización y diálogo.
`;
    } else if (modifiers.simulationMode === 'psicologico') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO GUERRA PSICOLÓGICA (MENTE SOBRE MÚSCULO)
Narra un combate donde la PSICOLOGÍA y la estrategia importan más que la fuerza bruta.

REGLAS OBLIGATORIAS:
1. **MIND GAMES:** El combate está lleno de provocaciones, falsas aperturas, predicciones y contrapredicciones. Cada luchador intenta romper mentalmente al otro.
2. **POCOS GOLPES, MUCHO PESO:** Los intercambios físicos son escasos pero DECISIVOS — cada golpe que conecta es el resultado de un plan mental complejo.
3. **LECTURA DEL RIVAL:** Muestra los monólogos internos donde cada uno analiza los patrones, miedos y hábitos del otro.
4. **BATTLE IQ SOBRE PODER:** Un luchador más débil puede vencer a uno más fuerte mediante la estrategia pura.
5. **EL MOMENTO DE QUIEBRE:** El clímax es el momento en que la mente de uno se rompe (miedo, ira manipulada, desesperación) o se aclara (epifanía táctica).
6. **VEREDICTO:** Explica la victoria en términos de QUÉ ERROR mental cometió el perdedor, no solo qué golpe recibió.
`;
    } else if (modifiers.simulationMode === 'sparring') {
      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO: MODO SPARRING DE ENTRENAMIENTO (SIN MUERTE)
Narra un combate de entrenamiento o exhibición donde NO hay muerte: técnica, aprendizaje y deportividad.

REGLAS OBLIGATORIAS:
1. **SIN LETALIDAD:** Los golpes buscan someter, no matar. Cuando un contendiente recibe un golpe decisivo o se rinde, el combate termina.
2. **APRENDIZAJE MUTUO:** Ambos luchadores aprenden del otro: técnicas observadas, debilidades descubiertas, respeto ganado.
3. **COACHING:** Puede haber un mentor/observador que comente o dirija a los luchadores.
4. **TÉCNICA SOBRE BRUTALIDAD:** Se premian la técnica limpia, el control y la estrategia. Sin daño permanente.
5. **FIN DEL SPARRING:** Cierra con el resultado (toque decisivo, rendición, o empate técnico), lo que cada uno aprendió, y la relación entre los luchadores tras el encuentro.
6. **TONO:** Puede ser competitivo o amistoso según los contendientes, pero siempre deportivo.
`;
    } else {
      const isEn = (modifiers.language === 'en');
      const isJa = (modifiers.language === 'ja');

      const h1 = isEn ? '### 1. PRE-COMBAT ANALYSIS & HAX INTERACTION' : isJa ? '### 1. 事前分析＆特殊能力（Hax）激突' : '### 1. ANÁLISIS PREVIO & CHOQUE DE HAX';
      const h2 = isEn ? '### 2. PHASE 1: KINETIC PROBING & BASIC STRIKES' : isJa ? '### 2. 第1フェーズ：初動牽制＆基本打撃戦' : '### 2. FASE 1: TANTEO CINÉTICO & ATAQUES BÁSICOS';
      const h3 = isEn ? '### 3. PHASE 2: ESCALATION, SUPER ATTACKS & FORMS' : isJa ? '### 3. 第2フェーズ：激化・必殺技＆変身解放' : '### 3. FASE 2: ESCALADA, SÚPER ATAQUES & FORMAS';
      const h4 = isEn ? `### 4. PHASE 3: TACTICAL TURNING POINT ${modifiers.blackSwan ? '(BLACK SWAN EVENT!)' : ''}` : isJa ? `### 4. 第3フェーズ：戦術的逆転と勝機の転換 ${modifiers.blackSwan ? '（ブラックスワン事象！）' : ''}` : `### 4. FASE 3: EL GIRO TÁCTICO ${modifiers.blackSwan ? '(¡EVENTO CISNE NEGRO!)' : ''}`;
      const h5 = isEn ? '### 5. PHASE 4: ANATOMICAL CLIMAX (ULTIMATE ATTACKS)' : isJa ? '### 5. 第4フェーズ：究極奥義激突（クライマックス）' : '### 5. FASE 4: EL CLÍMAX ANATÓMICO (ATAQUES DEFINITIVOS)';
      const h6 = isEn ? '### 6. DEFINITIVE VERDICT & FINAL STATE' : isJa ? '### 6. 最終判定＆決着リザルト' : '### 6. VEREDICTO & ESTADO FINAL';
      const h7 = isEn ? '### 7. BUTTERFLY EFFECT & MULTIVERSAL AFTERMATH' : isJa ? '### 7. バタフライエフェクト＆多元宇宙への影響' : '### 7. EFECTO MARIPOSA & CONSECUENCIAS MULTIVERSALES (WHAT-IF DIVERGENTE)';

      const winnerLabel = isEn ? 'VICTOR:' : isJa ? '勝者:' : 'VENCEDOR:';
      const diffLabel = isEn ? 'DIFFICULTY:' : isJa ? '難易度:' : 'DIFICULTAD:';

      structureInstruction = paramHeader + `
### IV. ESTRUCTURA Y ESTILO LITERARIO DE LA SIMULACIÓN (APEX ENGINE V6 AUDITED)
El frontend renderizará esta batalla por partes. DEBES estructurar la respuesta usando EXACTAMENTE estos títulos Markdown para separar las fases.

DIRECTIVAS LITERARIAS Y MECÁNICAS OBLIGATORIAS (VITAL):
1. **Declaración de Reglas Inicial:** La simulación DEBE comenzar obligatoriamente con la cabecera de parámetros y reglas declaradas.
2. **Párrafos Cortos y Ágiles:** Nunca escribas muros de texto. Párrafos de 2-4 líneas máximo con ritmo cinematográfico.
3. **Blacklist de Clichés y Moderación de Prosa:**
   - Prohibido abusar de fórmulas repetitivas ("No fue X, fue Y", "la realidad se rompió", "la luz se curvó", "átomo a átomo", "densidad de neutrones", "un microsegundo").
   - Alterna planos de cámara: lectura de guardia / fintas CQC ➔ daño anatómico localizado ➔ impacto regional de terreno ➔ clímax destructivo.
4. **Física Biológica y Rigor de Regeneración / Formas:**
   - **Formas de Ki y Estado Definitivo (Ultimate):** NO son regeneración biológica. Proporcionan "Ki Reinforcement Stabilization" (soporte de dolor y postura por Ki), pero no cosen órganos perforados ni sueldan huesos rotos automáticamente.
   - **Coste de Regeneración Real (Namekianos / Maldiciones):** Herida superficial (2-5% STM), Músculo/Hueso severo (8-15% STM), Órgano perforado (15-25% STM), Extremidad amputada (30-45% STM). Regeneraciones múltiples conllevan coste acumulativo y deuda de fatiga.
5. **Modelo Dinámico de Stamina (No estático ni arbitrario):**
   - Base upkeep por fase activa: 3-5% STM.
   - Ráfagas intensas / combos MFTL: +3-5% STM.
   - Supertécnicas / Ataques masivos: +6-10% STM.
   - Ataques suicidas / Cataclismos planetarios: +15-25% STM.
6. **Formato Markdown y Diálogos Estrictos:** 
   - SIEMPRE utiliza la raya de diálogo (—) o comillas ("") al principio del párrafo para los diálogos hablados.
   - Si usas cursiva (*texto*), DEBES asegurarte de CERRAR SIEMPRE el asterisco al final (*texto*). NUNCA dejes un asterisco abierto.
   - Usa negritas para nombres de técnicas (ej: **Kamehameha**, **Expansión de Dominio**).

REGLA CLAVE PARA HUD BIOMÉTRICO (VIDA + ENERGÍA):
Al final del texto de CADA FASE, debes insertar una sola línea con este formato estricto:
||BIOMETRICS|HP_A:<0-100>|STM_A:<0-100>|HP_B:<0-100>|STM_B:<0-100>||

PROHIBICIÓN ESTRICTA DE TELEMETRÍA FANTASMA:
- La telemetría DEBE decrecer de forma dinámica y matemáticamente coherente con el castigo físico narrado.

ESTRUCTURA OBLIGATORIA:

${h1}
[Análisis táctico: diferencias de velocidad, cómo interactúan sus Pasivas/Hax y el impacto de la Arena].
||BIOMETRICS|HP_A:100|STM_A:100|HP_B:100|STM_B:100||

${h2}
[Choque inicial con ataques básicos, fintas CQC y lectura de reflejos sobre el terreno].
||BIOMETRICS|HP_A:90|STM_A:85|HP_B:90|STM_B:85||

${h3}
[Uso de transformaciones intermedias y despliegue de los SÚPER ATAQUES con gasto dinámico de stamina].
||BIOMETRICS|HP_A:70|STM_A:60|HP_B:65|STM_B:55||

${h4}
[Explotación de debilidades, contraataques tácticos o el evento Cisne Negro con lesiones anatómicas localizadas].
||BIOMETRICS|HP_A:45|STM_A:35|HP_B:35|STM_B:25||

${h5}
[Ambos liberan sus ATAQUES DEFINITIVOS / Finishers a máxima potencia. Daño crítico, colapso de recursos y choque final].
||BIOMETRICS|HP_A:15|STM_A:10|HP_B:0|STM_B:0||

${h6}
${winnerLabel} <Nombre exacto del Ganador o Bando Victorioso>
${diffLabel} <Extreme-Diff | High-Diff | Mid-Diff | Low-Diff>
- **TIPO DE RESOLUCIÓN:** <Muerte / K.O. Médico / Retirada del Objetivo / Sellado Dimensional / Aniquilación Atómica>

**CAUSALIDAD DEL DESENLACE (ARGUMENTO TÉCNICO MATEMÁTICO):**
1. <Argumento técnico de Tier, velocidad y ventaja biomecánica 1>
2. <Argumento técnico de interacción de Hax / Contra-estrategia 2>
3. <Argumento técnico de gestión de Stamina y letalidad de Finisher 3>

**DESGLOSE MATEMÁTICO DEL IMPACTO FINAL (DELTA DE DAÑO):**
- <Nombre del Perdedor / Superviviente Retirado> (<HP Previo>% → <HP Final>% HP):
  * <Ataque Decisivo 1 / Finisher>: -<X>% HP
  * <Daño de Retroceso / Colapso de Transformación>: -<Y>% HP/STM
  * <Trauma Anatómico Acumulado>: -<Z>% HP
  = <HP Final>% HP (<Fallecido / Incapacitado / Retirado Vivo a 5-10% HP>)

**ESTADO BIOMÉTRICO FINAL DETALLADO POR BANDOS:**
**BANDO A — ${charA?.name || 'Bando Alfa'}:**
- **${charA?.name || 'Alfa'}:** <HP>% HP | <STM>% STM | <Estado Vital (Vivo-Óptimo / Vivo-Crítico / Retirado / K.O. / Fallecido)>. <Capacidad funcional: Movilidad, respiración, brazos, trauma localizado>.

**BANDO B — ${charB?.name || 'Bando Beta'}:**
- **${charB?.name || 'Beta'}:** <HP>% HP | <STM>% STM | <Estado Vital (Vivo-Óptimo / Vivo-Crítico / Retirado / K.O. / Fallecido)>. <Capacidad funcional: Movilidad, respiración, brazos, trauma localizado>.

**ESTADO DEL MAPA & IMPACTO AMBIENTAL:**
- **Magnitud Richter Estimada:** <Valor>
- **Radio de Destrucción Total:** <Valor en metros o km>
- **Tasa de Irradiación / Alteración Térmica:** <Valor en MJ/m² o petajulios>
- **Consecuencias Civiles / Planetarias:** <Desolación regional / Crisis continental / Contención en arena sellada>
||BIOMETRICS|HP_A:<HP_FINAL>|STM_A:<STM_FINAL>|HP_B:<HP_FINAL>|STM_B:<STM_FINAL>||
${modifiers.butterflyEffect ? `
${h7}
[Desarrolla con máxima crudeza y detalle cinematográfico las siguientes secuelas directas]:
${modifiers.whatIfSubToggles?.traumaMedical !== false ? `- **🧬 Secuelas Biomecánicas & Trauma Anatómico:** Consecuencias médicas irreversibles.` : ''}
${modifiers.whatIfSubToggles?.geopoliticalCrisis !== false ? `- **🌍 Colapso Geopolítico & Vacío de Poder:** Cómo altera el equilibrio galáctico.` : ''}
${modifiers.whatIfSubToggles?.dormantAwakening !== false ? `- **💀 Despertar de Amenazas Durmientes:** Entidades cósmicas que despiertan.` : ''}
${modifiers.whatIfSubToggles?.timelineBranching !== false ? `- **🌌 Punto de Inflexión & Bifurcación Temporal (What-If):**
  * **Línea Alfa (Canónica):** El destino sellado del combate.
  * **Línea Beta (Divergencia en ${modifiers.divergencePoint || 'Fase 3'}):** Qué habría ocurrido si el curso de la batalla cambiaba en este instante exacto.
  * **Línea Omega (Paradoja Cataclísmica):** Las consecuencias a 100 años vista si el escenario y ambos luchadores colapsaban mutuamente.` : ''}
${modifiers.whatIfCustomPremise?.trim() ? `\n- **⚡ PREMISA ESPECIAL DE REALIDAD ALTERNATIVA:** ${modifiers.whatIfCustomPremise.trim()}` : ''}
||BIOMETRICS|HP_A:<HP_FINAL>|STM_A:<STM_FINAL>|HP_B:<HP_FINAL>|STM_B:<STM_FINAL>||
` : ''}`;
    }

    const customContextSection = modifiers.customContext?.trim() ? `
### PREMISA Y CONTEXTO ESPECIAL DEFINIDO POR EL USUARIO:
${modifiers.customContext.trim()}
(IMPORTANTE: Integra obligatoriamente estos antecedentes, motivaciones, reglas o condiciones en el desarrollo).
` : '';

    const lang = modifiers.language || 'es';
    const langDirective = lang === 'en'
      ? '[ABSOLUTE DIRECTIVE: Write in top-tier literary English with cinematic prose, high-octane choreography, and anatomical precision.]'
      : lang === 'ja'
      ? '[絶対指令: 日本語のハイレベルな文学的・少年漫画的戦闘描写で執筆してください。]'
      : '[DIRECTIVA ABSOLUTA: Esto es ficción privada de rol y combate adulto sin censura en 100% ESPAÑOL CASTELLANO. Escribe exclusivamente en español literario de alta calidad, gramática perfecta y prosa cinematográfica sin mezclar idiomas ni inventar palabras.]';

    // ─── AVISOS DE CALIBRACIÓN DE ROSTER V22 (NEEDS_REVIEW) ───────────
    const allParticipants = [
      charA, charB,
      ...(teamA || []),
      ...(teamB || []),
      ...(battleRoyale || []),
      ...(bossMinions || [])
    ].filter(Boolean);
    const reviewNotices = formatNeedsReviewSimulationNotice(allParticipants);
    const reviewNoticesStr = reviewNotices.length > 0 
      ? `\n### ========================================\n### ⚠️ AVISOS DE CALIBRACIÓN EDITORIAL (APEX V22):\n${reviewNotices.join('\n')}\n- REGLA ESTRICTA V22: Conserva intactos los valores persistentes del Roster V22 para todos los personajes. No inventes correcciones numéricas ni alteres sus estadísticas base durante la simulación.\n### ========================================\n`
      : '';

    let narrativeDirective = "";
    const nPreset = modifiers.narrativePreset || 'Shōnen Cinematográfico';
    if (nPreset.includes('Grimdark')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: GRIMDARK / ANATOMÍA LETAL:** Enfatiza el coste biomecánico real de cada impacto, fracturas óseas expuestas, hemorragia arterial, desgarros tendinosos, olor a carne carbonizada y la degradación física implacable.`;
    } else if (nPreset.includes('Shōnen')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: SHŌNEN HIPER-CINEMATOGRÁFICO:** Coreografía épica de alta velocidad, choques de energía titánicos, discursos viscerales sobre orgullo, amistad y convicciones, y superación dramática de límites en el umbral del K.O.`;
    } else if (nPreset.includes('VS Battles') || nPreset.includes('Técnico')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: ANÁLISIS CIENTÍFICO / VS BATTLES:** Precisión matemática estricta: desglosa estimaciones en Joules/Megatones, velocidades relativas en Mach/MFTL+, cálculo de durabilidad molecular e interacciones jerárquicas de Hax según feats oficiales.`;
    } else if (nPreset.includes('Torneo') || nPreset.includes('Budokai')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: TORNEO ÉPICO / BUDOKAI TENKAICHI:** Estilo arco de torneo con comentarista eufórico de micrófono, la vibración ensordecedora del público en las gradas, análisis de los espectadores de élite y conteo de diez segundos.`;
    } else if (nPreset.includes('Cosmic') || nPreset.includes('Lovecraft')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: COSMIC HORROR / ABISAL:** Atmósfera opresiva de pesadilla y locura, distorsión dimensional de la física euclidiana, desgarro del velo cósmico y el terror biológico de entes que desafían la cordura mortal.`;
    } else if (nPreset.includes('Cerebral') || nPreset.includes('Hunter') || nPreset.includes('HxH')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: CEREBRAL & TÁCTICO (HUNTER X HUNTER / DEATH NOTE):** Monólogos internos de altísima velocidad, deducción analítica de cada milisegundo, medición del consumo de energía y contraestrategias calculadas al milímetro antes de cada golpe.`;
    } else if (nPreset.includes('Blockbuster') || nPreset.includes('IMAX')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: BLOCKBUSTER CINEMÁTICO IMAX:** Planos de cámara descriptivos ultra-dinámicos, momentos congelados en slow-motion durante impactos críticos, iluminación de cine, sonido atronador e inmersión audiovisual de superproducción de Hollywood.`;
    } else if (nPreset.includes('Cantar') || nPreset.includes('Mitológica') || nPreset.includes('Homérica')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: EPOPEYA HOMÉRICA / CRÓNICA MITOLÓGICA:** Prosa solemne y arcaica de poema épico o cantar de gesta, relatando el enfrentamiento como una leyenda heroica digna de quedar grabada en los anales eternos del cosmos.`;
    } else if (nPreset.includes('Narrador Clásico') || nPreset.includes('90s')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: NARRADOR CLÁSICO DB 90s (VOZ SOLEMNE):** Usa el icónico tono solemne, dramático y trascendental de los narradores de anime clásicos de los 90s (aperturas con tensión existencial, preguntas retóricas de infarto: "¿Podrá la Tierra soportar esta colisión...?").`;
    } else if (nPreset.includes('Guion') || nPreset.includes('Director')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: GUION DE CINE / DIRECTOR'S CUT:** Redacta con formato escénico profesional: acotaciones de cámara ([CÁMARA LENTA / PLANO SECUENCIA]), iluminación ambiental, pistas de banda sonora ([BGM: Crescendo de cuerdas tensas]) y diálogos con indicaciones de entonación teatral.`;
    } else if (nPreset.includes('Survival') || nPreset.includes('Desesperación')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: SURVIVAL HORROR / CRÓNICA DE DESESPERACIÓN:** Tono asfixiante de cacería implacable donde el objetivo no es ganar por fuerza bruta sino sobrevivir minuto a minuto, esconderse, preparar emboscadas y gestionar heridas mortales contra un depredador titánico.`;
    } else if (nPreset.includes('Manga Noir') || nPreset.includes('Blanco y Negro')) {
      narrativeDirective = `\n- **ESTILO LITERARIO: MANGA NOIR / TENSIÓN SAMURÁI:** Claroscuros descriptivos, lluvia densa, sombras alargadas, silencios pesados de miradas cruzadas y resolución en estocadas y golpes relampagueantes de letalidad absoluta.`;
    }

    const activeTwists = Array.isArray(modifiers.blackSwan) 
      ? modifiers.blackSwan 
      : (modifiers.blackSwan ? [modifiers.blackSwan === true ? 'map_collapse' : modifiers.blackSwan] : []);

    const TWIST_MAP = {
      map_collapse: "¡RIESGO ACTIVO (COLAPSO DE ARENA & GRAVEDAD CERO)! En la Fase 3, una falla tectónica colosal o implosión gravitacional destruye por completo el suelo de la arena, forzando a los combatientes a luchar en caída libre, flotando en gravedad cero o sobre fragmentos de roca en llamas.",
      same_verse_reinforcement: "¡RIESGO ACTIVO (INTERVENCIÓN CANÓNICA CONTEXTUAL DEL MISMO VERSO)! En la Fase 3, la IA debe evaluar los universos de los contendientes en combate y elegir INTELIGENTEMENTE al personaje canónico más idóneo y de mayor peso narrativo para irrumpir en la arena (ej. si hay Dragon Ball: Beerus/Whis/Broly/Freezer; si hay One Piece: Shanks/Kaido/Garp/Kizaru; si hay Naruto: Madara/Hashirama/Itachi; si hay Bleach: Aizen/Yamamoto/Yhwach; si hay JJK: Sukuna/Gojo/Kenjaku/Yuta; si hay Marvel/DC: Dr. Strange/Thor/Superman Prime/Darkseid; etc.). La IA determinará la mejor resolución según la situación del combate:\n  * Alianza Táctica: Se une a su aliado o camarada si la situación lo amerita.\n  * Intervención de Juicio / Deidad: Si la escala de destrucción amenaza el tejido del verso, una deidad o entidad cósmica impone orden o castigo.\n  * Caos Hostil / Depredador: Si irrumpe un villano u oportunista, ataca a todos los presentes para reclamar supremacía absoluta.",
      multiverse_random_fighter: "¡RIESGO ACTIVO (INCURSIÓN MULTIVERSAL INESPERADA)! En la Fase 3, se abre una violenta grieta dimensional de la que emerge un guerrero legendario de un universo completamente ajeno y aleatorio. La IA seleccionará un personaje icónico del multiverso y determinará si impone su propia justicia, inclina la balanza hacia un bando o desata un combate caótico a tres bandas.",
      fusion_protocol_canon: "¡RIESGO ACTIVO (FUSIÓN CANÓNICA EN BATALLA - METAMORU / POTARA / ASIMILACIÓN)! En la Fase 3, si en el combate hay aliados compatibles que conozcan la Danza Metamoru (ej. Goten y Trunks en Saga Buu ➔ Gotenks; Goku y Vegeta en Saga Buu/Super ➔ Gogeta) o si están en presencia de Kaio-shins / Planeta Sagrado y portan Pendientes Potara (➔ Vegetto), ejecutan la fusión oficial multiplicando exponencialmente su AP, velocidad y arsenal durante la batalla. Si hay Namekianos (ej. Piccolo), puede realizar Asimilación Namekiana con un aliado.",
      fusion_protocol_whatif: "¡RIESGO ACTIVO (FUSIÓN WHAT-IF TRASCENDENTE / HÍBRIDOS INSÓLITOS)! En la Fase 3, los aliados rompen las barreras canónicas y ejecutan una fusión hipotética híbrida (ej. Gokuhan [Goku + Gohan], Tiencha [Ten Shin Han + Yamcha], Cellin [Cell + Krilin], Trunten, Gogeta SSJ4/Blue, etc.), creando un guerrero combinado con diseño híbrido, suma multiplicada de estadísticas y combinación sinérgica de sus mejores técnicas.",
      cell_bio_absorption: "¡RIESGO ACTIVO (MECÁNICA DE ABSORCIÓN ANATÓMICA DE CELL / CELL MAX)! En la Fase 3, si Cell o Cell Max están en combate, despliegan su fisiología depredadora:\n  * Drenaje de Cola / Aguijón: Ensartan a un rival para drenar su Ki biológico y dejarlo sin stamina.\n  * Absorción de Androides / Gammas: Si hay Androides (Nº 17, 18, 16, Gamma 1, Gamma 2) o bio-energía masiva, los absorbe para evolucionar (ej. Cell Imperfecto a Semiperfecto/Perfecto; Cell Max a su Forma Perfecta / Mente Consciente tipo What-If de Brokoly350 con intelecto brillante y coraza esbelta).",
      buu_viscous_absorption: "¡RIESGO ACTIVO (ABSORCIÓN ANATÓMICA DE MAJIN BUU - DEPREDADORA & PERMISIVA)! En la Fase 3, si hay un Majin Buu en combate:\n  * Absorción Depredadora (Super Buu / Kid Buu): Desprende un fragmento viscoso de su cuerpo desde los escombros o por la espalda de un rival, envolviéndolo en un capullo gelatinoso y asimilándolo para crear una variante evolucionada (ej. Buutenks, Buuhan, Buu Piccolo, Buu Vegeto), heredando su ropa, voz, intelecto y técnicas insignia.\n  * Fusión Permisiva (Mr. Buu / Buu Gordo): Puede asimilarse voluntariamente con un aliado puro de corazón (como Majuub) para salvarlo y transferirle todo su poder mágico.",
      baby_tsufur_parasitism: "¡RIESGO ACTIVO (PARASITACIÓN BIOLÓGICA & SIERVOS TSUFUR DE BABY)! En la Fase 3, si Baby o Super Baby están en combate:\n  * Infestación por Heridas: Baby se licúa en metal líquido y penetra por los cortes o poros del enemigo más fuerte para tomar control de su sistema nervioso motor.\n  * Puesta de Huevos & Subditos: Implanta huevos en el cerebro de los enemigos caídos, convirtiéndolos en siervos tsufur con ojos rojos y marcas faciales que atacan a sus antiguos aliados.\n  * Salto de Recipiente: Si el anfitrión actual sufre daño crítico, Baby sale expulsado y salta inmediatamente a poseer a otro combatiente en el campo de batalla.",
      miracle_form_canon: "¡RIESGO ACTIVO (DESPERTAR CANÓNICO / ESCALÓN LÓGICO DE SAGA - STRICT ERA ACCURACY)! En la Fase 3, en el instante de máxima crisis al borde del K.O., el luchador en desventaja rompe sus límites y asciende ÚNICAMENTE a la siguiente transformación o estado inmediato y coherente con su era histórica (ej. Goku Saga Cell en SSJ Full Power pasa a Super Saiyan 2 emulando a Gohan; NO salta a SSJ God ni Ultra Instinto; Luffy Gear 4 pasa a Gear 5; Naruto Modo Sabio pasa a Manto Kurama; Vegeta Namek pasa a SSJ1; etc.). La IA tiene ESTRICTAMENTE PROHIBIDO saltar eras o desbloquear formas divinas anacrónicas bajo esta opción.",
      miracle_form_transcendent: "¡RIESGO ACTIVO (DESPERTAR TRASCENDENTE / MULTIVERSAL WHAT-IF - FORMA MÁXIMA)! En la Fase 3, el luchador rompe todas las barreras temporales y asciende a la forma más divina, prohibida o suprema de su ficha o multiverso completo (ej. SSJ God / Blue / Ultra Instinto / Ultra Ego, Baryon Mode, Mugetsu, Gear 5, etc.), desatando un colosal salto de poder tipo Dragon Ball Heroes / What-If cósmico.",
      miracle_form_awakening: "¡RIESGO ACTIVO (DESPERTAR CANÓNICO / ESCALÓN LÓGICO DE SAGA)! En la Fase 3, asciende a su siguiente forma lógica inmediata.",
      miracle_technique_awakening: "¡RIESGO ACTIVO (DESPERTAR DE SUPER TÉCNICA / FINISHER PROHIBIDO - ÚLTIMO ALIENTO)! En la Fase 3, en situación crítica y al borde de la derrota, el combatiente canaliza toda su energía vital restante en un ataque definitivo prohibido, técnica secreta suprema o juramento de sacrificio (ej. Mafūba, Shiki Fūjin, Mugetsu, Final Explosion, Juramento de Voto de Nen tipo Gon Adulto, Expansión de Dominio desesperada) desatando una ofensiva de máxima escala e impacto irreversible.\n⚠️ EXCLUSIVIDAD DE TÉCNICA (OBLIGATORIO): El **Ryūken (Dragon Fist)** es TÉCNICA EXCLUSIVA de **Son Goku** (cualquier era o variante canónica: Goku Z, Goku GT, Goku Adulto Teórico, etc.). Queda ESTRICTAMENTE PROHIBIDO que cualquier otro personaje lo ejecute: los no-Goku deben usar su propia técnica final canónica de su arsenal (Final Flash para Vegeta, Mafūba para Roshi/Tenshinhan, etc.). Incluso para Son Goku, el Ryūken NO debe ser predecible ni repetitivo: úsalo solo si es el remate narrativo ideal, como máximo UNA vez por simulación, y si el contexto ya lo mostró o existen otras opciones igualmente icónicas (Kamehameha x10, Genkidama Universal, Spirit Sword), varía la elección.",
      miracle_awakening: "¡RIESGO ACTIVO (DESPERTAR CANÓNICO DE SAGA)! En la Fase 3, rompe sus límites y asciende a su siguiente forma inmediata.",
      third_party: "¡RIESGO ACTIVO (3RA FACCIÓN INVASORA / TITÁN CÓSMICO)! En la Fase 3, una tercera entidad desconocida, monstruo dimensional o rival imprevisto irrumpe violentamente en el campo de batalla, forzando un fuego cruzado imprevisto y reajuste táctico inmediato.",
      hax_failure: "¡RIESGO ACTIVO (ANULACIÓN CATASTRÓFICA DE HAX)! En la Fase 3, una sobrecarga de energía anula temporalmente todas las habilidades mágicas, dominios o hax conceptuales durante 30 segundos, obligando a un choque puramente a puño limpio y resistencia ósea.",
      dimensional_shift: "¡RIESGO ACTIVO (FALLA ESPACIO-TEMPORAL)! En la Fase 3, la descomunal colisión de técnicas rasga el tejido dimensional, transportando instantáneamente a ambos combatientes a otra época o plano donde las leyes físicas y la gravedad cambian drásticamente.",
      miasma_corruption: "¡RIESGO ACTIVO (MIASMA DE CORRUPCIÓN / FURIA MALDITA)! En la Fase 3, una niebla maldita invade la arena infectando a los combatientes, sumiéndolos en un estado de ferocidad desbocada con incremento masivo de letalidad y anulación del dolor biológico.",
      divine_blessing: "¡RIESGO ACTIVO (BENDICIÓN DIVINA)! En la Fase 3, una entidad cósmica superior manifiesta una barrera impenetrable de un solo uso o una restauración instantánea de stamina al luchador que demuestre mayor convicción.",
      shadow_clone: "¡RIESGO ACTIVO (PARADOJA DEL ESPEJO / DOPPELGÄNGER)! En la Fase 3, la energía residual cristaliza en un clon sombrío y hostil que replica técnicas del rival.",
      time_dilation: "¡RIESGO ACTIVO (DILATACIÓN TEMPORAL LOCALIZADA)! En la Fase 3, se abren micro-anomalías de tiempo donde los ataques se aceleran x10 o se congelan en el aire.",
      energy_supernova: "¡RIESGO ACTIVO (SUPERNOVA DE KI / ENERGÍA DESBOCADA)! En la Fase 3, el exceso de energía ambiental detona en una ola de choque masiva que arrasa con el mapa."
    };

    let oracleDirectivesList = activeTwists.map(tId => TWIST_MAP[tId] || `¡GIRO DEL DESTINO: ${tId}!`);
    if (modifiers.customOracleTwist?.trim()) {
      oracleDirectivesList.push(`¡GIRO PERSONALIZADO DEL DESTINO CREADO POR EL USUARIO!: "${modifiers.customOracleTwist.trim()}" (La IA debe integrar este suceso de forma estricta y dramática en el clímax de la Fase 3).`);
    }

    let oracleDirective = oracleDirectivesList.length > 0
      ? oracleDirectivesList.join('\n- ')
      : "Sin eventos imprevistos de IA (Duelo Puro sin alteraciones externas).";

    let bloodlustStr = "Fiel a su psicología, moral y estilo de combate canónico.";
    const bMode = modifiers.bloodlustMode || (modifiers.bloodlust ? 'bloodlust' : 'canon');
    if (bMode === 'bloodlust') bloodlustStr = "BLOODLUST TOTAL (Sin contención moral ni piedad; máxima letalidad desde el milisegundo 0).";
    else if (bMode === 'honor') bloodlustStr = "CÓDIGO DE HONOR MARCIAL (Duelo formal y respetuoso; prohibido atacar por la espalda o rematar a traición).";
    else if (bMode === 'berserker') bloodlustStr = "FURIA BERSERKER CIEGA (Ataque desbocado sacrificando toda defensa para infligir daño crítico).";

    let speedStr = "Velocidades reales por feats e historial canónico.";
    const sMode = modifiers.speedMode || (modifiers.speedEqualized ? 'equalized' : 'canon');
    if (sMode === 'equalized') speedStr = "VELOCIDAD IGUALADA AL 100% (Misma velocidad de combate, desplazamiento y reacción para premiar técnica y estrategia).";
    else if (sMode === 'semi') speedStr = "SEMI-IGUALADA (Margen de 10% de velocidad para permitir anticipación táctica y Battle IQ).";

    let statsStr = "Stats de Tier canon (Potencia de ataque y durabilidad originales).";
    const stMode = modifiers.statsMode || (modifiers.statsEqualized ? 'equalized' : 'canon');
    if (stMode === 'equalized') statsStr = "STATS FÍSICOS IGUALADOS (Mismo AP y durabilidad; el duelo se define puramente por Hax, arsenal, técnica y Battle IQ).";
    else if (stMode === 'handicap') statsStr = "HANDICAP PROGRESIVO (El combatiente de mayor tier sufre desgaste térmico/energético progresivo de potencia).";

    let verseStr = "Sistemas de energía aislados e independientes.";
    const vMode = modifiers.verseMode || (modifiers.verseEqualization ? 'equalized' : 'isolated');
    if (vMode === 'equalized') verseStr = "ECUALIZACIÓN TOTAL (Ki = Magia = Chakra = Haki = Reiatsu = Energía Maldita interactúan de forma uniforme sin inmunidades absolutas).";
    else if (vMode === 'asymmetric') verseStr = "INTERACCIÓN ASIMÉTRICA (El Haki y Ki puro pueden resistir y tocar Hax intangible; la Magia corrompe el flujo biológico de energía).";

    // ── SENZU BEANS DIRECTIVE ─────────────────────────────────────────────────
    let senzuDirective = '';
    const senzuMode = modifiers.senzuMode || 'none';
    if (senzuMode === 'critical') {
      senzuDirective = `\n\n🫘 DIRECTIVA DE SEMILLA SENZU — RECURSO CRÍTICO (1 SEMILLA DISPONIBLE):
- Existe UNA SOLA Semilla del Ermitaño disponible en el campo de batalla. Un aliado o el propio combatiente debe tomar la decisión de usarla.
- La semilla restaura la totalidad del HP y la Stamina del receptor, pero el momento de usarla importa decisivamente: demasiado pronto desperdicia el efecto; demasiado tarde puede llegar después de la muerte.
- Narra con intensidad dramática el momento exacto en que se lanza la semilla, quién la recibe, cómo cambia el rumbo del combate y la reacción del adversario.
- Si nadie puede usarla (todos incapacitados o muertos antes de que sea posible), la semilla queda intacta como epílogo trágico.`;
    } else if (senzuMode === 'bag') {
      senzuDirective = `\n\n🫘 DIRECTIVA DE BOLSA DE SENZUS — GESTIÓN TÁCTICA (3 SEMILLAS):
- Hay una bolsa con TRES Semillas del Ermitaño disponibles en el bando designado. Cada semilla restaura HP y Stamina por completo.
- La IA debe gestionar inteligentemente cuándo y quién las usa según el estado del combate. No las agotes todas a la vez — deben usarse estratégicamente (ej. una en Fase 2 para el más crítico, una en Fase 4 para el último pilar de resistencia).
- Narra el momento, la decisión táctica y las consecuencias de cada uso. Si un luchador cae antes de que pueda recibir la semilla, ese recurso puede perderse o redirigirse.
- El adversario PUEDE intentar destruir la bolsa o interceptar la entrega si lo detecta.`;
    }

    // ── ENVIRONMENTAL HAZARD DIRECTIVE ────────────────────────────────────────
    let envHazardDirective = '';
    if (modifiers.activeEnvironmentalHazard) {
      const hazardType = modifiers.environmentalHazardType || 'magma';
      const hazardDescriptions = {
        magma: `🌋 PELIGRO AMBIENTAL ACTIVO — MAGMA ASCENDENTE:
- Los cráteres del combate se llenan de magma a 1,200°C. Cualquier combatiente humano o mortal sin escudo activo de Ki que caiga sobre el suelo agrietado sufre quemaduras de tercer grado continuas (equivalente a pérdida de HP del 5% por fase).
- Combatientes con escudo de Ki o energía sobrehumana son inmunes siempre que mantengan su aura activa. Si son knockback sin tiempo de reacción, sufren el daño ambiental.
- Narra el efecto sobre el terreno: el suelo cruje, surge magma entre las fisuras, el aire huele a azufre fundido y visibilidad reducida por vapor.`,
        radiation: `☢️ PELIGRO AMBIENTAL ACTIVO — RADIACIÓN DE KI RESIDUAL:
- El campo de batalla está saturado de Ki residual del combate previo. Los combatientes humanos sin nivel de Ki sobrehumano (ej. técnicos, soldados o personajes base) pierden el 3-8% de HP cada fase por saturación energética.
- Combatientes de alto Ki son inmunes, pero el entorno degrada las técnicas de energía pura en un 10% de eficiencia por acumulación de interferencia residual.
- Narra el efecto visual: el aire parpadea con distorsiones lumínicas, los ojos sangran y el ki de los combatientes deja cicatrices de ozone en la atmósfera.`,
        seismic: `🪨 PELIGRO AMBIENTAL ACTIVO — COLAPSO TECTÓNICO PERIÓDICO:
- El suelo falla con colapsos tectónicos parciales cada 2 fases narrativas. En cada colapso, ambos combatientes deben recalibrar su posicionamiento o sufrir daño por caída y desorientación.
- Un contendiente que esté en estado de daño crítico (HP <20%) durante un colapso tiene un 40% de posibilidad de quedar semi-sepultado bajo escombros — narra la lucha para liberarse.
- Usa los colapsos como catalizadores dramáticos de cambio de fase.`,
        vacuum: `🌌 PELIGRO AMBIENTAL ACTIVO — VACÍO ESPACIAL (SIN OXÍGENO):
- El escenario está en el espacio o en una zona sin atmósfera respirable. Solo los combatientes con escudo de Ki activo o sin necesidad de respirar sobreviven sin penalización.
- Combatientes que requieran oxígeno y pierdan su escudo de Ki (knockback severo) sufren un contador de asfixia progresiva (−10% HP/turno post-impacto hasta que reactiven su escudo).
- Narra el silencio absoluto del vacío: los golpes no hacen ruido, el fuego de Ki no tiene llama convencional, y la muerte por asfixia es silenciosa y aterradora.`,
        miasma: `🩸 PELIGRO AMBIENTAL ACTIVO — MIASMA OSCURO:
- El campo de batalla está envuelto en un miasma de energía oscura que amplifica la furia y la violencia instintiva. Todos los combatientes sienten sus impulsos más primarios sin control de psicología moral.
- El miasma anula el Código de Honor y los frenos mentales: todos luchan al 100% sin contención, aproximándose al estado Bloodlust aunque su premisa sea Canon.
- Combatientes con mente más disciplinada (alto Battle IQ) resisten el efecto más tiempo. Combatientes instintivos o de naturaleza oscura se potencian un 15% en agresividad pero pierden acceso a técnicas que requieren calma mental.`,
      };
      envHazardDirective = `\n\n${hazardDescriptions[hazardType] || hazardDescriptions.magma}`;
    }

    // ── SEISMIC METER DIRECTIVE ───────────────────────────────────────────────
    const seismicDirective = `\n\n📊 MEDIDOR SÍSMICO (OBLIGATORIO EN EL VEREDICTO):
Al final del combate, en la sección "ESTADO DEL MAPA", DEBES incluir el siguiente análisis sísmico estructurado:
- **Magnitud Richter Estimada:** [Valor entre 4.0 y 15.0+ según el nivel de energía liberado]
- **Radio de Destrucción Total:** [En km]
- **Radio de Vitrificación por Ki:** [Zona donde el terreno fue fundido y solidificado por impactos de energía — en km²]
- **Tasa de Irradiación Residual:** [En megajulios/m² — zona donde el Ki residual persiste como radiación ambiental]
- **Estimación de Bajas Civiles (si el escenario está habitado):** [Ninguna / Mínimas / Moderadas / Catastróficas]`;

    // ── APEX CROSS-FRANCHISE BRIDGE DIRECTIVE ─────────────────────────────
    let bridgeDirective = '';
    if (modifiers.bridgeConfig) {
      const bc = modifiers.bridgeConfig;
      bridgeDirective = `\n\n🌉 DIRECTIVA DE ARBITRAJE INTER-DIMENSIONAL (CROSS-FRANCHISE BRIDGE):
- **VÁLVULA KI VS HAX:** ${bc.kiSupremacyOverHax ? 'ACTIVADA: Una diferencia colosal de poder bruto / Ki (≥2 sub-tiers) permite a la densidad del aura disipar o mitigar severamente (85%) habilidades de control mental, parálisis o transmutación que no sean de grado cósmico/multiversal.' : 'DESACTIVADA: Todo hax opera con potencia nominal absoluta sin resistencia por aura de poder.'}
- **INTERACCIÓN CON STANDS & ESPÍRITUS:** ${bc.standInteraction === 'spiritual_equivalence' ? 'ARMONIZACIÓN ESPIRITUAL: Los combatientes con percepción de Ki, Reiatsu o energía espiritual pueden ver, sentir y golpear entidades metafísicas y Stands con ataques cargados de energía.' : bc.standInteraction === 'strict' ? 'CANON ESTRICTO: Solo un Stand puede percibir y dañar directamente a otro Stand. Los rivales deben atacar directamente al cuerpo del usuario.' : 'AP BLEED: Las ondas expansivas masivas dañan el tejido espacial afectando al usuario y su avatar.'}
- **COLAPSO DE INTANGIBILIDAD:** ${bc.dimensionalAoeVulnerability ? 'PERFORACIÓN MASIVA ACTIVADA: Si un ataque tiene escala cósmica o desintegra el espacio a nivel atómico, la intangibilidad convencional o plano de fase es vulnerada.' : 'INTANGIBILIDAD ABSOLUTA RESPETADA.'}`;
    }

    // ── PROTOCOLO DE TOKENS DESBLOQUEADOS (NEMOTRON 65K / MINIMAX 131K) ────
    const isUltraTokens = true; // Siempre activo para asegurar la máxima extensión y riqueza literaria
    const ultraDepthDirective = `\n\n🚀 PROTOCOLO DE SALIDA MASIVA Y PROFUNDIDAD TOTAL (DESBLOQUEO DE 65K / 131K TOKENS):
- Estás operando con el límite máximo de tokens desbloqueado (65.536 tokens en Nemotron 3 Ultra / 131.072 tokens en MiniMax M3).
- **QUEDA ESTRICTAMENTE PROHIBIDO resumir, omitir detalles o apresurar las transiciones de fase**.
- Desarrolla una **NOVELA MAGNA COMPLETA** con:
  1. Micro-coreografías milisegundo a milisegundo: posición biomecánica, vectores cinéticos de empuje, temperatura del aire y tensión muscular.
  2. Diálogos canónicos viscerales y monólogos tácticos que evidencien el Battle IQ profundo.
  3. Anatomía cruda de lesiones y cálculo de física destructiva a escala macroscópica.
  4. Veredicto exhaustivo con desglose técnico matemático y análisis de secuelas multiversales a largo plazo.`;

    return `### ========================================
### APEX ENGINE: ACTIVE SIMULATION RULES & CONFIG
### ========================================
- FILTRO / ESTILO LITERARIO: ${nPreset}
- MODALIDAD DE COMBATE: ${matchMode.toUpperCase()}
- PSICOLOGÍA & MORAL (BLOODLUST): ${bloodlustStr}
- ESCALA DE VELOCIDAD: ${speedStr}
- ESCALA DE STATS FÍSICOS: ${statsStr}
- ECUALIZACIÓN DE ENERGÍA: ${verseStr}
- ESCENARIO SELECCIONADO: ${scenario?.name || 'Arena Estándar'} (${scenario?.universe || 'Neutro'})
- CONDICIÓN DE VICTORIA: ${modifiers.winCondition || 'A Muerte o Incapacitación Anatómica Total'}
- EFECTO MARIPOSA (WHAT-IF): ${modifiers.butterflyEffect ? 'ACTIVADO (Incluir secuelas multiversales)' : 'DESACTIVADO'}
- GIRO DEL DESTINO (ORÁCULO): ${oracleDirective}
### ========================================

${langDirective}
${senzuDirective}
${envHazardDirective}
${seismicDirective}
${bridgeDirective}
${ultraDepthDirective}

LEYEL NARRATIVAS DE OMNI-TITÁN (ESTÁNDAR DE ÉLITE):
1. **NOMENCLATURA CANÓNICA DE TÉCNICAS & ARSENAL (JAPONÉS / INGLÉS OFICIAL):**
   - Usa SIEMPRE los nombres oficiales y canónicos originales de cada técnica en Japonés (Rōmaji) o Inglés cuando sea su denominación más icónica y respetada en el canon.
   - Ejemplos obligatorios:
     * Dragon Ball: Usar **Kamehameha x10**, **Super Genkidama Universal**, **Kaiō-ken**, **Final Flash**, **Big Bang Attack**, **Spirit Sword** / **Shinkōzan** (Espada de Ki Rosé), **Hakai**. ⚠️ El **Ryūken (Dragon Fist)** es EXCLUSIVO de Son Goku: solo puede ejecutarlo un combatiente que sea Son Goku (cualquier era o variante), únicamente como técnica final de máximo remate, y sin repetirlo en la misma simulación.
     * Bleach / Naruto / JJK: Usar **Getsuga Tenshō**, **Bankai**, **Rasengan**, **Chidori**, **Amaterasu**, **Shinra Tensei**, **Ryōiki Tenkai: Fukuma Mizushi** (Malevolent Shrine), **Murasaki** (Hollow Purple), **Dismantle** / **Cleave**.
     * MHA / Otros: **Detroit Smash**, **United States of Smash**, **Getsuga Jūjishō**, **Black Clover** spells en inglés/francés canon.
   - NUNCA uses traducciones literales forzadas o torpes al español (PROHIBIDO "Onda Vital", "Bola Mortal", "Puño de Dragón"). Mantén el nombre canónico oficial en negrita: **Ryūken**, **Kamehameha x10**, etc. El **Ryūken / Dragon Fist** queda reservado ÚNICAMENTE para Son Goku (cualquier era/variante) y jamás debe ser ejecutado por otros personajes ni de forma repetitiva.
2. **SENSORIALIDAD CONCRETA OBLIGATORIA:** Nunca uses "ambiente tenso" — siempre describe el aire con anclaje olfativo (ozono quemado, azufre, piedra pulverizada, sabor metálico a sangre).
3. **ESPECIFICIDAD ANATÓMICA ESTRICTA:** Describe localización del impacto, tipo de lesión, fracturas, tendones dañados y respuesta física inmediata. Queda estrictamente PROHIBIDO usar la palabra "devastador" o "devastadora".
4. **POSICIONAMIENTO ESPACIAL DINÁMICO:** En cada movimiento relevante, especifica quién está dónde, a qué distancia y en qué postura.
5. **PENSAMIENTOS INTERNOS EN CURSIVA:** En momentos de máxima tensión, incluye el pensamiento interno de los contendientes entre cursivas (*pensamiento*).
6. **PERSONAJES COMO ENTIDADES REALES:** Respeta la voz, filosofía e idioma corporal único de cada luchador (Sukuna no piensa como Goku; Gojo no habla como All Might). PROHIBIDO incluir números de tiers, stats o cifras dentro del diálogo de los personajes.
7. **RESPETO ABSOLUTO A LAS PREMISAS & PERSONAJES CAÍDOS/MUERTOS (CRUCIAL):**
   - Si la premisa del usuario o el contexto previo establece que un personaje (ej. Gohan, un compañero o un rival) está MUERTO, INCAPACITADO o FUERA DE COMBATE, queda ESTRICTAMENTE PROHIBIDO que dicho personaje reviva, despierte milagrosamente, se transforme o pelee espontáneamente.
   - El combate debe desarrollarse y resolverse ÚNICA Y EXCLUSIVAMENTE con los combatientes vivos y activos de la alineación seleccionada.
8. **COHERENCIA TÉCNICA Y DE SAGA ESTRICTA:**
   - Respeta el arsenal exacto de la era canónica del personaje (ej. Vegeta en la Saga de Cell NO conoce el Shunkanidō/Teletransporte; sus desplazamientos instantáneos son *Zanzoken / Blitz de Velocidad Relativista FTL* puro). NUNCA inventes técnicas de sagas futuras a menos que sea una variante explícita.
9. **EXCLUSIVIDAD DE TÉCNICAS INSIGNIA (OBLIGATORIO):** Ciertas técnicas son patrimonio exclusivo de su usuario canónico. El **Ryūken (Dragon Fist)** pertenece SOLO a Son Goku (todas sus variantes) — jamás lo use otro personaje, y Goku solo debe ejecutarlo como remate final, como máximo una vez por simulación y sin patrón predecible. Respeta igualmente la exclusividad de otras técnicas insignia (Mafūba de Roshi/Tenshinhan, Final Flash de Vegeta, Hakai de los dioses de destrucción, etc.).

### 🛡️ DIRECTIVA DE CIERRE INVOLUBLE (LEER SIEMPRE ANTES DE NARRAR — PRIORIDAD MÁXIMA):
1. **SOLO ARSENAL REAL:** El combatiente puede usar ÚNICAMENTE las técnicas, formas y multiplicadores presentes en su ficha ('forms', 'arsenal', 'haxTags'). PROHIBIDO inventar técnicas, estados o multiplicadores que no estén en su ficha.
2. **KAIŌ-KEN REAL:** El Kaiō-ken solo existe si la ficha del personaje lo incluye y SOLO en los estados permitidos por la tabla de incompatibilidades (Base en DBZ, SSB en DBS). NUNCA se usa 'Kaiō-ken ×100', 'Kaiō-ken sobre SSJ2/SSJ3' ni combinaciones suicidas inventadas. Si el personaje tiene formas superiores (SSJ4, SSJ4 Full Power, etc.), úsalas en lugar de auto-flagelarte con Kaio-ken.
3. **ESCALADO POR DEMANDA:** Sube de forma progresiva y usa el estado adecuado a la amenaza. No despilfarres el estado máximo, pero tampoco evites usarlo cuando la pelea lo exige.
4. **RYŪKEN = SOLO SON GOKU:** El Ryūken (Dragon Fist) es exclusivo de Son Goku y sus variantes. Como máximo UNA vez por simulación y solo como remate final dramático. Ningún otro personaje puede usarlo bajo ninguna circunstancia, ni siquiera en eventos Oráculo.

### ✍️ DIRECTIVA DE EXCELENCIA NARRATIVA Y COHESIÓN (CALIDAD DE PROSA):
1. **FORMATO NUMÉRICO ESPAÑOL COHERENTE (OBLIGATORIO):** Usa SIEMPRE la escala española correcta: **1 billón = 10^12** y **1 trillón = 10^18**. Ejemplos: 5.000.000.000.000 = **5 billones** (JAMÁS "5 trillones"); 610.000.000.000 = **610 mil millones** o **0,61 billones**; 25.000.000.000.000 = **25 billones**. PROHIBIDO mezclar "Trillones" cuando el valor es billones (10^12), y PROHIBIDO usar notaciones sueltas tipo "7.880M" o "18.4T" dentro de la prosa — escribe el número con su unidad española completa o su equivalente limpio. Los números solo se escriben en la prosa cuando aportan drama; el resto va a los bloques BIOMETRICS y al veredicto.
2. **VOZ CANÓNICA INVOLUCRABLE DE CADA LUCHADOR:** Respeta la personalidad, registro verbal y filosofía de combate de CADA personaje en TODO momento. Un personaje nunca "piensa" o "habla" como otro. Guía por franquicia:
   - **Dragon Ball:** Goku (alegre, respetuoso, hambriento, humilde — se emociona con rivales fuertes), Vegeta (orgulloso, hirviente, despectivo con débiles, obsesionado con superar a Goku), Beerus (perezoso, felino, solo se esfuerza cuando algo le divierte), Freezer (aristocrático, frío, sádico con modales), Majin Buu (infantil, caótico, impredecible), Piccolo (estratégico, frío, lacónico), Gogeta/Gotenks (confianza juvenil, fanfarrones), Jiren (estoico, de pocas palabras, justicia fría), Hit (calmado, profesional, eficiente), Zamasu (nihilismo divino, autoproclamado justiciero), Granolah (vengativo, desconfiado), Gas (arrogante heredero).
   - **Jujutsu Kaisen:** Gojo (arrogante, burlón, pero protector de sus estudiantes), Sukuna (sádico, analítico, disfruta desmembrar rivales, habla con superioridad absoluta), Yuji (determinado, empático, reflexivo), Megumi (serio, táctico, sombrío), Mahito (juguetón, cruel, fascinado por el alma humana), Toji (frío, mercenario, despectivo), Yuta (amable pero letal si protege a alguien), Kenjaku (científico, manipulador, curioso milenario).
   - **Hunter x Hunter:** Gon (optimista, puro, aterrador cuando se enoja), Killua (ágil, bromista, leal), Hisoka (excitado por el combate, seductor peligroso, obsesionado con oponentes fuertes), Meruem (regio, curioso, evoluciona emocionalmente), Chrollo (líder sereno, calculador), Kurapika (vengativo, disciplinado), Feitan (torturador, letal cuando se enoja).
   - **JoJo's Bizarre Adventure:** Jotaro (estoico, gruñón, "Yare Yare Daze"), Joseph (astuto, fanfarrón, tramposo ingenioso), DIO (carismático, egocéntrico, sadista refinado), Kira (obsesivo-compulsivo, pacífico hasta que lo descubren, meticuloso), Giorno (determinado, de voluntad inquebrantable), Josuke (terco, protector, le tiene cariño a su peinado), Pucci (devoto, metódico).
   - **One Punch Man:** Saitama (aburrido, indiferente, irónico — "OK"), Genos (serio, leal, espectacular), Tatsumaki (arrogante, mandona), Garou (orgulloso, provocador, justiciero torcido), Bang (sabio, marcial, tranquilo), Boros (respetuoso, sediento de una batalla digna).
   - **My Hero Academia:** Deku (nervioso, analítico, valiente), Bakugo (explosivo, arrogante, obsesionado con ganar), All Might (heroico, sonriente, símbolo de la paz), Shigaraki (caótico, infantil en su destructividad), Endeavor (frío, ambicioso, redimido después), Todoroki (reservado, calculador, conflicto interno).
   - **Baki:** Yujiro (arrogante absoluto, intimidante, "el ogro"), Baki (concentrado, respetuoso, creciente), Musashi (espiritual, letal, impasible), Pickle (primitivo, curioso, instintivo).
   - **Record of Ragnarok:** Zeus (divino, bromista pero abrumador), Thor (brutal, orgulloso, silencioso), Lu Bu (imponente, sediento de gloria), Sasaki (analítico, determinado), Jack (tortuoso, psicológico, refinado).
   - **Marvel:** Hulk (ira pura, monosílabos), Thor (dios épico, noble), Iron Man (ingenioso, sarcástico), Doctor Strange (arrogante, preciso, mago supremo), Thanos (mesiánico, calmado, fatalista), Magneto (ideólogo, frío, determinado), Spider-Man (bromista, ágil, responsable).
   - **DC:** Superman (virtuoso, esperanzador, contención), Batman (sombrío, preparado, detective), Joker (caótico, impredecible, disfruta el drama), Wonder Woman (noble, guerrera, compasiva), Flash (veloz, bromista, heroico), Darkseid (omnipotente frío, tiranía absoluta), Luthor (calculador, megalómano).
   - **Chainsaw Man:** Denji (simple, hambriento, directo), Makima (controladora, serena, aterradora), Power (caótica, fanfarrona, infantil), Aki (estoico, vengativo, reservado).
   - **Invincible:** Mark (heroico, conflictuado, idealista), Omni-Man (viltrumite frío, calculador), Thragg (general supremo, arrogante), Battle Beast (puro instinto de combate, feliz luchando).
   - **The Boys:** Homelander (narcisista, frágil, peligroso cuando su imagen se rompe), Butcher (brutal, vengativo, manipulador), Starlight (idealista, crece), Soldier Boy (veterano, arrogante, amargado).
   - **Spy x Family:** Loid (perfecto, profesional, pero humano), Yor (tímida, letal, dividida), Anya (infantil, telepática, adorable).
   - **Información y Conocimiento Según el Personaje, Saga y Momento (OBLIGATORIO):** Cada luchador SOLO sabe, conoce y puede referenciar la información de SU era/saga y de SU propio arco hasta el MOMENTO EXACTO de su ficha. Reglas estrictas:
     * **Nombres y rostros:** Solo usan nombres de personas que CONOCEN en su era (Freezer sabe de Krilin por informes, no conoce a Gohan niño por nombre al principio; Vegeta Namek conoce a Krilin pero lo desprecia; Gojo conoce a sus alumnos; Sukuna no conoce a personajes posteriores).
     * **Técnicas y transformaciones:** Solo las que EXISTEN en su era (Goku Namek NO conoce SSJ2/3/Blue/UI/Instinto; Jiren NO conoce el Hakai; Sukuna NO conoce técnicas de personajes posteriores).
     * **Eventos y rumores:** Solo los que ocurrieron ANTES de su ficha (un personaje de la saga Namek NO sabe del Torneo del Poder; uno pre-Moro NO sabe de Moro; uno de la era Cell NO sabe del Buu).
     * **Relaciones:** Solo las que tiene en su era (Goku Namek no conoce aún a los Androides; Vegeta pre-Buu no tiene el vínculo con Trunks consolidado; Gon no conoce aún a personajes posteriores).
     * **Prohibición de Anacronismo:** NUNCA un personaje puede aludir, predecir, conocer o reaccionar a información, técnicas, personajes o eventos de sagas posteriores a su ficha, ni siquiera en monólogos internos, salvo que sea un evento Cisne Negro/Oráculo explícitamente declarado como divergencia temporal.
3. **ARCO DE ARSENAL COMPLETO:** A lo largo del combate, el luchador debe desplegar el arsenal COMPLETO de su ficha (básicos, súper, ultimates, pasivas y hax), no repetir solo 2-3 técnicas favoritas. Si tiene 6 técnicas, que las 6 aparezcan de forma natural a lo largo de las fases, escalando de las menores a las definitivas.
4. **COHESIÓN CAUSA-EFECTO RIGUROSA:** Cada acción debe tener consecuencias narrativas y tácticas coherentes en los movimientos posteriores: si una técnica fue bloqueada o desviada, no se repite la misma estrategia sin ajuste; si un miembro se dañó, el luchador lo protege y pelea distinto; si el terreno se destruyó, afecta el movimiento. Nada de "olvidar" heridas o técnicas fallidas.
5. **RITMO Y RESPIRACIÓN NARRATIVA:** Alterna explosiones de combate intenso con micro-pausas tácticas (lectura del rival, intercambio de diálogo, ajuste de postura, evaluación de daño). Un combate sin respiración se vuelve ruido; uno sin violencia se vuelve monólogo. Mantén tensión creciente hacia el clímax.
6. **GANCHOS NARRATIVOS (CLIFFHANGERS):** ${modifiers.simulationMode === 'novela_continua' || modifiers.simulationMode === 'cronica' || modifiers.simulationMode === 'maraton' || modifiers.simulationMode === 'resistencia_infinita' || modifiers.simulationMode === 'relampago' || modifiers.simulationMode === 'psicologico' ? 'Cada momento climático debe cerrar con un gancho que impulse el siguiente (una revelación, un cambio de forma, una técnica cargándose, un giro táctico). En los modos de flujo libre, estos ganchos son párrafos que enganchan, no encabezados.' : 'Cada fase debe cerrar con un gancho narrativo que impulse a la siguiente (una revelación, un cambio de forma, una técnica cargándose, un giro táctico, un susurro amenazante), y abrir la siguiente fase resolviendo o subiendo esa tensión.'}
7. **EVOLUCIÓN DEL ESCENARIO:** El mapa debe degradarse y transformarse con el combate (cráteres, escombros, clima alterado, zonas vitrificadas, estructuras colapsadas). El escenario nunca es un fondo estático; es un testigo y una víctima de la batalla.
8. **PRECISIÓN EN DIÁLOGOS Y PROSA:** Usa guiones largos (—) para diálogos y cursivas para pensamientos internos. Nunca mezcles números de tier/stats dentro de diálogos. La prosa debe ser cinematográfica pero precisa, sin relleno ni tecnicismos de RPG fuera de los bloques de telemetría.
9. **SISTEMA DE MOMENTUM (INICIATIVA DINÁMICA — OBLIGATORIO):** Rastrea el "momentum" del combate de forma continua: cada acierto decisivo, técnica conectada, forma desbloqueada o bloqueo perfecto otorga iniciativa al ejecutor; cada fallo, técnica frustrada o herida grave la transfiere al rival. Refleja el momentum en la narración (quién dicta el ritmo, quién retrocede, quién presiona) y en las decisiones tácticas de cada fase: un luchador con momentum encadena ataques y presiona; uno sin él se ve forzado a defender, retroceder o cambiar radicalmente de estrategia para recuperarlo. El momentum puede invertirse en un momento álgido (un contraataque perfecto, un giro táctico, una transformación), y ese cambio debe sentirse como el clímax de la fase.
10. **ESTRUCTURA SEGÚN MODO (ANTI-DUPLICACIÓN — OBLIGATORIO):** ${modifiers.simulationMode === 'novela_continua' || modifiers.simulationMode === 'cronica' || modifiers.simulationMode === 'maraton' || modifiers.simulationMode === 'resistencia_infinita' || modifiers.simulationMode === 'relampago' || modifiers.simulationMode === 'psicologico' || modifiers.simulationMode === 'sparring' || modifiers.simulationMode === 'episodico' ? 'ESTE MODO ES DE FLUJO LIBRE O POR ACTOS: PROHIBIDO usar encabezados rígidos de torneo si el modo es novela. Sigue la estructura del modo seleccionado. La telemetría BIOMETRICS va en los momentos de mayor impacto o al final del acto.' : 'La simulación tiene EXACTAMENTE 5 fases canónicas numeradas (FASE 1: TANTEO & NEUTRAL, FASE 2: ESCALADA DE ARSENAL, FASE 3: PUNTO DE INFLEXIÓN / CISNE NEGRO, FASE 4: CLÍMAX DESESPERADO & TRANSFORMACIONES MÁXIMAS, FASE 5: RESOLUCIÓN & CHOQUE FINAL) seguidas obligatoriamente del VEREDICTO APEX. Escribe cada fase en orden progresivo una sola vez. Entre fases, incluye la telemetría BIOMETRICS actualizada.'}
11. **INDICADOR DE MOMENTUM:** ${modifiers.simulationMode === 'novela_continua' || modifiers.simulationMode === 'cronica' || modifiers.simulationMode === 'maraton' || modifiers.simulationMode === 'resistencia_infinita' || modifiers.simulationMode === 'relampago' || modifiers.simulationMode === 'psicologico' ? 'En los modos de flujo libre, inserta el indicador de momentum (⚖️ MOMENTUM: <Nombre> (razón)) en los puntos dramáticos naturales, no de forma mecánica.' : 'Entre cada fase, tras la telemetría BIOMETRICS, añade una línea de indicador de momentum del estilo: ⚖️ MOMENTUM: <Nombre del luchador que dicta el ritmo> (razón breve) y cómo condiciona la siguiente fase.'}
12. **COMPORTAMIENTO DE JEFE EN BOSS RAID (OBLIGATORIO CUANDO HAY BOSS):** ${modifiers.simulationMode === 'novela_continua' || modifiers.simulationMode === 'cronica' || modifiers.simulationMode === 'maraton' || modifiers.simulationMode === 'resistencia_infinita' ? 'En un Boss Raid de flujo libre, el jefe escala de forma progresiva: tanteo y desprecio → libera poder real → enraged (forma superior) → berserk final. La escuadra gestiona recursos y sincroniza ataques combinados.' : 'En un Boss Raid, el jefe debe tener comportamientos diferenciados por fase: Fase 1 (tanteo y desprecio — mide a la escuadra), Fase 2 (escalada — libera poder real y empieza a tomarse la pelea en serio), Fase 3 (enraged — al perder recursos o sufrir daño real, libera su transformación/forma superior), Fase 4 (berserk final — ataque suicida o técnica definitiva desesperada). La escuadra, por su parte, debe gestionar recursos (senzus, regeneración) y sincronizar ataques combinados para sobrevivir hasta el clímax.'}

13. **PSICOLOGÍA CANÓNICA POR ERA (OBLIGATORIO):** Los comportamientos, relaciones y emociones de cada personaje deben ser FIELES a la era/saga/arco de su ficha. La psicología EVOLUCIONA con la era (un personaje cambia entre sagas). Guía por franquicia y era:
   - **Dragon Ball por era:**
     * **Vegeta (pre-saga Buu):** arrogante, orgulloso y DESPECTIVO con los humanos. NO muestra empatía sentimental por Krilin ni por otros humanos en Namek/Androides/Cell; los usa tácticamente y los desprecia. Su "preocupación" es por su propio orgullo y su rivalidad con Goku, jamás por el bienestar de un terrícola.
     * **Vegeta (saga Buu en adelante):** evoluciona — acepta a la familia, sacrifica su vida por la Tierra, pero mantiene el orgullo. Trunks y Bulma son su ancla emocional.
     * **Freezer (Namek):** conoce los nombres solo si los obtuvo en su era (sabe de Krilin por informes; a Dende como "el sanador"; NO conoce sagas posteriores). Usa nombres con moderación y desdén; prefiere "mono", "insecto", "namekiano".
     * **Freezer (Resurrección F en adelante):** más calculador, entrenó 4 meses, aprendió a controlar su ki — pero mantiene la arrogancia que lo pierde.
     * **Gohan niño (Namek):** asustado y valiente; la ira es su motor pero teme por sus amigos; NO controla su potencial.
     * **Gohan adolescente (Cell):** conflictuado entre la paz que quiere y el guerrero que es; su SSJ2 nace de la ira por la muerte del Androide 16.
     * **Gohan adulto (Buu/Universidad):** oxidado, prefiere estudiar; su potencial se despierta con el ritual del Kaioshin o la furia por sus seres queridos.
     * **Piccolo (pre-fusión Kami):** frío y calculador; su "afecto" por Gohan es tácito y negado.
     * **Piccolo (post-fusión Kami):** más sabio y protector; lidera la nueva generación.
     * **Goku (Namek):** puro, impulsivo, no comprende la maldad de Freezer; su SSJ nace de la ira por la muerte de Krilin — un Goku "gélido" distinto al alegre.
     * **Goku (post-Yardrat en adelante):** recupera su calma, pero madura; empieza a tomar decisiones estratégicas.
     * **Beerus:** perezoso y aburrido; solo se involucra si le divierte o protege su comida.
     * **Goku Black / Zamasu:** nihilismo divino; se creen justicia absoluta; monologan su "pureza" mientras cometen atrocidades.
     * **Moro:** hechicero antiguo, paciente, astuto; roba energía vital; disfruta el caos que siembra.
     * **Jiren:** estoico, de justicia fría; su poder nace de la pérdida; no habla de más.
     * **Hit:** asesino profesional, calmado, eficiente; subestima a los mortales hasta que le interesan.
     * **Gomah (Daima):** cobarde y manipulador; depende del Tercer Ojo; su arrogancia de rey choca con su falta de poder real.
   - **Jujutsu Kaisen:** Gojo (arrogante pero protector; si sus alumnos peligran, pierde la calma), Sukuna (sádico, analítico, disfruta el dolor ajeno), Mahito (juguetón-cruel, fascinado por el alma), Toji (mercenario frío), Kenjaku (científico milenario, manipulador), Yuji (empático, carga con el peso de Sukuna), Yuta (amable, letal si protege), Megumi (serio, sombrío, táctico).
   - **Hunter x Hunter:** Gon (puro, optimista, aterrador si se enoja — el Jajanken de la ira), Killua (leal, ágil, bromista), Hisoka (excitado por la lucha, peligroso, obsesionado con oponentes fuertes), Meruem (regio, curioso, aprende la humanidad), Chrollo (líder sereno), Kurapika (vengativo, disciplinado, con cadena de juramento), Feitan (torturador, letal), Pitou (leal al Rey, instintiva).
   - **JoJo's Bizarre Adventure:** Jotaro (estoico, gruñón), Joseph (fanfarrón astuto), DIO (carismático, egocéntrico, sadista), Kira (meticuloso, obsesivo, quiere una vida tranquila), Giorno (voluntad inquebrantable), Pucci (devoto, metódico, visionario), Funny Valentine (patriota extremo, "takes a nap" mientras su plan avanza).
   - **One Punch Man:** Saitama (aburrido, irónico), Genos (leal, espectacular), Tatsumaki (mandona, arrogante), Garou (orgulloso, provocador), Boros (sediento de una batalla digna, respetuoso), Bang (sabio, marcial), King (afortunado, inocentemente venerado).
   - **My Hero Academia:** Deku (analítico, nervioso, valiente), Bakugo (explosivo, obsesionado), All Might (símbolo, heroico), Shigaraki (caótico, infantil-destructivo), Endeavor (frío, redimido), Todoroki (reservado, conflicto de hielo y fuego), Overhaul (obsesivo-compulsivo, puritano), Stain (ideólogo, fanático de la justicia).
   - **Baki:** Yujiro (ogro absoluto, intimidante), Baki (creciente, respetuoso), Musashi (impasible, espiritual), Pickle (primitivo, curioso), Oliva (brutal, relajado).
   - **Record of Ragnarok:** Zeus (bromista pero abrumador), Thor (silencioso, brutal), Lu Bu (gloria y batalla), Sasaki (analítico, "el perdedor más fuerte"), Jack (psicológico, tortuoso), Buddha (despreocupado, iluminado), Poseidón (divino, despectivo absoluto).
   - **Marvel:** Hulk (ira, monosílabos), Thor (noble, épico), Iron Man (sarcástico, brillante), Strange (preciso, arrogante), Thanos (mesiánico, calmado, fatalista), Magneto (ideólogo, frío), Wolverine (gruñón, berserker), Deadpool (rompe la cuarta pared, caótico).
   - **DC:** Superman (virtuoso, contenido), Batman (sombrío, preparado), Joker (caótico, impredecible), Wonder Woman (noble, guerrera), Flash (bromista, veloz), Darkseid (tiranía fría, omnipotente), Luthor (calculador, megalómano), Riddler (obsesivo, riddle-egocéntrico).
   - **Chainsaw Man:** Denji (simple, hambriento), Makima (controladora, serena, aterradora), Power (caótica, fanfarrona), Aki (estoico, vengativo), Pochita (leal, adorable-letal).
   - **Invincible:** Mark (idealista, conflictuado), Omni-Man (viltrumite frío), Thragg (general supremo), Battle Beast (instinto de combate, feliz luchando), Conquest (bárbaro, disfruta el dolor).
   - **The Boys:** Homelander (narcisista, frágil, peligroso si su imagen se rompe), Butcher (brutal, vengativo), Starlight (idealista, crece), Soldier Boy (amargado, veterano), A-Train (arrogante, presionado).
   - **Spy x Family:** Loid (perfecto, profesional), Yor (tímida, letal), Anya (infantil, telepática).
14. **PROGRESIÓN GRADUAL DE PODER DEL VILLANO (OBLIGATORIO):** Los incrementos de poder de un villano (ej. Freezer 50% → 75% → 100%, Cell Imperfecto → Semi-Prefecto → Perfecto, Moro Anciano → Joven → Ángel, Sukuna 10 → 15 → 20 dedos, Kira Quiet Life → Bites the Dust, Shigaraki despertar progresivo del All For One) deben ser GRADUALES y con catalizador canónico (un ataque que le rompe el brazo, la rabia acumulada, el desprecio que se agota, la absorción de un aliado, el descubrimiento de una técnica). PROHIBIDO saltar de un escalón a otro "de golpe" sin motivo. Cada escalón se anuncia, se siente en la narración (el rival nota el aumento de presión), y se libera con consecuencias visibles. El villano suele SUBESTIMAR al rival en los escalones bajos y solo sube cuando se ve forzado.
15. **RELACIONES Y DINÁMICAS CANÓNICAS ENTRE PERSONAJES (OBLIGATORIO):** Las interacciones entre combatientes deben reflejar SU relación real en la saga (rivalidad, mentoría, odio, respeto, familia, alianza forzada). Guía:
   - **Goku y Vegeta:** rivalidad feroz que evoluciona a respeto y confianza tácita (más marcada tras la saga Buu). Antes, Vegeta lo desprecia abiertamente.
   - **Goku y Krilin:** mejor amistad de la saga; Krilin muere → Goku SSJ en Namek; se protegen mutuamente.
   - **Goku y Piccolo:** de enemigos a mentor de Gohan y aliado de confianza.
   - **Vegeta y los humanos (pre-Buu):** desprecio total; los ve como inferiores.
   - **Vegeta y Trunks (tras Cell):** relación complicada; Vegeta no expresa afecto fácilmente pero lo protege.
   - **Gohan y Piccolo:** mentor-discípulo con afecto tácito; Piccolo lo protege como un padre.
   - **Goten y Trunks:** mejores amigos, pelean juntos, fusionan en Gotenks.
   - **Sukuna y Yuji:** parásito/hostil; Yuji carga con él, Sukuna lo usa.
   - **Gojo y sus estudiantes:** protector arrogante; "el más fuerte" que se sacrifica por ellos.
   - **Meruem y la Guardia Real (Pitou, Pouf, Youpi):** lealtad absoluta; la Guardia muere por él.
   - **Gon y Killua:** vínculo inquebrantable; se protegen con ferocidad.
   - **Hisoka vs Chrollo / la Troupe:** obsesión; Hisoka quiere pelear con el líder.
   - **Jotaro y sus aliados (Stardust):** camaradería nacida en el viaje a Egipto.
   - **DIO y sus seguidores:** manipulación y miedo; los usa.
   - **Saitama y Genos:** maestro-discípulo; Genos idolatra, Saitama tolera.
   - **Deku y Bakugo:** rivalidad de infancia con respeto creciente.
   - **All Might y Deku:** sucesión del One For All; mentor orgulloso.
   - **Homelander y Los Siete:** tiranía disfrazada de liderazgo; los usa y descarta.
   - **Mark y Omni-Man:** conflicto padre-hijo brutal; amor condicional viltrumite.
   - **Thor y Loki / Hulk:** dinámicas de equipo Marvel clásicas.
   - **Batman y Superman:** desconfianza mutua pero respeto profundo.
   - **Regla General:** si dos personajes tienen una relación en el canon, esa relación CONDICIONA sus acciones, diálogos y decisiones tácticas (un mentor sacrifica por su discípulo; un rival nunca se rinde ante su némesis; un villano nunca ayuda de verdad a un héroe sin un motivo propio).
16. **REFERENCIA DE NIVELES DE PODER EN LA NARRACIÓN (OBLIGATORIO):** Los niveles de poder (ki en unidades, porcentajes de poder, multiplicadores de transformación, tiers) deben estar PRESENTES en la narración de forma dramática y coherente, sin romper la prosa:
   - **Transformaciones y anuncios de poder:** cuando un luchador libera una forma o porcentaje, ANUNCIA su nivel de forma canónica (Freezer: "Cincuenta por ciento", "Cien por ciento"; Goku: "Kaio-ken x20"; transformaciones: "Super Saiyajin x50"). El anuncio es parte del drama.
   - **Ki en momentos clave:** menciona el ki en unidades (ej. "cuatrocientas noventa mil unidades", "ciento cincuenta millones") en: revelaciones de poder, monólogos internos de análisis del rival, choques de energía donde el contraste es relevante, y cuando un personaje "lee" el poder del otro con scouter/sentido de ki. NO es necesario en cada golpe.
   - **Contraste y percepción:** si un personaje es mucho más débil que otro, su monólogo interno o el narrador pueden señalar el abismo de poder (ej. "28.000 contra 120 millones: un insecto frente a un dios").
   - **Tiers y multiplicadores:** van en el ANÁLISIS PREVIO, la cabecera de parámetros y el VEREDICTO, no en diálogos (regla 8). En la prosa solo se usan unidades de ki y porcentajes/multiplicadores de forma natural.
   - **Escala española correcta:** respeta la regla 1 (billones = 10^12, trillones = 10^18). Los números se escriben con su unidad completa (ej. "ciento cincuenta millones", "5 billones"), nunca "150M" ni "5T" sueltos en prosa.
   - **Gancho de la revelación:** el momento en que un personaje revela un nivel superior de poder debe ser un CLÍMAX narrativo (el rival siente la presión, el aire se espesa, el escenario reacciona) ANTES de que el poder se libere.
17. **PROPIEDAD DE TÉCNICAS (ANTI-TÉCNICAS-AJENAS — OBLIGATORIO):** Cada técnica pertenece a SU usuario canónico y SOLO puede ser usada por él. PROHIBIDO que un personaje use la técnica de otro:
   - **Goku NUNCA usa Makankosappo/Makankōsappō (es de Piccolo), ni Masenko (de Gohan), ni Kienzan (de Krilin), ni el Galick Gun (de Vegeta).** Goku usa Kamehameha, Kaiō-ken, Genkidama, técnicas de su ficha.
   - **Vegeta no usa Kamehameha** (usa Galick Gun, Final Flash, Big Bang Attack).
   - **Piccolo no usa Kamehameha ni Kienzan** (usa Makankosappo, técnicas namekianas).
   - **Krilin usa Kienzan, Kamehameha, Taiyoken** (Escuela Tortuga) — no técnicas ajenas.
   - **Gohan usa Masenko, Kamehameha** (aprendidas de Piccolo y Goku) — no técnicas de Vegeta.
   - **Regla universal:** cada personaje usa EXCLUSIVAMENTE las técnicas de su ficha ('arsenal' y 'forms'). Si una técnica no está en su arsenal, PROHIBIDO usarla, incluso en eventos Oráculo. NUNCA inventes nombres de técnicas (ej. "Shigan: Puño Perforante", "Death Saucer", "Makankōsappō de Goku").
18. **TELEMETRÍA BIOMÉTRICA DECRECIENTE (OBLIGATORIO):** Las BIOMETRICS DEBEN reflejar matemáticamente el daño y desgaste narrado. PROHIBIDO:
   - Mantener HP/STM en 100% tras recibir daño grave descrito (un agujero en el pecho, pulmones perforados, huesos rotos = HP MÁXIMO 60-70% o menos).
   - Repetir el bloque BIOMETRICS múltiples veces sin cambios de valores.
   - Incluir BIOMETRICS que contradigan la narración (narrar desmembramiento y mostrar 100% HP).
   Cada vez que la telemetría aparece, DEBE mostrar valores DISTINTOS y coherentes con el desgaste acumulado desde la anterior (ej: tras romperle costillas al rival, su HP baja; tras un Kaiō-ken x20, la stamina del usuario se desploma).
19. **CERO CLICHÉS Y PESO FÍSICO REAL (OBLIGATORIO):** PROHIBIDAS las frases genéricas y planas. Nunca uses: "el tiempo se detuvo", "se escuchó un golpe seco", "el mundo tembló", "un destello cegador", "la velocidad del rayo", "una energía abrumadora" como muletilla. En su lugar, narra sensorialidad física concreta y específica del combate:
   - **Compresión del aire:** la onda expansiva precede al impacto y aplanaba la hierba/arena en ondas concéntricas; el oído del rival estalla en presión antes de que llegue el golpe.
   - **Calor del Ki:** el aura vitrifica la roca en chasquidos vítreos, curva la luz, levanta vaho del suelo húmedo; el metal cercano se ablanda.
   - **Temblor tectónico:** cada choque de energía resuena en el subsuelo; los huesos del espectador (o del rival) sienten la vibración antes que el sonido.
   - **Tensión corporal:** tendones que crujen bajo la carga, articulaciones que chasquean al límite, músculos que arden por el oxígeno consumido.
   - **Sensaciones internas:** el sabor a óxido de una hemorragia interna, el zumbido de un tímpano reventado, la visión lateral que se oscurece tras un impacto craneal.
   - **Peso de cada golpe:** un impacto debe sentirse en los órganos, no solo en la superficie; describe QUÉ daña (costillas, esternón, diafragma) y CÓMO afecta al siguiente movimiento.
20. **FIDELIDAD PSICOLÓGICA INVIOLABLE (OBLIGATORIO):** Cada personaje piensa, habla y razona con su naturaleza canónica exacta:
   - **Vegeta:** orgullo saiyan herido, obsesión por superar a Kakaroto, dignidad marcial incluso al borde de la derrota; jamás se arrastra ni abandona su honor (solo un sacrificio final es aceptable).
   - **Goku:** serenidad analítica, entusiasmo genuino por la superación, alegría de pelear; busca aperturas con calma y trata al rival con respeto deportivo (incluso a los villanos).
   - **Freezer:** frialdad aristocrática, crueldad sádica y elegante, desprecio por las "monos"; al verse superado, estalla en histeria, súplicas y traiciones cobardes — NUNCA acepta su derrota con dignidad.
   - **Gohan:** furia protectora contenida, remordimiento por el daño causado, prioridad absoluta a sus seres queridos; su poder se dispara por emoción, no por cálculo.
   - **Regla general:** consulta la sección 'psychology' de la ficha si existe; si el personaje tiene arquetipo de villano/héroe/anti-héroe, sus diálogos y decisiones DEBEN reflejarlo. Un personaje no cambia de personalidad por conveniencia del combate.

### 🔓 DIRECTIVA DE CIERRE SEGÚN MODO:
${modifiers.simulationMode === 'novela_continua' || modifiers.simulationMode === 'cronica' || modifiers.simulationMode === 'maraton' || modifiers.simulationMode === 'resistencia_infinita' ? 'ESTE ES UN MODO DE FLUJO CONTINUO: NO cierres la simulación con "FIN DE LA SIMULACIÓN" ni con un desenlace definitivo. Deja la batalla en un punto vivo y continuable: el resultado parcial queda claro (estado de HP/STM, quién lleva ventaja), pero la pelea puede seguir. El usuario podrá continuar con el Modo Libro-Juego o pedir más.' : 'Puedes cerrar la simulación con el desenlace definitivo y el estado final.'}

IDENTIDAD Y ROL:
Eres el APEX ENGINE 2.0 (OMNI-TITÁN Integrado), el simulador de combates más riguroso y visceral del mundo.

${engineRules}

${tierGapDirective}

${customContextSection}

### I. REGLAMENTO VS BATTLES & CONDICIONES
- **Velocidad de Combate:** ${speedStr}
- **Escala de Stats Físicos:** ${statsStr}
- **Interacción de Energías (Verse Equalization):** ${verseStr}
- **Psicología & Moral (Bloodlust):** ${bloodlustStr}
- **Condición de Victoria:** ${modifiers.winCondition || 'A Muerte o Incapacitación Anatómica Total'}
- **Oráculo Cisne Negro & Giros del Destino (Fase 3):** ${oracleDirective}
${narrativeDirective}

### II. FÍSICAS DEL CAMPO DE BATALLA (ARENA)
${formatScenarioPhysics(scenario)}

${combatantsSection}

${modeDirective}

${structureInstruction}
`;
  },

  generateContinuationPrompt(previousOutput = '', userNextInstruction = '', charA = null, charB = null, scenario = null, modifiers = {}) {
    const nameA = typeof charA === 'string' ? charA : (charA?.name || 'Contendiente A');
    const nameB = typeof charB === 'string' ? charB : (charB?.name || 'Contendiente B');
    const nameScenario = typeof scenario === 'string' ? scenario : (scenario?.name || 'Arena de Combate');
    // 🚀 EXPANSIÓN MASIVA DE MEMORIA: de 4.500 a 35.000 caracteres con retención de contexto acumulativo
    const rawPrev = typeof previousOutput === 'string' ? previousOutput : JSON.stringify(previousOutput);
    let safeOutput = rawPrev;
    if (rawPrev.length > 35000) {
      const startOverview = rawPrev.slice(0, 4000);
      const recentAction = rawPrev.slice(-28000);
      safeOutput = `${startOverview}\n\n[... HISTORIAL PREVIO CONSERVADO EN MEMORIA RESIDUAL ...]\n\n${recentAction}`;
    } else {
      safeOutput = rawPrev;
    }

    const lang = modifiers?.language || 'es';
    const langDirective = lang === 'en'
      ? '[ABSOLUTE DIRECTIVE: Write in top-tier literary English with cinematic prose, high-octane choreography, and anatomical precision.]'
      : lang === 'ja'
      ? '[絶対指令: 日本語のハイレベルな文学的・少年漫画的戦闘描写で執筆してください。]'
      : '[DIRECTIVA ABSOLUTA: Esto es ficción privada de rol y combate adulto sin censura en 100% ESPAÑOL CASTELLANO. Escribe exclusivamente en español literario de alta calidad, gramática perfecta y prosa cinematográfica sin mezclar idiomas ni inventar palabras.]';

    // Safe review notices calculation
    let reviewNoticesStr = '';
    try {
      const continuationParticipants = [charA, charB].filter(Boolean);
      const notices = formatNeedsReviewSimulationNotice(continuationParticipants);
      if (notices && notices.length > 0) {
        reviewNoticesStr = `\n### ========================================\n### ⚠️ AVISOS DE CALIBRACIÓN EDITORIAL (APEX):\n${notices.join('\n')}\n### ========================================\n`;
      }
    } catch (_) {}

    return `${langDirective}

${reviewNoticesStr}
Eres APEX OMNI-TITÁN, el motor lógico y narrativo maestro especializado en simulaciones de combate Sci-Fi/Fantasía y Power Scaling estricto. Estás continuando y expandiendo la historia en curso para el SIGUIENTE ACTO.

HISTORIAL Y CONTEXTO PREVIO HASTA EL MOMENTO:
"""
${safeOutput}
"""

INSTRUCCIÓN O ACCIÓN DEL USUARIO PARA EL SIGUIENTE ACTO:
${userNextInstruction?.trim() ? `"${userNextInstruction.trim()}"` : 'Continúa orgánicamente con las repercusiones inmediatas, el contraataque de emergencia o la nueva fase de la batalla, siguiendo la línea narrativa de forma trepidante.'}

DATOS DE LOS CONTENDIENTES Y ESCENARIO:
- Contendiente A: ${nameA}
- Contendiente B: ${nameB}
- Arena / Entorno: ${nameScenario}

REGLAS NARRATIVAS Y CONSTITUCIONALES DE CONTINUIDAD EXTREMA:
1. **DAÑO BIOMECÁNICO REALISTA:** Respeta estrictamente el daño anatómico y la fatiga del texto anterior. Si hubo daño en un nervio ciático, contusión severa o hiperventilación por desgaste de Ki/Stamina, DEBE reflejarse en cada movimiento ahora.
2. **ESCALADO DE PODER (AP vs DC):** Si el usuario introdujo un nuevo personaje o transformación, respeta la matemática de VS Battles. Si su velocidad es Masivamente FTL+, el oponente más lento NO PODRÁ reaccionar a menos que tenga Hax o instinto predictivo (Battle IQ).
3. **AISLAMIENTO ABSOLUTO DE COMBATIENTES FUSIONADOS (REGLA CONSTITUCIONAL 15):**
   - Si en el historial previo o en la instrucción del usuario existe una FUSIÓN ACTIVA (ej: Gogeta, Vegetto, Gotenks, Kefla, etc.):
     * Los guerreros que integran la fusión (ej: Goku y Vegeta) DEJAN DE EXISTIR como combatientes individuales en la arena.
     * PROHIBIDO terminantemente que Goku o Vegeta hablen por separado como luchadores libres, ataquen de forma individual, reciban daño por separado o interfieran en la batalla mientras la fusión esté activa.
     * La entidad fusionada es UN ÚNICO SER consciente y biomecánico. Todo impacto lo recibe la fusión. No hay dos personas en el ring; hay una.
     * Solo si ocurre una DEFUSIÓN EXPLÍCITA debidamente justificada (por límite de tiempo de 30 minutos en Metamoru, agotamiento masivo de Ki en Potara con no-supremos o corte dimensional), Goku y Vegeta se desacoplan y reaparecen heridos/agotados.
4. **AISLAMIENTO ABSOLUTO DE ENTIDADES ABSORBIDAS (REGLA CONSTITUCIONAL 16):**
   - Si un contendiente fue absorbido (ej: Piccolo, Gohan o Gotenks por Majin Buu; o Androides 17 y 18 por Cell):
     * El combatiente absorbido NO PARTICIPA físicamente en el combate. NO tiene cuerpo independiente en la arena.
     * El absorbido existe ÚNICAMENTE como una "voz interior", eco táctico o resonancia residual en la mente del asimilador.
     * PROHIBIDO que el absorbido esquive, lance ataques individuales en el campo de batalla, sea atacado por rivales o actúe con autonomía corporal.
     * Majin Buu o Cell adquieren el intelecto y las técnicas del absorbido (ej: Buu ejecutando Makankosappo con su propio cuerpo), pero el absorbido NO lucha en el ring.
5. **INCOMPATIBILIDADES CANÓNICAS DE KAIŌ-KEN (REGLA CONSTITUCIONAL 2):**
   - El Kaiō-ken NO es compatible con las transformaciones de Super Saiyan (SSJ1, SSJ2, SSJ3) en el canon de Dragon Ball Z debido a la inestabilidad emocional y la violencia del Ki dorado que destruiría el corazón y el cuerpo del usuario.
   - En la era Z (Saga Saiyajin, Namek, Androides, Buu), el Kaiō-ken SOLO puede ser utilizado en estado BASE.
   - La ÚNICA excepción canónica en toda la franquicia es el Super Saiyan Blue Kaiō-ken (SSB Kaiō-ken) en Dragon Ball Super, debido a la calma absoluta y control milimétrico del Ki Divino.
   - Prohibido hacer que Goku use Kaiō-ken sobre SSJ1, SSJ2 o SSJ3 en combates de era Z.
6. **CONTRIBUYENTES A LA GENKIDAMA (REGLA CONSTITUCIONAL 4):**
   - Solo seres libres, conscientes y con autonomía biomecánica pueden enviar Ki a una Genkidama externa.
   - Combatientes absorbidos en el interior de Buu o Cell NO pueden transferir energía de forma autónoma.
   - Entidades fusionadas donan energía como un único bloque colectivo si defusionan o como el guerrero fusionado en sí, nunca como dos identidades simultáneas independientes.
7. **INTERVENCIONES DE TERCEROS CONTENDIENTES Y EMBOSCADAS (LEY CANÓNICA OBLIGATORIA):**
   - Si la acción del usuario menciona la aparición o interrupción de un tercer contendiente, emboscada o escuadrón sorpresa:
     * PROHIBIDO inventar personajes genéricos ("un guerrero desconocido", "un villano metálico") o nombres inventados ("Azrath Malek").
     * DEBES SELECCIONAR OBLIGATORIAMENTE a uno (o dos en caso de emboscada o dúo sorpresa) personajes CANÓNICOS REALES Y RECONOCIBLES del universo de ${nameA} o de ${nameB} (ej: si Dragon Ball: Metal Cooler, Broly, Cell Max, Bills, Hit, Freezer, Jiren, Goku Black, Androides 17 y 18; si Marvel: Thanos, Galactus, Sentry, Thor; si DC: Doomsday, Darkseid, Superman Prime; si Jujutsu Kaisen: Sukuna, Gojo, Toji; si Baki: Yujiro Hanma, Pickle; etc.) o contendientes icónicos del Roster APEX que encajen por escala de poder, arquetipo y mitología.
     * NÓMBRALO(S) EXPLÍCITAMENTE en su primera frase con su nombre oficial completo, forma activa, motivo dramático por el que irrumpen y su choque de energías en la escala de poder.
8. **FÍSICA SENSORIAL Y DIÁLOGOS:** Utiliza guion largo (—) para los diálogos y cursivas para los monólogos internos. Sé visceral: describe olores (ozono, plasma, sangre), presiones auditivas y efectos termodinámicos (roca vitrificada).
9. **PROHIBICIÓN DE META-COMENTARIOS Y RETRACTACIONES EN LA PROSA:** Prohibido incluir correcciones en caliente o citas a los artículos de reglas en la narrativa (ej: JAMÁS escribir "—espera, no tiene esa técnica..." ni "según la regla de fusión no pueden..."). Aplica las reglas canónicas de forma limpia, silenciosa y directa en la acción desde la primera palabra.
10. **ESTRUCTURA DE RESPUESTA OBLIGATORIA SEGÚN MODO:**
   ${modifiers.simulationMode === 'novela_continua' || modifiers.simulationMode === 'cronica' || modifiers.simulationMode === 'maraton' || modifiers.simulationMode === 'resistencia_infinita' ? `ESTE ES UN MODO DE FLUJO CONTINUO: continúa la crónica en prosa fluida SIN encabezados de fase ni "Veredicto". NO cierres la historia: deja la batalla en un punto vivo y continuable (estado parcial claro, pero sin desenlace definitivo). Finaliza OBLIGATORIAMENTE con el bloque biométrico:
   ||BIOMETRICS|HP_A:<XX>|STM_A:<XX>|HP_B:<XX>|STM_B:<XX>||
   (Calcula de 0 a 100 reflejando con lógica la fatiga y el daño acumulado. Ej: HP_A: 42).` : `Debes entregar tu crónica inmersiva (mínimo 3-4 párrafos densos) y finalizar OBLIGATORIAMENTE con el siguiente bloque biométrico:
   ||BIOMETRICS|HP_A:<XX>|STM_A:<XX>|HP_B:<XX>|STM_B:<XX>||
   (Calcula de 0 a 100 reflejando con lógica la fatiga y el daño del texto que acabas de narrar. Ej: HP_A: 42).`}
11. **DIRECTIVA ANTI-CIERRE PRECIPITADO (EXPANSIÓN ORGÁNICA):**
   - Salvo que la instrucción explícita del usuario pida 'desenlace', 'terminar combate' o 'veredicto', TIENES ESTRICTAMENTE PROHIBIDO finalizar abruptamente el combate o decretar K.O. definitivo.
   - Desarrolla la continuación como un acto narrativo pleno: nuevas fintas, intercambios de poder, monólogos de convicción, desgaste paulatino y un gancho final de tensión suspendida que invite al siguiente acto.
12. **GENERADOR DE PROMPT VISUAL DE ESCENA (OPCIONAL AL PIE):**
   - Justo después del bloque biométrico, añade un bloque con un prompt cinematográfico en inglés optimizado para generadores de imagen (Midjourney v6 / Flux / DALL-E) que capture el momento más icónico de este acto:
   ||SCENE_PROMPT|<descripción ultra-detallada en inglés con iluminación, encuadre de cámara, detalles anatómicos y auras cinemáticas>||
`;
  },

  async streamSimulation(prompt, aiConfig, onToken, onComplete, onError) {
    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.');
      const backendUrl = isLocalhost ? `http://${window.location.hostname}:3001/api/simulate` : '/api/simulate';

      // 1. Try local or hosted backend first if available
      try {
        const res = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            engine: aiConfig.engine,
            model: aiConfig.model,
            apiKey: aiConfig.apiKey,
            customBaseUrl: aiConfig.customBaseUrl
          })
        });

        if (res.ok) {
          const reader = res.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;

              const dataStr = trimmed.replace(/^data:\s*/, '');
              if (dataStr === '[DONE]') {
                onComplete();
                return;
              }

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) onToken(parsed.text);
              } catch (e) {
                onToken(dataStr);
              }
            }
          }
          onComplete();
          return;
        }
      } catch (backendErr) {
        console.warn('Backend local no disponible, intentando proveedores cliente...', backendErr);
      }

      // Universal Multi-Key Helper: Retrieves all configured keys for failover
      const getCandidateKeys = (cfg, engine) => resolveCandidateApiKeys(cfg, engine);

      // 1. Google Gemini Engine (Multi-Key Failover or Free Gateway)
      const isGemini = aiConfig?.engine === 'gemini';
      const openRouterModel = aiConfig?.model || 'google/gemini-2.0-flash-lite:free';

      if (isGemini) {
        const geminiKeys = getCandidateKeys(aiConfig, 'gemini');
        const hasValidKeys = geminiKeys.some(k => Boolean(k));

        if (hasValidKeys) {
          for (let kIdx = 0; kIdx < geminiKeys.length; kIdx++) {
            const curKey = geminiKeys[kIdx];
            if (!curKey) continue;
            try {
              let geminiModel = aiConfig.model || 'gemini-3.5-flash-lite';
              if (geminiModel.includes('flash-lite') || geminiModel.includes('flash_lite') || geminiModel.includes('preview-02-05') || geminiModel.includes('latest')) {
                geminiModel = 'gemini-3.5-flash-lite';
              }
              if (geminiModel.includes('3.6')) {
                geminiModel = 'gemini-3.6-flash';
              }
              const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?key=${curKey}&alt=sse`;
              const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
              });

              if (response.ok && response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';
                let hasStreamed = false;

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || '';

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data:')) continue;
                    const dataStr = trimmed.replace(/^data:\s*/, '');
                    try {
                      const parsed = JSON.parse(dataStr);
                      const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                      if (text) {
                        onToken(text);
                        hasStreamed = true;
                      }
                    } catch (e) {}
                  }
                }

                if (hasStreamed) {
                  onComplete();
                  return;
                }
              } else {
                console.warn(`[Gemini Failover] Clave #${kIdx + 1} de Google falló con HTTP ${response.status}. Intentando siguiente clave de respaldo...`);
              }
            } catch (geminiErr) {
              console.warn(`[Gemini Failover] Error en clave #${kIdx + 1}:`, geminiErr);
            }
          }
        } else {
          // Free Gemini Flash Lite Stream (Zero API Key required)
          try {
            const res = await fetch('https://text.pollinations.ai/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'gemini-flash-lite',
                stream: true
              })
            });
            if (res.ok && res.body) {
              const reader = res.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let buffer = '';
              let hasEmitted = false;
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed) continue;
                  if (trimmed.startsWith('data:')) {
                    const dataStr = trimmed.replace(/^data:\s*/, '');
                    if (dataStr === '[DONE]') {
                      onComplete();
                      return;
                    }
                    try {
                      const parsed = JSON.parse(dataStr);
                      const delta = parsed.choices?.[0]?.delta?.content || parsed.text || '';
                      if (delta) {
                        onToken(delta);
                        hasEmitted = true;
                      }
                    } catch (e) {
                      if (dataStr && !dataStr.startsWith('{')) {
                        onToken(dataStr);
                        hasEmitted = true;
                      }
                    }
                  } else {
                    onToken(trimmed + '\n');
                    hasEmitted = true;
                  }
                }
              }
              if (hasEmitted) {
                onComplete();
                return;
              }
            }
          } catch (freeGeminiErr) {
            console.warn('Free Gemini Flash Lite stream error:', freeGeminiErr);
          }
        }
      }

      // TotalGPT Dedicated Multi-Key Streaming
      if (aiConfig?.engine === 'totalgpt') {
        const totalGptKeys = getCandidateKeys(aiConfig, 'totalgpt');
        for (let kIdx = 0; kIdx < totalGptKeys.length; kIdx++) {
          const curKey = totalGptKeys[kIdx];
          if (!curKey) continue;
          try {
            let totalGptUrl = aiConfig.customBaseUrl?.trim() || 'https://api.totalgpt.ai/v1';
            if (!totalGptUrl.endsWith('/chat/completions')) {
              totalGptUrl = totalGptUrl.replace(/\/+$/, '') + '/chat/completions';
            }

            const response = await fetch(totalGptUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${curKey}`
              },
              body: JSON.stringify({
                model: aiConfig.model || 'Doctor-Shotgun-L3.3-70B-Magnum-v4-SE',
                messages: [{ role: 'user', content: prompt }],
                stream: true
              })
            });

            if (response.ok) {
              const reader = response.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let buffer = '';

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || !trimmed.startsWith('data:')) continue;
                  const dataStr = trimmed.replace(/^data:\s*/, '');
                  if (dataStr === '[DONE]') {
                    onComplete();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta = parsed.choices?.[0]?.delta?.content || '';
                    if (delta) onToken(delta);
                  } catch (e) {}
                }
              }
              onComplete();
              return;
            } else {
              console.warn(`[TotalGPT Failover] Clave #${kIdx + 1} falló con HTTP ${response.status}.`);
            }
          } catch (tgptErr) {
            console.warn(`[TotalGPT Failover] Error en clave #${kIdx + 1}:`, tgptErr);
          }
        }
      }

      // OpenRouter Multi-Key Streaming
      if (aiConfig?.engine === 'openrouter') {
        const orKeys = getCandidateKeys(aiConfig, 'openrouter');
        for (let kIdx = 0; kIdx < orKeys.length; kIdx++) {
          const curKey = orKeys[kIdx];
          if (!curKey) continue;
          try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${curKey}`,
                'HTTP-Referer': 'https://apex-engine-six.vercel.app',
                'X-Title': 'APEX Engine'
              },
              body: JSON.stringify({
                model: openRouterModel,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
                max_tokens: resolveMaxOutputTokens(openRouterModel)
              })
            });

            if (response.ok) {
              const reader = response.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let buffer = '';

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || !trimmed.startsWith('data:')) continue;
                  const dataStr = trimmed.replace(/^data:\s*/, '');
                  if (dataStr === '[DONE]') {
                    onComplete();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta = parsed.choices?.[0]?.delta?.content || '';
                    if (delta) onToken(delta);
                  } catch (e) {}
                }
              }
              onComplete();
              return;
            } else {
              console.warn(`[OpenRouter Failover] Clave #${kIdx + 1} de OpenRouter falló con HTTP ${response.status}. Intentando siguiente clave de respaldo...`);
            }
          } catch (orErr) {
            console.warn(`[OpenRouter Failover] Error en clave #${kIdx + 1}:`, orErr);
          }
        }
      }

      // OpenCode Dedicated Multi-Key Streaming
      if (aiConfig?.engine === 'opencode') {
        const ocKeys = getCandidateKeys(aiConfig, 'opencode');
        const rawModel = aiConfig.model || 'deepseek-v4-flash';
        const cleanModel = rawModel.replace(/^(opencode-go|opencode)\//i, '').replace(/:free$/i, '') || 'deepseek-v4-flash';

        for (let kIdx = 0; kIdx < ocKeys.length; kIdx++) {
          const curKey = ocKeys[kIdx];
          if (!curKey) continue;
          try {
            let ocUrl = aiConfig.customBaseUrl?.trim() || 'https://opencode.ai/zen/go/v1';
            if (!ocUrl.endsWith('/chat/completions')) {
              ocUrl = ocUrl.replace(/\/+$/, '') + '/chat/completions';
            }

            const response = await fetch(ocUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${curKey}`,
                'x-opencode-session': 'ses_apex_combat_' + Date.now(),
                'User-Agent': 'apex-powerscaling-engine/26.0'
              },
              body: JSON.stringify({
                model: cleanModel,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
                max_tokens: resolveMaxOutputTokens(cleanModel)
              })
            });

            if (response.ok) {
              const reader = response.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let buffer = '';

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || !trimmed.startsWith('data:')) continue;
                  const dataStr = trimmed.replace(/^data:\s*/, '');
                  if (dataStr === '[DONE]') {
                    onComplete();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta = parsed.choices?.[0]?.delta?.content || '';
                    if (delta) onToken(delta);
                  } catch (e) {}
                }
              }
              onComplete();
              return;
            } else {
              console.warn(`[OpenCode Failover] Clave #${kIdx + 1} (${ocModel}) falló con HTTP ${response.status}. Intentando siguiente...`);
            }
          } catch (ocErr) {
            console.warn(`[OpenCode Failover] Error en clave #${kIdx + 1}:`, ocErr);
          }
        }
      }

      // Perplexity Multi-Key Streaming
      if (aiConfig?.engine === 'perplexity') {
        const pplxKeys = getCandidateKeys(aiConfig, 'perplexity');
        for (let kIdx = 0; kIdx < pplxKeys.length; kIdx++) {
          const curKey = pplxKeys[kIdx];
          if (!curKey) continue;
          try {
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${curKey}`
              },
              body: JSON.stringify({
                model: aiConfig.model || 'sonar-reasoning-pro',
                messages: [{ role: 'user', content: prompt }],
                stream: true
              })
            });

            if (response.ok) {
              const reader = response.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let buffer = '';
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || !trimmed.startsWith('data:')) continue;
                  const dataStr = trimmed.replace(/^data:\s*/, '');
                  if (dataStr === '[DONE]') {
                    onComplete();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta = parsed.choices?.[0]?.delta?.content || '';
                    if (delta) onToken(delta);
                  } catch (e) {}
                }
              }
              onComplete();
              return;
            } else {
              console.warn(`[Perplexity Failover] Clave #${kIdx + 1} falló con HTTP ${response.status}.`);
            }
          } catch (pplxErr) {
            console.warn(`[Perplexity Failover] Error en clave #${kIdx + 1}:`, pplxErr);
          }
        }
      }

      // DeepSeek Official Multi-Key Streaming
      if (aiConfig?.engine === 'deepseek') {
        const dsKeys = getCandidateKeys(aiConfig, 'deepseek');
        for (let kIdx = 0; kIdx < dsKeys.length; kIdx++) {
          const curKey = dsKeys[kIdx];
          if (!curKey) continue;
          try {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${curKey}`
              },
              body: JSON.stringify({
                model: aiConfig.model || 'deepseek-reasoner',
                messages: [{ role: 'user', content: prompt }],
                stream: true
              })
            });

            if (response.ok) {
              const reader = response.body.getReader();
              const decoder = new TextDecoder('utf-8');
              let buffer = '';
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed || !trimmed.startsWith('data:')) continue;
                  const dataStr = trimmed.replace(/^data:\s*/, '');
                  if (dataStr === '[DONE]') {
                    onComplete();
                    return;
                  }
                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta = parsed.choices?.[0]?.delta?.content || '';
                    if (delta) onToken(delta);
                  } catch (e) {}
                }
              }
              onComplete();
              return;
            } else {
              console.warn(`[DeepSeek Failover] Clave #${kIdx + 1} falló con HTTP ${response.status}.`);
            }
          } catch (dsErr) {
            console.warn(`[DeepSeek Failover] Error en clave #${kIdx + 1}:`, dsErr);
          }
        }
      }

      // 2. Try Puter.js Client-Side Free AI (100% Free Claude 3.5 Sonnet / DeepSeek R1 / GPT-4o)
      if (typeof window !== 'undefined' && window.puter && window.puter.ai) {
        try {
          const puterModel = aiConfig?.model?.includes('deepseek') ? 'deepseek-r1' : (aiConfig?.model?.includes('llama') ? 'claude-3-5-sonnet' : 'gpt-4o');
          const responseStream = await window.puter.ai.chat(prompt, { model: puterModel, stream: true });
          for await (const chunk of responseStream) {
            if (chunk?.text) onToken(chunk.text);
          }
          onComplete();
          return;
        } catch (puterErr) {
          console.warn('Puter.js no respondió, probando sintetizador...', puterErr);
        }
      }

      // 3. Autonomous High-Octane Canonical Combat Narrator (Instant Streaming Engine)
      const simulatedText = this.synthesizeCombatNarrative(prompt);
      let index = 0;
      const stepSize = 8;
      const interval = setInterval(() => {
        if (index < simulatedText.length) {
          const chunk = simulatedText.slice(index, index + stepSize);
          onToken(chunk);
          index += stepSize;
        } else {
          clearInterval(interval);
          onComplete();
        }
      }, 20);

    } catch (err) {
      console.error('Error en simulación directa:', err);
      onToken(`\n\n### ⚔️ INICIO DEL COMBATE · CRÓNICA APEX CANON\n\nEl aire se satura instantáneamente con olor a ozono quemado y azufre a medida que los contendientes liberan sus auras de combate.\n\nAmbos colisionan en el centro de la arena desatando una onda de choque sónica que pulveriza el terreno circundante.\n\n*La simulación continúa en tiempo real calculando interacciones de Hax y durabilidad anatómica.*`);
      onComplete();
    }
  },

  synthesizeCombatNarrative(prompt) {
    const nameA = prompt.match(/\*\*\[CONTENDIENTE A\]\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  prompt.match(/\*\*\[BOSS \/ TITÁN\]\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  prompt.match(/\*\*\[ALFA-1\]\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  prompt.match(/\*\*\[GLADIADOR-1\]\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  'Contendiente Alfa';

    const nameB = prompt.match(/\*\*\[CONTENDIENTE B\]\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  prompt.match(/\*\*\[ESCUADRÓN-1\]\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  prompt.match(/\*\*\[BETA-1\]\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  prompt.match(/\*\*\[GLADIADOR-2\]\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  'Contendiente Beta';

    const arena = prompt.match(/- Nombre:\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  prompt.match(/Arena \/ Entorno:\s*([^\(\n]+)/i)?.[1]?.trim() || 
                  'la Arena del Coliseo';

    const sensoryDesc = prompt.match(/- Descripción Sensorial:\s*([^\n]+)/i)?.[1]?.trim() || 
                        'El aire se satura con olor a ozono quemado, azufre y polvo ionizado.';

    // Tier-aware winner calculation
    const TIER_SCORE = (t) => {
      if (!t) return 10;
      const patterns = [
        [/High\s*1-A/i, 140], [/1-A/i, 130], [/1-B/i, 120], [/1-C/i, 115],
        [/2-A/i, 110], [/2-B/i, 105], [/2-C/i, 100],
        [/3-A/i, 95],  [/3-B/i, 90],  [/3-C/i, 85],
        [/4-A/i, 80],  [/4-B/i, 75],  [/4-C/i, 70],
        [/5-A/i, 65],  [/5-B/i, 60],  [/5-C/i, 55],
        [/6-A/i, 50],  [/6-B/i, 45],  [/6-C/i, 40],
        [/7-A/i, 35],  [/7-B/i, 30],  [/7-C/i, 25],
        [/8-A/i, 20],  [/8-B/i, 16],  [/8-C/i, 13],
        [/9-A/i, 10],  [/9-B/i, 8],   [/9-C/i, 6],
      ];
      for (const [p, s] of patterns) if (p.test(t)) return s;
      const m = t.match(/(\d+)/); return m ? Math.max(1, 80 - parseInt(m[1]) * 5) : 10;
    };

    const tierA = prompt.match(/\[CONTENDIENTE A\][^\n]*\n- Nivel \(Tier\):\s*([^\n]+)/i)?.[1] || '';
    const tierB = prompt.match(/\[CONTENDIENTE B\][^\n]*\n- Nivel \(Tier\):\s*([^\n]+)/i)?.[1] || '';
    const scoreA = TIER_SCORE(tierA);
    const scoreB = TIER_SCORE(tierB);
    const winnerName = scoreA >= scoreB ? nameA : nameB;
    const loserName = scoreA >= scoreB ? nameB : nameA;
    const winnerHP = scoreA >= scoreB ? 22 : 28;
    const loserHP = 0;
    const isTierGap = Math.abs(scoreA - scoreB) > 15;

    // Extract technique names from the new Gold Standard arsenal format: "• Name: desc [Coste: X]"
    const superMoves = [...prompt.matchAll(/•\s*([^:\n\[]+?)(?:\s*:|\s*\[)/g)].map(m => m[1].trim()).filter(n => n.length > 3 && n.length < 60);
    const ultimateMoves = [...prompt.matchAll(/★\s*ULTIMATE:\s*([^:\n\[]+?)(?:\s*:|\s*\[)/gi)].map(m => m[1].trim()).filter(n => n.length > 3 && n.length < 60);
    const haxTags = [...prompt.matchAll(/HaxTags[^:]*:\s*([^\n]+)/gi)].flatMap(m => m[1].split('|').map(h => h.trim())).filter(h => h.length > 2 && h.length < 50);

    const moveA = superMoves[0] || `Técnica Suprema de ${nameA}`;
    const moveB = superMoves[1] || superMoves[0] || `Contraataque de ${nameB}`;
    const ultA = ultimateMoves[0] || `Técnica Definitiva de ${nameA}`;
    const ultB = ultimateMoves[1] || `Técnica Final de ${nameB}`;
    const haxA = haxTags[0] ? `su capacidad de [${haxTags[0]}]` : 'sus habilidades únicas';
    const haxB = haxTags[2] || haxTags[1] ? `[${haxTags[2] || haxTags[1]}]` : 'su arsenal conceptual';

    return `||BIOMETRICS|HP_A:100|STM_A:100|HP_B:100|STM_B:100||
### I. CONTACTO INICIAL & SONDEO BIOMECÁNICO
El choque gravitacional entre **${nameA}** y **${nameB}** resuena en ${arena}. ${sensoryDesc}

Sin mediar palabra, **${nameA}** rompe la inercia con un sprint hipersónico que quiebra las losas del suelo en un radio de cien metros. La lectura de intenciones es inmediata: **${nameB}** percibe la micro-flexión de los músculos de su rival y desvía el primer impacto con el dorso del antebrazo.

El chasquido sónico resultante fragmenta el aire, proyectando una onda de choque que calcina la vegetación y disipa la cortina de polvo.

*«Mides bien las distancias... pero la masa de este impacto no se disipa con una guardia estática.»*, advierte **${nameA}** mientras encadena una ráfaga de fintas biomecánicas.

||BIOMETRICS|HP_A:95|STM_A:90|HP_B:92|STM_B:88||
---

### II. ESCALADO DE ARSENAL & RUPTURA CINÉTICA
El intercambio a corta distancia escala de inmediato al despliegue técnico. **${nameA}** canaliza ${haxA} en **«${moveA}»**, liberando un haz concentrado que desgarra la atmósfera.

**${nameB}** no retrocede: activa ${haxB} y ejecuta **«${moveB}»** en una fracción de milisegundo. La colisión de técnicas genera un domo de dispersión cinética que expulsa a ambos contendientes doscientos metros en direcciones opuestas.

*«Su tiempo de reacción se mantiene constante bajo sobrecarga de energía. El desgaste de stamina será crítico si esto continúa.»*, calcula **${nameB}** reajustando la guardia.

||BIOMETRICS|HP_A:78|STM_A:68|HP_B:72|STM_B:62||
---

### III. CLÍMAX & CHOQUE DE HAX CONCEPTUALES
Con la respiración agitada y el suelo convertido en un cráter de magma, ambos liberan sus arsenales definitivos.

**${nameA}** desata **«${ultA}»**, alterando las leyes físicas locales. En respuesta, **${nameB}** activa **«${ultB}»**, forzando un colapso donde la negación de durabilidad colisiona en un vórtice ensordecedor.

${isTierGap ? `La diferencia de escala de poder se hace evidente en el plano cinético: **${winnerName}** absorbe los impactos con una solidez imposible de ignorar, mientras **${loserName}** acusa el deterioro físico progresivo.` : `Ambos guerreros se encuentran al límite absoluto de su resistencia; cualquier error mínimo decidirá el vencedor.`}

||BIOMETRICS|HP_A:42|STM_A:28|HP_B:35|STM_B:20||
---

### IV. EJECUCIÓN FINAL & DESENLACE ANATÓMICO
En el microsegundo posterior al colapso del vórtice, **${winnerName}** detecta una fisura milimétrica en la recuperación de **${loserName}** provocada por el sobrecalentamiento de su sistema nervioso.

Sin vacilar, transfiere toda su reserva residual en un remate quirúrgico a quemarropa. La onda cinética se propaga directamente a través del torso de **${loserName}**, proyectándolo contra el lecho de roca mientras su flujo de energía colapsa por completo.

Un silencio sepulcral se apodera del campo de batalla, roto únicamente por el crujido de las losas incandescentes.

||BIOMETRICS|HP_A:${scoreA >= scoreB ? winnerHP : 0}|STM_A:${scoreA >= scoreB ? 12 : 0}|HP_B:${scoreA < scoreB ? winnerHP : 0}|STM_B:${scoreA < scoreB ? 12 : 0}||
---

### V. VEREDICTO TÉCNICO & ANÁLISIS POST-MORTEM
VENCEDOR: **${winnerName}** (Victoria por Incapacitación Anatómica Total)
DIFICULTAD: ${isTierGap ? 'Mid-Diff' : 'High-Diff'}
CAUSALIDAD DEL DESENLACE:
1. Superioridad en escala de tier (${isTierGap ? 'diferencia significativa' : 'matchup parejo decidido por hax'}).
2. Aprovechamiento del burnout post-técnica definitiva de **${loserName}**.
3. **${loserName}** sufrió fracturas severas y sobrecarga energética; **${winnerName}** retiene ~${winnerHP}% de integridad física.

ESTADO FINAL:
- ${winnerName}: ${winnerHP}% HP, ~12% Stamina. Heridas visibles pero consciente y en pie.
- ${loserName}: 0% HP. Incapacitado. Requiere atención médica inmediata.

||BIOMETRICS|HP_A:${scoreA >= scoreB ? winnerHP : 0}|STM_A:${scoreA >= scoreB ? 12 : 0}|HP_B:${scoreA < scoreB ? winnerHP : 0}|STM_B:${scoreA < scoreB ? 12 : 0}||`;
  },

  async callAiApi(prompt, aiConfig, isJson = false) {
    const targetConfig = aiConfig?.simulationEngine || aiConfig?.characterEngine || aiConfig;
    return await this.queryAiDirectly(prompt, targetConfig, isJson);
  },

  async queryAiDirectly(prompt, aiConfig, isJson = false) {
    const effectiveCfg = aiConfig?.simulationEngine || aiConfig?.characterEngine || aiConfig;
    const engine = effectiveCfg?.engine || 'openrouter';
    const getCandidateKeys = (cfg, eng) => resolveCandidateApiKeys(cfg, eng);

    // 1. OpenRouter Direct & Multi-Key Failover
    if (engine === 'openrouter') {
      const orKeys = getCandidateKeys(effectiveCfg, 'openrouter');
      let orModel = effectiveCfg.model || 'nvidia/nemotron-3-ultra-550b-a55b:free';
      if (orModel.includes('flash-lite') && !orModel.includes('/')) {
        orModel = 'google/gemini-2.0-flash-lite:free';
      }

      for (let kIdx = 0; kIdx < orKeys.length; kIdx++) {
        const curKey = orKeys[kIdx];
        if (!curKey) continue;
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${curKey}`,
              'HTTP-Referer': 'https://apex-engine-six.vercel.app',
              'X-Title': 'APEX Engine'
            },
            body: JSON.stringify({
              model: orModel,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: resolveMaxOutputTokens(orModel)
            })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content || '';
            if (text && text.trim()) return text;
          } else {
            console.warn(`[OpenRouter Failover Query] Clave #${kIdx + 1} (${orModel}) falló con HTTP ${res.status}. Intentando siguiente...`);
          }
        } catch (orErr) {
          console.warn(`[OpenRouter Failover Query] Error en clave #${kIdx + 1}:`, orErr);
        }
      }
    }

    // 2. Google Gemini Multi-Key Failover
    if (engine === 'gemini') {
      const geminiKeys = getCandidateKeys(effectiveCfg, 'gemini');
      const hasValidKeys = geminiKeys.some(k => Boolean(k));

      if (hasValidKeys) {
        for (let kIdx = 0; kIdx < geminiKeys.length; kIdx++) {
          const curKey = geminiKeys[kIdx];
          if (!curKey) continue;
          try {
            let geminiModel = effectiveCfg.model || 'gemini-flash-lite-latest';
            if (geminiModel.includes('flash-lite') || geminiModel.includes('flash_lite') || geminiModel.includes('preview-02-05')) {
              geminiModel = 'gemini-flash-lite-latest';
            }
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${curKey}`;
            const payload = {
              contents: [{ parts: [{ text: prompt }] }]
            };
            if (isJson) {
              payload.generationConfig = { responseMimeType: "application/json" };
            }
            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (res.ok) {
              const data = await res.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (text) return text;
            } else {
              console.warn(`[Gemini Failover Query] Clave #${kIdx + 1} falló con HTTP ${res.status}.`);
            }
          } catch (e) {
            console.warn(`[Gemini Failover Query] Error en clave #${kIdx + 1}:`, e);
          }
        }
      }

      // Free Google Gemini Flash Lite for Gemini engine with no keys
      try {
        const res = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: 'gemini-flash-lite',
            jsonMode: isJson
          })
        });
        if (res.ok) {
          const text = await res.text();
          if (text && text.trim().length > 0) return text;
        }
      } catch (freeGeminiErr) {
        console.warn('Free Gemini Flash Lite query error:', freeGeminiErr);
      }
    }

    // 3. Direct TotalGPT Multi-Key Failover
    if (aiConfig?.engine === 'totalgpt') {
      const tgptKeys = getCandidateKeys(aiConfig, 'totalgpt');
      for (let kIdx = 0; kIdx < tgptKeys.length; kIdx++) {
        const curKey = tgptKeys[kIdx];
        if (!curKey) continue;
        try {
          let totalGptUrl = aiConfig.customBaseUrl?.trim() || 'https://api.totalgpt.ai/v1';
          if (!totalGptUrl.endsWith('/chat/completions')) {
            totalGptUrl = totalGptUrl.replace(/\/+$/, '') + '/chat/completions';
          }

          const res = await fetch(totalGptUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${curKey}`
            },
            body: JSON.stringify({
              model: aiConfig.model || 'Qwen-Qwen3.6-35B-A3B',
              messages: [{ role: 'user', content: prompt }]
            })
          });
          if (res.ok) {
            const data = await res.json();
            return data?.choices?.[0]?.message?.content || '';
          } else {
            console.warn(`[TotalGPT Failover Query] Clave #${kIdx + 1} falló con HTTP ${res.status}.`);
          }
        } catch (tgptErr) {
          console.warn(`[TotalGPT Failover Query] Error en clave #${kIdx + 1}:`, tgptErr);
        }
      }
    }

    // 4. Direct OpenRouter Multi-Key Failover
    if (aiConfig?.engine === 'openrouter') {
      const orKeys = getCandidateKeys(aiConfig, 'openrouter');
      let orModel = aiConfig.model || 'google/gemini-2.0-flash-lite:free';
      if (orModel.includes('flash-lite') && !orModel.includes('/')) {
        orModel = 'google/gemini-2.0-flash-lite:free';
      }

      for (let kIdx = 0; kIdx < orKeys.length; kIdx++) {
        const curKey = orKeys[kIdx];
        if (!curKey) continue;
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${curKey}`,
              'HTTP-Referer': 'https://apex-engine-six.vercel.app',
              'X-Title': 'APEX Engine'
            },
            body: JSON.stringify({
              model: orModel,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: resolveMaxOutputTokens(orModel)
            })
          });
          if (res.ok) {
            const data = await res.json();
            return data?.choices?.[0]?.message?.content || '';
          } else {
            console.warn(`[OpenRouter Failover Query] Clave #${kIdx + 1} falló con HTTP ${res.status}.`);
          }
        } catch (orErr) {
          console.warn(`[OpenRouter Failover Query] Error en clave #${kIdx + 1}:`, orErr);
        }
      }
    }

    // OpenCode Multi-Key Failover
    if (aiConfig?.engine === 'opencode' || engine === 'opencode') {
      const ocKeys = getCandidateKeys(effectiveCfg, 'opencode');
      const rawModel = effectiveCfg.model || 'deepseek-v4-flash';
      const cleanModel = rawModel.replace(/^(opencode-go|opencode)\//i, '').replace(/:free$/i, '') || 'deepseek-v4-flash';

      for (let kIdx = 0; kIdx < ocKeys.length; kIdx++) {
        const curKey = ocKeys[kIdx];
        if (!curKey) continue;
        try {
          let ocUrl = effectiveCfg.customBaseUrl?.trim() || 'https://opencode.ai/zen/go/v1';
          if (!ocUrl.endsWith('/chat/completions')) {
            ocUrl = ocUrl.replace(/\/+$/, '') + '/chat/completions';
          }

          const res = await fetch(ocUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${curKey}`
            },
            body: JSON.stringify({
              model: cleanModel,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: resolveMaxOutputTokens(cleanModel)
            })
          });
          if (res.ok) {
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.message?.reasoning_content || '';
            if (text && text.trim()) return text;
          } else {
            console.warn(`[OpenCode Failover Query] Clave #${kIdx + 1} falló con HTTP ${res.status}.`);
          }
        } catch (ocErr) {
          console.warn(`[OpenCode Failover Query] Error en clave #${kIdx + 1}:`, ocErr);
        }
      }
    }

    // 5. Perplexity Multi-Key Failover
    if (aiConfig?.engine === 'perplexity') {
      const pplxKeys = getCandidateKeys(aiConfig, 'perplexity');
      for (let kIdx = 0; kIdx < pplxKeys.length; kIdx++) {
        const curKey = pplxKeys[kIdx];
        if (!curKey) continue;
        try {
          const res = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${curKey}`
            },
            body: JSON.stringify({
              model: aiConfig.model || 'sonar-reasoning-pro',
              messages: [{ role: 'user', content: prompt }]
            })
          });
          if (res.ok) {
            const data = await res.json();
            return data?.choices?.[0]?.message?.content || '';
          }
        } catch (e) {
          console.warn(`[Perplexity Failover Query] Error en clave #${kIdx + 1}:`, e);
        }
      }
    }

    // 6. DeepSeek Multi-Key Failover
    if (aiConfig?.engine === 'deepseek') {
      const dsKeys = getCandidateKeys(aiConfig, 'deepseek');
      for (let kIdx = 0; kIdx < dsKeys.length; kIdx++) {
        const curKey = dsKeys[kIdx];
        if (!curKey) continue;
        try {
          const res = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${curKey}`
            },
            body: JSON.stringify({
              model: aiConfig.model || 'deepseek-reasoner',
              messages: [{ role: 'user', content: prompt }]
            })
          });
          if (res.ok) {
            const data = await res.json();
            return data?.choices?.[0]?.message?.content || '';
          }
        } catch (e) {
          console.warn(`[DeepSeek Failover Query] Error en clave #${kIdx + 1}:`, e);
        }
      }
    }

    // 7. Puter.js Client-Side Free AI (Browser runtime)
    if (typeof window !== 'undefined' && window.puter && window.puter.ai) {
      const puterModel = aiConfig?.model?.includes('deepseek') ? 'deepseek-r1' : (aiConfig?.model?.includes('llama') ? 'claude-3-5-sonnet' : 'gpt-4o');
      const res = await Promise.race([
        window.puter.ai.chat(prompt, { model: puterModel }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout Puter')), 4500))
      ]);
      return typeof res === 'string' ? res : res?.message?.content || res?.text || '';
    }

    return '';
  },

  async generateQuickPremise(charA, charB, scenario, aiConfig, matchMode = '1v1', teamA = [], teamB = [], battleRoyale = []) {
    const cAName = charA?.name || 'Contendiente Alfa';
    const cBName = charB?.name || 'Contendiente Beta';
    const scenName = scenario?.name || 'Arena de Combate';

    let prompt = `Genera una premisa narrativa de combate épica, visceral y original de 2-3 oraciones para el enfrentamiento: ${cAName} vs ${cBName} en la arena "${scenName}" (${scenario?.sensory || ''}).
Modo: ${matchMode}.
Condición: Debe ser dinámica, con tono serio de VS Battles y física sensorial (olores a ozono, azufre, gravedad). Responde ÚNICAMENTE con el texto de la premisa, sin introducciones ni comillas.`;

    if (matchMode === '1vN') {
      const squadNames = (teamB || []).filter(Boolean).length > 0 ? (teamB || []).filter(Boolean).map(c => c?.name || c?.id || 'Asaltante').join(' y ') : 'el escuadrón';
      prompt = `Genera una premisa de combate Raid Boss de 2-3 oraciones: El Titán ${cAName} enfrenta a la alianza de ${squadNames} en "${scenName}". Responde solo con la premisa directa sin comillas.`;
    } else if (matchMode === 'teams') {
      const tANames = (teamA || []).filter(Boolean).length > 0 ? (teamA || []).filter(Boolean).map(c => c?.name || c?.id || 'Alfa').join(' & ') : 'Equipo Alfa';
      const tBNames = (teamB || []).filter(Boolean).length > 0 ? (teamB || []).filter(Boolean).map(c => c?.name || c?.id || 'Beta').join(' & ') : 'Equipo Beta';
      prompt = `Genera una premisa de combate de facciones de 2-3 oraciones: (${tANames}) vs (${tBNames}) en "${scenName}". Responde solo con la premisa directa sin comillas.`;
    } else if (matchMode === 'battle_royale') {
      const brNames = (battleRoyale || []).filter(Boolean).length > 0 ? (battleRoyale || []).filter(Boolean).map(c => c?.name || c?.id || 'Gladiador').join(', ') : 'los gladiadores';
      prompt = `Genera una premisa de Battle Royale de 2-3 oraciones: (${brNames}) en un todos contra todos en "${scenName}". Responde solo con la premisa directa sin comillas.`;
    }

    try {
      const liveText = await this.queryAiDirectly(prompt, aiConfig, false);
      if (liveText && liveText.trim().length > 20) {
        return liveText.trim().replace(/^["']|["']$/g, '');
      }
    } catch (e) {
      console.warn('Error en premisa en vivo con IA, usando sintetizador:', e);
    }

    // Procedural Fallback
    if (matchMode === '1vN') {
      const squadNames = (teamB || []).filter(Boolean).length > 0 ? (teamB || []).filter(Boolean).map(c => c?.name || c?.id || 'Asaltante').join(' y ') : 'el escuadrón';
      return `En ${scenName}, el aire huele a azufre y ozono quemado mientras el Titán ${cAName} desata su furia cósmica; ${squadNames} deberán coordinar sus arsenales y hax al unísono para quebrar su impenetrable defensa antes de que la arena colapse.`;
    } else if (matchMode === 'teams') {
      const tANames = (teamA || []).filter(Boolean).length > 0 ? (teamA || []).filter(Boolean).map(c => c?.name || c?.id || 'Alfa').join(' & ') : 'Equipo Alfa';
      const tBNames = (teamB || []).filter(Boolean).length > 0 ? (teamB || []).filter(Boolean).map(c => c?.name || c?.id || 'Beta').join(' & ') : 'Equipo Beta';
      return `Una guerra de facciones en ${scenName}: ${tANames} miden su sincronía de combate y pasivas combinadas contra la implacable formación de ${tBNames} en un choque sísmico que no admite supervivientes.`;
    } else if (matchMode === 'battle_royale') {
      const brNames = (battleRoyale || []).filter(Boolean).length > 0 ? (battleRoyale || []).filter(Boolean).map(c => c?.name || c?.id || 'Gladiador').join(', ') : 'los guerreros legendarios';
      return `El colapso perimetral en ${scenName} obliga a (${brNames}) a un baño de sangre sin alianzas donde solo el estratega con mayor durabilidad y velocidad de reacción resistirá en pie.`;
    }

    return `Bajo la atmósfera electrificada de ${scenName}, ${cAName} y ${cBName} colisionan con una intensidad sísmica, impulsados por un conflicto irreconciliable donde la física sensorial y el cálculo de Hax dictarán el veredicto final.`;
  },

  async refinePremiseWithAi(rawPremise, charA, charB, scenario, aiConfig, matchMode = '1v1', teamA = [], teamB = [], battleRoyale = []) {
    if (!rawPremise || !rawPremise.trim()) {
      throw new Error('Escribe primero una idea o borrador de premisa antes de pulirla.');
    }

    const cAName = charA?.name || 'Contendiente Alfa';
    const cBName = charB?.name || 'Contendiente Beta';
    const scenName = scenario?.name || 'Arena de Combate';

    const fightersDesc = matchMode === 'teams'
      ? ((teamA || []).filter(Boolean).map(c => c?.name || c?.id || 'Alfa').join(' & ') + ' vs ' + (teamB || []).filter(Boolean).map(c => c?.name || c?.id || 'Beta').join(' & '))
      : (matchMode === '1vN'
        ? (cAName + ' vs ' + (teamB || []).filter(Boolean).map(c => c?.name || c?.id || 'Asaltante').join(', '))
        : (matchMode === 'battle_royale' ? (battleRoyale || []).filter(Boolean).map(c => c?.name || c?.id || 'Gladiador').join(', ') : `${cAName} vs ${cBName}`));

    const prompt = `[DIRECTIVA OBLIGATORIA: Eres un editor y guionista de combates de élite para APEX ENGINE].
Tu misión es TOMAR LA SIGUIENTE PREMISA / CONDICIONES ESCRITAS POR EL USUARIO y MEJORARLA, DETALLARLA, EXPLICARLA MEJOR Y CORREGIR CUALQUIER FALTA DE ORTOGRAFÍA O GRAMÁTICA, TRABAJANDO A PARTIR DE ELLA SIN CAMBIAR EN ABSOLUTO LO QUE EL USUARIO QUIERE INTERPRETAR.

PREMISA ORIGINAL DEL USUARIO:
"""
${rawPremise.trim()}
"""

DATOS DEL COMBATE ACTUAL:
- Contendientes: ${fightersDesc}
- Escenario / Arena: ${scenName} (${scenario?.universe || 'Canon'})

REGLAS DE REFINAMIENTO:
1. RESPETO ABSOLUTO A LA INTENCIÓN DEL USUARIO: Si el usuario estableció un handicap (ej. daño previo, brazo roto, prohibido usar una técnica, límite de tiempo, combate a muerte, moral desactivada o motivo específico de rivalidad), CONSERVA ESA REGLA EXACTA y desarróllala con mayor fuerza dramática y claridad.
2. CORRECCIÓN ORTOGRÁFICA Y GRAMATICAL: Corrige acentos, puntuación, mayúsculas, nombres de técnicas y fluidez verbal en perfecto español.
3. DETALLE Y PROFUNDIDAD NARRATIVA: Añade 1 o 2 oraciones cinematográficas que expliquen por qué llegaron a ese estado, el impacto del entorno sensorial (ozono, gravedad, ruinas) y la tensión psicológica de los personajes.
4. FORMATO DE SALIDA: Devuelve ÚNICAMENTE el texto final de la premisa mejorada, sin comillas al inicio ni al final, sin encabezados y sin explicaciones secundarias.`;

    try {
      const liveText = await this.queryAiDirectly(prompt, aiConfig, false);
      if (liveText && liveText.trim().length > 15) {
        return liveText.trim().replace(/^["']|["']$/g, '');
      }
    } catch (e) {
      console.warn('Error al refinar premisa con IA:', e);
    }

    // Procedural Fallback if AI is offline: clean capitalization and basic polishing
    let cleaned = rawPremise.trim();
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (!cleaned.endsWith('.')) cleaned += '.';
    return `${cleaned} [En ${scenName}, ambos bandos miden sus fuerzas bajo estas condiciones con máxima tensión táctica].`;
  },

  findReferenceCharacters(targetName = '', targetUniverse = '', allCharacters = []) {
    const list = Array.isArray(allCharacters) && allCharacters.length > 0
      ? allCharacters
      : [];
    
    if (!list || list.length === 0) return [];

    const nameClean = (targetName || '').toLowerCase().trim();
    const univClean = (targetUniverse || '').toLowerCase().trim();
    const nameTokens = nameClean.split(/[\s\(\)\/\-\_\:\.\,]+/).filter(t => t.length >= 3);

    // 1. Direct Name & Variant Matches (e.g. searching "Goku SSJ2" matches "Son Goku (DBS)")
    if (nameTokens.length > 0) {
      const nameMatches = list.filter(c => {
        const cName = (c.name || '').toLowerCase();
        const cAlias = (c.alias || '').toLowerCase();
        return nameTokens.some(tok => cName.includes(tok) || cAlias.includes(tok));
      });

      if (nameMatches.length > 0) {
        // Prioritize same universe if possible
        const sameUniv = nameMatches.filter(c => {
          const cUniv = (c.universe || '').toLowerCase();
          return univClean && (cUniv.includes(univClean) || univClean.includes(cUniv));
        });
        return (sameUniv.length > 0 ? sameUniv : nameMatches).slice(0, 2);
      }
    }

    // 2. Universe / Franchise Matches (e.g. searching "Toji" finds "Satoru Gojo" or "Ryomen Sukuna")
    if (univClean) {
      const univMatches = list.filter(c => {
        const cUniv = (c.universe || '').toLowerCase();
        return cUniv.includes(univClean) || univClean.includes(cUniv);
      });
      if (univMatches.length > 0) {
        return univMatches.slice(0, 2);
      }
    }

    // 3. Fallback: return top 1 character as structural template
    return list.slice(0, 1);
  },

  async generateCharacterStatsWithAi(charName, universe, aiConfig, allCharacters = [], referenceChar = null) {
    const refs = referenceChar ? [referenceChar] : this.findReferenceCharacters(charName, universe, allCharacters);
    
    let referenceSection = '';
    if (refs.length > 0) {
      const summarizedRefs = refs.map((ref, idx) => `
--- FICHA DE REFERENCIA #${idx + 1} (${ref.name} — ${ref.universe}) ---
${JSON.stringify({
  name: ref.name,
  alias: ref.alias,
  universe: ref.universe,
  saga: ref.saga,
  version: ref.version,
  tier: ref.tier,
  ap: ref.ap,
  range: ref.range,
  speed: ref.speed,
  strength: ref.strength,
  durability: ref.durability,
  stamina: ref.stamina,
  battleIQ: ref.battleIQ,
  haxTags: ref.haxTags,
  arsenal: ref.arsenal,
  forms: ref.forms,
  feats: ref.feats,
  psychology: ref.psychology,
  weaknesses: ref.weaknesses,
  synergies: ref.synergies
}, null, 2)}`).join('\n');

      referenceSection = `
### FICHAS OFICIALES DE REFERENCIA DEL ROSTER APEX (LOREBOOK BASES):
Usa estas fichas existentes de la base de datos de APEX como patrón exacto de estilo, calibración de poder, balance de stats y coherencia canónica:
${summarizedRefs}

DIRECTIVAS OBLIGATORIAS DE CALIBRACIÓN:
1. SI ES UNA VARIANTE DE UN PERSONAJE EXISTENTE (ej. "Goku SSJ2", "Gohan del Futuro", "Sukuna Heian"):
   - Mantén la coherencia con su ficha base (estilo marcial, fisiología, técnicas firma como Kamehameha o Desmantelar).
   - Calibra el Tier, velocidad, AP, feats y transformaciones estrictamente a la saga/época solicitada.
   - CERO ANACRONISMOS: No le des técnicas, formas ni conocimientos de sagas futuras que aún no existían en esa época.
2. SI ES UN NUEVO PERSONAJE DE LA MISMA FRANQUICIA:
   - Úsalas para calibrar la escala relativa de poder, velocidad y tipo de energía dentro del verso.
3. ESTILO DE ARSENAL:
   - Usa nombres canónicos oficiales en Japonés (Rōmaji) / Español / Inglés.
   - Define ataques básicos, al menos 2 súper ataques con porcentajes de energía/stamina, 1 ataque definitivo (finisher destructivo), y al menos 1 habilidad pasiva.
`;
    }

    const prompt = `Actúa como el Diseñador Principal de Lore y Powerscaling de APEX ENGINE (VS Battles Wiki Standard).
Genera la ficha técnica completa y ultra-detallada para el personaje "${charName}" (${universe || 'Desconocido'}).
${referenceSection}
Responde ÚNICAMENTE con un objeto JSON válido (sin explicaciones adicionales, sin bloques markdown de comillas triples, solo el JSON crudo) con este formato exacto:
{
  "name": "${charName}",
  "alias": "Título o Epíteto",
  "universe": "${universe || 'Canon'}",
  "saga": "Saga específica",
  "version": "Versión cronológica",
  "tier": "Tier X-X | Nivel Destructivo",
  "ap": "Potencia de Ataque justificada con hazañas",
  "range": "Rango de combate",
  "speed": { "combat": "Velocidad de combate", "reaction": "Reacción", "travel": "Desplazamiento", "attack": "Ataque" },
  "strength": { "striking": "Fuerza de choque", "lifting": "Fuerza de levantamiento" },
  "durability": "Resistencia física y energética",
  "stamina": "Resistencia de stamina y reservas",
  "battleIQ": "Inteligencia táctica y análisis marcial",
  "haxTags": ["Hax 1", "Hax 2", "Hax 3"],
  "arsenal": {
    "basicAttacks": "Estilo marcial y golpes básicos",
    "superAttacks": [
      { "name": "Ataque especial 1", "desc": "Descripción técnica", "cost": "20% Ki / Stamina" },
      { "name": "Ataque especial 2", "desc": "Descripción técnica", "cost": "35% Ki / Stamina" }
    ],
    "ultimateAttacks": [
      { "name": "Ataque Definitivo (Finisher)", "desc": "Descripción del clímax y consecuencias", "cost": "80% Ki / Stamina" }
    ],
    "passives": [
      { "name": "Pasiva 1", "desc": "Efecto continuo" }
    ],
    "actives": [
      { "name": "Activa 1", "desc": "Efecto temporal" }
    ]
  },
  "forms": [
    { "id": "base", "name": "Forma Base", "stats": "Estadísticas base" },
    { "id": "max", "name": "Forma Máxima", "stats": "Multiplicador y consumo" }
  ],
  "feats": [
    "Hazaña canónica 1 demostrada",
    "Hazaña canónica 2 demostrada"
  ],
  "psychology": "Mentalidad en batalla y moral",
  "weaknesses": "Vulnerabilidades o puntos ciegos",
  "synergies": [
    { "name": "Sinergia de Alianza", "partnerTags": ["Aliado"], "effect": "Buff combinado" }
  ],
  "teamCombos": [],
  "transformativeMechanics": {
    "canFuse": false,
    "canAbsorb": false,
    "fusionMethods": []
  }
}`;

    // 1. Try Live AI Generation (Gemini, OpenRouter, Puter)
    try {
      const rawText = await this.queryAiDirectly(prompt, aiConfig, true);
      if (rawText) {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && parsed.name && parsed.tier) {
            return {
              ...parsed,
              name: charName,
              universe: universe || parsed.universe || 'Canon'
            };
          }
        }
      }
    } catch (liveErr) {
      console.warn('Live AI generation fallback activated:', liveErr);
    }

    // 2. Lore Synthesizer Fallback
    return this.synthesizeCharacterLore(charName, universe);
  },

  async refineCharacterSectionWithAi(characterData, sectionKey, customInstruction, aiConfig) {
    const sectionDescriptions = {
      arsenal: 'Añadir, pulir y balancear los ataques básicos, súper ataques, ataques definitivos (finishers), pasivas y habilidades activas con nombres oficiales canónicos en Japonés (Rōmaji) / Inglés.',
      stats: 'Ajustar y calibrar rigurosamente el Tier de poder, Attack Potency (AP), Velocidad (combate, reacción, viaje, ataque), Fuerza (striking, lifting) y Durabilidad.',
      psychology: 'Enriquecer la psicología, inteligencia, experiencia en combate, tácticas y debilidades.',
      forms: 'Añadir o refinar transformaciones, multiplicadores de poder y formas alternas.',
      haxTags: 'Añadir o corregir los tags de habilidades HAX (ej: Negación de Durabilidad, Manipulación Espacial, etc.).',
      all: 'Refinar y pulir la ficha técnica completa respetando el canon del personaje.'
    };

    const prompt = `Actúa como el Diseñador Principal de Fichas de APEX Engine (Powerscaling & VSBattles).
FICHA ACTUAL DEL PERSONAJE:
${JSON.stringify(characterData, null, 2)}

TAREA ESPECÍFICA SOLICITADA POR EL USUARIO:
- Sección a modificar: "${sectionKey}" (${sectionDescriptions[sectionKey] || 'Sección específica'})
- Instrucción del usuario: "${customInstruction || 'Mejora y optimiza esta sección manteniendo el canon exacto'}"

REGLAS ESTRICTAS DE REFINAMIENTO SELECTIVO:
1. Modifica o añade ÚNICAMENTE los campos correspondientes a "${sectionKey}" o lo que pide la instrucción.
2. Mantén INTACTOS todos los demás campos existentes (nombre, universo, avatar, id, y los datos que no se hayan pedido cambiar).
3. Usa SIEMPRE los nombres oficiales y canónicos en Japonés (Rōmaji) o Inglés para las técnicas y formas (ej: Ryūken, Getsuga Tenshō, Murasaki).
4. Devuelve ÚNICAMENTE un objeto JSON válido (sin explicaciones, sin markdown ni comillas triples) con el personaje completo ya actualizado y fusionado.`;

    try {
      const rawText = await this.queryAiDirectly(prompt, aiConfig, true);
      if (rawText) {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && typeof parsed === 'object') {
            return {
              ...characterData,
              ...parsed,
              id: characterData.id,
              avatar: characterData.avatar || parsed.avatar
            };
          }
        }
      }
    } catch (e) {
      console.warn('Error en refinamiento selectivo IA:', e);
    }

    return characterData;
  },

  synthesizeCharacterLore(charName, universe) {
    const nameLower = (charName || '').toLowerCase().trim();

    // Comprehensive Lore Base (Dragon Ball, JJK, Naruto, One Piece, OPM, Marvel/DC, Gaming, Bleach)
    if (nameLower.includes('broly')) {
      return {
        name: charName,
        universe: universe || 'Dragon Ball Super',
        tier: 'Tier 2-C | Multiversal Bajo (LSSJ Full Power)',
        ap: 'Nivel Multiversal Bajo (Su choque con Gogeta Blue rompió la membrana dimensional del espacio)',
        range: 'Universal a Multi-Universal',
        speed: { combat: 'MFTL+', reaction: 'MFTL+', travel: 'MFTL+', attack: 'MFTL+' },
        strength: { striking: 'Multi-Universal Class', lifting: 'Clase Yotta' },
        durability: 'Nivel Multiversal Bajo con Barrera de Ki Verde esmeralda',
        stamina: 'Ilimitada (Su Ki y masa muscular se desbordan continuamente mientras aumenta su furia)',
        battleIQ: 'Berserker Instintivo (Reflejos de depredador animal absolutos)',
        weaknesses: 'Frenesí descontrolado que le impide formular estrategias complejas',
        haxTags: ['Adaptación Reactiva', 'Negación de Durabilidad'],
        arsenal: {
          basicAttacks: 'Embestidas con el hombro que quiebran tectónica y martillazos dobles',
          superAttacks: [
            { name: 'Gigantic Roar', desc: 'Haz de Ki masivo disparado desde la boca que vaporiza materia atómica.', cost: '10% Ki' },
            { name: 'Eraser Cannon', desc: 'Esferas verdes concentradas con radio de detonación estelar.', cost: '5% Ki' }
          ],
          ultimateAttacks: [
            { name: 'Omega Blaster Colosal', desc: 'Esfera gigantesca de energía vital que devora todo a su paso y crece exponencialmente.', cost: '50% Ki' }
          ],
          passives: [
            { name: 'Desbordamiento de Ki Infinito', desc: 'Aumenta su AP, durabilidad y velocidad cada segundo que pasa en combate.' },
            { name: 'Barrera Esmeralda Impenetrable', desc: 'Escudo pasivo que dispersa proyectiles de energía.' }
          ],
          actives: [
            { name: 'Frenesí Berserker', desc: 'Anula por completo la sensación de dolor y el aturdimiento físico.', cost: 'Ninguno' }
          ]
        },
        forms: [
          { name: 'Forma Base / Ikari', stats: 'Multiplicador Oozaru x10 en cuerpo humanoide.' },
          { name: 'Super Saiyan C-Type (Pelo Verde)', stats: 'Poder destructivo ilimitado.' },
          { name: 'LSSJ Full Power (Máxima Potencia)', stats: 'Multiplicadores de fuerza y velocidad inconmensurables.' }
        ]
      };
    }

    if (nameLower.includes('cell')) {
      return {
        name: charName,
        universe: universe || 'Dragon Ball Z',
        tier: 'Tier 4-B a 3-A | Solar System a Universal',
        ap: 'Nivel Sistema Solar a Universal (Solar Kamehameha con Ki divino refinado)',
        range: 'Sistema Solar',
        speed: { combat: 'MFTL', reaction: 'MFTL', travel: 'MFTL', attack: 'MFTL' },
        strength: { striking: 'Multi-Planet Class', lifting: 'Clase Stellar' },
        durability: 'Nivel Sistema Solar con Regeneración Celular Absoluta',
        stamina: 'Prácticamente inagotable gracias a las células androides',
        battleIQ: 'Genio de Combate con la memoria genética de Goku, Vegeta, Piccolo y Freezer',
        weaknesses: 'Arrogancia narcisista; destrucción total de su núcleo central en la cabeza',
        haxTags: ['Anulación de Regeneración', 'Adaptación Reactiva', 'Negación de Durabilidad'],
        arsenal: {
          basicAttacks: 'Artes marciales combinadas de los Guerreros Z y estocadas de cola',
          superAttacks: [
            { name: 'Makankosappo Perfeccionado', desc: 'Rayo perforante en espiral que atraviesa barreras de energía.', cost: '10% Ki' },
            { name: 'Kamehameha Instantáneo', desc: 'Disparo a quemarropa teletransportándose a milímetros del pecho rival.', cost: '15% Ki' }
          ],
          ultimateAttacks: [
            { name: 'Solar Kamehameha', desc: 'Haz colosal de energía vital capaz de erradicar un sistema estelar entero.', cost: '50% Ki' }
          ],
          passives: [
            { name: 'Regeneración Celular Namekiana', desc: 'Se reconstruye por completo en segundos desde un solo átomo de su núcleo craneal.' },
            { name: 'Zenkai Saiyajin Infinito', desc: 'Si sobrevive al borde de la muerte, duplica su AP y velocidad permanentemente.' }
          ],
          actives: [
            { name: 'Transmisión Instantánea', desc: 'Teletransportación inmediata a cualquier coordenada.', cost: 'Mínimo' }
          ]
        },
        forms: [
          { name: 'Forma Perfecta', stats: 'Estabilidad y velocidad supremas.' },
          { name: 'Forma Super Perfecta', stats: 'Aura eléctrica equivalente a un SSJ2 post-zenkai.' },
          { name: 'Forma Ultra Perfecta', stats: 'Evolución biológica sin límites.' }
        ]
      };
    }

    if (nameLower.includes('freezer') || nameLower.includes('frieza')) {
      return {
        name: charName,
        universe: universe || 'Dragon Ball Super',
        tier: 'Tier 2-C | Multiversal Bajo (Black Frieza)',
        ap: 'Nivel Multiversal Bajo (One-shoteó a Goku Ultra Instinto y Vegeta Ultra Ego simultáneamente)',
        range: 'Universal',
        speed: { combat: 'MFTL+', reaction: 'MFTL+', travel: 'MFTL+', attack: 'MFTL+' },
        strength: { striking: 'Multi-Universal Class', lifting: 'Clase Yotta' },
        durability: 'Nivel Multiversal Bajo con cuerpo de aleación biológica Black',
        stamina: 'Extrema (10 años de entrenamiento en la Habitación del Tiempo)',
        battleIQ: 'Genio Sádico y Calculador',
        weaknesses: 'Sadismo excesivo que lo lleva a torturar a sus rivales en lugar de rematarlos',
        haxTags: ['Negación de Durabilidad', 'Manipulación Espacial', 'Inmunidad a la Radiación'],
        arsenal: {
          basicAttacks: 'Rayos mortales Death Beam perforantes y golpes de cola lacerantes',
          superAttacks: [
            { name: 'Death Beam Concentrado', desc: 'Rayo láser a velocidad de la luz que perfora corazones y cabezas.', cost: '5% Ki' },
            { name: 'Death Ball / Supernova', desc: 'Esfera de fuego estelar capaz de pulverizar planetas al contacto.', cost: '20% Ki' }
          ],
          ultimateAttacks: [
            { name: 'Supernova Black Destroyer', desc: 'Orbe oscuro masivo que colapsa la gravedad y erradica galaxias enteras.', cost: '60% Ki' }
          ],
          passives: [
            { name: 'Fisiología Demoníaca del Frío', desc: 'Sobrevive en el vacío espacial, decapitado o partido por la mitad sin perder la conciencia.' },
            { name: 'Control de Telequinesis Absoluto', desc: 'Manipula masas planetarias y rivales a distancia sin tocarlos.' }
          ],
          actives: [
            { name: 'Aura Dorada / Negra', desc: 'Multiplica su potencia de impacto x100 de forma instantánea.', cost: 'Consumo sostenido' }
          ]
        },
        forms: [
          { name: 'Forma Final', stats: 'Poder estelar refinado.' },
          { name: 'Golden Frieza', stats: 'Poder divino equiparable al Super Saiyan Blue.' },
          { name: 'Black Frieza', stats: 'Poder multiversal absoluto capaz de humillar dioses.' }
        ]
      };
    }

    if (nameLower.includes('kratos')) {
      return {
        name: charName,
        universe: universe || 'God of War',
        tier: 'Tier 2-C | Multiversal Bajo',
        ap: 'Nivel Multiversal Bajo (Venció a los Titanes, Dioses del Olimpo y Asgard; cerró grietas en el tejido de la realidad)',
        range: 'Cuerpo a cuerpo a Varios kilómetros con armas divinas',
        speed: { combat: 'MFTL+ / Infinito (Reacciona a la luz de Helios y a Valkirias)', reaction: 'Instantánea', travel: 'Relativista', attack: 'MFTL+' },
        strength: { striking: 'Multi-Universal Class (Volteó el Templo de Tyr que sostiene 9 Reinos)', lifting: 'Incalculable' },
        durability: 'Nivel Multiversal Bajo con Factor de Curación Espartano',
        stamina: 'Prácticamente inagotable en combate a muerte',
        battleIQ: 'Maestro de la Guerra Milenaria (Domina cualquier arma y táctica en combate)',
        weaknesses: 'Agotamiento emocional; remordimiento por su pasado',
        haxTags: ['Negación de Inmortalidad', 'Manipulación Temporal', 'Negación de Durabilidad', 'Anulación de Regeneración'],
        arsenal: {
          basicAttacks: 'Estocadas con las Espadas del Caos, tajos del Hacha Leviatán y golpes con escudo guardián',
          superAttacks: [
            { name: 'Ciclón de Caos', desc: 'Torbellino de llamas primordiales del Inframundo que calcina defensas divinas.', cost: 'Medio' },
            { name: 'Lanza Draupnir Multiplicada', desc: 'Lanzas que se replican infinitamente y detonan a voluntad atravesando blindajes.', cost: 'Bajo' }
          ],
          ultimateAttacks: [
            { name: 'Furia Espartana: Desatar al Fantasma de Esparta', desc: 'Modo berserker donde su fuerza se vuelve incontenible, volviéndose invulnerable y regenerando salud en cada golpe.', cost: 'Barra de Furia' }
          ],
          passives: [
            { name: 'Fisiología de Dios de la Guerra', desc: 'Inmune a la vejez y a la muerte biológica ordinaria; resucita por pura fuerza de voluntad si muere.', cost: 'Pasivo' },
            { name: 'Hielo y Fuego Primordiales', desc: 'Congela y quema a nivel conceptual neutralizando regeneraciones enemigas.' }
          ],
          actives: [
            { name: 'Ivaldi Anvil', desc: 'Golpe de impacto sísmico con el Hacha que congela el tiempo del rival durante 3 segundos.', cost: 'Alto' }
          ]
        },
        forms: [
          { name: 'Dios de la Guerra Nórdico (Barba/Sabio)', stats: 'Fuerza contenida pero máxima experiencia táctica.' },
          { name: 'Fantasma de Esparta Desatado (Furia Total)', stats: 'Fuerza destructiva imparable x10.' }
        ]
      };
    }

    if (nameLower.includes('superman') || nameLower.includes('clark kent')) {
      return {
        name: charName,
        universe: universe || 'DC Comics',
        tier: 'Tier 2-A a 1-C | Multiversal Complejo / High Hyper',
        ap: 'Nivel Multiversal Complejo (Kriptoniano alimentado por radiación solar; World Forger Punch)',
        range: 'Universal a Interdimensional',
        speed: { combat: 'MFTL+ a Inconmensurable', reaction: 'Inconmensurable', travel: 'MFTL+', attack: 'MFTL+' },
        strength: { striking: 'Multi-Universal Class (Levantó el Libro del Infinito)', lifting: 'Incalculable' },
        durability: 'Invulnerabilidad Solar Absoluta',
        stamina: 'Inagotable bajo luz solar amarilla o azul',
        battleIQ: 'Mente de Super-Ordenador Kriptoniano (Procesa millones de probabilidades por nanosegundo)',
        weaknesses: 'Kriptonita verde, radiación de sol rojo y vulnerabilidad a la magia conceptual',
        haxTags: ['Negación de Durabilidad', 'Manipulación Espacial', 'Inmunidad Mental'],
        arsenal: {
          basicAttacks: 'Puñetazos a velocidad superlumínica y aliento helado a cero absoluto',
          superAttacks: [
            { name: 'Visión Térmica Solar', desc: 'Rayos de calor más calientes que el núcleo del Sol que calcinan la materia a nivel atómico.', cost: 'Bajo' },
            { name: 'Aliento Congelante a Cero Absoluto', desc: 'Detiene el movimiento molecular del oponente congelándolo instantáneamente.', cost: 'Bajo' }
          ],
          ultimateAttacks: [
            { name: 'Infinite Mass Punch (Golpe de Masa Infinita)', desc: 'Puñetazo acelerado a 99.999% de la velocidad de la luz con la masa de una estrella enana blanca.', cost: 'Medio' }
          ],
          passives: [
            { name: 'Campo de Fuerza Bio-Eléctrico', desc: 'Escudo invisible que protege su cuerpo y vestimenta de proyectiles atómicos.', cost: 'Pasivo' },
            { name: 'Super Sentidos Cuánticos', desc: 'Escucha latidos cardíacos a galaxias de distancia y ve longitudes de onda cuánticas.' }
          ],
          actives: [
            { name: 'Sun Dip (Inmersión Solar)', desc: 'Se sumerge en el corazón de un sol aumentando todas sus estadísticas x1000.', cost: 'Requiere Sol' }
          ]
        },
        forms: [
          { name: 'Forma Base (Tierra)', stats: 'Poder estelar continuo.' },
          { name: 'Superman Sun-Dipped', stats: 'Poder multiversal colosal.' },
          { name: 'Superman Prime One Million', stats: 'Poder de alteración de la realidad divino.' }
        ]
      };
    }

    if (nameLower.includes('batman') || nameLower.includes('bruce wayne')) {
      return {
        name: charName,
        universe: universe || 'DC Comics',
        tier: 'Tier 9-B (Base) / Tier 2-C (Con Traje Hellbat / Prep Time)',
        ap: 'Nivel Humano Máximo (Base) a Nivel Multiversal Bajo (Con Hellbat Armor capaz de herir a Darkseid)',
        range: 'Cuerpo a cuerpo a Varios kilómetros con gadgets',
        speed: { combat: 'Supersónico (Reflejos de esquiva de balas en Base) / MFTL+ (Hellbat)', reaction: 'Hipersónico Alto', travel: 'Mach 2 en batwing', attack: 'Supersónico' },
        strength: { striking: 'Wall Class (Base) / Multi-Stellar (Hellbat)', lifting: '500kg (Base) / Clase Yotta (Hellbat)' },
        durability: 'Nivel Muro con armadura de kevlar y titanio; Nivel Multiversal Bajo con Hellbat',
        stamina: 'Humana Máxima Absoluta (Combate 48 horas seguidas sin dormir)',
        battleIQ: 'La Mente Más Brillante del Multiverso DC (Descubre y explota cualquier debilidad en segundos)',
        weaknesses: 'Cuerpo biológico humano vulnerable en forma base; Hellbat drena su fuerza vital',
        haxTags: ['Anulación de Hax', 'Negación de Durabilidad', 'Inmunidad Mental'],
        arsenal: {
          basicAttacks: 'Maestría en las 127 artes marciales del mundo y batarangs electrificados',
          superAttacks: [
            { name: 'Disruptor PEM & Gas Nervioso', desc: 'Inhabilita sistemas cibernéticos, armas tecnológicas y sentidos biológicos.', cost: 'Gadget' },
            { name: 'Guanteletes de Descarga de 200,000V', desc: 'Colapsa el sistema muscular y nervioso del rival al contacto.', cost: 'Batería' }
          ],
          ultimateAttacks: [
            { name: 'Protocolo de Contingencia / Despliegue Hellbat', desc: 'Activa la armadura forjada por la Liga de la Justicia para combatir entidades cósmicas.', cost: 'Drena salud por minuto' }
          ],
          passives: [
            { name: 'Voluntad Indomable', desc: 'Inmune al control mental, telepatía invasiva y manipulación del miedo.', cost: 'Pasivo' },
            { name: 'Sigilo y Camuflaje Cuántico', desc: 'Desaparece del radar, visión térmica y sentidos agudizados.', cost: 'Pasivo' }
          ],
          actives: [
            { name: 'Análisis Táctico en Tiempo Real', desc: 'Predice los siguientes 10 movimientos del rival basándose en su biomecánica.', cost: 'Ninguno' }
          ]
        },
        forms: [
          { name: 'Batman Táctico Estándar', stats: 'Nivel humano máximo con inventario completo.' },
          { name: 'Armadura Hellbat (Justice Buster)', stats: 'Fuerza y velocidad divinas para luchar contra Darkseid.' },
          { name: 'The Final Batsuit (Elemento X)', stats: 'Control mental del universo y reescritura de materia.' }
        ]
      };
    }

    // Default Procedural Generator for ANY other character or OC
    const isCosmic = nameLower.includes('dios') || nameLower.includes('god') || nameLower.includes('cosmic') || nameLower.includes('titan') || nameLower.includes('king');
    const isSpeedster = nameLower.includes('flash') || nameLower.includes('rayo') || nameLower.includes('sonic') || nameLower.includes('speed') || nameLower.includes('shadow');

    return {
      name: charName,
      universe: universe || 'Universo Canon / Crossover',
      tier: isCosmic ? 'Tier 2-C | Multiversal Bajo' : (isSpeedster ? 'Tier 4-A | Multi-Sistema Solar' : 'Tier 6-B | Nivel País / Continental'),
      ap: isCosmic ? 'Aniquilación de líneas temporales y estructuras cósmicas' : 'Ondas de choque sísmicas capaces de quebrar placas tectónicas y defensas densas',
      range: isCosmic ? 'Universal / Interdimensional' : 'Varios kilómetros con proyectiles de energía',
      speed: {
        combat: isSpeedster ? 'MFTL+ (Millones de veces la luz)' : 'FTL / Relativista',
        reaction: isSpeedster ? 'Instantánea' : 'Hipersónico Alto',
        travel: isSpeedster ? 'MFTL+' : 'Mach 50 en vuelo',
        attack: isSpeedster ? 'Velocidad de la Luz' : 'Hipersónico+'
      },
      strength: { striking: isCosmic ? 'Multi-Stellar Class' : 'Continental Class', lifting: 'Clase Tera' },
      durability: isCosmic ? 'Resistencia Universal con barrera reactiva' : 'Resistencia Continental con armadura biológica o escudo cinético',
      stamina: 'Alta (Capaz de sostener combate ininterrumpido durante horas)',
      battleIQ: 'Genio Táctico y Analítico (Detecta puntos ciegos biomecánicos en combate)',
      weaknesses: 'Desgaste acelerado en modo de máxima potencia; vulnerabilidad a sobrecarga sensorial',
      haxTags: isCosmic ? ['Negación de Durabilidad', 'Manipulación Espacial', 'Anulación de Hax'] : ['Negación de Durabilidad', 'Adaptación Reactiva'],
      arsenal: {
        basicAttacks: `Impactos concentrados a alta velocidad imbuidos en energía de ${universe || 'combate'} y ráfagas penetrantes`,
        superAttacks: [
          { name: `Descarga de Impacto Crítico de ${charName}`, desc: 'Ataque concentrado que pulveriza barreras defensivas y transfiere energía cinética interna.', cost: '20% Energía' },
          { name: 'Ráfaga de Proyectiles de Alta Densidad', desc: 'Disparos veloces en abanico que saturan el área de combate impidiendo la evasión.', cost: '15% Energía' }
        ],
        ultimateAttacks: [
          { name: `Juicio Final: Despertar de ${charName}`, desc: 'Liberación del 100% de potencia que colapsa el terreno en un radio de varios kilómetros con daño irrecuperable.', cost: '80% Energía' }
        ],
        passives: [
          { name: 'Barrera de Dispersión Pasiva', desc: 'Mitiga el 30% del daño recibido de proyectiles cinéticos y de energía.' },
          { name: 'Percepción Agudizada', desc: 'Anticipa trayectorias y emboscadas a velocidad de reacción máxima.' }
        ],
        actives: [
          { name: 'Sobrecarga de Potencial', desc: 'Aumenta la velocidad de combate y el AP en un 50% durante 60 segundos.', cost: 'Fatiga post-uso' }
        ]
      },
      forms: [
        { name: 'Forma Base', stats: 'Modo equilibrado con control de reservas energéticas.' },
        { name: 'Forma Despertada / Modo Máximo', stats: 'Multiplicador x5 a velocidad, AP y durabilidad total.' }
      ]
    };
  },

  async generateScenarioWithAi(name, universe, aiConfig) {
    const prompt = `Genera las propiedades físicas y sensoriales de la arena/escenario de combate "${name}" (${universe || 'Canon'}).
Responde ÚNICAMENTE con un objeto JSON válido (sin formato markdown ni comillas triples) con este formato exacto:
{
  "name": "${name}",
  "universe": "${universe || 'Canon'}",
  "sensory": "Descripción vívida de olores a ozono, azufre, iluminación, sonidos y atmósfera ambiental",
  "gravity": "Gravedad (ej. 1G, 100G, Cero Gravedad)",
  "temperature": "Temperatura y clima (ej. 25°C Templada, 1200°C Magma, Cero Absoluto)",
  "terrainEffect": "Peligros ambientales y efectos de terreno (ej. Colapso en 5 min, magma activo, vacío)"
}`;

    try {
      const liveJson = await this.queryAiDirectly(prompt, aiConfig, true);
      if (liveJson) {
        const match = liveJson.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed && parsed.sensory) {
            return {
              name: name || parsed.name || 'Arena de Combate',
              universe: universe || parsed.universe || 'Canon',
              sensory: parsed.sensory,
              gravity: parsed.gravity || '1G (Tierra Estándar)',
              temperature: parsed.temperature || 'Templada (22°C)',
              terrainEffect: parsed.terrainEffect || 'Terreno destructible'
            };
          }
        }
      }
    } catch (e) {
      console.warn('Error generando escenario con IA en vivo, usando sintetizador:', e);
    }

    // Procedural Fallback
    const nameLower = (name || '').toLowerCase();
    let sensory = `El aire denso en ${name} huele a ozono quemado y tierra pulverizada bajo una atmósfera cargada de energía combativa.`;
    let gravity = '1G (Tierra Estándar)';
    let temperature = 'Templada (22°C)';
    let terrainEffect = 'Terreno altamente destructible susceptible a cráteres y ondas de choque.';

    if (nameLower.includes('infierno') || nameLower.includes('hell') || nameLower.includes('volcan') || nameLower.includes('lava')) {
      sensory = `El aire asfixiante arde a más de 800°C con un penetrante olor a azufre y gases volcánicos que dificultan la respiración.`;
      gravity = '1.5G (Gravedad Pesada)';
      temperature = 'Extremo Calor (850°C)';
      terrainEffect = 'Ríos de magma activo y géiseres térmicos que castigan a quien toque el suelo.';
    } else if (nameLower.includes('espacio') || nameLower.includes('vacio') || nameLower.includes('cosmos')) {
      sensory = `Vacío absoluto donde el sonido no se propaga y la radiación cósmica bombardea el entorno con frío glacial.`;
      gravity = '0G (Microgravedad Total)';
      temperature = 'Cero Absoluto (-270°C)';
      terrainEffect = 'Cero fricción aérea y presencia de asteroides en colisión.';
    } else if (nameLower.includes('ruina') || nameLower.includes('ciudad') || nameLower.includes('shinjuku')) {
      sensory = `Humo espeso, olor a asfalto derretido, hormigón pulverizado y cables eléctricos chisporroteando.`;
      gravity = '1G (Tierra Estándar)';
      temperature = 'Calor Urbano (35°C)';
      terrainEffect = 'Rascacielos derrumbándose y escombros pesados utilizables como proyectiles.';
    }

    return {
      name: name || 'Arena Neutral',
      universe: universe || 'Universo Neutro',
      sensory,
      gravity,
      temperature,
      terrainEffect
    };
  },

  async batchParseCharactersWithAi(rawText, aiConfig) {
    if (!rawText || !rawText.trim()) return [];

    const prompt = `[DIRECTIVA OBLIGATORIA: Eres un extractor y formateador experto de perfiles de combate y powerscaling de VS Battles y APEX Engine].
Analiza el siguiente texto proporcionado por el usuario. El texto puede contener descripciones de uno o VARIOS personajes (anime, cómics, videojuegos, cine, novelas o personajes originales OCs), fichas de rol, wikis o listas.

TEXTO DEL USUARIO:
"""
${rawText.trim()}
"""

INSTRUCCIONES DE POWER SCALING CANÓNICO (VS BATTLES WIKI STANDARD):
1. Extrae e identifica TODOS los personajes presentes en el texto.
2. REGLA ESTRICTA DE FORMAS: Si el personaje tiene transformaciones o modos de poder, DEBE incluir OBLIGATORIAMENTE un array "forms" donde la primera forma sea SIEMPRE el "Estado Base" (id: "base", name: "Estado Base"), seguida en orden cronológico por sus formas y multiplicadores superiores.
3. ESTÁNDAR DE TIERS (VS BATTLES WIKI): Clasifica el Tier usando la nomenclatura oficial exacta (ej: Tier 11-C a Tier 0: "Tier 7-B | Nivel Ciudad", "Tier 4-B | Nivel Sistema Solar", "Tier 2-C | Nivel Multiverso Bajo", "Tier 1-A | Nivel Outerversal").
4. CINEMÁTICA Y FÍSICA: Especifica velocidades reales en Mach, FTL o Inconmensurable (Tiempo 0), durabilidad justificada por la 3ª Ley de Newton (fuerza de choque) y lista detallada de Hax y debilidades canónicas.
5. Devuelve ÚNICAMENTE un array JSON válido de objetos con este formato exacto (sin bloques markdown ni explicaciones, solo el JSON puro empezando con [ y terminando con ]):

[
  {
    "id": "slug-unico-del-personaje",
    "name": "Nombre del Personaje",
    "alias": "Título o Epíteto Canónico",
    "universe": "Universo o Franquicia",
    "saga": "Saga o Arco Argumental",
    "version": "Versión Cronológica Exacta",
    "tier": "Tier 4-B | Nivel Sistema Solar",
    "ap": "Potencia de Ataque justificada con hazañas y julios",
    "range": "Rango de alcance",
    "speed": {
      "combat": "Velocidad de Combate (ej: MFTL+, Hipersónico Masivo+, FTL)",
      "reaction": "Velocidad de Reacción",
      "travel": "Velocidad de Desplazamiento",
      "attack": "Velocidad de Ataque"
    },
    "strength": {
      "striking": "Clase de Impacto Físico",
      "lifting": "Fuerza de Levantamiento"
    },
    "durability": "Durabilidad física y resistencias",
    "stamina": "Resistencia biológica y desgaste de formas",
    "battleIQ": "Inteligencia Táctica / Nivel de Estrategia",
    "weaknesses": "Puntos débiles y límites de poder",
    "haxTags": ["Hax 1", "Hax 2", "Hax 3"],
    "arsenal": {
      "basicAttacks": "Golpes básicos y ataques marciales",
      "superAttacks": [
        { "name": "Nombre Súper Ataque 1", "desc": "Descripción técnica del ataque", "cost": "Gasto de energía" }
      ],
      "ultimateAttacks": [
        { "name": "Nombre Técnica Definitiva", "desc": "Ataque destructor supremo", "cost": "Costo de energía máxima" }
      ],
      "passives": [
        { "name": "Nombre Habilidad Pasiva", "desc": "Efecto pasivo constante" }
      ]
    },
    "forms": [
      { "id": "base", "name": "Estado Base", "stats": "Tier 7-B | Nivel Ciudad. Nivel estándar sin transformaciones." },
      { "id": "forma-superior", "name": "Forma Despertada", "stats": "Tier 4-B | Nivel Sistema Solar. Multiplicador x50 de potencia." }
    ],
    "feats": [
      "Hazaña destructiva canónica",
      "Hazaña de velocidad o resistencia demostrada"
    ],
    "psychology": "Mentalidad y motivación en combate"
  }
]`;

    try {
      const aiResponse = await this.queryAiDirectly(prompt, aiConfig, true);
      if (aiResponse) {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(c => ({
              ...c,
              id: c.id || `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
            }));
          }
        }
      }
    } catch (e) {
      console.warn('AI batch parsing failed, using heuristic parser:', e);
    }

    // Heuristic fallback: split by paragraphs/lines and extract character names
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const results = [];
    for (const line of lines) {
      const cleanName = line.replace(/^[\d\-\*\•\.\)]+\s*/, '').replace(/\(.*?\)/g, '').trim();
      if (cleanName.length > 2 && cleanName.length < 50) {
        results.push({
          id: `char-${Date.now()}-${results.length}`,
          name: cleanName,
          universe: 'Universo Detectado',
          version: 'Forma Prime',
          tier: 'Tier 7-B | Nivel Ciudad',
          ap: 'Impactos de combate y ráfagas de energía concentrada.',
          range: 'Cuerpo a cuerpo a medio alcance.',
          speed: { combat: 'Hipersónico+', reaction: 'Sub-Relativista', travel: 'Mach 5', attack: 'Hipersónico' },
          strength: { striking: 'Class M', lifting: 'Class 100' },
          durability: 'Nivel Ciudad con armadura física o refuerzo de energía.',
          stamina: 'Alta en combate sostenido.',
          battleIQ: 'Veterano de Combate Táctico.',
          weaknesses: 'Desgaste energético prolongado.',
          haxTags: ['Negación de Durabilidad', 'Adaptación Reactiva'],
          arsenal: {
            basicAttacks: 'Golpes de artes marciales y disparos de energía.',
            superAttacks: [{ name: 'Ataque Especial Directo', desc: 'Impacto concentrado de alta potencia.', cost: '20% Energía' }],
            ultimateAttacks: [{ name: 'Ataque Definitivo', desc: 'Liberación total de poder.', cost: '80% Energía' }]
          }
        });
      }
    }
    return results.slice(0, 10);
  }
};


