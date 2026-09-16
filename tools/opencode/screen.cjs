#!/usr/bin/env node
/**
 * Helper de Node.js para invocar la captura de pantalla de OpenCode
 * y devolver la ruta y metadatos en stdout.
 */
const { execSync } = require('child_process');
const path = require('path');

const psScript = path.join(__dirname, 'capture_screen.ps1');

try {
  const isBase64 = process.argv.includes('--base64');
  const isRecord = process.argv.includes('--record');
  
  if (isRecord) {
    const recordScript = path.join(__dirname, 'record_screen.ps1');
    const out = execSync(`powershell -ExecutionPolicy Bypass -File "${recordScript}" -Json`, { encoding: 'utf-8' });
    console.log(out.trim());
  } else {
    const cmd = `powershell -ExecutionPolicy Bypass -File "${psScript}" -Json ${isBase64 ? '-Base64' : ''}`;
    const out = execSync(cmd, { encoding: 'utf-8' });
    console.log(out.trim());
  }
} catch (err) {
  console.error(JSON.stringify({ success: false, error: err.message }));
  process.exit(1);
}
