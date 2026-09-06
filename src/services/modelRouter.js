/**
 * APEX ENGINE - Intelligent Model Router
 * Sistema de selección y enrutamiento dinámico entre modelos de IA gratuitos
 * Optimiza la asignación según tipo de tarea, complejidad y límites de tokens sin desperdicio.
 */

export const FREE_MODEL_CATALOG = {
  // 1. CODING & REFACTORING PESADO
  'poolside/laguna-s-2.1': {
    id: 'poolside/laguna-s-2.1',
    name: 'Laguna S 2.1',
    provider: 'Poolside',
    category: 'code_engineering',
    contextWindow: 262144,
    isFree: true,
    description: 'Especialista en SWE-bench y refactorización de código React/Vite/Node.',
    tags: ['code', 'refactor', 'vite', 'react', 'algorithms']
  },
  'poolside/laguna-xs-2.1': {
    id: 'poolside/laguna-xs-2.1',
    name: 'Laguna XS 2.1',
    provider: 'Poolside',
    category: 'code_quick',
    contextWindow: 256000,
    isFree: true,
    description: 'Modelo ligero FP8 para micro-funciones, componentes y fixes rápidos.',
    tags: ['code', 'quick', 'components', 'css']
  },
  'cohere/north-mini-code': {
    id: 'cohere/north-mini-code',
    name: 'North Mini Code',
    provider: 'Cohere',
    category: 'code_lightweight',
    contextWindow: 256000,
    isFree: true,
    description: 'Modelo de 3B activos ultrarrápido para invocación de herramientas y utilidades.',
    tags: ['code', 'tools', 'json', 'parsers']
  },

  // 2. NARRACIÓN ÉPICA, REDACCIÓN & COHESIÓN DE LORE
  'inclusionai/ling-3.0-flash-fin': {
    id: 'inclusionai/ling-3.0-flash-fin',
    name: 'Ling 3.0 Flash Fin',
    provider: 'InclusionAI',
    category: 'narrative_lore',
    contextWindow: 262144,
    isFree: true,
    description: 'Excelente coherencia discursiva, narrativa fluida y estructuración paso a paso.',
    tags: ['narrative', 'lore', 'writing', 'cohesion', 'combat-log']
  },
  'thinkingmachines/inkling': {
    id: 'thinkingmachines/inkling',
    name: 'Inkling',
    provider: 'Thinking Machines',
    category: 'reasoning_lore',
    contextWindow: 1050000,
    isFree: true,
    description: 'Modelo MoE masivo con razonamiento profundo de batallas, hazañas y versos.',
    tags: ['reasoning', 'lore', 'powerscaling', 'feats', 'what-if']
  },
  'thinkingmachines/inkling-small': {
    id: 'thinkingmachines/inkling-small',
    name: 'Inkling Small',
    provider: 'Thinking Machines',
    category: 'ui_creative',
    contextWindow: 1050000,
    isFree: true,
    description: 'Modelo multimodal eficiente para diseño de interfaces, textos descriptivos y prompts.',
    tags: ['ui', 'creative', 'prompts', 'multimodal']
  },

  // 3. RAZONAMIENTO A GRAN ESCALA Y MEGA-CONTEXTO (1M TOKENS)
  'z-ai/glm-5.2': {
    id: 'z-ai/glm-5.2',
    name: 'GLM 5.2',
    provider: 'Z.ai',
    category: 'long_context_reasoning',
    contextWindow: 1000000,
    isFree: true,
    description: 'Razonamiento a escala masiva para bases de datos extensas (>800 personajes) y árboles what-if.',
    tags: ['long-context', 'database', 'what-if-tree', 'tournament-matrix']
  },
  'nvidia/nemotron-3.5-lightning': {
    id: 'nvidia/nemotron-3.5-lightning',
    name: 'Nemotron 3.5 Lightning',
    provider: 'NVIDIA',
    category: 'simulation_math',
    contextWindow: 1000000,
    isFree: true,
    description: 'Cálculo de alta velocidad para fórmulas de Ki, matrices de probabilidad y física de combate.',
    tags: ['math', 'physics', 'scouter', 'simulation', 'benchmarks']
  },
  'meta/muse-spark-1.3-contributor:free': {
    id: 'meta/muse-spark-1.3-contributor:free',
    name: 'Meta Muse Spark 1.3',
    provider: 'Meta',
    category: 'agentic_audit',
    contextWindow: 1000000,
    maxOutputTokens: 131072,
    isFree: true,
    description: '1M Contexto y 131K Output. Razonamiento agéntico holístico para auditorías masivas de 4 pjs por lote, combos y counterplay.',
    tags: ['audit', 'agentic', 'long-context', 'team-combos', 'synergies']
  },

  // 4. OPENCODE GO / ZEN HIGH-PERFORMANCE SUITE
  'opencode-go/deepseek-v4-flash': {
    id: 'opencode-go/deepseek-v4-flash',
    name: 'OpenCode DeepSeek V4 Flash',
    provider: 'OpenCode',
    category: 'simulation_math',
    contextWindow: 1000000,
    maxOutputTokens: 65536,
    isFree: true,
    description: '1M Contexto con aceleración DSpark. Rendimiento extremo en simulación y generación de fichas.',
    tags: ['opencode', 'flash', 'dspark', 'speed', 'combat']
  },
  'opencode-go/deepseek-v4-pro': {
    id: 'opencode-go/deepseek-v4-pro',
    name: 'OpenCode DeepSeek V4 Pro',
    provider: 'OpenCode',
    category: 'reasoning_lore',
    contextWindow: 1000000,
    maxOutputTokens: 65536,
    isFree: true,
    description: 'Razonamiento profundo para deducción táctica de hax, cálculo de tiers y debilidades lógicas.',
    tags: ['opencode', 'reasoning', 'hax', 'tiers', 'logic']
  },
  'opencode-go/kimi-k2.7-code': {
    id: 'opencode-go/kimi-k2.7-code',
    name: 'OpenCode Kimi K2.7 Code',
    provider: 'OpenCode',
    category: 'code_engineering',
    contextWindow: 512000,
    maxOutputTokens: 32768,
    isFree: true,
    description: 'Especialista en estructuración JSON, validación de esquemas y reglas de combate.',
    tags: ['opencode', 'code', 'json', 'schema', 'rules']
  },
  'opencode-go/qwen3.8-max': {
    id: 'opencode-go/qwen3.8-max',
    name: 'OpenCode Qwen 3.8 Max',
    provider: 'OpenCode',
    category: 'long_context_reasoning',
    contextWindow: 1000000,
    maxOutputTokens: 65536,
    isFree: true,
    description: 'Colosal 2.4T MoE para análisis enciclopédico de lore, hazañas y versos cruzados.',
    tags: ['opencode', 'qwen', 'encyclopedic', 'lore', 'massive']
  },

  // 4. EMBEDDINGS Y BÚSQUEDA SEMÁNTICA
  'nvidia/nemotron-3-embed-1b': {
    id: 'nvidia/nemotron-3-embed-1b',
    name: 'Nemotron 3 Embed 1B',
    provider: 'NVIDIA',
    category: 'embeddings',
    contextWindow: 32768,
    isFree: true,
    description: 'Generación de vectores semánticos de alta precisión para búsqueda por conceptos/hax.',
    tags: ['embedding', 'semantic-search', 'retrieval']
  },
  'liquid/lfm2.5-embedding-350m': {
    id: 'liquid/lfm2.5-embedding-350m',
    name: 'LFM2.5 Embedding 350M',
    provider: 'LiquidAI',
    category: 'embeddings_light',
    contextWindow: 512,
    isFree: true,
    description: 'Embeddings ultraligeros de 1024 dimensiones para filtrado de gladiadores.',
    tags: ['embedding', 'fast-search']
  }
};

