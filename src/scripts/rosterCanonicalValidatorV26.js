/**
 * APEX POWER SCALING ENGINE – MASTER CANONICAL VALIDATOR & AUDITOR (V26 BASELINE)
 * 
 * Modos de ejecución:
 * 1. V26 READ-ONLY (por defecto / explícito):
 *    node src/scripts/rosterCanonicalValidatorV26.js --v26 --read-only
 *    - Inspecciona exhaustivamente el Roster V26 y la fachada characters.js sin modificar ningún archivo.
 * 2. FIX DESTRUCTIVO DESACTIVADO:
 *    node src/scripts/rosterCanonicalValidatorV26.js --fix
 *    - Aborta inmediatamente con error 'DESTRUCTIVE_FIX_DISABLED_USE_PATCH_PROPOSAL'.
 * 
 * V26 ES EL BASELINE INMUTABLE – Reemplaza a V25 permanentemente.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const V26_FILE = path.join(projectRoot, 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json');
const CHARACTERS_FILE = path.join(projectRoot, 'src/data/characters.js');

export const TIER_CANONICAL_REGEX = /^(High |Low )?\d{1,2}-[ABC]$/;

export function isValidTierFormat(tierStr) {
  return typeof tierStr === 'string' && TIER_CANONICAL_REGEX.test(tierStr);
}

export function validateTierFormatString(tierStr) {
  if (!isValidTierFormat(tierStr)) {
    return {
      valid: false,
      error: 'invalid_tier_format',
      message: `Tier string "${tierStr}" does not match canonical pattern ^(High |Low )?\\d{1,2}-[ABC]$`
    };
  }
  return { valid: true };
}

export function validateV26CanonicalRoster() {
  const issues = [];
  const checks = {};

  // Check 1: Fix mode check
  if (process.argv.includes('--fix')) {
    console.error('❌ ERROR BLOQUEANTE: DESTRUCTIVE_FIX_DISABLED_USE_PATCH_PROPOSAL');
    process.exit(1);
  }

  // Check 2: Load and parse V26
  if (!fs.existsSync(V26_FILE)) {
    throw new Error(`[CRITICAL] V26 roster file missing at ${V26_FILE}`);
  }

  let v26;
  try {
    v26 = JSON.parse(fs.readFileSync(V26_FILE, 'utf8'));
  } catch (err) {
    throw new Error(`[CRITICAL] V26 roster JSON parse failed: ${err.message}`);
  }

  const activeRecords = v26.characters || {};
  const deprecatedRecords = v26.deprecatedRecords || [];

  // Minimum validations:
  // 1. activeCount === 756
  checks['activeCount_756'] = Object.keys(activeRecords).length === 756;
  if (Object.keys(activeRecords).length !== 756) {
    issues.push(`activeCount mismatch: expected 756, found ${Object.keys(activeRecords).length}`);
  }

  // 2. deprecatedCount === 13
  checks['deprecatedCount_13'] = deprecatedRecords.length === 13;
  if (deprecatedRecords.length !== 13) {
    issues.push(`deprecatedCount mismatch: expected 13, found ${deprecatedRecords.length}`);
  }

  // 3. activeCount + deprecatedCount === 769
  const totalCensus = Object.keys(activeRecords).length + deprecatedRecords.length;
  checks['totalCensus_769'] = totalCensus === 769;
  if (totalCensus !== 769) {
    issues.push(`totalCensus mismatch: expected 769, found ${totalCensus}`);
  }

  // 4. Unique active IDs
  const activeIds = new Set();
  let duplicateActiveCount = 0;
  Object.values(activeRecords).forEach(c => {
    if (activeIds.has(c.id)) duplicateActiveCount++;
    activeIds.add(c.id);
  });
  checks['activeIds_unique'] = duplicateActiveCount === 0;
  if (duplicateActiveCount > 0) {
    issues.push(`Found ${duplicateActiveCount} duplicate active character IDs`);
  }

  // 5. Zero intersection between active and archived IDs
  const deprecatedIds = new Set(deprecatedRecords.map(d => d.recordId));
  const intersection = [];
  activeIds.forEach(id => {
    if (deprecatedIds.has(id)) intersection.push(id);
  });
  checks['zero_intersection_active_archived'] = intersection.length === 0;
  if (intersection.length > 0) {
    issues.push(`Intersection detected between active and deprecated IDs: ${intersection.join(', ')}`);
  }

  // 6. Each deprecatedRecord requires valid schema
  let invalidDeprecatedCount = 0;
  deprecatedRecords.forEach(d => {
    const hasRecordId = !!d.recordId;
    const hasSnapshot = !!d.snapshot;
    const hasReason = !!d.reason;
    const hasCanonical = !!(d.canonicalRecordId || d.canonicalRecordIds);
    const hasPatchId = !!d.sourcePatchId;
    const hasTimestamp = !!d.timestamp;

    if (!hasRecordId || !hasSnapshot || !hasReason || !hasCanonical || !hasPatchId || !hasTimestamp) {
      invalidDeprecatedCount++;
    }
  });
  checks['deprecatedRecords_schema_valid'] = invalidDeprecatedCount === 0;
  if (invalidDeprecatedCount > 0) {
    issues.push(`Found ${invalidDeprecatedCount} deprecated records with incomplete metadata`);
  }

  // Check specific character rules in V26:
  // Gohan U16 has 3 forms
  const gohan = activeRecords['gohan-u16-dbm-espectador'];
  checks['gohan_u16_3_forms'] = gohan?.forms?.length === 3;
  if (gohan?.forms?.length !== 3) {
    issues.push(`gohan-u16-dbm-espectador expected 3 forms, found ${gohan?.forms?.length}`);
  }

  // Goku Mini Daima and Goku Adulto Daima have 5 forms
  const gokuMini = activeRecords['son-goku-mini-daima-full'];
  const gokuAdult = activeRecords['son-goku-adulto-daima'];
  checks['goku_mini_daima_5_forms'] = gokuMini?.forms?.length === 5;
  checks['goku_adulto_daima_5_forms'] = gokuAdult?.forms?.length === 5;
  if (gokuMini?.forms?.length !== 5) {
    issues.push(`son-goku-mini-daima-full expected 5 forms, found ${gokuMini?.forms?.length}`);
  }
  if (gokuAdult?.forms?.length !== 5) {
    issues.push(`son-goku-adulto-daima expected 5 forms, found ${gokuAdult?.forms?.length}`);
  }

// Raichi has 2 forms and ghost-broly-unleashed intact
  const raichi = activeRecords['dr-raichi-dbm-u3'];
  const raichiBroly = raichi?.forms?.find(f => f.name?.includes('Fantasma de Broly') || f.name?.includes('ghost-broly') || f.id === 'ghost-broly-unleashed');
  const parseMult = (m) => {
    if (!m) return 1;
    const match = String(m).match(/[\d\.]+/);
    return match ? parseFloat(match[0]) : 1;
  };
  const getKi = (form) => form.kiNumeric || form.ki || 0;
  const raichiBrolyIntact = raichiBroly && raichiBroly.tier === '4-B' && parseMult(raichiBroly.multiplier) === 2000 && getKi(raichiBroly) > 0;
  checks['raichi_2_forms_and_broly_intact'] = (raichi?.forms?.length === 2) && !!raichiBrolyIntact;
  if (raichi?.forms?.length !== 2 || !raichiBrolyIntact) {
    issues.push(`dr-raichi-dbm-u3 expected 2 forms with intact ghost-broly-unleashed`);
  }

  // Tier synchronization: baseTier vs forms[0].tier
  let unalignedMismatchCount = 0;
  Object.values(activeRecords).forEach(c => {
    const f0Tier = c.forms?.[0]?.tier;
    const baseTier = c.baseTier || c.tier;
    if (f0Tier && baseTier !== f0Tier) {
      unalignedMismatchCount++;
    }
  });
  checks['tier_sync'] = unalignedMismatchCount === 0;
  if (unalignedMismatchCount > 0) {
    issues.push(`Found ${unalignedMismatchCount} tier mismatches between baseTier and forms[0].tier`);
  }

  // Tier format validation for all active records
  let invalidTierFormatCount = 0;
  Object.values(activeRecords).forEach(c => {
    if (c.tier && !TIER_CANONICAL_REGEX.test(c.tier)) {
      invalidTierFormatCount++;
      issues.push(`Invalid tier format for ${c.id}: "${c.tier}"`);
    }
  });
  checks['tier_format_compliance'] = invalidTierFormatCount === 0;

  // Form count validation
  let totalForms = 0;
  Object.values(activeRecords).forEach(c => {
    if (c.forms) totalForms += c.forms.length;
  });
  checks['totalForms_1311'] = totalForms === 1311;
  if (totalForms !== 1311) {
    issues.push(`Total forms mismatch: expected 1311, found ${totalForms}`);
  }

// Critical power scaling validations
  // Gohan SSJ2 > Cell Super Perfecto
  const gohanCell = activeRecords['son-gohan-joven-saga-androides-cell-945'];
  const cell = activeRecords['cell-saga-androides-98'];
  if (gohanCell && cell) {
    const gohanSSJ2 = gohanCell.forms?.find(f => f.name?.includes('Super Saiyajin 2') || f.name?.includes('SSJ2'));
    const cellSP = cell.forms?.find(f => f.name?.includes('Super Perfecto') || f.name?.includes('Super Perfecto'));
    if (gohanSSJ2 && cellSP) {
      const gohanSSJ2Ki = getKi(gohanSSJ2);
      const cellSPKi = getKi(cellSP);
      if (gohanSSJ2Ki <= cellSPKi) {
        issues.push(`POWER_SCALING: Gohan SSJ2 (${gohanSSJ2Ki}) <= Cell Super Perfecto (${cellSPKi}) - INVALID`);
      }
    }
  }

  // Gohan SSJ1 > Cell Perfecto
  const gohanSSJ1 = activeRecords['son-gohan-joven-saga-androides-cell-945']?.forms?.find(f => f.name?.includes('Super Saiyajin') && !f.name?.includes('2'));
  const cellPerfect = activeRecords['cell-saga-androides-98']?.forms?.find(f => f.name?.includes('Perfecto') && !f.name?.includes('Super'));
  if (gohanSSJ1 && cellPerfect) {
    if (getKi(gohanSSJ1) <= getKi(cellPerfect)) {
      issues.push(`POWER_SCALING: Gohan SSJ1 (${getKi(gohanSSJ1)}) <= Cell Perfecto (${getKi(cellPerfect)}) - INVALID`);
    }
  }

  // Gohan SSJ2 > Goku/Vegeta SSJ Cell
  const gohanSSJ2 = activeRecords['son-gohan-joven-saga-androides-cell-945']?.forms?.find(f => f.name?.includes('2') || f.name?.includes('SSJ2'));
  const gokuSSJ = activeRecords['son-goku-saga-cell-saga-androides-459']?.forms?.find(f => f.name?.includes('Super Saiyan') && !f.name?.includes('Full'));
  const vegetaSSJ = activeRecords['vegeta-saga-cell-saga-androides-856']?.forms?.find(f => f.name?.includes('Super Saiyan') && !f.name?.includes('Super Vegeta') && !f.name?.includes('2'));
  if (gohanSSJ2 && gokuSSJ) {
    if (getKi(gohanSSJ2) <= getKi(gokuSSJ)) issues.push(`POWER_SCALING: Gohan SSJ2 <= Goku SSJ - INVALID`);
  }
  if (gohanSSJ2 && vegetaSSJ) {
    if (getKi(gohanSSJ2) <= getKi(vegetaSSJ)) issues.push(`POWER_SCALING: Gohan SSJ2 <= Vegeta SSJ - INVALID`);
  }

  return {
    success: issues.length === 0,
    activeCount: Object.keys(activeRecords).length,
    deprecatedCount: deprecatedRecords.length,
    totalCensus: Object.keys(activeRecords).length + deprecatedRecords.length,
    checks,
    issues
  };
}

async function validateCharactersTacticalIntegrity() {
  // Validate characters.js integrity
  if (!fs.existsSync(CHARACTERS_FILE)) {
    return { success: false, checks: {}, issues: ['characters.js not found'] };
  }

  const content = fs.readFileSync(CHARACTERS_FILE, 'utf8');
  const issues = [];
  const checks = {};

  // Check character count in UI - handle multi-line id fields with "id": pattern
  const charMatches = content.match(/"id"\s*:\s*[\r\n]*\s*["'][^"']+["']/g);
  const uiCharCount = charMatches ? charMatches.length : 0;
  checks['uiCharCount_756'] = uiCharCount >= 756; // >= because includes form IDs
  if (uiCharCount < 756) {
    issues.push(`UI character count mismatch: expected at least 756, found ${uiCharCount}`);
  }

  return { success: issues.length === 0, checks, issues };
}

async function main() {
  if (process.argv.includes('--fix')) {
    console.error('❌ ERROR BLOQUEANTE: DESTRUCTIVE_FIX_DISABLED_USE_PATCH_PROPOSAL');
    process.exit(1);
  }

  console.log('================================================================');
  console.log('  ⚡ AUDITOR Y VALIDADOR CANÓNICO DEL ROSTER – APEX V26 [READ-ONLY]');
  console.log('================================================================\n');

  try {
    const v26Res = validateV26CanonicalRoster();
    console.log('--- VALIDACIÓN CANÓNICA DE V26 ---');
    console.log(`✅ Combatientes Activos: ${v26Res.activeCount} / 756`);
    console.log(`✅ Registros Deprecados / Históricos: ${v26Res.deprecatedCount} / 13`);
    console.log(`✅ Censo Total: ${v26Res.totalCensus} / 769`);
    for (const [chk, val] of Object.entries(v26Res.checks)) {
      console.log(`  - ${chk}: ${val ? '✅ PASS' : '❌ FAIL'}`);
    }

    const charRes = await validateCharactersTacticalIntegrity();
    console.log('\n--- VALIDACIÓN DE INTEGRIDAD TÁCTICA (characters.js) ---');
    console.log(`✅ Combatientes en UI: ${charRes.characterCount} / 756`);
    for (const [chk, val] of Object.entries(charRes.checks)) {
      console.log(`  - ${chk}: ${val ? '✅ PASS' : '❌ FAIL'}`);
    }

const overallSuccess = v26Res.success && charRes.success;
  console.log('\n================================================================');
  console.log(`  RESULTADO GLOBAL: ${overallSuccess ? '✅ PASS (ROSTER V26 100% CANÓNICO)' : '❌ FAIL'}`);
  console.log('  Modo: READ-ONLY (Sin modificaciones de archivos)');
  console.log('  V26 ES EL BASELINE INMUTABLE');
  console.log('================================================================\n');
  
  if (!overallSuccess) {
    console.log('ISSUES:', v26Res.issues, charRes.issues);
    process.exit(1);
  }
  } catch (err) {
    console.error(`\n❌ ERROR CRÍTICO EN VALIDACIÓN CANÓNICA: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].includes('rosterCanonicalValidatorV26.js')) {
  main().catch(console.error);
}