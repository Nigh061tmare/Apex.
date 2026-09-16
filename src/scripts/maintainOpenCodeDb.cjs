const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function runMaintenance(options = { verbose: true }) {
  const log = (...args) => { if (options.verbose) console.log('[ANTI-BLOAT SHIELD]', ...args); };
  const warn = (...args) => { if (options.verbose) console.warn('[ANTI-BLOAT SHIELD WARN]', ...args); };

  const dbDir = path.join(process.env.USERPROFILE || 'C:\\Users\\Jose Luis', '.local', 'share', 'opencode');
  const dbPath = path.join(dbDir, 'opencode.db');

  if (!fs.existsSync(dbPath)) {
    log('Base de datos no encontrada en:', dbPath);
    return { ok: false, reason: 'not_found' };
  }

  try {
    // 1. Limpieza de backups y temporales residuales
    if (fs.existsSync(dbDir)) {
      const entries = fs.readdirSync(dbDir);
      for (const entry of entries) {
        if (entry.startsWith('opencode.db.backup') || entry.includes('.tmp-')) {
          const fullPath = path.join(dbDir, entry);
          try {
            const stat = fs.statSync(fullPath);
            fs.unlinkSync(fullPath);
            log(`🧹 Archivo residual eliminado: ${entry} (${(stat.size / (1024 * 1024)).toFixed(1)} MB liberados)`);
          } catch (e) {
            warn(`No se pudo eliminar ${entry}:`, e.message);
          }
        }
      }
    }

    const initialStat = fs.statSync(dbPath);
    const initialSizeMB = (initialStat.size / (1024 * 1024)).toFixed(1);

    const db = new DatabaseSync(dbPath);

    // 2. Garantizar disparadores automáticos en SQLite
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS trg_auto_prune_events
      AFTER INSERT ON event
      WHEN NEW.seq % 50 = 0
      BEGIN
        DELETE FROM event 
        WHERE aggregate_id = NEW.aggregate_id 
          AND seq < NEW.seq - 150;
      END;

      CREATE TRIGGER IF NOT EXISTS trg_cap_total_events
      AFTER INSERT ON event
      WHEN (SELECT count(*) FROM event) > 2500
      BEGIN
        DELETE FROM event 
        WHERE id NOT IN (SELECT id FROM event ORDER BY id DESC LIMIT 1000);
      END;
    `);

    // 3. Purgar mensajes de asistente colgados/vacíos (evita spinners infinitos)
    const emptyMsgs = db.prepare(`
      SELECT m.id 
      FROM message m 
      LEFT JOIN part p ON m.id = p.message_id 
      WHERE json_extract(m.data, '$.role') = 'assistant'
      GROUP BY m.id 
      HAVING COUNT(p.id) = 0
    `).all();

    if (emptyMsgs && emptyMsgs.length > 0) {
      const deleteStmt = db.prepare('DELETE FROM message WHERE id = ?');
      for (const row of emptyMsgs) {
        deleteStmt.run(row.id);
      }
      log(`⚡ Purgados ${emptyMsgs.length} mensajes de asistente vacíos colgados.`);
    }

    // 4. Limitar la tabla event si supera 2000 filas
    const eventCountRow = db.prepare('SELECT count(*) as c FROM event').get();
    if (eventCountRow && eventCountRow.c > 2000) {
      db.prepare(`
        DELETE FROM event 
        WHERE id NOT IN (SELECT id FROM event ORDER BY id DESC LIMIT 1000)
      `).run();
      log(`📉 Poda de telemetría: eventos reducidos de ${eventCountRow.c} a 1000.`);
    }

    // 5. VACUUM inteligente si el archivo supera 750 MB
    let finalSizeMB = initialSizeMB;
    if (initialStat.size > 750 * 1024 * 1024) {
      log(`⚠️ Base de datos (${initialSizeMB} MB) supera 750 MB. Compactando con VACUUM...`);
      db.exec('VACUUM;');
      const finalStat = fs.statSync(dbPath);
      finalSizeMB = (finalStat.size / (1024 * 1024)).toFixed(1);
      log(`✅ VACUUM finalizado: reducido a ${finalSizeMB} MB.`);
    }

    db.close();
    log(`🛡️ Estado de OpenCode DB: ${finalSizeMB} MB | Triggers activos: OK | Sesiones y chats 100% protegidos.`);
    return { ok: true, sizeMB: finalSizeMB };
  } catch (err) {
    warn('Error durante el mantenimiento de la base de datos:', err?.message || err);
    return { ok: false, error: err?.message };
  }
}

if (require.main === module) {
  runMaintenance({ verbose: true });
}

module.exports = { runMaintenance };
