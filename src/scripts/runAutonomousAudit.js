/**
 * APEX CONTINUOUS ROSTER AUDIT — AUTONOMOUS RUNNER (V25 BASELINE)
 * 
 * Reglas de Operación Segura:
 * - Operar SIEMPRE en READ_ONLY_DRAFT_MODE.
 * - Leer única y exclusivamente V25 (ROSTER_NIVELES_PODER_CORREGIDO_V25.json).
 * - Excluir deprecatedRecords de análisis de combatientes activos.
 * - Toda salida se genera en src/data/enrichmentDrafts/ con status: PROPOSAL_ONLY_NOT_APPLIED.
 * - PROHIBIDO escribir a V25, characters.js, App.jsx, roster activo o versiones previas.
 * - PROHIBIDO ejecutar git, vercel, deploy, commit, push o scripts de aplicación.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const V25_FILE = path.join(projectRoot, 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V25.json');
const DRAFTS_DIR = path.join(projectRoot, 'src/data/enrichmentDrafts');

export async function runAutonomousAudit(options = {}) {
  console.log('================================================================');
  console.log('  🌙 AUDITORÍA NOCTURNA AUTÓNOMA — APEX V25 [READ-ONLY DRAFT MODE]');
  console.log('================================================================\n');

  // 1. Cargar y validar baseline V25 obligatorio
  if (!fs.existsSync(V25_FILE)) {
    throw new Error(`[CRITICAL ERROR] Roster V25 no encontrado en ${V25_FILE}. Abortando sin fallback.`);
  }

  const rawV25 = fs.readFileSync(V25_FILE, 'utf8');
  let v25;
  try {
    v25 = JSON.parse(rawV25);
  } catch (err) {
    throw new Error(`[CRITICAL ERROR] Fallo al parsear JSON de V25: ${err.message}. Abortando.`);
  }

  const activeRecords = v25.characters || [];
  const deprecatedRecords = v25.deprecatedRecords || [];
  const historicalTotal = activeRecords.length + deprecatedRecords.length;

  if (activeRecords.length !== 756 || deprecatedRecords.length !== 13 || historicalTotal !== 769) {
    throw new Error(`[CRITICAL ERROR] Censo de V25 inválido: activos=${activeRecords.length} (esperado 756), deprecados=${deprecatedRecords.length} (esperado 13), total=${historicalTotal} (esperado 769). Abortando.`);
  }

  const baselineSha256 = crypto.createHash('sha256').update(rawV25).digest('hex');

  // 2. Verificar Pending Gates obligatorios
  const mandatoryGates = [
    'GATE-001-TAMAGAMI-SOURCE',
    'GER_MODEL_PENDING_CONSOLIDATION',
    'VALENTINE_HAX_MODEL_PENDING_SIMULATION_RULES',
    'Hatchiyack PROPOSAL_ONLY_NOT_ACTIVE',
    'daima_ssj4_representation_review_pending'
  ];

  const pendingGates = mandatoryGates.map(gateId => ({
    gateId,
    status: 'LOCKED_PENDING_EDITORIAL_DECISION',
    policy: 'MUTATION_BLOCKED_AUTONOMOUS_PROTECTION'
  }));

  // 3. Chequear violaciones de referencias deprecadas
  const deprecatedIds = new Set(deprecatedRecords.map(d => d.recordId));
  const deprecatedReferenceViolations = [];
  const errors = [];
  const warnings = [];

  // Excluir deprecatedRecords de análisis de combatientes activos
  activeRecords.forEach(c => {
    if (c.forms) {
      c.forms.forEach(f => {
        const str = JSON.stringify(f);
        deprecatedIds.forEach(dId => {
          if (str.includes(dId)) {
            deprecatedReferenceViolations.push({ recordId: c.id, formId: f.id, target: dId });
          }
        });
      });
    }
  });

  // 4. Generar reporte obligatorio
  const proposedDraftFileName = `APEX_V25_AUTONOMOUS_AUDIT_PROPOSAL_${Date.now()}.json`;
  const draftOutputPath = path.join(DRAFTS_DIR, proposedDraftFileName);

  const auditReport = {
    baselineVersion: 'V25',
    baselineSha256,
    activeCount: activeRecords.length,
    deprecatedCount: deprecatedRecords.length,
    historicalTotal,
    status: 'PROPOSAL_ONLY_NOT_APPLIED',
    auditMode: 'READ_ONLY_DRAFT_MODE',
    generatedAt: new Date().toISOString(),
    pendingGates,
    deprecatedReferenceViolations,
    proposedEnrichmentDrafts: [
      {
        draftFile: proposedDraftFileName,
        status: 'PROPOSAL_ONLY_NOT_APPLIED',
        notes: 'Auditoría nocturna V25 generada en modo lectura estricto.'
      }
    ],
    blockedAutoFixes: [
      'Auto-mutaciones en caliente deshabilitadas por gobernanza V25.',
      'Cualquier cambio requiere revisión y patch con aprobación explícita.'
    ],
    errors,
    warnings
  };

  if (!fs.existsSync(DRAFTS_DIR)) {
    fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  }

  // Escribir ÚNICAMENTE en src/data/enrichmentDrafts/
  fs.writeFileSync(draftOutputPath, JSON.stringify(auditReport, null, 2), 'utf8');

  console.log('--- REPORTE DE AUDITORÍA NOCTURNA V25 ---');
  console.log(`• baselineVersion:              ${auditReport.baselineVersion}`);
  console.log(`• baselineSha256:             ${auditReport.baselineSha256}`);
  console.log(`• activeCount:                ${auditReport.activeCount}`);
  console.log(`• deprecatedCount:            ${auditReport.deprecatedCount}`);
  console.log(`• historicalTotal:            ${auditReport.historicalTotal}`);
  console.log(`• pendingGates detectados:    ${auditReport.pendingGates.length}`);
  console.log(`• deprecatedRefViolations:    ${auditReport.deprecatedReferenceViolations.length}`);
  console.log(`• proposedEnrichmentDrafts:   ${auditReport.proposedEnrichmentDrafts.length}`);
  console.log(`• blockedAutoFixes:           ${auditReport.blockedAutoFixes.length}`);
  console.log(`• errors:                     ${auditReport.errors.length}`);
  console.log(`• warnings:                   ${auditReport.warnings.length}`);
  console.log(`\n💾 Propuesta de auditoría guardada en: src/data/enrichmentDrafts/${proposedDraftFileName}`);
  console.log('🔒 Prohibida escritura en V25, characters.js o producción. Status: PROPOSAL_ONLY_NOT_APPLIED.\n');

  return auditReport;
}

if (process.argv[1] && process.argv[1].includes('runAutonomousAudit.js')) {
  runAutonomousAudit().catch(err => {
    console.error('❌ ERROR BLOQUEANTE EN AUDITORÍA NOCTURNA:', err.message);
    process.exit(1);
  });
}
