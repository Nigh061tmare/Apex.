/**
 * APEX POWER SCALING ENGINE — MASTER CANONICAL VALIDATOR & AUDITOR (V25 BASELINE)
 * 
 * Modos de ejecución:
 * 1. V25 READ-ONLY (por defecto / explícito):
 *    node src/scripts/rosterCanonicalValidator.js --v25 --read-only
 *    - Inspecciona exhaustivamente el Roster V25 y la fachada characters.js sin modificar ningún archivo.
 * 2. FIX DESTRUCTIVO DESACTIVADO:
 *    node src/scripts/rosterCanonicalValidator.js --fix
 *    - Aborta inmediatamente con error 'DESTRUCTIVE_FIX_DISABLED_USE_PATCH_PROPOSAL'.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const V25_FILE = path.join(projectRoot, 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V25.json');
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

export function validateV25CanonicalRoster() {
  const issues = [];
  const checks = {};

  // Check 1: Fix mode check
  if (process.argv.includes('--fix')) {
    console.error('❌ ERROR BLOQUEANTE: DESTRUCTIVE_FIX_DISABLED_USE_PATCH_PROPOSAL');
    process.exit(1);
  }

  // Check 2: Load and parse V25
  if (!fs.existsSync(V25_FILE)) {
    throw new Error(`[CRITICAL] V25 roster file missing at ${V25_FILE}`);
  }

  let v25;
  try {
    v25 = JSON.parse(fs.readFileSync(V25_FILE, 'utf8'));
  } catch (err) {
    throw new Error(`[CRITICAL] V25 roster JSON parse failed: ${err.message}`);
  }

  const activeRecords = v25.characters || [];
  const deprecatedRecords = v25.deprecatedRecords || [];

  // Minimum validations:
  // 1. activeCount === 756
  checks['activeCount_756'] = activeRecords.length === 756;
  if (activeRecords.length !== 756) {
    issues.push(`activeCount mismatch: expected 756, found ${activeRecords.length}`);
  }

  // 2. deprecatedCount === 13
  checks['deprecatedCount_13'] = deprecatedRecords.length === 13;
  if (deprecatedRecords.length !== 13) {
    issues.push(`deprecatedCount mismatch: expected 13, found ${deprecatedRecords.length}`);
  }

  // 3. activeCount + deprecatedCount === 769
  const totalCensus = activeRecords.length + deprecatedRecords.length;
  checks['totalCensus_769'] = totalCensus === 769;
  if (totalCensus !== 769) {
    issues.push(`totalCensus mismatch: expected 769, found ${totalCensus}`);
  }

  // 4. Unique active IDs
  const activeIds = new Set();
  let duplicateActiveCount = 0;
  activeRecords.forEach(c => {
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

  // Check specific character rules in V25:
  // Gohan U16 has 3 forms
  const gohan = activeRecords.find(c => c.id === 'gohan-u16-dbm-espectador');
  checks['gohan_u16_3_forms'] = gohan?.forms?.length === 3;
  if (gohan?.forms?.length !== 3) {
    issues.push(`gohan-u16-dbm-espectador expected 3 forms, found ${gohan?.forms?.length}`);
  }

  // Goku Mini Daima and Goku Adulto Daima have 5 forms
  const gokuMini = activeRecords.find(c => c.id === 'son-goku-mini-daima-full');
  const gokuAdult = activeRecords.find(c => c.id === 'son-goku-adulto-daima');
  checks['goku_mini_daima_5_forms'] = gokuMini?.forms?.length === 5;
  checks['goku_adulto_daima_5_forms'] = gokuAdult?.forms?.length === 5;
  if (gokuMini?.forms?.length !== 5) {
    issues.push(`son-goku-mini-daima-full expected 5 forms, found ${gokuMini?.forms?.length}`);
  }
  if (gokuAdult?.forms?.length !== 5) {
    issues.push(`son-goku-adulto-daima expected 5 forms, found ${gokuAdult?.forms?.length}`);
  }

  // Raichi has 2 forms and ghost-broly-unleashed intact
  const raichi = activeRecords.find(c => c.id === 'dr-raichi-dbm-u3');
  const raichiBroly = raichi?.forms?.find(f => f.id === 'ghost-broly-unleashed');
  const raichiBrolyIntact = raichiBroly && raichiBroly.tier === '4-B' && raichiBroly.multiplier === 2000 && raichiBroly.kiNumeric > 0;
  checks['raichi_2_forms_and_broly_intact'] = (raichi?.forms?.length === 2) && !!raichiBrolyIntact;
  if (raichi?.forms?.length !== 2 || !raichiBrolyIntact) {
    issues.push(`dr-raichi-dbm-u3 expected 2 forms with intact ghost-broly-unleashed`);
  }

  // Check 11: baseTier vs forms[0].tier synchronization with tierStatus (Parte D - V25-PATCH-0009-VALIDATOR-FIX)
  let unalignedMismatchCount = 0;
  activeRecords.forEach(c => {
    const f0Tier = c.forms?.[0]?.tier;
    if (f0Tier && c.baseTier !== f0Tier) {
      if (c.powerSchema?.tierStatus !== 'needs_feat_review') {
        unalignedMismatchCount++;
        issues.push(`mismatch_unmarked: ${c.id} has baseTier "${c.baseTier}" vs forms[0].tier "${f0Tier}" but tierStatus is "${c.powerSchema?.tierStatus}" (expected "needs_feat_review")`);
      }
    }
  });
  checks['tierStatus_synchronization'] = unalignedMismatchCount === 0;

  // Check 12: Tier format validation for audited patch records (Parte D - V25-PATCH-0009-VALIDATOR-FIX)
  const AUDITED_PATCH_RECORDS = [
    'son-goku-saga-super-dragon-ball-super-732',
    'vegeta-saga-super-dragon-ball-super-454',
    'king-piccolo-u3-dbm',
    'androide-18-saga-androides-476',
    'androide-8-dragon-ball-cl-sico-704',
    'krilin-db-clasico',
    'mayor-metallitron-dragon-ball-cl-sico-265',
    'yamcha-db-clasico',
    'captain-ginyu-saga-namek-524',
    'cell-saga-androides-98',
    'piccolo-saga-saiyan',
    'piccolo-saga-cell-buu-saga-androides-946',
    'caulifla-dragon-ball-super-537',
    'freezer-dbs-broly-movie',
    'frost-dragon-ball-super-662',
    'kale-dbs-u6',
    'son-gohan-saga-super-dragon-ball-super-39',
    'trunks-futuro-v4-manga-super-zamasu',
    'son-goku-adulto-daima',
    'son-goku-saga-gt-dragon-ball-gt-281',
    'broly-dbz-pel-culas-dbz-toei-822',
    'maestro-roshi-jackie-chun-dragon-ball-cl-sico-224',
    'son-bra-dbm-u16',
    'vegeta-db-after'
  ];
  let invalidTierFormatCount = 0;
  AUDITED_PATCH_RECORDS.forEach(id => {
    const c = activeRecords.find(x => x.id === id);
    if (c) {
      if (c.baseTier && !TIER_CANONICAL_REGEX.test(c.baseTier)) {
        invalidTierFormatCount++;
        issues.push(`invalid_tier_format: ${c.id} baseTier "${c.baseTier}" does not match ^(High |Low )?\\d{1,2}-[ABC]$`);
      }
      c.forms?.forEach((f, idx) => {
        if (f.tier && !TIER_CANONICAL_REGEX.test(f.tier)) {
          invalidTierFormatCount++;
          issues.push(`invalid_tier_format: ${c.id} forms[${idx}] tier "${f.tier}" does not match ^(High |Low )?\\d{1,2}-[ABC]$`);
        }
      });
    }
  });
  checks['tier_format_compliance'] = invalidTierFormatCount === 0;

  return {
    success: issues.length === 0,
    activeCount: activeRecords.length,
    deprecatedCount: deprecatedRecords.length,
    totalCensus,
    checks,
    issues
  };
}

export async function validateCharactersTacticalIntegrity() {
  const issues = [];
  const checks = {};

  if (!fs.existsSync(CHARACTERS_FILE)) {
    throw new Error(`[CRITICAL] characters.js missing at ${CHARACTERS_FILE}`);
  }

  const mod = await import('file://' + CHARACTERS_FILE.replace(/\\/g, '/'));
  const characters = mod.INITIAL_CHARACTERS || [];
  const deprecatedSet = mod.DEPRECATED_RECORD_IDS || new Set();

  checks['characters_count_756'] = characters.length === 756;
  if (characters.length !== 756) {
    issues.push(`INITIAL_CHARACTERS expected 756, found ${characters.length}`);
  }

  // Scan tactical fields for references to deprecated IDs
  const tacticalFields = [
    'arsenal', 'passives', 'haxTags', 'weaknesses', 'artifacts',
    'synergies', 'teamCombos', 'combatStatuses', 'arenaAffinities',
    'narrativeCombatProfile', 'parent_team_profile', 'team_affiliation'
  ];

  let deprecatedRefViolations = [];
  characters.forEach(c => {
    tacticalFields.forEach(f => {
      if (c[f] !== undefined && c[f] !== null) {
        const str = JSON.stringify(c[f]);
        deprecatedSet.forEach(dId => {
          if (str.includes(dId)) {
            deprecatedRefViolations.push({ charId: c.id, field: f, target: dId });
          }
        });
      }
    });
  });

  checks['zero_deprecated_references'] = deprecatedRefViolations.length === 0;
  if (deprecatedRefViolations.length > 0) {
    issues.push(`Found ${deprecatedRefViolations.length} tactical references to deprecated IDs`);
  }

  // Tamagami source gate check
  const t1 = characters.find(c => c.id === 'tamagami-1-espada-daima');
  const t2 = characters.find(c => c.id === 'tamagami-n-mero-1-dragon-ball-daima-763');
  const t1Gate = t1?.narrativeCombatProfile?.pendingSourceGate === 'GATE-001-TAMAGAMI-SOURCE';
  const t2Gate = t2?.narrativeCombatProfile?.pendingSourceGate === 'GATE-001-TAMAGAMI-SOURCE';
  checks['tamagami_gate_preserved'] = t1Gate && t2Gate;
  if (!t1Gate || !t2Gate) {
    issues.push('Tamagami source gate GATE-001-TAMAGAMI-SOURCE missing or invalid');
  }

  return {
    success: issues.length === 0,
    characterCount: characters.length,
    deprecatedRefViolations,
    checks,
    issues
  };
}

async function main() {
  if (process.argv.includes('--fix')) {
    console.error('❌ ERROR BLOQUEANTE: DESTRUCTIVE_FIX_DISABLED_USE_PATCH_PROPOSAL');
    process.exit(1);
  }

  console.log('================================================================');
  console.log('  🛡️ AUDITOR Y VALIDADOR CANÓNICO DEL ROSTER — APEX V25 [READ-ONLY]');
  console.log('================================================================\n');

  try {
    const v25Res = validateV25CanonicalRoster();
    console.log('--- VALIDACIÓN CANÓNICA DE V25 ---');
    console.log(`• Combatientes Activos: ${v25Res.activeCount} / 756`);
    console.log(`• Registros Deprecados / Históricos: ${v25Res.deprecatedCount} / 13`);
    console.log(`• Censo Total: ${v25Res.totalCensus} / 769`);
    for (const [chk, val] of Object.entries(v25Res.checks)) {
      console.log(`  - ${chk}: ${val ? '✅ PASS' : '❌ FAIL'}`);
    }

    const charRes = await validateCharactersTacticalIntegrity();
    console.log('\n--- VALIDACIÓN DE INTEGRIDAD TÁCTICA (characters.js) ---');
    console.log(`• Combatientes en UI: ${charRes.characterCount} / 756`);
    for (const [chk, val] of Object.entries(charRes.checks)) {
      console.log(`  - ${chk}: ${val ? '✅ PASS' : '❌ FAIL'}`);
    }

    const overallSuccess = v25Res.success && charRes.success;
    console.log('\n================================================================');
    console.log(`  RESULTADO GLOBAL: ${overallSuccess ? '✅ PASS (ROSTER V25 100% CANÓNICO)' : '❌ FAIL'}`);
    console.log('  Modo: READ-ONLY (Sin modificaciones de archivos)');
    console.log('================================================================\n');

    if (!overallSuccess) {
      process.exit(1);
    }
  } catch (err) {
    console.error(`\n❌ ERROR CRÍTICO EN VALIDACIÓN CANÓNICA: ${err.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].includes('rosterCanonicalValidator.js')) {
  main().catch(console.error);
}
