const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS restringido: solo orígenes conocidos (producción Vercel + desarrollo local).
// Cualquier web ajena queda bloqueada para que no consuma los motores IA pagados.
const ALLOWED_ORIGINS = [
  'https://apex-engine-six.vercel.app',
  'https://apex-powerscaling-engine.vercel.app',
  'https://apex-powerscaling.local'
];
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl / server-to-server
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    return cb(new Error('Origen no autorizado por CORS'));
  }
}));
app.use(express.json({ limit: '20mb' }));

// Rate limiter en memoria (sin dependencias externas): protege los endpoints IA
// de abuso externo. Limpia entradas viejas cada 5 minutos.
const RATE_LIMIT = { windowMs: 60000, max: 60 };
const rateBuckets = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateBuckets) {
    if (bucket.resetAt < now) rateBuckets.delete(ip);
  }
}, 5 * 60 * 1000).unref?.();

function aiRateLimit(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT.windowMs };
    rateBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT.max) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Espera un momento antes de reintentar.' });
  }
  next();
}

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

function getVaultPath() {
  const candidates = [
    'D:\\Vault Obsidian',
    'D:\\Vault Obsidian\\Obsidian Vault',
    'D:\\Obsidian Vault',
    'Z:\\Obsidian Vault',
    'Z:\\',
    path.join(__dirname, '..')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return 'D:\\Vault Obsidian';
}

const VAULT_PATH = getVaultPath();

// ==========================================
// 1. OBSIDIAN VAULT ENDPOINTS
// ==========================================

app.get('/api/vault/status', (req, res) => {
  try {
    const currentPath = getVaultPath();
    const exists = fs.existsSync(currentPath);
    res.json({
      connected: exists,
      path: currentPath,
      message: exists ? `Bóveda de Obsidian conectada correctamente en ${currentPath}` : `No se pudo encontrar ${currentPath}`
    });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

app.get('/api/vault/files', (req, res) => {
  try {
    if (!fs.existsSync(VAULT_PATH)) {
      return res.status(404).json({ error: 'La ruta de la bóveda no existe.' });
    }

    const getAllFiles = (dirPath, arrayOfFiles = []) => {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith('.md')) {
          const relPath = path.relative(VAULT_PATH, fullPath);
          const stats = fs.statSync(fullPath);
          arrayOfFiles.push({
            name: file,
            path: relPath,
            size: stats.size,
            mtime: stats.mtime
          });
        }
      });
      return arrayOfFiles;
    };

    const files = getAllFiles(VAULT_PATH);
    res.json({ files });
  } catch (err) {
    console.error('Error leyendo archivos de Obsidian:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vault/save', (req, res) => {
  try {
    const { folder = '06 - Proyectos/Obsidian + IA/Simulaciones APEX', filename, content } = req.body;
    if (!content || !filename) {
      return res.status(400).json({ error: 'Se requiere un nombre de archivo y contenido.' });
    }

    const targetDir = path.join(VAULT_PATH, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
    const targetFile = path.join(targetDir, safeFilename);

    fs.writeFileSync(targetFile, content, 'utf-8');
    res.json({
      success: true,
      message: `Simulación guardada exitosamente en: ${path.relative(VAULT_PATH, targetFile)}`,
      filePath: targetFile
    });
  } catch (err) {
    console.error('Error guardando en Obsidian:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

function characterToMarkdown(c) {
  const frontmatter = `---
id: ${c.id || ''}
nombre: "${c.name || 'Sin Nombre'}"
alias: "${c.alias || ''}"
universo: "${c.universe || 'Desconocido'}"
saga: "${c.saga || ''}"
tier: "${c.tier || ''}"
ap: "${c.ap || ''}"
velocidad: "${typeof c.speed === 'object' ? (c.speed.combat || c.speed.reaction || 'Desconocida') : (c.speed || '')}"
fuerza: "${typeof c.strength === 'object' ? (c.strength.striking || '') : (c.strength || '')}"
durabilidad: "${c.durability || ''}"
estamina: "${c.stamina || ''}"
tags: [${(c.haxTags || []).map(t => `"${t}"`).join(', ')}]
---

# ${c.name}
> *${c.alias || 'Luchador del Multiverso'}*

## 📊 Atributos de Combate
- **Tier:** ${c.tier || 'Desconocido'}
- **Attack Potency (AP):** ${c.ap || 'Desconocido'}
- **Rango:** ${c.range || 'Cuerpo a cuerpo'}
- **Velocidad de Combate:** ${c.speed?.combat || 'Desconocida'}
- **Velocidad de Reacción:** ${c.speed?.reaction || 'Desconocida'}
- **Velocidad de Desplazamiento:** ${c.speed?.travel || 'Desconocida'}
- **Fuerza de Impacto:** ${c.strength?.striking || 'Desconocida'}
- **Fuerza de Levantamiento:** ${c.strength?.lifting || 'Desconocida'}
- **Durabilidad:** ${c.durability || 'Desconocida'}
- **Estamina:** ${c.stamina || 'Media'}
- **Battle IQ:** ${c.battleIQ || 'Promedio'}

## 🧬 Transformaciones & Formas
${(c.forms || []).map(f => `- **${f.name}:** ${f.stats || ''}`).join('\n') || '- Forma Base única.'}

## ⚔️ Arsenal & Habilidades
- **Ataques Básicos:** ${c.arsenal?.basicAttacks || 'Combos marciales estándar.'}
${(c.arsenal?.superAttacks || []).map(a => `- **${a.name}** (${a.cost || ''}): ${a.desc}`).join('\n')}
${(c.arsenal?.ultimateAttacks || []).map(a => `- 💥 **${a.name} [ULTIMATE]** (${a.cost || ''}): ${a.desc}`).join('\n')}
${(c.arsenal?.passives || []).map(p => `- 🛡️ **${p.name} [PASIVA]**: ${p.desc}`).join('\n')}

## 🏆 Hazañas Canónicas (Feats)
${(c.feats || []).map(f => `- ${f}`).join('\n') || '- Participó en batallas multiversales.'}

## ⚠️ Psicología & Debilidades
- **Psicología:** ${c.psychology || 'Luchador estándar.'}
- **Debilidades:** ${c.weaknesses || 'Las convencionales de su especie.'}
`;
  return frontmatter;
}

function markdownToCharacter(content, filename) {
  const char = {
    id: `obsidian-${filename.replace(/\.md$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: filename.replace(/\.md$/, ''),
    alias: 'Ficha importada de Obsidian',
    universe: 'Obsidian Vault',
    saga: 'Personalizado',
    version: 'Obsidian Version',
    tier: 'Tier 7-B',
    ap: 'Nivel Desconocido',
    range: 'Cuerpo a cuerpo',
    speed: { combat: 'Hipersónico', reaction: 'Hipersónico', travel: 'Hipersónico', attack: 'Hipersónico' },
    strength: { striking: 'Acorde a su Tier', lifting: 'Acorde a su Tier' },
    durability: 'Media',
    stamina: 'Media',
    battleIQ: 'Promedio',
    haxTags: [],
    arsenal: { basicAttacks: '', superAttacks: [], ultimateAttacks: [], passives: [] },
    forms: [{ id: 'base', name: 'Forma Base', stats: 'Estándar' }],
    feats: [],
    psychology: '',
    weaknesses: ''
  };

  // Parse YAML Frontmatter
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match) {
    const yaml = match[1];
    yaml.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().toLowerCase();
        const val = parts.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
        if (key === 'id') char.id = val;
        if (key === 'nombre' || key === 'name') char.name = val;
        if (key === 'alias') char.alias = val;
        if (key === 'universo' || key === 'universe') char.universe = val;
        if (key === 'saga') char.saga = val;
        if (key === 'tier') char.tier = val;
        if (key === 'ap') char.ap = val;
        if (key === 'durabilidad' || key === 'durability') char.durability = val;
        if (key === 'estamina' || key === 'stamina') char.stamina = val;
        if (key === 'tags' || key === 'haxtags') {
          try {
            const raw = val.replace(/^\[|\]$/g, '');
            char.haxTags = raw.split(',').map(t => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
          } catch (e) {}
        }
      }
    });
  }

  return char;
}

app.post('/api/vault/export-characters', (req, res) => {
  try {
    const { characters = [], folder = '06 - Proyectos/Obsidian + IA/Fichas APEX' } = req.body;
    if (!characters.length) {
      return res.status(400).json({ error: 'No se enviaron personajes para exportar.' });
    }

    const currentVault = getVaultPath();
    const targetDir = path.join(currentVault, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let exportedCount = 0;
    characters.forEach(c => {
      const cleanName = (c.name || 'Sin Nombre').replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `${cleanName}.md`;
      const filePath = path.join(targetDir, filename);
      const mdContent = characterToMarkdown(c);
      fs.writeFileSync(filePath, mdContent, 'utf-8');
      exportedCount++;
    });

    res.json({
      success: true,
      message: `¡${exportedCount} fichas exportadas exitosamente a ${folder}!`,
      exportedCount,
      targetDir
    });
  } catch (err) {
    console.error('Error exportando fichas a Obsidian:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/vault/import-characters', (req, res) => {
  try {
    const currentVault = getVaultPath();
    if (!fs.existsSync(currentVault)) {
      return res.status(404).json({ error: 'No se encuentra la ruta de la bóveda.' });
    }

    const getAllMdFiles = (dirPath, list = []) => {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          if (!file.startsWith('.') && file !== 'node_modules') {
            getAllMdFiles(fullPath, list);
          }
        } else if (file.endsWith('.md')) {
          list.push({ file, fullPath });
        }
      });
      return list;
    };

    const allMd = getAllMdFiles(currentVault);
    const parsedChars = [];

    allMd.forEach(({ file, fullPath }) => {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('tier:') || content.includes('AP:') || content.includes('Atributos de Combate') || fullPath.includes('Fichas')) {
          const char = markdownToCharacter(content, file);
          parsedChars.push(char);
        }
      } catch (e) {}
    });

    res.json({
      success: true,
      characters: parsedChars,
      count: parsedChars.length
    });
  } catch (err) {
    console.error('Error importando fichas de Obsidian:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. UNIVERSAL AI ENGINE HELPERS
// ==========================================

function getEndpointConfig(engine, model, apiKey, customBaseUrl) {
  switch (engine) {
    case 'totalgpt':
    case 'infermatic':
      return {
        url: 'https://api.totalgpt.ai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        model: model || 'Doctor-Shotgun-L3.3-70B-Magnum-v4-SE',
        type: 'openai_chat'
      };
    case 'openrouter':
      return {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://apex-powerscaling.local',
          'X-Title': 'APEX Power Scaling Engine'
        },
        model: model || 'anthropic/claude-3.5-sonnet',
        type: 'openai_chat'
      };
    case 'opencode':
      return {
        url: (customBaseUrl?.trim() || 'https://opencode.ai/zen/go/v1').replace(/\/$/, '') + '/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey || process.env.OPENCODE_API_KEY || ''}`
        },
        model: (model || 'deepseek-v4-flash').replace(/^(opencode-go|opencode)\//i, '').replace(/:free$/i, '') || 'deepseek-v4-flash',
        type: 'openai_chat'
      };
    case 'openai':
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        model: model || 'gpt-4o',
        type: 'openai_chat'
      };
    case 'gemini':
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-pro'}`,
        apiKey: apiKey,
        model: model || 'gemini-1.5-pro',
        type: 'gemini'
      };
    case 'custom':
      return {
        url: customBaseUrl?.replace(/\/$/, '') + '/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : undefined
        },
        model: model || 'default',
        type: 'openai_chat'
      };
    case 'ollama':
    default:
      return {
        url: (customBaseUrl || 'http://127.0.0.1:11434').replace(/\/$/, ''),
        model: model || 'qwen2.5-coder',
        type: 'ollama'
      };
  }
}

// Endpoint: Test connection / model sanity check
app.post('/api/ai/test', aiRateLimit, async (req, res) => {
  try {
    const { engine, model, apiKey, customBaseUrl } = req.body;
    const cfg = getEndpointConfig(engine, model, apiKey, customBaseUrl);

    if (cfg.type === 'ollama') {
      const response = await fetch(`${cfg.url}/api/tags`);
      if (!response.ok) throw new Error(`Ollama no responde en ${cfg.url}`);
      const data = await response.json();
      return res.json({ success: true, message: `Conexión a Ollama exitosa. Modelos disponibles: ${data.models?.map(m => m.name).join(', ') || 'ninguno'}` });
    }

    if (cfg.type === 'gemini') {
      if (!cfg.apiKey) return res.status(400).json({ success: false, message: 'Falta la API Key de Gemini.' });
      const testUrl = `${cfg.url}:generateContent?key=${cfg.apiKey}`;
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Di únicamente "APEX_ONLINE".' }] }] })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      return res.json({ success: true, message: `Conexión a Gemini (${cfg.model}) exitosa.` });
    }

    if (cfg.type === 'openai_chat') {
      if (!apiKey && engine !== 'custom' && engine !== 'opencode') return res.status(400).json({ success: false, message: 'Falta la API Key.' });
      const response = await fetch(cfg.url, {
        method: 'POST',
        headers: cfg.headers,
        body: JSON.stringify({
          model: cfg.model,
          messages: [{ role: 'user', content: 'Di únicamente "APEX_ONLINE".' }],
          max_tokens: 10
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      return res.json({ success: true, message: `Conexión a ${engine.toUpperCase()} (${cfg.model}) exitosa.` });
    }

    res.status(400).json({ success: false, message: 'Motor no reconocido.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 3. AUTO-FILL CHARACTER DATA (JSON)
// ==========================================

app.post('/api/character/generate', aiRateLimit, async (req, res) => {
  try {
    const { name, engine, model, apiKey, customBaseUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Se requiere el nombre del personaje.' });

    const cfg = getEndpointConfig(engine, model, apiKey, customBaseUrl);
    const prompt = `Actúa como el mayor experto mundial en Power Scaling (VS Battles Wiki) y rol narrativo avanzado. 
Genera la ficha técnica completa y rigurosa para el personaje "${name}". 

[REGLAS CRÍTICAS PARA ARSENAL, FORMAS Y HABILIDADES]:
- Eres ESTRICTO con el canon oficial de CUALQUIER franquicia.
- Incluye TODAS las transformaciones cronológicas en "forms".
- Desglosa su ARSENAL en:
  * basicAttacks: Golpes estándar o ráfagas menores.
  * superAttacks: Técnicas especiales características (ej: Kamehameha, Getsuga Tensho, Chidori).
  * ultimateAttacks: Ataques definitivos o finishers de máxima escala (ej: Genkidama, Hollow Purple, Final Flash).
  * passives: Habilidades pasivas continuas (ej: Zenkai, Regeneración, Intangibilidad, Adaptación).
  * actives: Técnicas de soporte o buffs (ej: Kaio-ken, Teletransportación, Ilusiones).

Debes devolver ÚNICAMENTE un objeto JSON válido (sin markdown) con esta estructura:
{
  "id": "nombre-slug",
  "name": "${name}",
  "entityType": "fighter | duo | squad | summon_group",
  "memberIds": ["id1", "id2"],
  "sharedMechanics": ["Mecánica compartida (ej: Decapitación simultánea, Fusión)"],
  "universe": "Franquicia de origen",
  "continuity": "Continuidad específica (ej: Canon Manga, Dragon Ball Multiverse, Fan-Manga, Marvel 616, DC Post-Crisis)",
  "sourceMedium": "manga | anime | comic | fan_manga | movie | game | novel",
  "sagaOrArc": "Saga o arco argumental exacto",
  "version": "Versión canónica (ej: Prime, Adulto, Super, U18)",
  "tier": "Tier oficial VS Battles y Nivel de Poder",
  "physicalTier": "Tier de resistencia física y cuerpo a cuerpo (ej: Tier 8-C Físico)",
  "haxTier": "Tier de habilidad hax / Stand / Magia / Artefacto (ej: Tier 2-C Causal)",
  "canonicalKi": "Lectura oficial de Scouter si existe en el canon (número o null)",
  "ap": "Attack Potency / DC exacto anclado a feats",
  "range": "Rango de ataque efectivo (ej: Cuerpo a cuerpo estándar, Planetario)",
  "speed": {
    "combat": "Velocidad de combate (Lanzar golpes)",
    "reaction": "Velocidad de reacción (Esquivar)",
    "travel": "Velocidad de desplazamiento (Vuelo/Correr)",
    "attack": "Velocidad de ataques de energía/magia"
  },
  "strength": {
    "striking": "Fuerza de Impacto (ej: Town Class)",
    "lifting": "Fuerza de Levantamiento (ej: Clase K)"
  },
  "durability": "Resistencia física y resistencias a hax",
  "stamina": "Límite térmico/calórico o fatiga (ej: Agota Ki rápido, infinita)",
  "battleIQ": "Inteligencia Táctica (ej: Genio Táctico, Instintivo)",
  "haxTags": ["Tag 1", "Tag 2"],
  "subEntity": {
    "name": "Nombre Stand / Invocación (si aplica)",
    "type": "Stand / Invocación / Simbionte",
    "stats": "Poder y reglas"
  },
  "arsenal": {
    "basicAttacks": "Golpes básicos y ráfagas menores",
    "superAttacks": [
      { "name": "Super Ataque", "desc": "Descripción precisa y alcance", "cost": "Coste de energía" }
    ],
    "ultimateAttacks": [
      { "name": "Ataque Definitivo (Finisher)", "desc": "Efecto destructivo masivo / Borrado", "cost": "Desgaste de stamina" }
    ],
    "passives": [
      { "name": "Habilidad Pasiva", "desc": "Efecto continuo (ej: Zenkai, Regeneración)" }
    ],
    "actives": [
      { "name": "Habilidad Activa", "desc": "Efecto y duración (ej: Kaio-ken)" }
    ]
  },
  "abilities": [
    { "name": "Nombre", "desc": "Descripción precisa", "limit": "Coste" }
  ],
  "forms": [
    { "id": "base", "name": "Estado Base", "stats": "Poder base" },
    { "id": "fase-1", "name": "Nombre Forma 1", "stats": "Stats y multiplicador" }
  ],
  "synergies": [
    {
      "name": "Nombre temático canónico (ej: Rivalidad Eterna, Los Mejores del Mundo, Alianza de Maestros)",
      "partnerTags": ["Nombre de aliados canónicos de su propio universo"],
      "effect": "Efecto táctico mecánico coherente (ej: +20% velocidad de reacción / cobertura de aggro / impulso de furia)",
      "canonStatus": "source_backed"
    }
  ],
  "teamCombos": [
    {
      "partnerRequirements": ["Compañero específico del mismo universo"],
      "comboName": "Nombre del Ataque Combinado",
      "description": "Descripción del finisher o ataque dual"
    }
  ],
  "feats": ["Hazaña destacada 1", "Hazaña destacada 2"],
  "psychology": "Psicología Tripartita: Lo que busca, lo que teme. Microgestos al mentir/sufrir dolor.",
  "weaknesses": "Debilidades físicas y psíquicas, condiciones para ser derrotado.",
  "equipment": "Armamento y reliquias clave"
}

REGLAS DE SINERGIAS & PASIVAS (ESTRICTAS):
1. AISLAMIENTO DE LORE: Las sinergias y combos solo pueden relacionar personajes de su propio universo o facción aliada directa.
2. PROHIBICIÓN BIOLÓGICA: Prohibido asignar Zenkai a no-saiyajins, Biomasa/absorción a no-Cell/bio-androides, Ki a personajes sin Ki, o Cursed Energy a no-hechiceros.
3. EFECTOS REALISTAS: Los efectos deben describir ventajas tácticas de combate real (flanqueo, distracción, sincronización de energía, impulso de furia al caer un aliado).
`;

    let jsonString = '';

    if (cfg.type === 'gemini') {
      const response = await fetch(`${cfg.url}:generateContent?key=${cfg.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.3
          }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    } else if (cfg.type === 'openai_chat') {
      const response = await fetch(cfg.url, {
        method: 'POST',
        headers: cfg.headers,
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { role: 'system', content: 'Eres un generador de fichas de Power Scaling en formato JSON estricto.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      jsonString = data.choices?.[0]?.message?.content || '{}';

    } else {
      // Ollama
      const response = await fetch(`${cfg.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cfg.model,
          prompt: prompt,
          stream: false,
          format: 'json',
          options: { temperature: 0.3 }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      jsonString = data.response;
    }

    const cleaned = jsonString.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    // Enriquecimiento post-generación (hook de poder canónico APEX)
    try {
      const { applyPowerHook } = await import('./src/scripts/applyPowerHook.js');
      const enriched = applyPowerHook(parsed);
      return res.json(enriched);
    } catch (hookErr) {
      console.warn('Could not run applyPowerHook on generated character:', hookErr.message);
      return res.json(parsed);
    }

  } catch (error) {
    console.error('Error generando personaje:', error);
    res.status(500).json({ error: error.message || 'Fallo al generar el personaje con la IA.' });
  }
});

// ==========================================
// 4. STREAMING COMBAT SIMULATION (SSE)
// ==========================================

app.post('/api/simulate', aiRateLimit, async (req, res) => {
  try {
    const { prompt, engine, model, apiKey, customBaseUrl } = req.body;
    const cfg = getEndpointConfig(engine, model, apiKey, customBaseUrl);

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (cfg.type === 'gemini') {
      const response = await fetch(`${cfg.url}:streamGenerateContent?key=${cfg.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.65,
            topP: 0.95
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        res.write(`data: ${JSON.stringify({ text: `\n\n[Error de Gemini API: ${errText}]` })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            try {
              const payload = JSON.parse(trimmed.slice(5).trim());
              const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch (e) {}
          } else if (trimmed.includes('"text":')) {
            try {
              const match = trimmed.match(/"text":\s*"((?:[^"\\]|\\.)*)"/);
              if (match) {
                const text = JSON.parse(`"${match[1]}"`);
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch (e) {}
          }
        }
      }

      res.write(`data: [DONE]\n\n`);
      return res.end();

    } else if (cfg.type === 'openai_chat') {
      const response = await fetch(cfg.url, {
        method: 'POST',
        headers: cfg.headers,
        body: JSON.stringify({
          model: cfg.model,
          messages: [
            { 
              role: 'system', 
              content: 'Eres el motor APEX ENGINE 2.0. Escribe prosa de combate fluida, descarnada y de máxima calidad literaria EXCLUSIVAMENTE en español. Prohibido mezclar idiomas, caracteres extraños o palabras corruptas.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.65,
          top_p: 0.9,
          stream: true
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        res.write(`data: ${JSON.stringify({ text: `\n\n[Error de ${engine.toUpperCase()}: ${errText}]` })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') {
            res.write(`data: [DONE]\n\n`);
            return res.end();
          }
          try {
            const parsed = JSON.parse(dataStr);
            const content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.text || '';
            if (content) {
              res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
            }
          } catch (e) {}
        }
      }

      res.write(`data: [DONE]\n\n`);
      return res.end();

    } else {
      // Ollama
      const response = await fetch(`${cfg.url}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cfg.model,
          prompt: prompt,
          stream: true,
          options: {
            temperature: 0.65,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        res.write(`data: ${JSON.stringify({ text: `\n\n[Error de Ollama: ${errText}]` })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.response) {
              res.write(`data: ${JSON.stringify({ text: parsed.response })}\n\n`);
            }
          } catch (e) {}
        }
      }

      res.write(`data: [DONE]\n\n`);
      return res.end();
    }

  } catch (error) {
    console.error('Simulation stream error:', error);
    res.write(`data: ${JSON.stringify({ text: `\n\n[Error crítico del servidor: ${error.message}]` })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

// ==========================================
// 4. SCENARIO AUTO-FILL AI GENERATOR
// ==========================================
app.post('/api/scenario/generate', aiRateLimit, async (req, res) => {
  try {
    const { name, universe, engine = 'totalgpt', model, apiKey, customBaseUrl } = req.body;
    const prompt = `Genera los detalles físicos y sensoriales completos para un escenario/arena de combate de VS Battles llamado "${name || 'Arena Cósmica'}" (${universe || 'Universo Ficción'}).
DEBES responder únicamente con un JSON estrictamente válido (sin etiquetas markdown adicionales) con este formato exacto:
{
  "name": "${name || 'Nombre Épico de la Arena'}",
  "universe": "${universe || 'Universo de Origen'}",
  "gravity": "10G (Diez veces la gravedad terrestre)",
  "temperature": "1500°C (Atmósfera de plasma y calor sofocante)",
  "terrainEffect": "Magma subterráneo en erupción y colapso de la plataforma cada 3 minutos",
  "sensory": "El aire apesta a azufre y ozono ionizado. Relámpagos de energía pura rasgan un cielo púrpura mientras el suelo de basalto retumba con vibraciones tectónicas continuas."
}`;

    const cfg = getEndpointConfig(engine, model, apiKey, customBaseUrl);
    let fullText = '';
    if (cfg.type === 'gemini') {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${cfg.apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      const response = await fetch(cfg.url, {
        method: 'POST',
        headers: cfg.headers,
        body: JSON.stringify({
          model: cfg.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5
        })
      });
      const data = await response.json();
      fullText = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || '';
    }

    const cleanJson = fullText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (err) {
    console.error('Scenario generate error:', err);
    res.status(500).json({ error: 'Error al generar la arena: ' + err.message });
  }
});

// ==========================================
// 6. IMAGE GENERATOR (Reforge / SD WebUI / Pollinations)
// ==========================================
app.post('/api/image/generate', aiRateLimit, async (req, res) => {
  try {
    const { prompt, style = 'shonen', engine = 'pollinations', sdUrl = 'http://127.0.0.1:7860', width = 768, height = 768, negativePrompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Se requiere un prompt para generar la imagen.' });

    let styleSuffix = 'masterpiece, best quality, ultra-detailed anime fighting wallpaper, vibrant colors, sharp focus';
    if (style === 'shonen') {
      styleSuffix = 'masterpiece, ultra-detailed anime action shot, glowing ki aura, energetic sparks, dramatic lighting, intense eyes, trending on pixiv';
    } else if (style === 'cinematic') {
      styleSuffix = 'photorealistic 8k, cinematic lighting, volumetric atmosphere, octane render, Unreal Engine 5, realistic textures';
    } else if (style === 'grimdark') {
      styleSuffix = 'dark fantasy art, ink splatter, gritty textures, heavy battle scars, dark dramatic shadows, Berserk manga style';
    } else if (style === 'wiki') {
      styleSuffix = 'official character render, full body illustration, crisp clean lineart, concept art, high definition';
    }

    const fullPrompt = `${prompt}, ${styleSuffix}`;

    if (engine === 'sd_local' || engine === 'reforge') {
      const targetUrl = `${sdUrl.replace(/\/$/, '')}/sdapi/v1/txt2img`;
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          negative_prompt: negativePrompt || 'worst quality, low quality, blurry, mutated hands, distorted, bad anatomy, watermark, text, signature',
          steps: 25,
          cfg_scale: 7,
          width: width || 768,
          height: height || 768
        })
      });

      if (!response.ok) {
        throw new Error(`SD/Reforge no respondió en ${targetUrl}. Asegúrate de tener Stable Diffusion / Forge abierto con el parámetro --api activado.`);
      }

      const data = await response.json();
      const base64Img = data.images?.[0];
      if (!base64Img) throw new Error('No se recibió imagen desde SD/Reforge.');
      return res.json({ imageUrl: `data:image/png;base64,${base64Img}` });
    }

    // Default: Pollinations.ai (100% Free Cloud Image Generation)
    const seed = Math.floor(Math.random() * 1000000);
    const cleanPrompt = encodeURIComponent(fullPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width || 768}&height=${height || 768}&seed=${seed}&nologo=true&enhance=true`;
    return res.json({ imageUrl });
  } catch (err) {
    console.error('Image generate error:', err);
    res.status(500).json({ error: 'Error al generar imagen: ' + err.message });
  }
});

// Generador de Cartel de Combate / Clash Wallpaper
app.post('/api/image/battle', aiRateLimit, async (req, res) => {
  try {
    const { charAName, charBName, scenarioName, style = 'shonen', engine = 'pollinations', sdUrl } = req.body;
    const battlePrompt = `epic confrontation between ${charAName} and ${charBName} clashing in ${scenarioName || 'a destroyed cosmic arena'}, energy beam clash, shockwaves, shattered earth, high stakes battle`;
    
    // Delegate to image generator
    const subRes = await fetch(`http://localhost:${PORT}/api/image/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: battlePrompt, style, engine, sdUrl, width: 1024, height: 576 })
    });
    const data = await subRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al generar cartel de combate: ' + err.message });
  }
});

// Test de Conexión con Reforge / SD Local
app.post('/api/image/test-reforge', aiRateLimit, async (req, res) => {
  try {
    const { sdUrl = 'http://127.0.0.1:7860' } = req.body;
    const testUrl = `${sdUrl.replace(/\/$/, '')}/sdapi/v1/sd-models`;
    const response = await fetch(testUrl);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const models = await response.json();
    res.json({ success: true, modelsCount: models.length || 0, message: `¡Conexión exitosa con Reforge/SD! (${models.length || 0} modelos detectados)` });
  } catch (err) {
    res.json({ success: false, message: `No se pudo conectar a ${req.body.sdUrl || 'http://127.0.0.1:7860'}. Asegúrate de tener Reforge abierto con el parámetro --api activado.` });
  }
});

// ==========================================
// 7. PUBLIC ROSTER API (consulta externa del canon V26)
//    GET /api/roster            → resumen ligero de los 770 luchadores
//    GET /api/roster?search=ki  → búsqueda por nombre/alias/id
//    GET /api/roster/:id        → ficha completa de un personaje
// ==========================================

const ROSTER_JSON_PATH = path.join(__dirname, 'src', 'data', 'ROSTER_NIVELES_PODER_CORREGIDO_V26.json');
const TACTICAL_JSON_PATH = path.join(__dirname, 'src', 'data', 'tacticalProfiles.json');

let rosterCache = null;
function getRosterData() {
  if (rosterCache) return rosterCache;
  const raw = JSON.parse(fs.readFileSync(ROSTER_JSON_PATH, 'utf8'));
  const list = Array.isArray(raw.characters) ? raw.characters : Object.values(raw.characters || {});
  let tacticalMap = {};
  try {
    const tac = JSON.parse(fs.readFileSync(TACTICAL_JSON_PATH, 'utf8'));
    if (Array.isArray(tac)) {
      tacticalMap = new Map(tac.filter(p => p && p.id).map(p => [p.id, p]));
    }
  } catch (e) { /* perfiles tácticos opcionales */ }
  rosterCache = { list, tacticalMap, meta: raw.meta || {} };
  return rosterCache;
}

function toSummary(c) {
  return {
    id: c.id,
    name: c.name,
    franchise: c.franchise || null,
    universe: c.universe || null,
    saga: c.saga || null,
    baseTier: c.baseTier || null,
    baseKiNumeric: c.baseKiNumeric ?? null,
    baseKiFormatted: c.baseKiFormatted || null,
    formsCount: (c.forms || []).length
  };
}

app.get('/api/roster', (req, res) => {
  try {
    const { search } = req.query;
    const { list } = getRosterData();
    let out = list;
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      out = list.filter(c =>
        (c.id || '').toLowerCase().includes(q) ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.alias || '').toLowerCase().includes(q) ||
        (c.franchise || '').toLowerCase().includes(q) ||
        (c.universe || '').toLowerCase().includes(q)
      );
    }
    res.json({
      meta: { version: 'V26', total: list.length, filtered: out.length, source: 'ROSTER_NIVELES_PODER_CORREGIDO_V26.json' },
      characters: out.map(toSummary)
    });
  } catch (err) {
    console.error('Roster API error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/roster/:id', (req, res) => {
  try {
    const { list, tacticalMap } = getRosterData();
    const found = list.find(c => c.id === req.params.id);
    if (!found) return res.status(404).json({ error: `Personaje "${req.params.id}" no encontrado.` });
    const tactical = tacticalMap?.get ? tacticalMap.get(found.id) : null;
    res.json({ character: tactical ? { ...found, tacticalProfile: tactical } : found });
  } catch (err) {
    console.error('Roster detail API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. CLOUD SYNC (multi-dispositivo) — persistencia en archivo JSON
//    El serverless de Vercel (api/cloud/sync.js) era 100% en memoria y el
//    rewrite de vercel.json apunta /api/* aquí (Render), así que este endpoint
//    ES el que el frontend usa de verdad. Almacena en .cloud_sync_store.json
//    (writable en Render/local; si falla la escritura, degrada a memoria).
// ==========================================

const CLOUD_STORE_PATH = path.join(__dirname, '.cloud_sync_store.json');
let cloudVaultStore = new Map();
let cloudAccountStore = new Map();
let cloudLinkCodes = new Map();

function loadCloudStore() {
  try {
    if (fs.existsSync(CLOUD_STORE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(CLOUD_STORE_PATH, 'utf8'));
      cloudVaultStore = new Map(Object.entries(raw.vaults || {}));
      cloudAccountStore = new Map(Object.entries(raw.accounts || {}));
      cloudLinkCodes = new Map(Object.entries(raw.linkCodes || {}));
    }
  } catch (e) { /* store corrupto → empieza limpio */ }
}
function saveCloudStore() {
  try {
    const data = {
      vaults: Object.fromEntries(cloudVaultStore),
      accounts: Object.fromEntries(cloudAccountStore),
      linkCodes: Object.fromEntries(cloudLinkCodes)
    };
    fs.writeFileSync(CLOUD_STORE_PATH, JSON.stringify(data), 'utf8');
  } catch (e) { /* disco no escribible → queda en memoria */ }
}
loadCloudStore();
// Limpieza periódica de códigos de enlace expirados
setInterval(() => {
  const now = Date.now();
  for (const [code, item] of cloudLinkCodes) {
    if (!item.expiresAt || item.expiresAt < now) cloudLinkCodes.delete(code);
  }
}, 60 * 1000).unref?.();

// CORS ligero para el sync (el frontend llama al mismo origen en Render/Vercel)
app.use('/api/cloud/sync', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.get('/api/cloud/sync', (req, res) => {
  const searchKey = (req.query.userId || req.query.identifier || '').toLowerCase().trim();
  if (!searchKey) return res.status(400).json({ error: 'Debes proporcionar un userId o identificador.' });
  const vault = cloudVaultStore.get(searchKey);
  const account = cloudAccountStore.get(searchKey);
  if (vault || account) return res.json({ success: true, vault: vault || null, account: account || null });
  return res.status(404).json({ empty: true, message: 'No se encontraron datos en la nube para este identificador.' });
});

app.post('/api/cloud/sync', (req, res) => {
  const data = req.body || {};
  const action = data.action || req.query.action;

  // Códigos de enlace rápido PC <-> móvil
  if (action === 'create_link_code') {
    const cleanCode = `APX-${Math.floor(1000 + Math.random() * 9000)}`;
    cloudLinkCodes.set(cleanCode, {
      code: cleanCode,
      payload: data.payload || null,
      account: data.account || null,
      expiresAt: Date.now() + 1000 * 60 * 30
    });
    saveCloudStore();
    return res.json({ success: true, code: cleanCode, message: `Código de enlace generado: ${cleanCode}. Válido por 30 minutos.` });
  }

  if (action === 'redeem_link_code') {
    const targetCode = String(data.code || '').trim().toUpperCase();
    const item = cloudLinkCodes.get(targetCode);
    if (!item) return res.status(404).json({ success: false, error: 'Código de enlace no encontrado o expirado.' });
    if (Date.now() > item.expiresAt) { cloudLinkCodes.delete(targetCode); saveCloudStore(); return res.status(410).json({ success: false, error: 'El código de enlace ha expirado.' }); }
    return res.json({ success: true, payload: item.payload, account: item.account });
  }

  // Guardar / sincronizar bóveda de usuario
  const uid = String(data.userId || '').toLowerCase().trim();
  const email = String(data.userEmail || data.email || '').toLowerCase().trim();
  const username = String(data.displayName || data.username || '').toLowerCase().trim();
  if (!uid && !email && !username) return res.status(400).json({ error: 'Datos de usuario insuficientes.' });

  const payload = {
    userId: uid || `usr_${email}`,
    userEmail: email,
    displayName: data.displayName || data.username || 'Usuario APEX',
    timestamp: new Date().toISOString(),
    characters: data.characters || [],
    combatHistory: data.combatHistory || [],
    oracleCoins: data.oracleCoins ?? 1000,
    customScenarios: data.customScenarios || [],
    aiConfig: data.aiConfig || {}
  };
  const accountData = {
    id: payload.userId,
    email: payload.userEmail,
    displayName: payload.displayName,
    avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.displayName || payload.userEmail)}`,
    lastSync: payload.timestamp
  };

  for (const key of [uid, email, username]) {
    if (key) { cloudVaultStore.set(key, payload); cloudAccountStore.set(key, accountData); }
  }
  saveCloudStore();

  return res.json({
    success: true,
    timestamp: payload.timestamp,
    stats: { charactersCount: payload.characters.length, favoritesCount: (payload.combatHistory || []).filter(h => h && h.isFavorite).length, coins: payload.oracleCoins }
  });
});

// SPA Fallback for production dist
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

const http = require('http');
const server = http.createServer(app);

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`ℹ️ El backend de APEX ya está corriendo activamente en el puerto ${PORT}. No es necesario iniciarlo de nuevo.`);
    process.exit(0);
  } else {
    console.error('Error en el servidor backend:', e);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`⚡ APEX ENGINE MULTI-AI BACKEND RUNNING`);
  console.log(`🌐 Port: http://0.0.0.0:${PORT}`);
  console.log(`🧠 Providers: OpenRouter, Gemini, OpenAI, Ollama, Custom URL`);
  console.log(`📂 Vault Path: ${VAULT_PATH}`);
  console.log(`====================================================`);
});
