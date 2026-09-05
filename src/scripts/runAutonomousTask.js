/**
 * APEX UNIVERSAL AUTONOMOUS TASK RUNNER — GOLDEN STANDARD EDITION
 * 
 * Enriquecimiento Integral de Fichas con Máximo Rigor:
 * - Auditoría de Formas Base + Transformaciones Canónicas y APEX-Custom
 * - Arsenal Táctico con Costes de Stamina y Contrajuegos
 * - Pasivas Fisiológicas continuas y Debilidades de combate
 * - Combos Coordinados de Equipo (Team Combos de 3 Fases) y Sinergias
 * - Compatibilidad Dinámica para cualquier número de personajes y archivos externos
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const CHARACTERS_FILE = path.join(projectRoot, 'src/data/characters.js');
const OUTPUT_DIR = path.join(projectRoot, 'src/data/enrichmentDrafts');
const PROXY_PORT = 4097;

// CLI arguments
const TASK_DESCRIPTION = process.argv[2] || 'full_enrichment';
const TARGET_UNIVERSE = process.argv[3] || 'all';
const MODEL = process.argv[4] || 'minimax/minimax-m3:free';
const MAX_LIMIT = process.argv[5] ? parseInt(process.argv[5], 10) : 0;
const ROUNDS = process.argv[6] !== undefined ? parseInt(process.argv[6], 10) : 1;
const START_INDEX = process.argv[7] ? Math.max(1, parseInt(process.argv[7], 10)) : 1;

// Optimizacion dinamica de lote para maximizar respuestas y no saturar cuota gratuita
let BATCH_SIZE = 2;
if (MODEL.includes('muse')) {
  BATCH_SIZE = 4; // ⭐ Lote óptimo de 4 para Meta Muse Spark: aprovecha su contexto de 1M y sus 131k tokens de salida
} else if (MODEL.includes('minimax') || MODEL.includes('ling')) {
  BATCH_SIZE = 3; // 33% menos llamadas a la API de OpenRouter
}

let SYSTEM_PROMPT_MASTER = `APEX MASTER ROSTER ENRICHMENT & AUDIT ENGINE
ESTÁNDAR DORADO — MODO AUTÓNOMO DE ALTA PRECISIÓN TÁCTICA

Actúa como Diseñador Maestro de Roster, Curador de Lore y Especialista en Arquitectura de Combate para APEX Power Scaling Engine.`;

if (MODEL.includes('muse')) {
  SYSTEM_PROMPT_MASTER += `\n\n[MODO AGÉNTICO DE META MUSE SPARK 1.3 ACTIVADO]:
- Tienes una ventana masiva de 1 Millón de tokens y 131k de salida. Aprovéchala para analizar los 4 personajes del lote de forma holística.
- Correlaciona a los personajes del lote entre sí: si comparten universo o saga, genera 'synergies' cruzadas y 'teamCombos' coordinados directos.
- Desglosa cada arsenal con el máximo detalle táctico, especificando costes exactos de stamina (3-60) y 'counterplay' realista para cada técnica.`;
}

SYSTEM_PROMPT_MASTER += `\n\nTu misión es transformar cada personaje del lote en una ficha táctica de nivel maestro siguiendo estrictamente esta plantilla:

1. RECONOCIMIENTO Y FIDELIDAD CRONOLÓGICA:
   - Identifica al personaje por su nombre, saga, versión, universo y contexto canónico.
   - Cero anacronismos: Respeta la línea temporal estricta de la saga indicada.

2. AUDITORÍA EXHAUSTIVA DE FORMAS Y REGLA DE ORO CANÓNICA:
   - REGLA DE ORO: EXACTAMENTE UNA SOLA FORMA BASE POR PERSONAJE:
     * Toda ficha DEBE tener su Forma Base en el índice 0 del array forms con apexKiMultiplier: 1.0 y staminaDrain: 0.
     * Si el personaje ya tiene una forma base con nombre específico de saga (ej: "Goku Mini Estado Base", "Son Goku (Estado Base Saga Cell)", "Piccolo Base", etc.), CONSERVA Y AUDITA ESA MISMA FORMA. NUNCA insertes una segunda forma llamada "Estado Base" genérica.
     * NUNCA pongas una forma base después de una transformación.
   - CLASIFICACIÓN RIGUROSA EN 4 CATEGORÍAS ONTOLÓGICAS:
     * "transformation": Cambio biológico o fisiológico sostenido que escala apexKi y Tier (SSJ1-4, God, Blue, Beast, Orange Piccolo, Gear 4/5, Bankai, Resurrección).
     * "state_amp": Técnica de amplificación o sobreesfuerzo temporal que escala burstKi con daño de retroceso/recoil (Kaio-ken x1-x20, Espalda del Demonio de Baki/Yujiro, 100% Deku).
     * "hax_mode": Expansión de Dominio, barrera o estado conceptual. NO infla la fuerza física de Scouter; otorga acierto seguro o control espacial y lleva doesNotIncrease: ["baseAP", "durabilityKi"].
     * "degradation_state": Estado de fatiga, veneno, enfermedad o compresión dimensional (Goku virus corazón, Daima Mini compresión ÷10, All Might forma débil).
   - PROHIBICIÓN ABSOLUTA DE FORMAS ESPURIAS Y MODOS INVENTADOS:
     * ESTRICTAMENTE PROHIBIDO crear formas artificiales llamadas "Estado Base (100% Máximo Poder)", "Estado Base (Poder Desatado / Sin Contención)" o similares en personajes que ya cuentan con transformaciones reales.
     * SOLO personajes cuya transformación canónica de autor sea explícitamente el 100% muscular (ej. Freezer Forma Final 100%, Maestro Roshi Máximo Poder, Toguro 100%) pueden llevar esa forma.
    - PARA CADA FORMA DECLARAR:
      * id, name canónico descriptivo y category ("transformation" | "state_amp" | "hax_mode" | "degradation_state").
      * apexKiMultiplier (1.0 para base, factor correspondiente para superiores, <1.0 para debuffs).
      * tier y tierExact escalado según el nuevo nivel de potencia (FORMATO ESTRICTO OBLIGATORIO: ^(High |Low )?\\d{1,2}-[ABC]$ sin "+", sin sufijos ni paréntesis).
      * activationCondition, durationLimit, staminaDrain (gasto por turno) y drawbacks (fatiga, daño muscular, tiempo).
      * combatModifiers: { initiative, hitChance, dodgeChance, defensePenetration }.
      * canonStatus: "source_backed" para canónicas oficiales, "apex_custom" solo para What-Ifs.
    - REGLA DE ORO V25 — INVARIANTES CONSTITUCIONALES DEL ROSTER:
      * Ki y Tier monótonos crecientes dentro del mismo powerTree.
      * Prohibido modificar Ki o multiplicadores como atajo para arreglar un Tier; la corrección por defecto es ajustar el Tier.
      * Aislamiento absoluto de entidades externas (bodyStatIsolation: true): las entidades invocadas NO alteran los stats corporales del propietario.
      * Cero contaminación de plantillas: cada personaje debe tener estadísticas y nombres de formas propios y no clonados de Mark Grayson u otros.

3. ARSENAL TÁCTICO CON FÍSICA DE STAMINA:
   - basicAttacks: Golpes marciales (coste 3-8 stamina, daño contundente/cortante).
   - superAttacks: Técnicas de firma (coste 15-30 stamina, tiempo de carga, descripción, counterplay táctico).
   - ultimateAttacks: Finishers definitivos (coste 35-50 stamina, condiciones de acierto, counterplay).
   - passives: Rasgos biológicos/fisiológicos continuos de raza o entrenamiento (regeneración, Zenkai, adaptación, sentidos agudos).
   - specialMechanics: Hax, sellos, manipulación de espacio/tiempo, barras de Ki.
   - weaknesses: Puntos ciegos y vulnerabilidades físicas reales con counterTags asociados.

4. SINERGIAS DE EQUIPO Y TEAM COMBOS DE 3 FASES:
   - synergies: Vínculos tácticos (maestro-alumno, rivales, linaje, facción) con partnerTags y efecto pasivo.
   - teamCombos: Ataques coordinados entre aliados específicos:
     * partners: Lista de personajes participantes.
     * sequence: Array de 3 pasos exactos [Apertura/Inmovilización, Canalización/Apoyo, Remate Definitivo].
     * staminaCostPerParticipant: Desglose del gasto de energía de cada uno.
     * effect: Efecto e impacto si el combo conecta con éxito.
     * partialFailureResult: Qué ocurre si el rival interrumpe o esquiva un paso intermedio.
     * canonStatus: "source_backed" o "apex_custom".

5. NIVELES DE PODER UNIVERSALES (APEX-Ki, BURST-KI, DURABILIDAD Y HAX):
   - APEX-Ki UNIVERSAL DE COMBATE: Es el índice interno de balance para el Scouter y comparativas cross-verse.
     * NO es Ki místico para personajes fuera de Dragon Ball (en ellos sourceKi es estrictamente null).
     * CERO FALSA PRECISIÓN: Usa rangos [min, max] y centros redondeados (ej: [700, 1100] con apexKi: 950 para Spider-Man; [4200, 5500] con apexKi: 4800 para Sukuna; [2200, 3200] con apexKi: 2800 para Homelander; [750, 950] con apexKi: 850 para Baki).
     * burstKi: Pico temporal mediante técnica cargada, sacrificio o ultimate (siempre >= apexKi).
     * durabilityKi: Equivalencia de resistencia física/energética sostenida.
     * confidence: "high", "medium" o "low" según la consistencia de las hazañas documentadas.
   - LA VELOCIDAD NO INFLA EL AP FÍSICO NI EL APEX-KI:
     * NUNCA multipliques el Ki base porque un personaje sea hipersónico o FTL.
     * La velocidad se destina a combatModifiers: { initiative, dodgeChance, hitChance, comboWindow }.
   - EL HAX NO AUMENTA LA FUERZA FÍSICA BRUTA:
     * Defensas espaciales (Infinity), técnicas de sellado, ataques conceptuales o dominio se declaran en hax[] con doesNotIncrease: ["baseAP", "liftingStrength", "durabilityKi"].
   - DIRECTIVAS ESPECIALIZADAS POR MODELO DE INTELIGENCIA ARTIFICIAL:
     * Meta Muse Spark 1.3: Aplica tu razonamiento holístico agéntico de 1M de tokens para interconectar los 4 personajes del lote, calibrando sus debilidades, counterplay de stamina y combos cruzados sin resumir.
     * Google Gemini Flash Lite: Garantiza consistencia matemática rigurosa, JSON nativo estricto y cero truncamiento.
     * NVIDIA Nemotron: Valida la física de impacto, límites cinéticos y rigor de combate táctico.
     * MiniMax M3: Imprime excelencia narrativa en citas de combate (combatDialogue) y fidelidad de lore en español neutro.

6. MATRIZ DE RESISTENCIAS A HAX (haxResistances):
   - existenceErasure (0-100): Resistencia a borrado existencial o Hakai.
   - timeManipulation (0-100): Resistencia a congelación o salto temporal (Time-Skip).
   - mindControl (0-100): Resistencia a posesión mental o ilusiones.
   - matterManipulation (0-100): Resistencia a transmutación de materia (chocolate, piedra).
   - soulDamage (0-100): Resistencia a ataques espirituales directos.
   - powerNullification (0-100): Resistencia a sellado o anulación de energía.

7. PERFIL PSICOLÓGICO DE COMBATE IA (combatAIPersonality):
   - aggression (1-100): Impulso ofensivo vs cautela.
   - tacticalIQ (1-100): Capacidad de adaptación, análisis de patrones y contrajuegos.
   - mercyThreshold (1-100): Clemencia vs letalidad (dar senzus vs remate despiadado).
   - clutchFactor (1-100): Potencial de superación en crisis (menos de 20% HP).
   - preferredEngagementRange: "close_quarters", "mid_range", "long_range" o "adaptive".

8. AFINIDAD AMBIENTAL Y ADAPTACIÓN (environmentalAffinity):
   - spaceSurvival (boolean): ¿Sobrevive en el vacío del espacio sin soporte artificial?
   - gravityResistance (string): Límite de gravedad tolerada (ej. "100G", "300G", "Universal").
   - favoredBiomes (array de strings): Terrenos con ventaja táctica.
   - disfavoredBiomes (array de strings): Terrenos hostiles o con desventaja.

9. HAZAÑAS FÍSICAS Y CÁLCULOS AP DEMOSTRADOS (provenFeats):
   - apCalculation (string): Mayor feat de energía destructiva en Joules/Megatones acorde al Tier.
   - speedFeat (string): Hazaña cumbre de velocidad de reacción o desplazamiento.
   - durabilityFeat (string): Mayor impacto, explosión o técnica resistida.
   - canonicalReference (string): Fuente estricta (manga capítulo, guía, anime o cómic).

10. CITAS Y DIÁLOGOS TÁCTICOS DE COMBATE (combatDialogue):
    - onBattleStart: Frase épica representativa al entrar a la arena.
    - onTransformation: Grito o declaración al desatar una forma superior.
    - onUltimateReady: Declaración al cargar su técnica destructiva máxima.
    - onLowHealth: Respuesta al encontrarse al borde de la derrota.
    - onVictory: Frase de cierre característica tras ganar.

11. FÍSICA DE STAMINA Y EQUIPAMIENTO (staminaProfile y signatureEquipment):
    - staminaProfile: { maxStamina: 100-200, recoveryRatePerTurn: 5-15, exhaustionThreshold: 20 }.
    - signatureEquipment: Array de objetos icónicos con { name, durability, effect }.

12. BARRERA EPISTEMOLÓGICA, LÍNEA TEMPORAL Y CERO ANACRONISMOS (knowledgeHorizon):
    - PROHIBICIÓN ABSOLUTA DE METACONOCIMIENTO FUTURO:
      * Ningún personaje puede conocer hechos, personas, técnicas ni transformaciones ocurridas DESPUÉS de su saga/versión específica.
      * EJEMPLO: Goku (Saga Namek) NUNCA puede hablar ni saber del SSJ2, SSJ3, SSJ God, Ultra Instinto, Beerus ni el Multiverso.
      * EJEMPLO: Nappa (Saga Saiyajin) NUNCA puede saber de Gine, Bardock Super, el Super Saiyajin legendario ni secretos de Freezer que ignoraba en el Año 762.
      * EJEMPLO: Naruto (Parte 1 / Genin) no sabe del Modo Sabio, Kurama Link ni Kaguya.
    - REGLA DE AISLAMIENTO CROSS-VERSE (CERO OMNISCIENCIA DE OTROS MUNDOS):
      * Los personajes NO conocen la biografía, poderes ni nombres de personajes de otros universos a menos que posean el tag "fourth_wall_breaker" (ej. Deadpool) o sean entidades cósmicas omniscientes de Tier 1.
      * En sus citas y combates, reaccionan a oponentes de otros universos por lo que perciben físicamente en el momento (Ki, presión espiritual, musculatura, armamento), NUNCA diciendo cosas como "¡Oh, eres el Capitán América de Marvel!".
    - ESTRUCTURA EXACTA DEL CAMPO 'knowledgeHorizon':
      {
        "canonicalEra": "Nombre exacto de la era/saga y año cronológico (ej: Saga de Namek / Año 762)",
        "timelineRestrictions": "Descripción estricta de qué eventos aún no han ocurrido y el personaje desconoce por completo",
        "forbiddenConcepts": ["Array de conceptos/nombres futuros prohibidos que jamás debe mencionar"],
        "crossVerseAwareness": "none" // "none" por defecto, "fourth_wall_breaker" para Deadpool, o "multiverse_omnipresent" para Tier 1
      }

13. INTEGRIDAD DE FRANQUICIA, UNIVERSO Y NIVELES DE PODER (ESCALA OFICIAL APEX):
    - CONSERVACIÓN ESTRICTA DE FRANQUICIA Y UNIVERSO: Mantén intacto el valor de universe y franchise. PROHIBIDO inventar franquicias nuevas o dejar franchise como undefined.
    - PROHIBICIÓN DE SOURCEKI EN PERSONAJES NO-DRAGON BALL: Solo personajes canónicos del universo Dragon Ball pueden poseer un campo sourceKi numérico. ESTRICTAMENTE PROHIBIDO asignar niveles de unidades o sourceKi a personajes de Baki, Marvel, DC, Hunter x Hunter, Demon Slayer, Jujutsu Kaisen, etc.
    - CALIBRACIÓN OFICIAL DE MULTIPLICADORES Y SOURCEKI EN DRAGON BALL:
      * Base = 1.0x (sourceKi inicial de saga)
      * Kaio-ken x1: 1.5x | x2: 2x | x3: 3x | x4: 4x | x10: 10x | x20: 20x | Oozaru: 10x
      * False Super Saiyan (FSSJ): 25x
      * Super Saiyan (SSJ1): 50x | SSJ Grade 2: 62.5x | SSJ Grade 3: 100x (-75% velocidad) | SSJ Mastered: 50x
      * Super Saiyan 2: 100x | Super Saiyan 3: 400x | Super Saiyan 4 (GT): 4000x
      * Saiyan Más Allá de Dios: 3200x | Super Saiyan God (SSG): 6400x | Super Saiyan Blue (SSB): 7700x
      * SSB Kaio-ken x20: 84,700x | SSB Evolution (SSBE): 77,000x | SSJ Rage: 3700x
      * Ultra Instinto Signo: 150,000x | Ultra Instinto Perfecto (MUI): 300,000x
      * Gohan Místico/Ultimate: 800x | Gohan Beast: 1,000,000x | Orange Piccolo: 10,000x
      * SSJ Tipo C: 200x | LSSJ (Legendario): 2000x | Broly Ikari: 35x | Golden Freezer: 100,000x
      * Fusiones Potara: (A+B) * 1120 (Vegetto) | Metamoru: (A+B) * 1000 (Gogeta) | Gotenks: (A+B) * 5.7
      * Daima Compresión Mini: ÷10 sobre el poder adulto
    - ORDEN CANÓNICO ASCENDENTE DE TRANSFORMACIONES Y CATEGORÍAS:
      * Índice 0: OBLIGATORIAMENTE Forma Base (id: "base", category: "base", apexKiMultiplier: 1.0, staminaDrain: 0).
      * Índice 1+: Transformaciones reales (category: "transformation"), estados de sobreesfuerzo (category: "state_amp"), expansiones de dominio (category: "hax_mode") o debuffs (category: "degradation_state").
      * NUNCA coloques una transformación básica después de una superior ni una forma base al final.
      * NUNCA marques la forma base con category: "transformation".

14. POLÍTICA DE INMUTABILIDAD Y BLINDAJE DE NIVELES DE PODER:
    - Conserva intactos todos los datos de combate calibrados.
    - PROHIBIDO modificar, inflar o sobreescribir apexKi, apexKiRange, burstKi, durabilityKi, sourceKi o tierExact en el motor.
    - Toda entrada debe incluir "doesChangeTier": false, "doesChangePowerKey": false.
    - En personajes no-Dragon Ball: sourceKi debe ser siempre null y sourceType: "cross_verse_estimate".
    - Para nuevas formas añadidas:
      * "transformation": escala apexKi proporcionalmente (apexKi_base * mult).
      * "state_amp": eleva temporalmente burstKi con daño de retroceso/recoil y gasto de stamina acelerado.
      * "hax_mode": no infla la fuerza física de Scouter y declara doesNotIncrease: ["apexKi", "durabilityKi", "liftingStrength"].
      * "degradation_state": apexKiMultiplier < 1.0 y reduce la stamina máxima.

SALIDA ESTRICTA: Devuelve EXCLUSIVAMENTE un objeto JSON válido con esquema:
{
  "batchId": "...",
  "universe": "...",
  "results": [ /* array de fichas enriquecidas con formsAudited, arsenal, synergies, teamCombos, haxResistances, combatAIPersonality, environmentalAffinity, provenFeats, combatDialogue, staminaProfile, signatureEquipment, knowledgeHorizon */ ],
  "integrationPatch": [ /* array de operaciones de parche atómicas */ ]
}
Sin markdown fuera del JSON, sin saludos, sin explicaciones.`;

async function loadCharacters() {
  const V25_FILE = path.join(projectRoot, 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V25.json');
  if (!fs.existsSync(V25_FILE)) {
    throw new Error('Roster V25 no encontrado en ' + V25_FILE);
  }

  const v25 = JSON.parse(fs.readFileSync(V25_FILE, 'utf8'));
  const activeRecords = v25.characters || [];
  const deprecatedRecords = v25.deprecatedRecords || [];

  console.log('📌 V25 · 756 activos · 13 archivados');

  if (activeRecords.length !== 756 || deprecatedRecords.length !== 13) {
    throw new Error(`[ERROR BLOQUEANTE] Censo de V25 inválido: activos=${activeRecords.length}, deprecados=${deprecatedRecords.length}. Se esperan 756 activos y 13 archivados.`);
  }

  let chars = activeRecords;

  // Filtrar por universo si no es 'all'
  if (TARGET_UNIVERSE && TARGET_UNIVERSE !== 'all') {
    chars = chars.filter(c => 
      (c.universe || '').toLowerCase().includes(TARGET_UNIVERSE.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(TARGET_UNIVERSE.toLowerCase()) ||
      (c.saga || '').toLowerCase().includes(TARGET_UNIVERSE.toLowerCase())
    );
  }
  return chars;
}

import { executeResilientCompletion } from './aiKeyRotator.js';

function sendCompletion(payload) {
  return executeResilientCompletion(SYSTEM_PROMPT_MASTER, payload, MODEL);
}

function cleanJson(raw) {
  if (typeof raw !== 'string') return '{}';
  let text = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  const start = text.indexOf('{');
  if (start === -1) return '{}';
  text = text.substring(start);

  // 1. Limpieza inicial de comas finales inválidas (trailing commas)
  text = text.replace(/,\s*([}\]])/g, '$1');

  // 2. Intento directo de parseo
  try {
    JSON.parse(text);
    return text;
  } catch (initialErr) {
    // 3. Reparación profunda y progresiva de JSON truncado por tokens
    let sanitized = text;
    for (let attempt = 0; attempt < 120; attempt++) {
      let candidate = sanitized;
      let quoteCount = (candidate.match(/(?<!\\)"/g) || []).length;
      if (quoteCount % 2 !== 0) candidate += '"';

      let stack = [];
      let inString = false;
      let escaped = false;
      for (let i = 0; i < candidate.length; i++) {
        const c = candidate[i];
        if (escaped) { escaped = false; continue; }
        if (c === '\\') { escaped = true; continue; }
        if (c === '"') { inString = !inString; continue; }
        if (!inString) {
          if (c === '{') stack.push('}');
          else if (c === '[') stack.push(']');
          else if (c === '}' || c === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === c) stack.pop();
          }
        }
      }
      while (stack.length > 0) candidate += stack.pop();
      candidate = candidate.replace(/,\s*([}\]])/g, '$1');

      try {
        JSON.parse(candidate);
        return candidate; // ¡Reparado exitosamente sin perder personajes válidos!
      } catch (e) {
        // Podar hasta la última coma para descartar propiedades o claves truncadas
        const lastComma = sanitized.lastIndexOf(',');
        if (lastComma > start) {
          sanitized = sanitized.substring(0, lastComma);
        } else {
          break;
        }
      }
    }
    return '{}';
  }
}

function renderProgressBar(current, total, length = 22) {
  if (!total || total <= 0) return '░'.repeat(length);
  const pct = Math.min(1, Math.max(0, current / total));
  const filled = Math.round(length * pct);
  const empty = length - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const startTime = Date.now();
  const targetRounds = (ROUNDS === 0) ? Infinity : ROUNDS;
  const isInfinite = (ROUNDS === 0);

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   🌟 APEX MASTER ROSTER ENRICHMENT ENGINE (GOLDEN STANDARD)    ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  • Tarea:        ${TASK_DESCRIPTION.toUpperCase().padEnd(46)}║`);
  console.log(`║  • Universo:     ${TARGET_UNIVERSE.toUpperCase().padEnd(46)}║`);
  console.log(`║  • Motor IA:     ${MODEL.padEnd(46)}║`);
  console.log(`║  • Modo Vueltas: ${isInfinite ? 'Bucle Infinito Nocturno (Continuo)'.padEnd(46) : `${ROUNDS} Vuelta(s) al Roster`.padEnd(46)}║`);
  console.log(`║  • Limite Lote:  ${MAX_LIMIT > 0 ? `${MAX_LIMIT} personajes por vuelta`.padEnd(46) : 'TODO el Roster (Completo)'.padEnd(46)}║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  let baseChars = await loadCharacters();
  if (MAX_LIMIT > 0 && MAX_LIMIT < baseChars.length) {
    baseChars = baseChars.slice(0, MAX_LIMIT);
  }
  const totalChars = baseChars.length;
  const totalBatches = Math.ceil(totalChars / BATCH_SIZE);

  const safeUniverseName = TARGET_UNIVERSE.replace(/[\s\W]+/g, '_').toLowerCase();
  const outputFile = path.join(OUTPUT_DIR, `apex_golden_enriched_${safeUniverseName}.json`);
  const statusFile = path.join(OUTPUT_DIR, 'audit_live_status.json');
  const logFile = path.join(OUTPUT_DIR, 'audit_live.log');

  let allPatches = [];
  let allResults = [];
  if (fs.existsSync(outputFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      allResults = data.results || [];
      allPatches = data.integrationPatch || [];
    } catch {}
  }

  for (let currentRound = 1; currentRound <= targetRounds; currentRound++) {
    const roundHeader = isInfinite ? `🔄 VUELTA ${currentRound} (BUCLE INFINITO NOCTURNO)` : `🔄 VUELTA ${currentRound} DE ${ROUNDS}`;
    console.log(`\n════════════════════════════════════════════════════════════════`);
    console.log(`   ${roundHeader}`);
    console.log(`   📋 ${totalChars} personajes en ${totalBatches} lotes`);
    if (currentRound === 1 && START_INDEX > 1) {
      const charAtStart = baseChars[Math.min(START_INDEX - 1, totalChars - 1)]?.name || '';
      console.log(`   ⏩ Reanudando desde la ficha #${START_INDEX} (${charAtStart})`);
    }
    console.log(`════════════════════════════════════════════════════════════════\n`);

    const startFrom = (currentRound === 1 && START_INDEX > 1) ? Math.min(START_INDEX - 1, totalChars - 1) : 0;

    for (let i = startFrom; i < totalChars; i += BATCH_SIZE) {
      const batchStart = Date.now();
      const end = Math.min(i + BATCH_SIZE, totalChars);
      const batch = baseChars.slice(i, end);
      const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
      const batchSummary = batch.map(c => c.name).join(' | ');
      const batchId = `golden_round_${currentRound}_batch_${batchIndex}`;

      const progressPctNum = (end / totalChars) * 100;
      const progressPct = progressPctNum.toFixed(1);
      const bar = renderProgressBar(end, totalChars, 20);

      console.log(`\n┌──────────────────────────────────────────────────────────────┐`);
      console.log(`│ 🌌 [V${currentRound}] LOTE ${batchIndex}/${totalBatches} · [${bar}] ${progressPct}%`);
      console.log(`│ 👥 ${batchSummary.slice(0, 58)}...`);
      console.log(`└──────────────────────────────────────────────────────────────┘`);

      const payload = {
        mode: 'APEX_GOLDEN_ROSTER_ENRICHMENT',
        batchId: batchId,
        round: currentRound,
        auditMode: 'continuous_auto_enrichment',
        crossVerseMode: false,
        allowApexCustomAutoIntegration: true,
        maxRecordsPerRun: BATCH_SIZE,
        requestedFocus: [
          'full_audit', 'base_form_verification', 'canonical_transformations',
          'apex_custom_states', 'tactical_arsenal', 'stamina_physics', 
          'counterplay_mechanics', 'physiological_passives', 'tactical_weaknesses', 
          'team_synergies', 'three_phase_team_combos', 'hax_tags',
          'hax_resistances', 'combat_ai_personality', 'environmental_affinity',
          'proven_feats', 'combat_dialogue', 'stamina_profile', 'signature_equipment',
          'knowledge_horizon'
        ],
        records: batch
      };

      let attempts = 0;
      let ok = false;
      while (attempts < 5 && !ok) {
        attempts++;
        try {
          const raw = await sendCompletion(payload);
          const parsed = JSON.parse(cleanJson(raw));
          
          if (parsed.results || parsed.integrationPatch) {
            let newPatches = parsed.integrationPatch || [];

            // 🛡️ Filtro de seguridad en caliente: purgar formas espurias y blindar formas y Ki
            newPatches = newPatches.map(p => {
              if (p && p.formsAudited && Array.isArray(p.formsAudited)) {
                // 1. Filtrar formas espurias de 100% inventadas
                p.formsAudited = p.formsAudited.filter(f => {
                  if (!f || !f.name) return false;
                  const lower = f.name.toLowerCase();
                  if (lower.includes('100% máximo poder') && !lower.includes('freezer') && !lower.includes('roshi') && !lower.includes('toguro')) return false;
                  if (lower.includes('poder desatado / sin contención')) return false;
                  return true;
                });

                // 2. Garantizar que la forma en índice 0 sea siempre category: 'base'
                if (p.formsAudited.length > 0) {
                  p.formsAudited[0].id = 'base';
                  p.formsAudited[0].category = 'base';
                  p.formsAudited[0].apexKiMultiplier = 1.0;
                  p.formsAudited[0].staminaDrain = 0;
                }
              }

              // 3. Blindaje de Ki no-Dragon Ball
              const uLow = (p.universe || '').toLowerCase();
              if (uLow && !uLow.includes('dragon ball')) {
                delete p.sourceKi;
                delete p.sourceKiStatus;
                p.sourceType = 'cross_verse_estimate';
              }

              // 4. Prohibir sobreescritura de numericStats principales
              delete p.apexKi;
              delete p.numericStats;
              delete p.tierExact;

              return p;
            });

            allPatches.push(...newPatches);
            allResults.push(...(parsed.results || []));

            fs.writeFileSync(outputFile, JSON.stringify({
              universe: TARGET_UNIVERSE,
              currentRound: currentRound,
              totalProcessed: end,
              status: 'PROPOSAL_ONLY_NOT_APPLIED',
              mode: 'DRAFT_PROPOSAL_ONLY',
              results: allResults,
              integrationPatch: allPatches
            }, null, 2), 'utf8');

            const batchDurationSec = ((Date.now() - batchStart) / 1000).toFixed(1);
            const totalElapsedMin = ((Date.now() - startTime) / 60000).toFixed(1);
            const totalBatchesProcessed = (currentRound - 1) * totalBatches + batchIndex;
            const avgPerBatch = (Date.now() - startTime) / totalBatchesProcessed / 1000;
            const remainingBatchesInRound = totalBatches - batchIndex;
            const etaMin = ((remainingBatchesInRound * avgPerBatch) / 60).toFixed(1);

            console.log(`  ✅ Lote ${batchIndex} procesado en ${batchDurationSec}s.`);
            console.log(`  📊 [${bar}] ${end}/${totalChars} pjs | Ops acumuladas: ${allPatches.length} | Tiempo: ${totalElapsedMin}m (ETA vuelta: ~${etaMin}m)`);

            // Guardar estado en vivo para monitoreo
            const liveState = {
              active: true,
              round: currentRound,
              totalRounds: isInfinite ? 'Infinito' : ROUNDS,
              currentBatch: batchIndex,
              totalBatches: totalBatches,
              processedChars: end,
              totalChars: totalChars,
              percent: progressPct,
              totalPatches: allPatches.length,
              lastBatchDurationSec: batchDurationSec,
              elapsedMin: totalElapsedMin,
              etaMin: etaMin,
              lastUpdated: new Date().toLocaleTimeString()
            };
            fs.writeFileSync(statusFile, JSON.stringify(liveState, null, 2), 'utf8');
            fs.appendFileSync(logFile, `[${new Date().toLocaleTimeString()}] V${currentRound} Lote ${batchIndex}/${totalBatches} (${progressPct}%) [${batchSummary.slice(0, 40)}] -> OK (+${newPatches.length} ops)\n`, 'utf8');

            ok = true;
          } else {
            throw new Error('La respuesta JSON no contiene results ni integrationPatch.');
          }
        } catch (err) {
          console.error(`  ⚠️ Intento ${attempts}/5 falló: ${err.message}`);
          if (attempts < 5) {
            const waitTime = attempts * 3500;
            console.log(`  ⏳ Reintentando en ${waitTime / 1000}s...`);
            await sleep(waitTime);
          }
        }
      }

      if (!ok) {
        console.error(`  ❌ Lote ${batchId} omitido tras 5 intentos para continuar el avance.`);
      }

      await sleep(3000); // Pausa prudente para evitar rate limit de OpenRouter
    }

    console.log(`\n🏆 ¡VUELTA ${currentRound} COMPLETADA AL 100%! (${totalChars} personajes enriquecidos)`);
    if (isInfinite || currentRound < targetRounds) {
      console.log(`⏳ Iniciando siguiente vuelta de refinamiento en 5 segundos...`);
      await sleep(5000);
    }
  }

  const totalMin = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log(`║  🎉 ¡ENRIQUECIMIENTO DORADO APEX FINALIZADO CON ÉXITO!        ║`);
  console.log(`║  • Fichas maestras enriquecidas: ${allResults.length.toString().padEnd(30)}║`);
  console.log(`║  • Operaciones atómicas de parche: ${allPatches.length.toString().padEnd(28)}║`);
  console.log(`║  • Tiempo total empleado: ${`${totalMin} minutos`.padEnd(36)}║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  fs.writeFileSync(statusFile, JSON.stringify({ active: false, completed: true, totalPatches: allPatches.length, totalMin }, null, 2), 'utf8');
}

main().catch(console.error);
