#!/usr/bin/env node
/**
 * 🧭 VANE CLI — INTERFAZ DE LÍNEA DE COMANDOS PARA OPENCODE WEB
 * Uso:
 *   node tools/vane/vane_cli.cjs "tu pregunta de búsqueda"
 *   node tools/vane/vane_cli.cjs "https://ejemplo.com"
 */

const fs = require('fs');
const path = require('path');
const { searchWeb, browseUrl, answerWithVane } = require('./vane_engine.cjs');

// Cargar variables de entorno locales si no están presentes
const projectRoot = path.resolve(__dirname, '../../');
for (const envFile of ['.env', '.env.local']) {
  const p = path.join(projectRoot, envFile);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim();
        if (k && !process.env[k]) process.env[k] = v;
      }
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const input = args.join(' ').trim();

  if (!input) {
    console.log(`
🧭 VANE AI ANSWERING & BROWSER ENGINE (Modo 100% Gratuito)
Uso:
  /browser <pregunta o término de búsqueda>
  /browser <url>

Ejemplos:
  /browser ¿Cuáles son las últimas novedades de React 19?
  /browser https://github.com/ItzCrazyKns/Vane
`);
    process.exit(0);
  }

  // 1. Si el usuario pasa una URL directa: Navegar y extraer
  if (input.startsWith('http://') || input.startsWith('https://')) {
    console.log(`🌐 [VANE BROWSER] Navegando a: ${input}\n`);
    const page = await browseUrl(input, 10000);
    console.log(`## 📄 ${page.title}\n`);
    console.log(page.content);
    return;
  }

  // 2. Si el usuario pasa una consulta: Búsqueda, extracción y síntesis con citas
  console.log(`🧭 [VANE ENGINE] Investigando en la web: "${input}"...\n`);
  const result = await answerWithVane(input);

  console.log(result.answer);
  console.log('\n---');
  console.log('🛡️ Ejecutado con motor Vane + OpenRouter Free (Cero gasto de cuota OpenCode Go)');
}

main().catch(err => {
  console.error('[VANE CLI ERROR]:', err.message);
  process.exit(1);
});
