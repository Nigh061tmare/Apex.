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
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');

const V26_FILE = path.join(projectRoot, 'src/data/ROSTER_NIVELES_PODER_CORREGIDO_V26.json');
const CHARACTERS_FILE = path.join(projectRoot, 'src/data/characters.js');

// Official TIER_ORDER (source of truth: src/lib/apexTierSystem.js)
// Only these exact tier strings are recognized by the combat resolver.
// Audit 2026-09-05: 16 illegal tiers existed (High 5-B, High 4-B, High 8-A,
// High 7-B, High 4-A) and 33 chain descents were corrected; these guards prevent
// regression against the strict standard.
export const TIER_ORDER = [
  '10-C', '10-B', '10-A', '9-C', '9-B', '9-A',
  '8-C', 'High 8-C', '8-B', '8-A',
  'Low 7-C', '7-C', 'High 7-C', 'Low 7-B', '7-B', '7-A', 'High 7-A',
  '6-C', 'High 6-C', 'Low 6-B', '6-B', 'High 6-B', '6-A', 'High 6-A',
  '5-C', 'Low 5-B', '5-B', '5-A', 'High 5-A',
  'Low 4-C', '4-C', 'High 4-C', '4-B', '4-A',
  '3-C', '3-B', '3-A', 'High 3-A',
  'Low 2-C', '2-C', '2-B', '2-A',
  'Low 1-C', '1-C', 'High 1-C', '1-B', 'High 1-B',
  'Low 1-A', '1-A', 'High 1-A', '0'
];
const TIER_RANK = new Map(TIER_ORDER.map((t, i) => [t, i]));

export const TIER_CANONICAL_REGEX = /^(High |Low )?\d{1,2}-[ABC]$/;