export function classifyTask(taskDescription = '', explicitType = null) {
  if (explicitType && FREE_MODEL_CATALOG[explicitType]) return explicitType;
  const desc = (taskDescription || '').toLowerCase();
  if (/refactor|component|react|vite|jsx|hook|css|tailwind|bugfix|typescript|javascript|frontend|backend/.test(desc)) {
    if (/r[aá]pido|fix|peque[ñn]o|simple|bot[oó]n|modal/.test(desc)) return 'code_quick';
    return 'code_engineering';
  }
  if (/narraci[oó]n|relato|historia|cr[oó]nica|redacci[oó]n|cohesi[oó]n|estilo|flujo|di[aá]logo|lore/.test(desc)) {
    return 'narrative_lore';
  }
  if (/powerscaling|tier|haza[ñn]a|vs|simulaci[oó]n|combate|pelea|who would win|qui[eé]n gana/.test(desc)) {
    return 'reasoning_lore';
  }
  if (/f[oó]rmula|ki|scouter|probabilidad|matem[aá]tica|estad[ií]stica|matriz/.test(desc)) {
    return 'simulation_math';
  }
  if (/buscar|sem[aá]ntic|concepto|vector|embedding|hax|similitud/.test(desc)) {
    return 'embeddings';
  }
  if (/base de datos|800|completo|todo el roster|árbol completo|mega|contexto largo/.test(desc)) {
    return 'long_context_reasoning';
  }
  return 'reasoning_lore';
}

