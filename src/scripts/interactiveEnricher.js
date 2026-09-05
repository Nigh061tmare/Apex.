/**
 * APEX INTERACTIVE ENRICHER & AUDITOR CLI (GOLDEN STANDARD)
 * 
 * Interfaz interactiva 100% nativa en Node.js con colores ANSI,
 * soporte de teclas, valores por defecto con Enter y cero fallos de codificación.
 */

import readline from 'readline';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query, defaultVal = '') => new Promise((resolve) => {
  rl.question(query, (ans) => {
    const trimmed = ans.trim();
    resolve(trimmed ? trimmed : defaultVal);
  });
});

async function runMenu() {
  console.clear();
  console.log('\x1b[36m╔════════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║\x1b[0m \x1b[1m\x1b[33m🌟 APEX POWER SCALING — ENRIQUECEDOR AUTÓNOMO DE ROSTER           \x1b[0m\x1b[36m║\x1b[0m');
  console.log('\x1b[36m║\x1b[0m \x1b[90m   V25 · 756 activos · 13 archivados · Modo Seguro Proposal\x1b[0m\x1b[36m║\x1b[0m');
  console.log('\x1b[36m╚════════════════════════════════════════════════════════════════════╝\x1b[0m\n');

  // 1. Tarea
  console.log('\x1b[1m\x1b[32m[1/4] SELECCIONA LA TAREA A EJECUTAR:\x1b[0m');
  console.log('  \x1b[33m1.\x1b[0m \x1b[1mEnriquecimiento y Auditoría Completa\x1b[0m (Formas + Stamina + Combos + Sinergias) \x1b[32m[RECOMENDADO]\x1b[0m');
  console.log('  \x1b[33m2.\x1b[0m Auditoría Especializada de Formas (Base, Canónicas y Custom)');
  console.log('  \x1b[33m3.\x1b[0m Sinergias y Team Combos de 3 Fases');
  console.log('  \x1b[33m4.\x1b[0m Pasivas Biológicas y Debilidades de Combate');
  const taskChoice = await ask('\n👉 Elige tarea [1-4, Enter=1]: ', '1');
  
  const tasksMap = {
    '1': 'full_enrichment',
    '2': 'forms_audit',
    '3': 'synergies_combos',
    '4': 'passives_weaknesses'
  };
  const task = tasksMap[taskChoice] || 'full_enrichment';

  // 2. Universo
  console.log('\n\x1b[1m\x1b[32m[2/4] SELECCIONA EL UNIVERSO:\x1b[0m');
  console.log('  • Presiona \x1b[1mEnter\x1b[0m para procesar \x1b[33mtodo el Roster activo V25 (756 combatientes)\x1b[0m');
  console.log('  • O escribe un universo (ej: Dragon Ball, Baki, Marvel, DC, Jujutsu Kaisen)');
  const universe = await ask('\n👉 Universo [Enter=all]: ', 'all');

  // 3. Motor IA
  console.log('\n\x1b[1m\x1b[32m[3/4] SELECCIONA EL MOTOR DE INTELIGENCIA ARTIFICIAL:\x1b[0m');
  console.log('  \x1b[90m─── EN SOLITARIO ────────────────────────────────────────────────\x1b[0m');
  console.log('  \x1b[33m1.\x1b[0m \x1b[1mGoogle Gemini Flash Lite Latest\x1b[0m (~google/gemini-flash-lite-latest) \x1b[32m[⭐ RECOMENDADO AUDITORÍA NOCTURNA - API OFICIAL]\x1b[0m');
  console.log('  \x1b[33m2.\x1b[0m \x1b[1mMeta Muse Spark 1.3 Free\x1b[0m (meta/muse-spark-1.3-contributor:free) \x1b[35m[🔥 1M CTX · RAZONAMIENTO AGÉNTICO HOLÍSTICO]\x1b[0m');
  console.log('  \x1b[33m3.\x1b[0m \x1b[1mNVIDIA Nemotron 3.5 Lightning Free\x1b[0m                 \x1b[36m[⚡ ULTRA RÁPIDO - CERO LATENCIA]\x1b[0m');
  console.log('  \x1b[33m4.\x1b[0m \x1b[1mNVIDIA Nemotron 3 Super 120B Free\x1b[0m                  \x1b[36m[🧠 RAZONAMIENTO Y EQUILIBRIO]\x1b[0m');
  console.log('  \x1b[33m5.\x1b[0m \x1b[1mMiniMax M3 Free\x1b[0m (minimax-m3:free)                  \x1b[33m[🌟 LORE ÉPICO Y ESPAÑOL MAESTRO]\x1b[0m');
  console.log('  \x1b[33m6.\x1b[0m \x1b[1mNVIDIA Nemotron 3 Ultra 550B MoE\x1b[0m                   \x1b[35m[🏛️ LÓGICA PURA Y MÁXIMO RIGOR]\x1b[0m');
  console.log('  \x1b[33m7.\x1b[0m \x1b[1mGoogle Gemma 4 31B Free\x1b[0m (gemma-4-31b-it:free)      \x1b[34m[💎 NUEVO MODELO DE GOOGLE]\x1b[0m');
  console.log('  \x1b[90m─── MODOS HÍBRIDOS (50/50 DÚO ALTERNADO) ────────────────────────\x1b[0m');
  console.log('  \x1b[33m8.\x1b[0m \x1b[1mHíbrido Gemini Flash Lite + Meta Muse Spark 1.3\x1b[0m   \x1b[35m[GOOGLE API + META AGÉNTICO 1M]\x1b[0m');
  console.log('  \x1b[33m9.\x1b[0m \x1b[1mHíbrido Gemini Flash Lite + Lightning 3.5\x1b[0m         \x1b[32m[GOOGLE API + NVIDIA VELOCIDAD]\x1b[0m');
  console.log('  \x1b[33m10.\x1b[0m \x1b[1mHíbrido Gemini Flash Lite + MiniMax M3\x1b[0m           \x1b[33m[GOOGLE API + LORE ÉPICO]\x1b[0m');
  console.log('  \x1b[33m11.\x1b[0m \x1b[1mHíbrido Gemini Flash Lite + Nemotron Super 120B\x1b[0m \x1b[36m[GOOGLE API + CEREBRO 120B]\x1b[0m');
  console.log('  \x1b[90m─── OTROS MODELOS ───────────────────────────────────────────────\x1b[0m');
  console.log('  \x1b[33m12.\x1b[0m Ling 3.0 Flash Fin Free (Contexto masivo de 262k)');
  console.log('  \x1b[33m13.\x1b[0m Ingresar cualquier modelo personalizado (OpenRouter)');
  const modelChoice = await ask('\n👉 Elige Motor IA [1-13, Enter=1 (Gemini Flash Lite Oficial)]: ', '1');

  let model = '~google/gemini-flash-lite-latest';
  if (modelChoice === '1') {
    model = '~google/gemini-flash-lite-latest';
    console.log('  \x1b[32m✔ Seleccionado: Google Gemini Flash Lite Latest (API Oficial de Google Gemini)\x1b[0m');
  } else if (modelChoice === '2') {
    model = 'meta/muse-spark-1.3-contributor:free';
    console.log('  \x1b[35m✔ Seleccionado: Meta Muse Spark 1.3 Free (1M Contexto · Razonamiento Agéntico)\x1b[0m');
  } else if (modelChoice === '3') {
    model = 'nvidia/nemotron-3.5-lightning:free';
    console.log('  \x1b[36m✔ Seleccionado: NVIDIA Nemotron 3.5 Lightning Free (Ultra Rápido)\x1b[0m');
  } else if (modelChoice === '4') {
    model = 'nvidia/nemotron-3-super-120b-a12b:free';
    console.log('  \x1b[36m✔ Seleccionado: NVIDIA Nemotron 3 Super 120B Free\x1b[0m');
  } else if (modelChoice === '5') {
    model = 'minimax/minimax-m3:free';
    console.log('  \x1b[33m✔ Seleccionado: MiniMax M3 Free (Lore Épico en Español)\x1b[0m');
  } else if (modelChoice === '6') {
    model = 'nvidia/nemotron-3-ultra-550b-a55b:free';
    console.log('  \x1b[35m✔ Seleccionado: NVIDIA Nemotron 3 Ultra 550B MoE Free\x1b[0m');
  } else if (modelChoice === '7') {
    model = 'google/gemma-4-31b-it:free';
    console.log('  \x1b[34m✔ Seleccionado: Google Gemma 4 31B Free\x1b[0m');
  } else if (modelChoice === '8') {
    model = 'hybrid:~google/gemini-flash-lite-latest|meta/muse-spark-1.3-contributor:free';
    console.log('  \x1b[35m✔ Seleccionado: Modo Híbrido (Gemini Flash Lite Oficial + Meta Muse Spark 1.3 50/50)\x1b[0m');
  } else if (modelChoice === '9') {
    model = 'hybrid:~google/gemini-flash-lite-latest|nvidia/nemotron-3.5-lightning:free';
    console.log('  \x1b[32m✔ Seleccionado: Modo Híbrido (Gemini Flash Lite Oficial + Lightning 3.5 50/50)\x1b[0m');
  } else if (modelChoice === '10') {
    model = 'hybrid:~google/gemini-flash-lite-latest|minimax/minimax-m3:free';
    console.log('  \x1b[33m✔ Seleccionado: Modo Híbrido (Gemini Flash Lite Oficial + MiniMax M3 50/50)\x1b[0m');
  } else if (modelChoice === '11') {
    model = 'hybrid:~google/gemini-flash-lite-latest|nvidia/nemotron-3-super-120b-a12b:free';
    console.log('  \x1b[36m✔ Seleccionado: Modo Híbrido (Gemini Flash Lite Oficial + Super 120B 50/50)\x1b[0m');
  } else if (modelChoice === '12') {
    model = 'inclusionai/ling-3.0-flash-fin:free';
    console.log('  \x1b[32m✔ Seleccionado: Ling 3.0 Flash Fin Free\x1b[0m');
  } else if (modelChoice === '13') {
    const customId = await ask('  👉 Escribe el Model ID (ej: z-ai/glm-5.2:free): ', 'nvidia/nemotron-3.5-lightning:free');
    model = customId;
  }

  // 4. Vueltas al Roster
  console.log('\n\x1b[1m\x1b[32m[4/5] SELECCIONA EL MODO DE VUELTAS AL ROSTER:\x1b[0m');
  console.log('  \x1b[33m1.\x1b[0m \x1b[1m1 Vuelta Completa al Roster\x1b[0m (Audita los 756 activos de V25 en modo propuesta) \x1b[32m[RECOMENDADO]\x1b[0m');
  console.log('  \x1b[33m2.\x1b[0m 2 Vueltas de Refinamiento Maestro (Pasa 2 veces puliendo cada detalle)');
  console.log('  \x1b[33m3.\x1b[0m 3 Vueltas a Fondo');
  console.log('  \x1b[33m4.\x1b[0m \x1b[1mBucle Infinito Nocturno\x1b[0m (Sigue dando vueltas continuas toda la noche)');
  console.log('  \x1b[33m5.\x1b[0m Prueba Rápida de 10 personajes (2 lotes)');
  const roundChoice = await ask('\n👉 Elige modo de vueltas [1-5, Enter=1]: ', '1');

  let rounds = 1;
  let limit = 0;
  if (roundChoice === '2') rounds = 2;
  else if (roundChoice === '3') rounds = 3;
  else if (roundChoice === '4') rounds = 0; // 0 = infinito
  else if (roundChoice === '5') {
    rounds = 1;
    limit = 10;
  }

  // 5. Punto de Inicio / Reanudación
  console.log('\n\x1b[1m\x1b[32m[5/5] SELECCIONA EL PUNTO DE INICIO (REANUDACIÓN):\x1b[0m');
  console.log('  • Presiona \x1b[1mEnter\x1b[0m para empezar desde el principio (Ficha #1)');
  console.log('  • O escribe el número de ficha por donde quieres arrancar (ej: 50, 100, 250, etc.)');
  const startChoice = await ask('\n👉 Número de ficha inicial [Enter=1]: ', '1');
  const startIndex = Math.max(1, parseInt(startChoice, 10) || 1);

  if (startIndex > 1) {
    console.log(`  \x1b[36m⏩ Configurado: Se iniciará la auditoría directamente desde la ficha #${startIndex}\x1b[0m`);
  }

  rl.close();

  console.log('\n\x1b[32m🚀 INICIANDO ENRIQUECEDOR AUTÓNOMO...\x1b[0m\n');

  // Lanzar el script runner con los argumentos limpios
  const child = spawn('node', [
    path.join(__dirname, 'runAutonomousTask.js'),
    task,
    universe,
    model,
    limit.toString(),
    rounds.toString(),
    startIndex.toString()
  ], {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    console.log(`\n\x1b[36m════════════════════════════════════════════════════════════════════\x1b[0m`);
    console.log(`\x1b[32m  Proceso finalizado con código: ${code}\x1b[0m`);
    console.log(`\x1b[90m  Los borradores generados requieren revisión y aprobación antes de ser aplicados.\x1b[0m`);
    console.log(`\x1b[36m════════════════════════════════════════════════════════════════════\x1b[0m\n`);
  });
}

runMenu().catch(console.error);
