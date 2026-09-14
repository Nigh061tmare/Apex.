import { spawn, exec, execSync } from 'child_process';
import http from 'http';
import https from 'https';
import net from 'net';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const { runMaintenance } = require('./maintainOpenCodeDb.cjs');
let runSentinel = () => {};
let runCatalogUpdate = async () => {};
let runAutoCompaction = () => {};

try {
  const sentinelPath = path.resolve(__dirname, '../../tools/opencode/blindaje_antocuota.cjs');
  if (fs.existsSync(sentinelPath)) {
    runSentinel = require(sentinelPath).runSentinel;
  }
} catch (e) {}
try {
  const catalogPath = path.resolve(__dirname, '../../tools/opencode/update_free_models_catalog.cjs');
  if (fs.existsSync(catalogPath)) {
    runCatalogUpdate = require(catalogPath).runCatalogUpdate;
  }
} catch (e) {}
try {
  const compactorPath = path.resolve(__dirname, '../../tools/opencode/compact_and_prune_all_sessions.cjs');
  if (fs.existsSync(compactorPath)) {
    runAutoCompaction = require(compactorPath).runAutoCompaction;
  }
} catch (e) {}

process.on('uncaughtException', (err) => {
  console.warn('[SUPERVISOR SHIELD] Error no capturado interceptado (proceso protegido):', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[SUPERVISOR SHIELD] Promesa rechazada interceptada (proceso protegido):', reason?.message || reason);
});

console.log('  🚀 INICIANDO OPENCODE WEB — APEX POWER SCALING');
console.log('========================================================');
console.log('Directorio del proyecto:', projectRoot);

// ── Cargar .env y .env.local automáticamente si existen ──────────────────────
for (const f of ['.env', '.env.local']) {
  const p = path.join(projectRoot, f);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key && !process.env[key]) process.env[key] = val;
    }
  }
}
console.log('   ✅ Claves cargadas desde .env y .env.local');
if (process.env.OPENCODE_API_KEY) {
  console.log('   ⚡ OpenCode Go Suscripción detectada y activa');
}


// ── Detección de Puertos Disponibles sin Sockets Zombies ──
function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(preferred, fallbacks = []) {
  if (await isPortFree(preferred)) return preferred;
  for (const p of fallbacks) {
    if (await isPortFree(p)) return p;
  }
  return preferred;
}

const KEYS = [
  process.env.OPENROUTER_API_KEY || '',
  process.env.OPENROUTER_BACKUP_API_KEY || ''
].filter(Boolean);

let activeKeyIndex = 0;