export function selectModel({ taskDescription = '', taskType = null, estimatedTokens = 2000, preferFree = true } = {}) {
  const category = classifyTask(taskDescription, taskType);
  const categoryRouting = {
    'code_engineering': { primary: 'poolside/laguna-s-2.1', fallback: 'z-ai/glm-5.2', tertiary: 'cohere/north-mini-code' },
    'code_quick': { primary: 'poolside/laguna-xs-2.1', fallback: 'cohere/north-mini-code', tertiary: 'poolside/laguna-s-2.1' },
    'code_lightweight': { primary: 'cohere/north-mini-code', fallback: 'poolside/laguna-xs-2.1', tertiary: 'poolside/laguna-s-2.1' },
    'narrative_lore': { primary: 'inclusionai/ling-3.0-flash-fin', fallback: 'thinkingmachines/inkling', tertiary: 'z-ai/glm-5.2' },
    'reasoning_lore': { primary: 'thinkingmachines/inkling', fallback: 'inclusionai/ling-3.0-flash-fin', tertiary: 'z-ai/glm-5.2' },
    'simulation_math': { primary: 'nvidia/nemotron-3.5-lightning', fallback: 'thinkingmachines/inkling', tertiary: 'inclusionai/ling-3.0-flash-fin' },
    'long_context_reasoning': { primary: 'z-ai/glm-5.2', fallback: 'thinkingmachines/inkling', tertiary: 'nvidia/nemotron-3.5-lightning' },
    'embeddings': { primary: 'nvidia/nemotron-3-embed-1b', fallback: 'liquid/lfm2.5-embedding-350m', tertiary: 'thinkingmachines/inkling' },
    'embeddings_light': { primary: 'liquid/lfm2.5-embedding-350m', fallback: 'nvidia/nemotron-3-embed-1b', tertiary: 'cohere/north-mini-code' },
    'ui_creative': { primary: 'thinkingmachines/inkling-small', fallback: 'poolside/laguna-xs-2.1', tertiary: 'inclusionai/ling-3.0-flash-fin' }
  };
  const route = categoryRouting[category] || categoryRouting['reasoning_lore'];
  let chosenModelKey = route.primary;
  const primaryModel = FREE_MODEL_CATALOG[chosenModelKey];
  if (primaryModel && estimatedTokens > (primaryModel.contextWindow * 0.8)) {
    chosenModelKey = route.fallback || 'z-ai/glm-5.2';
  }
  const selectedModel = FREE_MODEL_CATALOG[chosenModelKey] || FREE_MODEL_CATALOG['thinkingmachines/inkling'];
  return {
    selectedModelId: selectedModel.id,
    modelName: selectedModel.name,
    provider: selectedModel.provider,
    category: category,
    contextWindow: selectedModel.contextWindow,
    isFree: selectedModel.isFree,
    fallbackModelId: route.fallback,
    explanation: 'Asignado a ' + selectedModel.name + ' (' + selectedModel.provider + ') para categoría \'' + category + '\'. Ventana: ' + Math.round(selectedModel.contextWindow / 1000) + 'k tokens.'
  };
}

export function buildOpenCodeTaskPayload(prompt, options = {}) {
  const selection = selectModel({
    taskDescription: prompt,
    taskType: options.taskType,
    estimatedTokens: options.estimatedTokens || Math.round(prompt.length / 3)
  });
  return {
    model: selection.selectedModelId,
    systemInstruction: options.systemInstruction || 'Eres un asistente especializado en APEX ENGINE Power Scaling.',
    prompt: prompt,
    routingMeta: selection
  };
}
