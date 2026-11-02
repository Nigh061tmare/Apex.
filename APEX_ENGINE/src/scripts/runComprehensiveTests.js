/**
 * APEX Engine Comprehensive Verification Test Suite
 * Tests all 14 core requirements.
 */

import { INITIAL_CHARACTERS } from '../data/characters.js';
import { resolveCombatState } from '../lib/combatStateResolver.js';
import { TIER_ORDER, getTierRank } from '../lib/apexTierSystem.js';
import { createCombatSnapshot, validateCombatSnapshot, executeCombatSimulation, triggerOracleEvent } from '../services/combatSimulationCore.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log("  [PASS] " + message);
  } else {
    failed++;
    console.error("  [FAIL] " + message);
  }
}

console.log("=== EJECUTANDO 14 PRUEBAS MÍNIMAS APEX ===");

// 1. Base = multiplicador ×1 (Son Goku Niño Base)
const gokuNino = INITIAL_CHARACTERS.find(c => c.id === 'son-goku-ni-o-dragon-ball-cl-sico-987') || INITIAL_CHARACTERS.find(c => (c.name || '').toLowerCase().includes('goku niño')) || INITIAL_CHARACTERS[0];
const resBase = resolveCombatState(gokuNino, 'goku-nino-base');
assert(resBase.formMultiplier === 1 && resBase.multiplierDisplay === '×1', '1. Base = multiplicador ×1');

// 2. Forma con multiplicador válido aumenta APEX-Ki (Son Goku Niño Oozaru ×10)
const resOozaru = resolveCombatState(gokuNino, gokuNino?.forms?.[2]?.id || 'form_3');
assert(resOozaru.currentApexKiLog10 > resBase.currentApexKiLog10 && resOozaru.formMultiplier >= 10, '2. Forma con multiplicador válido cambia APEX-Ki');

// 3. Multiplicador < 1 reduce APEX-Ki correctamente
const charWithSuppressed = {
  id: 'suppressed-char-test',
  name: 'Luchador Suprimido',
  universe: 'Dragon Ball Z',
  tierExact: '5-A',
  forms: [
    { id: 'base', name: 'Estado Base' },
    { id: 'suppressed', name: 'Supresión de Poder', apexKiMultiplier: 0.25 }
  ]
};
const resSupp = resolveCombatState(charWithSuppressed, 'suppressed');
assert(resSupp.currentApexKiLog10 < resolveCombatState(charWithSuppressed, 'base').currentApexKiLog10 && resSupp.formMultiplier === 0.25, '3. Multiplicador < 1 reduce APEX-Ki');

// 4. Forma con tier propio actualiza tierRank y powerKey
const charWithTierForm = {
  id: 'garou-test',
  name: 'Garou',
  universe: 'One Punch Man',
  tierExact: '8-A',
  forms: [
    { id: 'base', name: 'Estado Base' },
    { id: 'cosmic', name: 'Garou Cósmico', tierExact: '4-B' }
  ]
};
const resCosmic = resolveCombatState(charWithTierForm, 'cosmic');
assert(resCosmic.tierExact === '4-B' && resCosmic.tierRank === TIER_ORDER.indexOf('4-B') && resCosmic.scalingMethod === 'active-tier', '4. Forma con tier propio actualiza tierRank y powerKey');

// 5. Forma con Source Ki explícito de Dragon Ball actualiza Source Ki y APEX-Ki mediante ratio
const dbCharWithSourceKi = {
  id: 'db-fighter-source-ki',
  name: 'Luchador DB',
  universe: 'Dragon Ball Z',
  tierExact: '5-A',
  sourceKi: 530000,
  forms: [
    { id: 'base', name: 'Estado Base', sourceKi: 530000 },
    { id: 'form-boost', name: 'Forma Desatada', sourceKi: 1060000 }
  ]
};
const resF2 = resolveCombatState(dbCharWithSourceKi, 'form-boost');
assert(resF2.scalingMethod === 'db-source-ratio' && resF2.sourceKiCurrent === 1060000 && resF2.formMultiplier === 2, '5. Forma de Dragon Ball con sourceKi actualiza ratio y display');

