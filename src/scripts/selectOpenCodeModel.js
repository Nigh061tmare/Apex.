import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');
const configPath = path.join(projectRoot, 'opencode.json');

const TASK_CATEGORIES = [
  {
    category: '🛠️ TAREA 1: AGENTES DE CODIFICACIÓN & INGENIERÍA DE SOFTWARE (100% GRATIS)',
    desc: 'Modelos entrenados para editar archivos, Terminal-Bench y SWE-Agent sin pedir saldo ni créditos.',
    models: [
      { id: 'openrouter/poolside/laguna-s-2.1:free', name: 'Poolside Laguna S 2.1 [GRATIS]', badge: '🥇 #1 CÓDIGO (118B MoE · 262K CTX · 70.2% Terminal-Bench)' },
      { id: 'openrouter/poolside/laguna-xs-2.1:free', name: 'Poolside Laguna XS 2.1 [GRATIS]', badge: '⚡ COMPACTO & RÁPIDO (33B MoE · 256K CTX · FP8)' },
      { id: 'openrouter/cohere/north-mini-code:free', name: 'Cohere North Mini Code [GRATIS]', badge: '🚀 OPENCODE NATIVO (30B MoE · 256K CTX · JSON)' }
    ]
  },
  {
    category: '🧠 TAREA 2: CONTEXTO MASIVO 1M+ Y PROYECTO COMPLETO (100% GRATIS)',
    desc: 'Modelos con 1 Millón a 1.05M de tokens para leer y refactorizar todo el proyecto.',
    models: [
      { id: 'openrouter/nvidia/nemotron-3-ultra-550b-a55b:free', name: 'NVIDIA Nemotron 3 Ultra 550B [GRATIS]', badge: '👑 1M CTX / 65K OUT (550B MoE · Razonamiento Supremo & Auditoría)' },
      { id: 'openrouter/meta/muse-spark-1.3-contributor:free', name: 'Meta Muse Spark 1.3 [GRATIS]', badge: '🔥 1M CTX / 131K OUT (Razonamiento Agéntico Holístico, Combos & Auditoría)' },
      { id: 'openrouter/minimax/minimax-m3:free', name: 'MiniMax M3 [GRATIS]', badge: '✨ 1M CTX / 131K OUT (Brainstorming & Análisis de Gran Escala)' },
      { id: 'openrouter/z-ai/glm-5.2:free', name: 'Z.ai GLM 5.2 [GRATIS]', badge: '🥇 256K CTX / 65K OUT (Razonamiento Extremo xhigh · Ingeniería)' },
      { id: 'openrouter/thinkingmachines/inkling:free', name: 'Thinking Machines Inkling [GRATIS]', badge: '🦁 1.05M CTX (975B MoE · Multimodal & Razonamiento)' },
      { id: 'openrouter/thinkingmachines/inkling-small:free', name: 'Thinking Machines Inkling Small [GRATIS]', badge: '💎 1.05M CTX (276B MoE · Rápido y Ligero)' }
    ]
  },
  {
    category: '📊 TAREA 3: CÁLCULOS MATEMÁTICOS, TIERS & TAREAS MULTI-PASO (100% GRATIS)',
    desc: 'Modelos enfocados en razonamiento lógico riguroso, matemáticas y pasos múltiples.',
    models: [
      { id: 'openrouter/inclusionai/ling-3.0-flash-fin:free', name: 'InclusionAI Ling 3.0 Flash Fin [GRATIS]', badge: '🥇 124B MoE (262K CTX · Cálculo Tiers & Fichas)' },
      { id: 'openrouter/dots-studio/dots-3-note-preview:free', name: 'Dots Studio Dots3-Note [GRATIS]', badge: '📝 280B MoE (512K CTX · Multi-Paso & Razonamiento)' },
      { id: 'openrouter/deepseek/deepseek-r1:free', name: 'DeepSeek R1 [GRATIS]', badge: '🧠 RAZONAMIENTO DEDUCTIVO PURO & HAX' }
    ]
  },
  {
    category: '⚡ TAREA 4: ALTO RENDIMIENTO, AGENTES Y VELOCIDAD (100% GRATIS)',
    desc: 'Modelos de respuesta inmediata para consultas rápidas y flujos de trabajo ligeros.',
    models: [
      { id: 'openrouter/nvidia/nemotron-3.5-lightning:free', name: 'NVIDIA Nemotron 3.5 Lightning [GRATIS]', badge: '⚡ 1M CTX (30B MoE · Alto Rendimiento)' },
      { id: 'openrouter/google/gemini-2.0-flash-lite:free', name: 'Google Gemini 2.0 Flash Lite [GRATIS]', badge: '⭐ VELOCIDAD INSTANTÁNEA (<0.5s)' },
      { id: 'openrouter/liquid/lfm-2.5-2.6b:free', name: 'LiquidAI LFM 2.5 2.6B [GRATIS]', badge: '💧 66K CTX (Compacto para Extracción & RAG)' },
      { id: 'openrouter/meta-llama/llama-3.3-70b-instruct:free', name: 'Meta Llama 3.3 70B [GRATIS]', badge: '🔥 LITERATURA & COMBATES DRAMÁTICOS' }
    ]
  },
  {
    category: '👑 MODELOS PRO DE PAGO (OPCIONAL - REQUIEREN SALDO EN OPENROUTER)',
    desc: 'Solo si has recargado créditos en https://openrouter.ai/settings/credits',
    models: [
      { id: 'openrouter/anthropic/claude-3.7-sonnet', name: 'Anthropic Claude 3.7 Sonnet', badge: '🏆 MÁXIMO MODELO MUNDIAL' },
      { id: 'openrouter/google/gemini-2.5-pro', name: 'Google Gemini 2.5 Pro', badge: '👑 2M CONTEXTO PRO' }
    ]
  }
];

function readCurrentConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch {}
  return { model: 'openrouter/poolside/laguna-s-2.1:free' };
}

function saveConfig(cfg) {
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
}

const currentConfig = readCurrentConfig();
const currentModel = currentConfig.model || 'openrouter/poolside/laguna-s-2.1:free';

console.clear();
console.log("==========================================================================");
console.log("  ⚡ APEX POWER SCALING — SELECTOR DE MODELOS GRATIS OPENROUTER");
console.log("==========================================================================");
console.log(`  📌 MODELO ACTUALMENTE ACTIVO EN OPENCODE:\n     >> ${currentModel}\n`);
console.log("--------------------------------------------------------------------------");
console.log("  CATÁLOGO DE MODELOS GRATUITOS (100% SIN COSTE NI LÍMITES DE SALDO):");
console.log("--------------------------------------------------------------------------");

let optionCounter = 1;
const indexMap = {};

TASK_CATEGORIES.forEach((cat) => {
  console.log(`\n${cat.category}`);
  console.log(`   ℹ️  ${cat.desc}`);
  cat.models.forEach(m => {
    const num = String(optionCounter).padStart(2, ' ');
    const isCurrent = m.id === currentModel ? ' (ACTIVO ⭐)' : '';
    console.log(`    [${num}] ${m.name} — ${m.badge}${isCurrent}`);
    console.log(`         ID: ${m.id}`);
    indexMap[optionCounter] = m.id;
    optionCounter++;
  });
});

console.log("\n  [ 0] Escribir manualmente otro Model ID");
console.log("==========================================================================");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`\n👉 Elige el número de modelo (1-${optionCounter - 1}) o pulsa ENTER para mantener actual: `, (answer) => {
  const trimmed = answer.trim();

  if (!trimmed) {
    console.log("\n✓ Se mantiene el modelo actual:", currentModel);
    rl.close();
    return;
  }

  const num = parseInt(trimmed, 10);
  let newModel = '';

  if (!isNaN(num) && indexMap[num]) {
    newModel = indexMap[num];
  } else if (num === 0) {
    rl.question('Escribe el Model ID exacto de OpenRouter: ', (customId) => {
      const customTrimmed = customId.trim();
      if (customTrimmed) {
        applyNewModel(customTrimmed);
      } else {
        console.log("Operación cancelada.");
      }
      rl.close();
    });
    return;
  } else if (trimmed.includes('/')) {
    newModel = trimmed;
  } else {
    console.log("❌ Opción no válida.");
    rl.close();
    return;
  }

  applyNewModel(newModel);
  rl.close();
});

function applyNewModel(modelId) {
  currentConfig.model = modelId;
  saveConfig(currentConfig);
  console.log("\n==========================================================================");
  console.log("  ✅ ¡MODELO ACTUALIZADO CON ÉXITO EN OPENCODE!");
  console.log(`  🎯 Nuevo Modelo Activo: ${modelId}`);
  console.log("==========================================================================");
  console.log("Al abrir OpenCode Web (o Terminal), trabajará directamente con este modelo gratis.\n");
}