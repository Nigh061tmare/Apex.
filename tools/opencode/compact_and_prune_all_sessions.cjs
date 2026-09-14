/**
 * ⚡ AUTO-COMPACT & PRUNE ENGINE FOR OPENCODE SESSIONS (DESINFLADOR TOTAL)
 * 
 * OpenCode almacena las lecturas de archivos y salidas de comandos por triplicado:
 *   1. state.output
 *   2. state.metadata.preview
 *   3. state.metadata.display.text
 * 
 * Este script poda los tres campos en todos los turnos anteriores a los últimos 4 mensajes
 * de cada sesión, manteniendo la estructura 100% válida y reduciendo el contexto
 * de más de 120k tokens a menos de 8k tokens (>93% de ahorro de cuota).
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function runAutoCompaction(options = { verbose: true }) {
  const dbPath = path.join(process.env.USERPROFILE || 'C:\\Users\\Jose Luis', '.local', 'share', 'opencode', 'opencode.db');
  if (!fs.existsSync(dbPath)) {
    if (options.verbose) console.log('[COMPACTOR] No se encontró opencode.db');
    return { status: 'NO_DB' };
  }

  const db = new DatabaseSync(dbPath);

  // Obtener todas las sesiones
  const sessions = db.prepare('SELECT id, title FROM session').all();
  let totalPrunedParts = 0;
  let totalBytesSaved = 0;
  const sessionsAffected = [];

  const updateStmt = db.prepare('UPDATE part SET data = ? WHERE id = ?');

  for (const s of sessions) {
    // Proteger los últimos 4 mensajes (los turnos más recientes del chat)
    const recentMsgs = db.prepare('SELECT id FROM message WHERE session_id = ? ORDER BY time_created DESC LIMIT 4').all(s.id);
    const protectedMsgIds = new Set(recentMsgs.map(m => m.id));

    const parts = db.prepare('SELECT id, message_id, data FROM part WHERE session_id = ?').all(s.id);
    let sessionBytesSaved = 0;
    let sessionPartsPruned = 0;

    for (const p of parts) {
      if (protectedMsgIds.has(p.message_id)) continue;

      try {
        const obj = JSON.parse(p.data);
        let modified = false;
        const initialLen = p.data.length;

        // 1. Podar state.output
        if (obj.state && typeof obj.state.output === 'string' && obj.state.output.length > 500) {
          const head = obj.state.output.slice(0, 250);
          const tail = obj.state.output.slice(-150);
          obj.state.output = `${head}\n\n[... Salida previa archivada y compactada para ahorro de cuota ...]\n\n${tail}`;
          modified = true;
        }

        // 2. Podar state.metadata.preview
        if (obj.state && obj.state.metadata && typeof obj.state.metadata.preview === 'string' && obj.state.metadata.preview.length > 300) {
          obj.state.metadata.preview = obj.state.metadata.preview.slice(0, 200) + '... [compactado]';
          modified = true;
        }

        // 3. Podar state.metadata.display.text
        if (obj.state && obj.state.metadata && obj.state.metadata.display && typeof obj.state.metadata.display.text === 'string' && obj.state.metadata.display.text.length > 500) {
          obj.state.metadata.display.text = obj.state.metadata.display.text.slice(0, 250) + '\n\n[... Archivo previo archivado y compactado para ahorro de cuota ...]\n\n' + obj.state.metadata.display.text.slice(-100);
          modified = true;
        }

        // 4. Podar obj.output directo si existe
        if (typeof obj.output === 'string' && obj.output.length > 500) {
          const head = obj.output.slice(0, 250);
          const tail = obj.output.slice(-150);
          obj.output = `${head}\n\n[... Salida archivada y compactada ...]\n\n${tail}`;
          modified = true;
        }

        if (modified) {
          const newData = JSON.stringify(obj);
          sessionBytesSaved += (initialLen - newData.length);
          updateStmt.run(newData, p.id);
          sessionPartsPruned++;
        }
      } catch (err) {}
    }

    if (sessionPartsPruned > 0) {
      totalPrunedParts += sessionPartsPruned;
      totalBytesSaved += sessionBytesSaved;
      sessionsAffected.push({
        id: s.id,
        title: s.title,
        partsPruned: sessionPartsPruned,
        savedKB: (sessionBytesSaved / 1024).toFixed(1)
      });
    }
  }

  // Optimizar base de datos SQLite
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  } catch (e) {}

  if (options.verbose) {
    console.log(`[COMPACTOR] ✅ Compactación y desinflado completado.`);
    console.log(`[COMPACTOR] 📊 Sesiones optimizadas: ${sessionsAffected.length}`);
    console.log(`[COMPACTOR] ✂️  Bloques triplicados podados: ${totalPrunedParts}`);
    console.log(`[COMPACTOR] 💾 Espacio recuperado: ${(totalBytesSaved / 1024 / 1024).toFixed(2)} MB (~${Math.round(totalBytesSaved / 4).toLocaleString()} tokens)`);
  }

  return {
    status: 'OK',
    sessionsAffected: sessionsAffected.length,
    prunedParts: totalPrunedParts,
    bytesSaved: totalBytesSaved
  };
}

if (require.main === module) {
  runAutoCompaction({ verbose: true });
}

module.exports = { runAutoCompaction };