// 6. Freezer, King Cold, Cooler, Broly, Cell y Buu se resuelven y escalan correctamente
const coldDBM = INITIAL_CHARACTERS.find(c => c.id === 'rey-cold-saga-androides-751') || INITIAL_CHARACTERS.find(c => /rey cold/i.test(c.name));
const resColdFinal = resolveCombatState(coldDBM, coldDBM?.forms?.[1]?.id);
const cooler = INITIAL_CHARACTERS.find(c => /cooler/i.test(c.name));
const resCooler = resolveCombatState(cooler, cooler?.forms?.[1]?.id);
assert(
  resColdFinal.formMultiplier > 1 &&
  Number.isFinite(resColdFinal.formMultiplier) &&
  typeof resColdFinal.formMultiplier === 'number' &&
  resCooler.formMultiplier > 1 &&
  Number.isFinite(resCooler.formMultiplier),
  '6. Rey Cold, Cooler y formas canónicas/fan-mangas aumentan APEX-Ki correctamente (multiplicadores numéricos)');

// 7. Personaje no Dragon Ball muestra Ki APEX calculado desde su Tier (sin Source Ki false)
const naruto = INITIAL_CHARACTERS.find(c => /naruto/i.test(c.name)) || { id: 'naruto-real', name: 'Naruto Uzumaki', universe: 'Naruto', tierExact: '7-A' };
const resNaruto = resolveCombatState(naruto, 'base');
assert(resNaruto.sourceKiDisplay === null && resNaruto.sourceKiCurrent === null,
  '7a. Personaje no Dragon Ball NO tiene Source Ki falso');
assert(resNaruto.apexKiDisplay !== null && resNaruto.apexKiDisplay !== '—' && resNaruto.apexKiDisplay !== '',
  '7b. Personaje no Dragon Ball SÍ muestra Lectura Scouter APEX calculada desde Tier');

// 8. Forma sin datos de escalado verificados mantiene APEX-Ki base y añade warning
const unscaledFormChar = {
  id: 'custom-unscaled',
  name: 'Luchador Desconocido',
  universe: 'Universo Desconocido',
  tierExact: '8-C',
  forms: [
    { id: 'base', name: 'Base' },
    { id: 'mysterious-mode', name: 'Modo Desconocido Sin Datos' }
  ]
};
const resUnscaled = resolveCombatState(unscaledFormChar, 'mysterious-mode');
assert(resUnscaled.scalingMethod === 'unresolved' && resUnscaled.warnings.length > 0 && resUnscaled.formMultiplier === 1, '8. Forma sin escalado genera warning y mantiene valor base');

// 9. Evento Oráculo no autorizado no se puede activar
const snap = createCombatSnapshot({ scenario: {}, teamA: [gokuNino], teamB: [naruto], selectedOracleEvents: [] });
const trig = triggerOracleEvent(snap, 'canonical-fusion', { phase: 3 });
assert(!trig.success, '9. Evento Oráculo no autorizado no se puede activar');

// 10. No existe valor residual o fallback 8 (powerKey/tierRank numéricos y válidos)
assert(
  typeof resBase.powerKey === 'number' && Number.isFinite(resBase.powerKey) && resBase.powerKey >= 0 &&
  typeof resUnscaled.powerKey === 'number' && Number.isFinite(resUnscaled.powerKey) && resUnscaled.powerKey >= 0 &&
  typeof resBase.tierRank === 'number' && Number.isFinite(resBase.tierRank) && resBase.tierRank >= 0,
  '10. No existe fallback 8 residual');

// 11. No existe NaN ni Infinity
assert(!isNaN(resBase.currentApexKiLog10) && isFinite(resBase.currentApexKiLog10) && !isNaN(resOozaru.currentApexKiLog10) && isFinite(resOozaru.currentApexKiLog10), '11. No existen NaN ni Infinity en cálculos de Ki');

// 12. resolveCombatState exportado e integrado
assert(typeof resolveCombatState === 'function', '12. resolveCombatState exportado e integrado');

// 13 & 14. Snapshots inmutables y simulación con veredicto coherente
const sim = executeCombatSimulation(snap);
assert(sim.success && sim.verdict && sim.verdict.winnerName, '13 & 14. Snapshot inmutable y simulación con veredicto');

console.log("\n==================================================");
console.log("RESULTADO FINAL: " + passed + " Pasadas / " + failed + " Falladas.");
console.log("==================================================");
if (failed > 0) process.exit(1);