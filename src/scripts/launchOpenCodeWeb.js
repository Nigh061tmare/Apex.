import { spawn, exec, execSync } from 'child_process';
import http from 'http';
import https from 'https';
import net from 'net';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

console.log('  🚀 INICIANDO OPENCODE WEB — APEX POWER SCALING');
console.log('========================================================');
console.log('Directorio del proyecto:', projectRoot);

// ── Cargar .env automáticamente si existe ──────────────────────────────────
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
  console.log('   ✅ Claves cargadas desde .env');
} else {
  console.warn('   ⚠️  No se encontró .env — usa variables de entorno del sistema');
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
    'inclusionai/ling-3.0-flash-fin:free': 32768,
    'poolside/laguna-s-2.1:free': 32768
  };

  // ── PROXY INTELIGENTE CON CONMUTACIÓN AUTOMÁTICA DE CLAVES ──
  const proxyServer = http.createServer((clientReq, clientRes) => {
    const requestBodyChunks = [];
    clientReq.on('data', chunk => requestBodyChunks.push(chunk));

    clientReq.on('end', () => {
      let requestBody = Buffer.concat(requestBodyChunks);

      if (clientReq.method === 'POST' && requestBody.length > 0) {
        try {
          const bodyObj = JSON.parse(requestBody.toString('utf8'));
          if (bodyObj.model) {
            const cleanModel = bodyObj.model.replace(/^openrouter\//, '');
            const targetMax = MODEL_MAX_TOKENS[cleanModel];
            if (targetMax && (!bodyObj.max_tokens || bodyObj.max_tokens < targetMax)) {
              bodyObj.max_tokens = targetMax;
              requestBody = Buffer.from(JSON.stringify(bodyObj), 'utf8');
            }
          }
        } catch (err) {}
      }

      function attemptRequest(keyIndex) {
        if (keyIndex >= KEYS.length) {
          clientRes.writeHead(502, { 'Content-Type': 'application/json' });
          clientRes.end(JSON.stringify({ error: 'Todas las claves API de OpenRouter han fallado o agotado cuota.' }));
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

          clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(clientRes);
        });

        proxyReq.on('error', (err) => {
          console.error('[OPENROUTER PROXY ERROR] Error: ' + err.message);
          if ((keyIndex + 1) < KEYS.length) {
            console.log('[OPENROUTER FALLBACK] Reintentando con Clave ' + (keyIndex + 2) + '...');
            activeKeyIndex = keyIndex + 1;
            attemptRequest(keyIndex + 1);
          } else {
            clientRes.writeHead(502, { 'Content-Type': 'application/json' });
            clientRes.end(JSON.stringify({ error: 'Error conectando con OpenRouter: ' + err.message }));
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

  process.env.OPENROUTER_BASE_URL = `http://127.0.0.1:${proxyPort}/api/v1`;
  process.env.OPENAI_BASE_URL = `http://127.0.0.1:${proxyPort}/api/v1`;
  process.env.OPENROUTER_API_KEY = KEYS[0] || '';
  process.env.OPENROUTER_BACKUP_API_KEY = KEYS[1] || '';
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
  process.env.PATH = (process.env.APPDATA ? (process.env.APPDATA + '\\npm;') : '') + (process.env.PATH || '');

  const isWin = process.platform === 'win32';
  const cmd = isWin ? 'npx.cmd' : 'npx';
  const args = ['opencode-ai', 'web', '--port', String(opencodePort), '--hostname', '0.0.0.0'];

  const proc = spawn(cmd, args, {
    cwd: projectRoot,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env }
  });

  let browserOpened = false;

  function checkAndOpenBrowser() {
    if (browserOpened) return;
    const req = http.get(`http://127.0.0.1:${opencodePort}/`, (res) => {
      if (res.statusCode === 200 && !browserOpened) {
        browserOpened = true;
        console.log('\n=======================================================');
        console.log('  ✅ ¡OPENCODE WEB ESTÁ ACTIVO Y VINCULADO AL PROYECTO!');
        console.log(`  🌐 Abriendo navegador en: http://127.0.0.1:${opencodePort}/`);
        console.log('=======================================================\n');
        exec(`start http://127.0.0.1:${opencodePort}/`);
      }
    });
    req.on('error', () => {
      setTimeout(checkAndOpenBrowser, 800);
    });
  }

  setTimeout(checkAndOpenBrowser, 1000);

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

  proc.on('exit', (code) => {
    console.log('\nOpenCode se ha detenido con código: ' + code);
    try { proxyServer.close(); } catch {}
    process.exit(code || 0);
  });
}

bootstrap().catch(console.error);