async function bootstrap() {
  // ── Mantenimiento preventivo anti-bloat y verificación de salud de la BD ──
  try {
    runSentinel();
    await runCatalogUpdate();
    runAutoCompaction({ verbose: true });
    runMaintenance({ verbose: true });
  } catch (mErr) {
    console.warn('[SUPERVISOR] Mantenimiento inicial:', mErr?.message || mErr);
  }

  // Mantenimiento continuo, chequeo de blindaje y autocompactación cada 10 minutos
  setInterval(async () => {
    try {
      runSentinel();
      await runCatalogUpdate();
      runAutoCompaction({ verbose: false });
      runMaintenance({ verbose: false });
    } catch {}
  }, 10 * 60 * 1000);

  const opencodePort = await findAvailablePort(4096, [4098, 4100, 4102, 4104]);
  const proxyPort = await findAvailablePort(4097, [4099, 4101, 4103, 4105]);

  if (opencodePort !== 4096) {
    console.log(`ℹ️  Puerto 4096 reservado por socket previo de Windows. Usando puerto libre: ${opencodePort}`);
  }

  const MODEL_MAX_TOKENS = {
    'nvidia/nemotron-3-ultra-550b-a55b:free': 65536,
    'nvidia/nemotron-3.5-lightning:free': 65536,
    'nvidia/nemotron-3-super-120b-a12b:free': 235929,
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free': 65536,
    'minimax/minimax-m3:free': 262144,
    'minimax/minimax-m2.7:free': 176947,
    'meta/muse-spark-1.3-contributor:free': 262144,
    'z-ai/glm-5.2:free': 230400,
    'thinkingmachines/inkling:free': 262144,
    'thinkingmachines/inkling-small:free': 262144,
    'deepseek/deepseek-v4.1-flash': 384000,
    'nex-agi/nex-n2.5-mini:free': 32768,
    'nex-agi/nex-n2.5-pro:free': 32768,
    'poolside/laguna-s-2.1:free': 32768
  };

  // ── PROXY INTELIGENTE CON CONMUTACIÓN AUTOMÁTICA DE CLAVES ──
  const proxyServer = http.createServer((clientReq, clientRes) => {
    clientReq.on('error', (err) => console.warn('[PROXY CLIENT REQ WARN]', err.message));
    clientRes.on('error', (err) => console.warn('[PROXY CLIENT RES WARN]', err.message));

    const requestBodyChunks = [];
    clientReq.on('data', chunk => requestBodyChunks.push(chunk));

    clientReq.on('end', () => {
      let requestBody = Buffer.concat(requestBodyChunks);

      if (clientReq.method === 'POST' && requestBody.length > 0) {
        try {
          const bodyObj = JSON.parse(requestBody.toString('utf8'));
          if (bodyObj.max_tokens && bodyObj.max_tokens > 4096) {
            bodyObj.max_tokens = 4096;
            requestBody = Buffer.from(JSON.stringify(bodyObj), 'utf8');
          }
        } catch (err) {}
      }

      function attemptRequest(keyIndex) {
        if (clientRes.writableEnded) return;

        if (keyIndex >= KEYS.length) {
          try {
            clientRes.writeHead(502, { 'Content-Type': 'application/json' });
            clientRes.end(JSON.stringify({ error: 'Todas las claves API de OpenRouter han fallado o agotado cuota.' }));
          } catch {}
          return;
        }

        const currentKey = KEYS[keyIndex];
        const targetPath = clientReq.url.startsWith('/api/v1') ? clientReq.url : ('/api/v1' + clientReq.url);

        const headers = {
          ...clientReq.headers,
          host: 'openrouter.ai',
          authorization: 'Bearer ' + currentKey,
          'http-referer': `http://localhost:${opencodePort}`,
          'x-title': 'APEX OpenCode Engine'
        };

        delete headers['content-length'];
        if (requestBody.length > 0) {
          headers['content-length'] = Buffer.byteLength(requestBody);
        }

        const options = {
          hostname: 'openrouter.ai',
          port: 443,
          path: targetPath,
          method: clientReq.method,
          headers: headers
        };

        const proxyReq = https.request(options, (proxyRes) => {
          const isErrorStatus = proxyRes.statusCode === 401 || proxyRes.statusCode === 402 || proxyRes.statusCode === 429;

          if (isErrorStatus && (keyIndex + 1) < KEYS.length) {
            console.log('\n[OPENROUTER FALLBACK] ⚠ Detectado error ' + proxyRes.statusCode + ' en Clave ' + (keyIndex + 1) + '. Conmutando automáticamente a Clave ' + (keyIndex + 2) + '...');
            activeKeyIndex = keyIndex + 1;
            attemptRequest(keyIndex + 1);
            return;
          }

          if (!clientRes.writableEnded) {
            try {
              clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
              proxyRes.pipe(clientRes);
            } catch (pipeErr) {
              console.warn('[PROXY PIPE WARN]', pipeErr.message);
            }
          }
        });

        proxyReq.on('error', (err) => {
          console.warn('[OPENROUTER PROXY ERROR] ' + err.message);
          if ((keyIndex + 1) < KEYS.length) {
            console.log('[OPENROUTER FALLBACK] Reintentando con Clave ' + (keyIndex + 2) + '...');
            activeKeyIndex = keyIndex + 1;
            attemptRequest(keyIndex + 1);
          } else {
            if (!clientRes.writableEnded) {
              try {
                clientRes.writeHead(502, { 'Content-Type': 'application/json' });
                clientRes.end(JSON.stringify({ error: 'Error conectando con OpenRouter: ' + err.message }));
              } catch {}
            }
          }
        });

        if (requestBody.length > 0) {
          proxyReq.write(requestBody);
        }
        proxyReq.setTimeout(600000);
        proxyReq.end();
      }

      attemptRequest(activeKeyIndex);
    });
  });

  proxyServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\n⚠️  El puerto proxy ${proxyPort} ya estaba activo. Reutilizando conexión...`);
    } else {
      console.error('[PROXY SERVER ERROR]', err);
    }
  });

  proxyServer.listen(proxyPort, '0.0.0.0', () => {
    console.log('🏡  Proxy de Respaldo Automático de Claves activo en:');
    console.log(`   • Local: http://127.0.0.1:${proxyPort}/`);
    console.log(`   • Red LAN: http://0.0.0.0:${proxyPort}/`);
    const mainKey = KEYS[0] || 'SIN_CLAVE';
    const backupKey = KEYS[1] || 'SIN_CLAVE';
    console.log('   • Clave Principal: ' + mainKey.slice(0, 16) + '...');
    console.log('   • Clave Respaldo:  ' + backupKey.slice(0, 16) + '...');
    console.log('   (Conmutación automática activa sin cortar la sesión)\n');
  });

  process.env.UV_THREADPOOL_SIZE = '64';
  process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --max-old-space-size=4096';
  process.env.OPENROUTER_BASE_URL = `http://127.0.0.1:${proxyPort}/api/v1`;
  delete process.env.OPENAI_BASE_URL;
  process.env.OPENCODE_API_KEY = process.env.OPENCODE_API_KEY || process.env.OPENCODE_ZEN_API_KEY || '';
  process.env.OPENCODE_ZEN_API_KEY = process.env.OPENCODE_API_KEY;
  process.env.OPENROUTER_API_KEY = KEYS[0] || '';
  process.env.OPENROUTER_BACKUP_API_KEY = KEYS[1] || '';
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
  process.env.PATH = (process.env.APPDATA ? (process.env.APPDATA + '\\npm;') : '') + (process.env.PATH || '');


  const opencodeExe = 'C:\\Users\\Jose Luis\\AppData\\Roaming\\npm\\node_modules\\opencode-ai\\bin\\opencode.exe';
  const hasDirectExe = fs.existsSync(opencodeExe);
  const cmd = hasDirectExe ? opencodeExe : (process.platform === 'win32' ? 'npx.cmd' : 'npx');
  const baseArgs = ['web', '--port', String(opencodePort), '--hostname', '0.0.0.0'];
  const args = hasDirectExe ? baseArgs : ['opencode-ai', ...baseArgs];

  let browserOpened = false;
  const targetUrl = `http://127.0.0.1:${opencodePort}/`;

  function checkAndOpenBrowser() {
    if (browserOpened) return;
    const req = http.get(`http://127.0.0.1:${opencodePort}/global/health`, (res) => {
      if (res.statusCode === 200 && !browserOpened) {
        browserOpened = true;
        console.log('\n=======================================================');
        console.log('  ✅ ¡OPENCODE WEB ESTÁ ACTIVO Y BLINDADO CONTRA CUELGUES!');
        console.log(`  🌐 Abriendo navegador en: ${targetUrl}`);
        console.log('=======================================================\n');
        exec(`start ${targetUrl}`);
      }
    });
    req.on('error', () => {
      if (!browserOpened) setTimeout(checkAndOpenBrowser, 800);
    });
  }

  function startOpenCodeProcess() {
    console.log(`[SUPERVISOR] Lanzando OpenCode (comando: ${cmd})...`);
    const proc = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: !hasDirectExe,
      env: { ...process.env }
    });

    proc.stdout.on('data', (data) => {
      const str = data.toString();
      process.stdout.write(str);
      if ((str.includes('Local access:') || str.includes('Web interface') || str.includes('Listening')) && !browserOpened) {
        checkAndOpenBrowser();
      }
    });

    proc.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    proc.on('exit', (code, signal) => {
      console.log(`\n[SUPERVISOR] ⚠️ OpenCode se ha cerrado (código: ${code}, señal: ${signal}).`);
      console.log('[SUPERVISOR] 🔄 Reiniciando automáticamente en 2 segundos para mantener el servicio siempre activo...');
      setTimeout(startOpenCodeProcess, 2000);
    });

    proc.on('error', (err) => {
      console.error('[SUPERVISOR] Error en proceso:', err);
    });
  }

  startOpenCodeProcess();
  setTimeout(checkAndOpenBrowser, 1200);

  // Ejecutar primera compactación a los 5 segundos del inicio
  setTimeout(() => {
    try {
      runAutoCompaction({ verbose: true });
    } catch (e) {}
  }, 5000);

  // Compactador periódico de sesiones (cada 10 minutos para mantener el contexto ligero y barato)
  setInterval(() => {
    try {
      runAutoCompaction({ verbose: true });
    } catch (e) {}
  }, 10 * 60 * 1000);

  // Mantener el bucle de eventos de Node.js eternamente activo
  setInterval(() => {}, 30000);
}

bootstrap().catch((err) => {
  console.error('[SUPERVISOR BOOTSTRAP ERROR]', err);
  console.log('[SUPERVISOR] 🔄 Reintentando bootstrap en 3 segundos...');
  setTimeout(bootstrap, 3000);
});
