/**
 * 🛡️ APEX OPENCODE ANTI-QUOTA SENTINEL (BLINDAJE TOTAL ANTI-GASTO)
 * 
 * Este script audita y auto-repara en caliente todas las configuraciones de OpenCode
 * y la base de datos SQLite (opencode.db) para garantizar que NINGÚN modelo de pago
 * (Qwen Plus/Max/Flash, Kimi, Grok, GPT, Big-Pickle, DeepSeek Pro, etc.)
 * pueda ser ejecutado en segundo plano, por agentes internos (@explore, @build, etc.)
 * o al abrir sesiones antiguas guardadas en la interfaz web de OpenCode.
 * 
 * Los ÚNICOS modelos permitidos de OpenCode Go son:
 * - opencode-go/deepseek-v4.1-flash (Promo 4x cuota / ultra económico)
 * - opencode-go/deepseek-v4-flash (Flash estándar)
 * 
 * Todo lo demás se auto-repara a OpenRouter FREE (Nemotron Super 120B Free).
 */

const fs = require('fs');
const path = require('path');

const FORBIDDEN_PATTERNS = [
  /opencode-go\/qwen[a-zA-Z0-9._-]*/i,
  /opencode-go\/kimi[a-zA-Z0-9._-]*/i,
  /opencode-go\/deepseek-v4-pro/i,
  /opencode-go\/grok[a-zA-Z0-9._-]*/i,
  /opencode-go\/gpt[a-zA-Z0-9._-]*/i,
  /opencode-go\/glm-5\.[123](?!-flash)/i,
  /opencode-go\/big-pickle/i,
  /opencode\/big-pickle/i,
  /opencode-go\/(?!deepseek-v4\.1-flash|deepseek-v4-flash)[a-zA-Z0-9._-]+/i
];

const SAFE_FREE_MODEL = "openrouter/nvidia/nemotron-3-super-120b-a12b:free";
const SAFE_DB_MODEL_JSON = '{"id":"nvidia/nemotron-3-super-120b-a12b:free","providerID":"openrouter","variant":"default"}';

const CONFIG_PATHS = [
  'Z:/apex-powerscaling-engine/opencode.json',
  'Z:/apex-powerscaling-engine/.opencode/opencode.jsonc',
  'C:/Users/Jose Luis/.config/opencode/opencode.jsonc',
  'C:/Users/Jose Luis/apex-powerscaling-engine/opencode.json'
];

function auditAndHealConfig(filePath) {
  if (!fs.existsSync(filePath)) return { path: filePath, status: 'SKIPPED_NOT_FOUND' };

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      console.warn(`[SENTINEL] ⚠️ Modelo peligroso detectado en ${filePath} con patrón ${pattern}. Auto-reparando a modelo gratuito...`);
      content = content.replace(new RegExp(pattern.source, 'gi'), SAFE_FREE_MODEL);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[SENTINEL] ✅ Archivo ${filePath} auto-reparado y blindado exitosamente.`);
    return { path: filePath, status: 'HEALED' };
  }

  return { path: filePath, status: 'CLEAN' };
}

function sanitizeOpencodeDb() {
  const dbPath = path.join(process.env.USERPROFILE || 'C:\\Users\\Jose Luis', '.local', 'share', 'opencode', 'opencode.db');
  if (!fs.existsSync(dbPath)) {
    return { status: 'NO_DB' };
  }

  try {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(dbPath);

    const sessions = db.prepare("SELECT id, title, agent, model FROM session").all();
    let sanitizedCount = 0;

    for (const s of sessions) {
      const mStr = s.model || '';
      let isForbidden = false;

      try {
        const m = JSON.parse(mStr);
        const prov = m.providerID || '';
        const modelId = m.id || '';

        // Si es OpenCode Go pero NO es uno de los flash autorizados -> PROHIBIDO
        if (prov === 'opencode-go' && modelId !== 'deepseek-v4.1-flash' && modelId !== 'deepseek-v4-flash') {
          isForbidden = true;
        }
        // Modelos caros o residuales no autorizados
        if (modelId === 'big-pickle' || modelId.includes('qwen') || modelId.includes('kimi') || modelId.includes('deepseek-v4-pro')) {
          isForbidden = true;
        }
      } catch (e) {
        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(mStr)) {
            isForbidden = true;
            break;
          }
        }
      }

      if (isForbidden) {
        db.prepare("UPDATE session SET model = ? WHERE id = ?").run(SAFE_DB_MODEL_JSON, s.id);
        console.warn(`[SENTINEL] 🛡️ Sesión saneada en opencode.db: [${s.id}] "${s.title}" (era: ${mStr} -> ahora: ${SAFE_DB_MODEL_JSON})`);
        sanitizedCount++;
      }
    }

    if (sanitizedCount > 0) {
      console.log(`[SENTINEL] ✅ ${sanitizedCount} sesión(es) antigua(s) saneada(s) en la base de datos de OpenCode Web.`);
    } else {
      console.log('[SENTINEL] 🟢 Base de datos opencode.db limpia: Cero sesiones con modelos caros.');
    }

    return { status: 'OK', sanitizedCount };
  } catch (err) {
    console.warn('[SENTINEL] ⚠️ No se pudo sanear la base de datos opencode.db:', err.message);
    return { status: 'ERROR', error: err.message };
  }
}

function verifyRunners() {
  const runners = [
    'Z:/apex-powerscaling-engine/tools/opencode/runner_autonomo.ps1',
    'C:/Users/Jose Luis/opencode-tools/runner_autonomo.ps1'
  ];

  runners.forEach(r => {
    if (!fs.existsSync(r)) return;
    const c = fs.readFileSync(r, 'utf8');
    if (!c.includes('BLOQUEO DE SEGURIDAD ACTIVADO')) {
      console.warn(`[SENTINEL] ⚠️ Falta el killswitch en ${r}.`);
    } else {
      console.log(`[SENTINEL] 🛡️ Runner seguro y blindado: ${r}`);
    }
  });
}

function runSentinel() {
  console.log('[SENTINEL] 🔍 Iniciando chequeo de blindaje anti-cuota...');
  const results = CONFIG_PATHS.map(auditAndHealConfig);
  const dbResult = sanitizeOpencodeDb();
  verifyRunners();
  const allClean = results.every(r => r.status === 'CLEAN' || r.status === 'SKIPPED_NOT_FOUND') && (dbResult.status === 'OK' || dbResult.status === 'NO_DB');
  if (allClean) {
    console.log('[SENTINEL] 🟢 SISTEMA 100% BLINDADO: Cero modelos caros detectados en archivos y base de datos. Saldo a salvo.');
  }
  return allClean;
}

if (require.main === module) {
  runSentinel();
}

module.exports = { runSentinel, sanitizeOpencodeDb };
