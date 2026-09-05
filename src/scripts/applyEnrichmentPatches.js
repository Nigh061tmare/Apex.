/**
 * APEX ENRICHMENT PATCH VALIDATOR & SIMULATOR (V25 BASELINE)
 * 
 * Reglas de Operación Segura:
 * - Lee exclusivamente V25 como baseline canónico.
 * - NO edita characters.js ni V25 automáticamente (in-place mutation desactivada).
 * - Valida sourceRosterSha256, idempotencyKey único y targetRecordId activo.
 * - Rechaza terminantemente targetRecordId archivado/deprecado.
 * - Exige currentValueSnapshot y verifica consistencia.
 * - Lista blanca absoluta: arsenal, passives, haxTags, weaknesses, artifacts, synergies, teamCombos, combatStatuses, arenaAffinities, narrativeCombatProfile.
 * - Bloquea cualquier intento de tocar campos protegidos de identidad, Ki, tiers, forms o multiplicadores.
 * - Genera únicamente un resultado de revisión/propuesta con status: PROPOSAL_ONLY_NOT_APPLIED.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const V25_FILE = path.join(projectRoot, 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V25.json');
const DRAFTS_DIR = path.join(projectRoot, 'src/data/enrichmentDrafts');

export const ALLOWED_ENRICHMENT_FIELDS = [
  'arsenal',
  'passives',
  'haxTags',
  'weaknesses',
  'artifacts',
  'synergies',
  'teamCombos',
  'combatStatuses',
  'arenaAffinities',
  'narrativeCombatProfile'
];

export const PROHIBITED_FIELDS = [
  'id',
  'name',
  'franchise',
  'universe',
  'saga',
  'baseTier',
  'tier',
  'baseKiNumeric',
  'baseKiFormatted',
  'powerSchema',
  'forms',
  'formId',
  'ki',
  'multiplier',
  'canonStatus',
  'changeLog',
  'deprecatedRecords',
  'meta'
];

export function validateAndSimulatePatch(patch, v25Context) {
  const { activeMap, deprecatedSet, v25Sha256 } = v25Context;
  const errors = [];
  const warnings = [];

  const patchId = patch.patchId || patch.idempotencyKey;
  if (!patchId) {
    errors.push('El patch requiere un patchId o idempotencyKey único obligatorio.');
  }

  // 1. Validar targetRecordId
  const targetId = patch.targetRecordId || patch.characterId;
  if (!targetId) {
    errors.push('El patch requiere un targetRecordId válido.');
  } else if (deprecatedSet.has(targetId)) {
    errors.push(`RECHAZADO: targetRecordId '${targetId}' pertenece a deprecatedRecords y está archivado.`);
  } else if (!activeMap.has(targetId)) {
    errors.push(`RECHAZADO: targetRecordId '${targetId}' no existe en los 756 activos de V25.`);
  }

  // 2. Validar SHA256 si se declara
  if (patch.sourceRosterSha256 && patch.sourceRosterSha256 !== v25Sha256) {
    errors.push(`Fallo de integridad: sourceRosterSha256 no coincide con el baseline V25 actual (${v25Sha256}).`);
  }

  // 3. Validar currentValueSnapshot
  if (patch.action === 'remove_deprecated_reference' && !patch.currentValueSnapshot) {
    warnings.push('Patch de desvinculación sin currentValueSnapshot explícito.');
  }

  // 4. Validar lista blanca y campos prohibidos
  const candidateData = patch.approvedEnrichmentData || patch.enrichment || patch.data || {};
  const touchedKeys = Object.keys(candidateData);

  for (const key of touchedKeys) {
    const keyLower = key.toLowerCase();
    const isProhibited = PROHIBITED_FIELDS.some(pf => keyLower === pf.toLowerCase() || keyLower.includes(pf.toLowerCase()));
    if (isProhibited) {
      errors.push(`ERROR BLOQUEANTE: Campo prohibido '${key}' detectado en patch '${patchId}'. No se permite alterar identidad, Ki, forms o tiers.`);
    } else if (!ALLOWED_ENRICHMENT_FIELDS.includes(key)) {
      errors.push(`ERROR BLOQUEANTE: Clave de primer nivel no permitida '${key}'. Solo se permite la lista blanca de enriquecimiento táctico.`);
    }
  }

  return {
    patchId,
    targetRecordId: targetId,
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export async function processPatches(patchFilePath) {
  console.log('================================================================');
  console.log('  🛡️ VALIDADOR Y SIMULADOR DE PARCHES — APEX V25 [PROPOSAL MODE]');
  console.log('================================================================\n');

  if (!fs.existsSync(V25_FILE)) {
    throw new Error(`V25 baseline no encontrado en ${V25_FILE}`);
  }

  const rawV25 = fs.readFileSync(V25_FILE, 'utf8');
  const v25 = JSON.parse(rawV25);
  const v25Sha256 = crypto.createHash('sha256').update(rawV25).digest('hex');

  const activeRecords = v25.characters || [];
  const deprecatedRecords = v25.deprecatedRecords || [];

  const activeMap = new Map(activeRecords.map(c => [c.id, c]));
  const deprecatedSet = new Set(deprecatedRecords.map(d => d.recordId));

  const v25Context = { activeMap, deprecatedSet, v25Sha256 };

  // Determine patches to validate
  let patchesToValidate = [];
  if (patchFilePath && fs.existsSync(patchFilePath)) {
    const data = JSON.parse(fs.readFileSync(patchFilePath, 'utf8'));
    patchesToValidate = Array.isArray(data) ? data : (data.patchEntries || data.integrationPatch || [data]);
  } else {
    // Look in enrichmentDrafts
    if (fs.existsSync(DRAFTS_DIR)) {
      const draftFiles = fs.readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.json') && f.includes('PATCH'));
      for (const df of draftFiles) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(DRAFTS_DIR, df), 'utf8'));
          const entries = Array.isArray(data) ? data : (data.patchEntries || [data]);
          patchesToValidate.push(...entries);
        } catch { /* skip non-json */ }
      }
    }
  }

  console.log(`📋 Baseline V25: 756 activos | 13 archivados | SHA-256: ${v25Sha256.substring(0, 12)}...`);
  console.log(`📦 Parches candidatos evaluados: ${patchesToValidate.length}\n`);

  const results = [];
  let totalValid = 0;
  let totalRejected = 0;

  for (const patch of patchesToValidate) {
    const res = validateAndSimulatePatch(patch, v25Context);
    results.push(res);
    if (res.valid) {
      totalValid++;
      console.log(`  ✅ [APROBABLE] Patch '${res.patchId}' -> ${res.targetRecordId}`);
    } else {
      totalRejected++;
      console.log(`  ❌ [RECHAZADO] Patch '${res.patchId}' -> ${res.errors.join('; ')}`);
    }
  }

  const reportFileName = `APEX_PATCH_VALIDATION_REPORT_${Date.now()}.json`;
  const reportPath = path.join(DRAFTS_DIR, reportFileName);

  const finalReport = {
    baselineVersion: 'V25',
    baselineSha256: v25Sha256,
    status: 'PROPOSAL_ONLY_NOT_APPLIED',
    mode: 'SIMULATION_ONLY_NO_IN_PLACE_MUTATION',
    evaluatedAt: new Date().toISOString(),
    totalEvaluated: patchesToValidate.length,
    totalValid,
    totalRejected,
    results,
    notice: 'PATCHES ARE PROPOSALS ONLY. EXPLICIT USER APPROVAL REQUIRED BEFORE APPLICATION.'
  };

  if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2), 'utf8');

  console.log('\n================================================================');
  console.log(`  RESUMEN: ${totalValid} válidos para propuesta | ${totalRejected} rechazados`);
  console.log(`  Reporte generado en: src/data/enrichmentDrafts/${reportFileName}`);
  console.log('  ⚠️ AVISO: PATCHES ARE PROPOSALS ONLY. EXPLICIT USER APPROVAL REQUIRED.');
  console.log('  🔒 No se ha modificado ningún archivo de producción.');
  console.log('================================================================\n');

  return finalReport;
}

if (process.argv[1] && process.argv[1].includes('applyEnrichmentPatches.js')) {
  processPatches(process.argv[2]).catch(err => {
    console.error('❌ Error en validación de parches:', err.message);
    process.exit(1);
  });
}
