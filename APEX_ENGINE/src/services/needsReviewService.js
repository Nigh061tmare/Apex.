/**
 * APEX POWER SCALING — NEEDS_REVIEW & GOVERNANCE GATE SERVICE (V25 BASELINE)
 * 
 * Regla Constitucional de Operación:
 * - NO aplica cambios automáticos a tiers, Ki, multiplicadores, forms, universo ni IDs.
 * - Muestra los Pending Gates de V25 y las incidencias del backlog como avisos NO MUTABLES.
 * - Ningún gate se resuelve automáticamente; requiere decisión editorial explícita.
 * - No modifica V25 ni characters.js.
 */

import { APEX_NEEDS_REVIEW_BACKLOG } from '../data/apexNeedsReviewBacklog.js';

const issuesMap = new Map();

// Cargar incidencias editoriales
if (APEX_NEEDS_REVIEW_BACKLOG && APEX_NEEDS_REVIEW_BACKLOG.franchises) {
  APEX_NEEDS_REVIEW_BACKLOG.franchises.forEach(f => {
    f.issues.forEach(issue => {
      const rawIds = issue.recordId ? issue.recordId.split(/[,/]/).map(s => s.trim()) : [];
      rawIds.forEach(id => {
        if (id) {
          if (!issuesMap.has(id)) {
            issuesMap.set(id, []);
          }
          issuesMap.get(id).push({
            franchise: f.franchise,
            severity: issue.severity,
            issueType: issue.issueType,
            affectedFields: issue.affectedFields,
            reason: issue.reason,
            recommendedAction: issue.recommendedAction
          });
        }
      });
    });
  });
}

// Gates obligatorios V25 inmutables
export const V25_PENDING_GATES = {
  'tamagami-1-espada-daima': {
    gateId: 'GATE-001-TAMAGAMI-SOURCE',
    notice: 'GATE-001: Evidencia de fuente insuficiente para arbitrar escala entre registros de Tamagami. Auto-mutación bloqueada.'
  },
  'tamagami-n-mero-1-dragon-ball-daima-763': {
    gateId: 'GATE-001-TAMAGAMI-SOURCE',
    notice: 'GATE-001: Evidencia de fuente insuficiente para arbitrar escala entre registros de Tamagami. Auto-mutación bloqueada.'
  },
  'giorno-giovanna-jojo-va': {
    gateId: 'GER_MODEL_PENDING_CONSOLIDATION',
    notice: 'GER Gate: Ficha base de Giorno separada de GER. Modelo causal pendiente de consolidación unificada.'
  },
  'giorno-giovanna-ger-jojo-gg001': {
    gateId: 'GER_MODEL_PENDING_CONSOLIDATION',
    notice: 'GER Gate: Stand autónomo de reversión causal. Regla reactiva condicional sin multiplicación de Ki.'
  },
  'funny-valentine-jojo-sbr': {
    gateId: 'VALENTINE_HAX_MODEL_PENDING_SIMULATION_RULES',
    notice: 'Valentine Gate: Hax de Love Train y D4C pendiente de reglas avanzadas de escenario en simulación.'
  },
  'dr-raichi-dbm-u3': {
    gateId: 'Hatchiyack PROPOSAL_ONLY_NOT_ACTIVE',
    notice: 'Hatchiyack Gate: Manifestación en contingencia mantenida exclusivamente como propuesta inactiva.'
  },
  'son-goku-mini-daima-full': {
    gateId: 'daima_ssj4_representation_review_pending',
    notice: 'Daima Gate: SSJ4 canónico en Daima; pendiente revisión editorial de representación armónica.'
  },
  'son-goku-adulto-daima': {
    gateId: 'daima_ssj4_representation_review_pending',
    notice: 'Daima Gate: SSJ4 canónico en Daima; pendiente revisión editorial de representación armónica.'
  }
};

/**
 * Obtiene las incidencias registradas y gates para un personaje.
 */
export function getCharacterNeedsReviewNotice(characterId) {
  if (!characterId) return null;
  const issues = issuesMap.get(characterId) || [];
  const gate = V25_PENDING_GATES[characterId];
  if (gate) {
    return [
      ...issues,
      {
        franchise: 'APEX Governance',
        severity: 'INFO',
        issueType: 'PENDING_GATE',
        affectedFields: ['governance'],
        reason: gate.notice,
        recommendedAction: 'Conservar inmutable sin auto-resolución.'
      }
    ];
  }
  return issues.length > 0 ? issues : null;
}

/**
 * Verifica si un personaje tiene incidencias o gates pendientes.
 */
export function isCharacterInNeedsReview(characterId) {
  if (!characterId) return false;
  return issuesMap.has(characterId) || !!V25_PENDING_GATES[characterId];
}

/**
 * Genera el texto de advertencia para la interfaz de usuario (Modal / Ficha).
 */
export function getNeedsReviewWarningText(characterId) {
  const issues = getCharacterNeedsReviewNotice(characterId);
  if (!issues || issues.length === 0) return null;

  return issues.map(iss => {
    return `[${iss.severity}] ${iss.reason}`;
  }).join(' | ');
}

/**
 * Genera notas de advertencia para la simulación de combate sin alterar el estado persistente.
 */
export function formatNeedsReviewSimulationNotice(characters = []) {
  const notices = [];
  const seen = new Set();

  characters.forEach(c => {
    if (c && c.id && !seen.has(c.id)) {
      seen.add(c.id);
      const gate = V25_PENDING_GATES[c.id];
      if (gate) {
        notices.push(`🛡️ AVISO DE GOBERNANZA V25 (${c.name}): ${gate.notice}`);
      }
      const issues = issuesMap.get(c.id);
      if (issues) {
        issues.forEach(iss => {
          notices.push(`⚠️ AVISO DE CALIBRACIÓN (${c.name}): Ficha con revisión pendiente en APEX Backlog (${iss.issueType} [${iss.severity}]). Motivo: ${iss.reason}. REGLA V25: Se emplean estrictamente sus valores persistentes oficiales sin alteraciones especulativas.`);
        });
      }
    }
  });

  return notices;
}

export default {
  getCharacterNeedsReviewNotice,
  isCharacterInNeedsReview,
  getNeedsReviewWarningText,
  formatNeedsReviewSimulationNotice,
  V25_PENDING_GATES
};
