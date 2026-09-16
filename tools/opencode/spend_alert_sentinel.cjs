/**
 * 🚨 APEX OPENCODE SPEND ALERT SENTINEL (VIGILANTE DE GASTO EN TIEMPO REAL)
 * 
 * Monitoriza en tiempo real cada mensaje procesado en OpenCode Web.
 * Si detecta que un solo mensaje supera el umbral normal de DeepSeek Flash (0.035 $),
 * o si el consumo en 1 hora supera 0.25 $, o el día supera 1.00 $:
 * 1. Emite una notificación emergente en Windows.
 * 2. Muestra un banner de advertencia visual en la consola.
 * 3. Activa el "Circuit Breaker": si detecta peligro, conmuta la sesión automáticamente
 *    a Google Gemini Flash (100% Gratis) para frenar en seco el gasto.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ── UMBRALES DE ALERTA DE GASTO (Configurables) ──────────────────────────────
const THRESHOLDS = {
  // Gasto máximo aceptable en una sola respuesta (normalmente DeepSeek Flash cuesta ~0.001$)
  MAX_SINGLE_MSG_USD: 0.035,   // ~3,2 céntimos de euro por mensaje
  // Gasto máximo en los últimos 60 minutos
  MAX_HOURLY_USD: 0.25,        // ~23 céntimos de euro en 1 hora
  // Gasto máximo en las últimas 24 horas
  MAX_DAILY_USD: 1.00,         // ~0,92 euros en 1 día
  // Umbral crítico para conmutación de emergencia (Circuit Breaker a Gemini Free)
  CIRCUIT_BREAKER_USD: 0.08    // Si un mensaje supera 8 céntimos -> Freno de emergencia
};

const GEMINI_SAFE_MODEL_JSON = '{"id":"gemini-flash-latest","providerID":"google","variant":"default"}';
const DB_PATH = path.join(process.env.USERPROFILE || 'C:\\Users\\Jose Luis', '.local', 'share', 'opencode', 'opencode.db');
const LOG_PATH = path.join(__dirname, 'spend_alerts.log');

let lastCheckedTime = Date.now() - (60 * 1000);
let notifiedAlerts = new Set();

function logAlert(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  console.warn('\n' + '='.repeat(70));
  console.warn('  🚨 ALERTA DE GASTO DE IA EN OPENCODE:');
  console.warn('  ' + message);
  console.warn('='.repeat(70) + '\n');
  try {
    fs.appendFileSync(LOG_PATH, line, 'utf8');
  } catch(e) {}
}

function notifyWindows(title, text) {
  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms
    $n = New-Object System.Windows.Forms.NotifyIcon
    $n.Icon = [System.Drawing.SystemIcons]::Warning
    $n.Visible = $true
    $n.ShowBalloonTip(5000, '${title.replace(/'/g, "''")}', '${text.replace(/'/g, "''")}', [System.Windows.Forms.ToolTipIcon]::Warning)
    Start-Sleep -Milliseconds 800
    $n.Dispose()
  `;

  try {
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    exec(`powershell -NoProfile -NonInteractive -EncodedCommand ${encoded}`, (err) => {
      if (err) {
        process.stdout.write('\x07');
      }
    });
  } catch (e) {
    process.stdout.write('\x07');
  }
}

function checkSpendThresholds() {
  if (!fs.existsSync(DB_PATH)) return;

  try {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(DB_PATH);

    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Revisar nuevos mensajes desde la última comprobación
    const newMsgs = db.prepare(`
      SELECT id, session_id, time_created, data 
      FROM message 
      WHERE time_created > ?
      ORDER BY time_created ASC
    `).all(lastCheckedTime);

    for (const m of newMsgs) {
      lastCheckedTime = Math.max(lastCheckedTime, m.time_created);
      let parsed = {};
      try { parsed = typeof m.data === 'string' ? JSON.parse(m.data) : m.data; } catch(e){}

      if (parsed.role === 'assistant') {
        const cost = parsed.cost || 0;
        const model = parsed.modelID || parsed.model || 'desconocido';

        // ⚠️ ALERTA: Mensaje individual sospechosamente caro
        if (cost >= THRESHOLDS.MAX_SINGLE_MSG_USD) {
          const alertId = `msg_${m.id}`;
          if (!notifiedAlerts.has(alertId)) {
            notifiedAlerts.add(alertId);
            const msgText = `¡Gasto anómalo en 1 mensaje! Coste: $${cost.toFixed(4)} USD (${(cost * 0.92 * 100).toFixed(1)}¢) con modelo: ${model}`;
            logAlert(msgText);
            notifyWindows('🚨 Alerta Gasto OpenCode', msgText);

            // 🛑 CIRCUIT BREAKER DE EMERGENCIA: Frenar sesión si supera umbral crítico
            if (cost >= THRESHOLDS.CIRCUIT_BREAKER_USD) {
              try {
                db.prepare("UPDATE session SET model = ? WHERE id = ?").run(GEMINI_SAFE_MODEL_JSON, m.session_id);
                const breakerMsg = `🛑 CIRCUIT BREAKER ACTIVADO: Sesión ${m.session_id} conmutada a Google Gemini Flash (100% Gratis) para evitar fugas de saldo.`;
                logAlert(breakerMsg);
                notifyWindows('🛑 Freno de Emergencia', 'Sesión cambiada a Gemini Flash 1M Free.');
              } catch (bErr) {
                console.warn('[SENTINEL BREAKER ERROR]', bErr.message);
              }
            }
          }
        }
      }
    }

    // 2. Revisar gasto acumulado en la última hora
    const hourlyRows = db.prepare(`
      SELECT data FROM message WHERE time_created >= ?
    `).all(oneHourAgo);

    let hourlyCost = 0;
    for (const r of hourlyRows) {
      let p = {};
      try { p = typeof r.data === 'string' ? JSON.parse(r.data) : r.data; } catch(e){}
      if (p.role === 'assistant') hourlyCost += (p.cost || 0);
    }

    if (hourlyCost >= THRESHOLDS.MAX_HOURLY_USD) {
      const hourKey = `hour_${Math.floor(now / (60 * 60 * 1000))}`;
      if (!notifiedAlerts.has(hourKey)) {
        notifiedAlerts.add(hourKey);
        const hourAlert = `Ritmo elevado: $${hourlyCost.toFixed(3)} USD en la última hora (Límite: $${THRESHOLDS.MAX_HOURLY_USD})`;
        logAlert(hourAlert);
        notifyWindows('⚠️ Consumo Elevado en 1 Hora', hourAlert);
      }
    }

    // 3. Revisar gasto acumulado del día
    const dailyRows = db.prepare(`
      SELECT data FROM message WHERE time_created >= ?
    `).all(startOfDay.getTime());

    let dailyCost = 0;
    for (const r of dailyRows) {
      let p = {};
      try { p = typeof r.data === 'string' ? JSON.parse(r.data) : r.data; } catch(e){}
      if (p.role === 'assistant') dailyCost += (p.cost || 0);
    }

    if (dailyCost >= THRESHOLDS.MAX_DAILY_USD) {
      const dayKey = `day_${startOfDay.toISOString().slice(0, 10)}`;
      if (!notifiedAlerts.has(dayKey)) {
        notifiedAlerts.add(dayKey);
        const dayAlert = `Aviso diario: El gasto de hoy ha alcanzado $${dailyCost.toFixed(2)} USD (~${(dailyCost * 0.92).toFixed(2)}€).`;
        logAlert(dayAlert);
        notifyWindows('📊 Aviso de Gasto Diario', dayAlert);
      }
    }

  } catch (err) {
    // Proceso protegido ante bloqueos de base de datos
  }
}

function startSpendMonitor(intervalSeconds = 30) {
  console.log(`[SPEND SENTINEL] 🛡️ Vigilante de gasto en tiempo real iniciado (Umbrales: >$0.035/msg, >$0.25/hora, >$1.00/día).`);
  checkSpendThresholds();
  setInterval(checkSpendThresholds, intervalSeconds * 1000);
}

if (require.main === module) {
  startSpendMonitor(10);
}

module.exports = { startSpendMonitor, checkSpendThresholds, THRESHOLDS };