export function isValidTierFormat(tierStr) {
  // STRICT: must be one of the exact canonical tiers in TIER_ORDER
  return typeof tierStr === 'string' && TIER_RANK.has(tierStr);
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
  // 1. activeCount === 772 (Namek 2026-09-06: +Krilin Namek, +Gohan Namek)
  checks['activeCount_772'] = Object.keys(activeRecords).length === 772;
  if (Object.keys(activeRecords).length !== 772) {
    issues.push(`activeCount mismatch: expected 772, found ${Object.keys(activeRecords).length}`);
  }

  // 2. deprecatedCount === 13
  checks['deprecatedCount_13'] = deprecatedRecords.length === 13;
  if (deprecatedRecords.length !== 13) {
    issues.push(`deprecatedCount mismatch: expected 13, found ${deprecatedRecords.length}`);
  }

  // 3. activeCount + deprecatedCount === 785
  const totalCensus = Object.keys(activeRecords).length + deprecatedRecords.length;
  checks['totalCensus_785'] = totalCensus === 785;
  if (totalCensus !== 785) {
    issues.push(`totalCensus mismatch: expected 785, found ${totalCensus}`);
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

  // Base Ki sync: baseKiNumeric must equal forms[0].kiNumeric (Single-Measure Rule).
  // Audit 2026-09-05: 13 records had a broken single measure (9 cosmic records 1000x off,
  // Gojo x2 (5200 vs 15000), Hakari (7697 vs 9500), Black Freezer Granolah (180T vs 183.75T)).
  // All fixed; this guard prevents regression.
  let baseKiMismatchCount = 0;
  Object.values(activeRecords).forEach(c => {
    const f0Ki = c.forms?.[0]?.kiNumeric;
    const baseKi = c.baseKiNumeric;
    if (baseKi != null && f0Ki != null && Math.abs(baseKi - f0Ki) > 0.5) {
      baseKiMismatchCount++;
      issues.push(`baseKi/forms[0] mismatch for ${c.id}: base=${baseKi}, forms[0]=${f0Ki}`);
    }
  });
  checks['baseKi_sync_forms0'] = baseKiMismatchCount === 0;
  if (baseKiMismatchCount > 0) {
    issues.push(`Found ${baseKiMismatchCount} baseKi/forms[0] single-measure mismatches`);
  }

  // Tier format validation for all active records (STRICT TIER_ORDER, forms included)
  let invalidTierFormatCount = 0;
  Object.values(activeRecords).forEach(c => {
    const baseTier = c.baseTier || c.tier;
    if (baseTier && !TIER_RANK.has(baseTier)) {
      invalidTierFormatCount++;
      issues.push(`Invalid tier format for ${c.id}: "${baseTier}"`);
    }
    (c.forms || []).forEach((f, i) => {
      if (f.tier && !TIER_RANK.has(f.tier)) {
        invalidTierFormatCount++;
        issues.push(`Invalid tier format for ${c.id} form[${i}]: "${f.tier}"`);
      }
    });
  });
  checks['tier_format_compliance'] = invalidTierFormatCount === 0;

  // Form count validation
  // V25 baseline had 1311 forms. V26 adds 5 canonical JJK forms:
  //   Jogo (Maximum: Meteor, Maximum: Ultra) +2
  //   Mahoraga (Adaptación: Contra Jogo, Adaptación Total: Rueda, Adaptación Máxima vs Sukuna) +3
  //   Sukuna Heian: contamination (Super Saiyan 1/2/3) REMOVED, back to 1 form => net +5
  // Anti-Flat-Clone PASS (aprobado por el usuario 2026-09-05): 11 formas fusionadas/eliminadas
  //   (duplicados literales + escalado de clones planos) => 1316 - 11 = 1305
  // 2026-09-06: Gohan Futuro Brokoly corregido a escala Goku Saga Buu (SSJ1/2/3) +2 formas => 1307
  // 2026-09-06 R1: Revision Bloque 0 Clasico segun referencia maestra (+9 formas canonicas) => 1316
  // 2026-09-06 R2: Sagas Z corregidas + 2 fichas nuevas (Trunks Adol 13, SSG Ritual) => 1318
  // 2026-09-06 R3: Saga Buu corregida + 2 fichas nuevas (Buutenks, Gohan Universidad) => 1325
// 2026-09-06 Namek: +Krilin Namek (3 formas), +Gohan Namek (6 formas) => 1350 + 9 = 1359
  let totalForms = 0;
  Object.values(activeRecords).forEach(c => {
    if (c.forms) totalForms += c.forms.length;
  });
  checks['totalForms_1359'] = totalForms === 1359;
  if (totalForms !== 1359) {
    issues.push(`Total forms mismatch: expected 1359, found ${totalForms}`);
  }

  // DB-form contamination guard: NO Super Saiyan / Kaio-ken / Oozaru forms allowed
  // in non-Dragon Ball universes (Constitution Rule 1 & 4: zero cross-universe contamination)
  const DB_FORM_PATTERNS = [
    /super\s*saiyan|ssj[\s\d]*|saiyajin/i,
    /kaio[\s-]?ken/i,
    /oozaru|gran\s*simio|mono\s*gigante/i,
    /zenkai/i,
    /super\s*saiyan\s*(god|blue)|\bssg\b|\bssb\b|ssgss/i,
    /ultra\s*instinct|instinto\s*perfecto/i,
  ];
  let dbFormContamination = [];
  Object.values(activeRecords).forEach(c => {
    const uni = c.universe || '';
    if (uni.startsWith('DRAGON BALL')) return;
    (c.forms || []).forEach(f => {
      const nm = f.name || '';
      if (DB_FORM_PATTERNS.some(p => p.test(nm))) {
        dbFormContamination.push(`${c.id} -> "${nm}"`);
      }
    });
  });
  checks['no_db_form_contamination'] = dbFormContamination.length === 0;
  if (dbFormContamination.length > 0) {
    issues.push(`DB form contamination in non-DB universes (${dbFormContamination.length}): ${dbFormContamination.join(' | ')}`);
  }

  // Universe/ID alignment guard (Constitution Pillar 1: Zero Franchise Crosses).
  // Audit 2026-09-05: 12 records were placed in the wrong universe (Yuta->CSM, Wolverine->DC,
  // Zeno Zoldyck->JoJo, Zeus->Marvel, Yujiro->RoR, Zombieman->MHA, Kira->OPM, etc.).
  // All fixed; this guard prevents regression via strong id hints.
  const UNIVERSE_HINTS = [
    { u: 'JUJUTSU KAISEN', p: /(jjk|jujutsu|sukuna|gojo|itadori|fushiguro|mahoraga|zenin|kugisaki|okkotsu|hakari|toji)-/i },
    { u: 'CHAINSAW MAN', p: /(csm|chainsaw|denji|makima|pochita|yoshida-hirofumi)/i },
    { u: 'HUNTER X HUNTER', p: /(hxh|zoldyck|killua|meruem|netero|hisoka|chrollo|kurapika)-/i },
    { u: "JOJO'S BIZARRE ADVENTURE", p: /(jojo|kakyoin|jotaro|giorno|zeppeli|yoshikage)-/i },
    { u: 'ONE PUNCH MAN', p: /(opm|saitama|genos|garou|zombieman|flashy-flash)/i },
    { u: 'MY HERO ACADEMIA', p: /(mha|bakugo|shigaraki|todoroki|twice-)/i },
    { u: 'BAKI THE GRAPPLER', p: /(-baki|hanma|yujiro|pickle|oliva|guevaru|sikorsky|kaioh)/i },
    { u: 'SHUUMATSU NO VALKYRIE (RECORD OF RAGNAROK)', p: /(shuumatsu|valkyrie|ragnarok|zeus-|lu-?bu)/i },
    { u: 'MARVEL COMICS', p: /(marvel|wolverine|iron-man|spider|hulk|adam-warlock|jean-grey|dr-doom|galactus|thanos)/i },
    { u: 'DC COMICS', p: /(^dc-|-dc-|superman|batman|wonder-woman|darkseid|lex-luthor|joker|dr-manhattan|spectre|anti-monitor|zatanna)/i },
    { u: 'INVINCIBLE', p: /(invincible|omni-man|battle-beast|universa)/i },
    { u: 'THE BOYS', p: /(the-boys|homelander|butcher|neuman|soldier-boy)/i },
  ];
  let universeMismatch = [];
  Object.values(activeRecords).forEach(c => {
    const uni = c.universe || '';
    if (uni.startsWith('DRAGON BALL')) return; // DB ids are varied; covered by no_db_form_contamination
    if (uni.includes('APEX ORIGINAL') || uni.includes('HÍBRIDO')) return;
    const cid = c.id || '';
    for (const { u, p } of UNIVERSE_HINTS) {
      if (p.test(cid)) {
        const key = u.split(' ')[0];
        if (!uni.toUpperCase().includes(key.toUpperCase())) {
          universeMismatch.push(`${c.id} -> "${uni}" (hint: ${u})`);
        }
        break;
      }
    }
  });
  checks['universe_id_alignment'] = universeMismatch.length === 0;
  if (universeMismatch.length > 0) {
    issues.push(`Universe/ID misalignments (${universeMismatch.length}): ${universeMismatch.join(' | ')}`);
  }

  // Ascending order guard: forms must be sorted by kiNumeric ascending (Constitution Rule 2)
  let outOfOrderChars = [];
  Object.values(activeRecords).forEach(c => {
    const forms = c.forms || [];
    if (forms.length < 2) return;
    let prev = -1;
    for (const f of forms) {
      const ki = getKi(f);
      if (!ki || ki < prev) {
        outOfOrderChars.push(`${c.id} (form "${f.name}", ki=${ki} after ${prev})`);
        break;
      }
      prev = ki;
    }
  });
  checks['forms_ascending_order'] = outOfOrderChars.length === 0;
  if (outOfOrderChars.length > 0) {
    issues.push(`Out-of-order forms (${outOfOrderChars.length}): ${outOfOrderChars.join(' | ')}`);
  }

  // Tier monotonicity guard: tier[i] must never be BELOW tier[i-1] within a chain
  // (Constitution Golden Rule 2: kIs ascend AND tiers must scale correlatively).
  let tierDropChars = [];
  Object.values(activeRecords).forEach(c => {
    const forms = c.forms || [];
    for (let i = 1; i < forms.length; i++) {
      const prevRank = TIER_RANK.get(forms[i - 1].tier);
      const curRank = TIER_RANK.get(forms[i].tier);
      if (prevRank == null || curRank == null) continue; // non-standard handled above
      if (curRank < prevRank) {
        tierDropChars.push(`${c.id} (form[${i}] "${forms[i].name}" ${forms[i].tier} < form[${i - 1}] ${forms[i - 1].tier})`);
      }
    }
  });
  checks['forms_tier_ascending'] = tierDropChars.length === 0;
  if (tierDropChars.length > 0) {
    issues.push(`Tier descents within chains (${tierDropChars.length}): ${tierDropChars.join(' | ')}`);
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

  const issues = [];
  const checks = {};

  // Cuenta real de combatientes: importa el módulo (carga el JSON V26 + los
  // perfiles tácticos en tacticalProfiles.json) en lugar de contar "id" por regex.
  let uiCharCount = 0;
  try {
    const mod = await import(pathToFileURL(CHARACTERS_FILE).href + `?v=${Date.now()}`);
    uiCharCount = (mod.INITIAL_CHARACTERS || []).length;

    // Advertencia (no bloqueante): texto plantilla prohibido por las Reglas de Oro
    // en forms[].stats (ej. "Capacidades de combate activas al 100%...").
    const TEMPLATE_STATS = /Capacidades de combate activas al 100%/i;
    let templateHits = 0;
    for (const c of mod.INITIAL_CHARACTERS || []) {
      for (const f of (c.forms || [])) {
        if (f?.stats && TEMPLATE_STATS.test(f.stats)) templateHits++;
      }
    }
    if (templateHits > 0) {
      console.warn(`⚠️ ADVERTENCIA DE CALIDAD: ${templateHits} formas usan el texto plantilla genérico prohibido ("Capacidades de combate activas al 100%...") en forms[].stats. Revisa tacticalProfiles.json.`);
    }
  } catch (e) {
    issues.push(`No se pudo importar characters.js: ${e.message}`);
  }

  checks['uiCharCount_772'] = uiCharCount >= 772;
  if (uiCharCount < 772) {
    issues.push(`UI character count mismatch: expected at least 772, found ${uiCharCount}`);
  }

  return { success: issues.length === 0, checks, issues, characterCount: uiCharCount };
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
    console.log(`✅ Combatientes Activos: ${v26Res.activeCount} / 770`);
    console.log(`✅ Registros Deprecados / Históricos: ${v26Res.deprecatedCount} / 13`);
    console.log(`✅ Censo Total: ${v26Res.totalCensus} / 783`);
    for (const [chk, val] of Object.entries(v26Res.checks)) {
      console.log(`  - ${chk}: ${val ? '✅ PASS' : '❌ FAIL'}`);
    }

    const charRes = await validateCharactersTacticalIntegrity();
    console.log('\n--- VALIDACIÓN DE INTEGRIDAD TÁCTICA (characters.js) ---');
    console.log(`✅ Combatientes en UI: ${charRes.characterCount} / 770`);
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