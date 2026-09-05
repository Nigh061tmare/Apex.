/**
 * APEX Powerscaling Engine — Simulation Log Audit Script
 * Audits simulation snapshots, logs, oracle events, and verdicts.
 * Generates src/data/simulationAuditReport.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCombatSnapshot, validateCombatSnapshot, executeCombatSimulation, synthesizeNarrativeFromValidatedLog, ORACLE_EVENT_CONFIG } from '../services/combatSimulationCore.js';
import { validateSimulationIntegrity } from '../lib/simulationIntegrityValidator.js';
import { resolveCombatState } from '../lib/combatStateResolver.js';
import { INITIAL_CHARACTERS } from '../data/characters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

console.log("Iniciando auditoría de simulación y logs...");

const issues = [];
let testRuns = 0;
let validSnapshots = 0;
let invalidAbilitiesBlocked = 0;
let invalidFormsBlocked = 0;
let oracleEventsValidated = 0;

// Test Suite 1: Canonical 1v1 Simulation (Goku vs Vegeta)
const charGoku = INITIAL_CHARACTERS.find(c => c.id?.includes('goku')) || {
  id: 'goku-z',
  name: 'Son Goku (Saga Saiyajin)',
  universe: 'Dragon Ball Z',
  tierExact: '7-A',
  sourceKi: 8000,
  forms: [{ id: 'base', name: 'Base' }, { id: 'kaioken', name: 'Kaio-ken x3' }]
};

const charVegeta = INITIAL_CHARACTERS.find(c => c.id?.includes('vegeta')) || {
  id: 'vegeta-z',
  name: 'Vegeta (Saga Saiyajin)',
  universe: 'Dragon Ball Z',
  tierExact: '7-A',
  sourceKi: 18000,
  forms: [{ id: 'base', name: 'Base' }, { id: 'oozaru', name: 'Mono Gigante Oozaru' }]
};

testRuns++;
const snapshot1 = createCombatSnapshot({
  scenario: { name: "Páramo Rocoso", ruleset: "apex-standard", allowFusion: true },
  teamA: [charGoku],
  teamB: [charVegeta],
  selectedOracleEvents: ["canonical-awakening"]
});

const val1 = validateCombatSnapshot(snapshot1);
if (val1.isValid) {
  validSnapshots++;
} else {
  issues.push({
    phase: 0,
    type: "invalid-snapshot",
    severity: "critical",
    message: "Fallo en validación de snapshot 1: " + val1.blockingErrors.join(", "),
    suggestedFix: "Revisar datos de entrada del combatiente"
  });
}

const simResult1 = executeCombatSimulation(snapshot1);
if (simResult1.success) {
  // Verify log properties
  let prevHpA = 100;
  let prevHpB = 100;

  for (const log of simResult1.combatLog) {
    if (log.hpChangeA !== undefined && log.hpChangeB !== undefined) {
      if (isNaN(log.hpChangeA) || isNaN(log.hpChangeB)) {
        issues.push({
          phase: log.phase,
          type: "hp-inconsistency",
          severity: "high",
          message: "Valores NaN detectados en hpChange durante Turno " + log.turn,
          suggestedFix: "Validar fórmulas de daño"
        });
      }
    }
  }

  // Verify verdict
  if (!simResult1.verdict.winnerTeamId || !simResult1.verdict.winnerName) {
    issues.push({
      phase: 4,
      type: "verdict-inconsistency",
      severity: "critical",
      message: "Veredicto incompleto o sin ganador declarado",
      suggestedFix: "Asegurar que executeCombatSimulation resuelva ganador"
    });
  }
}

// Test Suite 2: Unauthorized Oracle Event Check
testRuns++;
const snapshot2 = createCombatSnapshot({
  scenario: { name: "Arena del Torneo", ruleset: "apex-standard" },
  teamA: [charGoku],
  teamB: [charVegeta],
  selectedOracleEvents: [] // No events selected
});

const simResult2 = executeCombatSimulation(snapshot2);
if (simResult2.verdict.oracleSummary.oracleEventsTriggered.length > 0) {
  issues.push({
    phase: 3,
    type: "oracle-event-not-authorized",
    severity: "critical",
    message: "Evento Oráculo activado sin estar seleccionado en el snapshot",
    suggestedFix: "Comprobar oracleEvents.enabled y active list"
  });
} else {
  oracleEventsValidated++;
}

// Test Suite 3: Canonical Fusion Component Isolation Check (Rule 15)
testRuns++;
const snapshot3 = createCombatSnapshot({
  scenario: { name: "Planeta Sagrado de los Supremos", ruleset: "apex-standard", allowFusion: true },
  teamA: [charGoku],
  teamB: [charVegeta],
  selectedOracleEvents: ["canonical-fusion"]
});

const simResult3 = executeCombatSimulation(snapshot3);
if (!simResult3.createdFusions || simResult3.createdFusions.length === 0) {
  issues.push({
    phase: 3,
    type: "fusion-not-created",
    severity: "high",
    message: "Fusión no fue creada a pesar de estar activa en selectedOracleEvents",
    suggestedFix: "Revisar triggerOracleEvent para canonical-fusion"
  });
} else {
  const fusion = simResult3.createdFusions[0];
  if (!fusion.componentAvailabilityStatus || fusion.componentAvailabilityStatus.length === 0) {
    issues.push({
      phase: 3,
      type: "fusion-isolation-missing",
      severity: "critical",
      message: "Fusión creada no declara componentAvailabilityStatus",
      suggestedFix: "Asegurar que createFusionCombatState incluya componentAvailabilityStatus"
    });
  } else if (!simResult3.integrityReport?.isValid) {
    issues.push({
      phase: 3,
      type: "integrity-rule15-violation",
      severity: "critical",
      message: "Fallo en integridad de simulación con Fusión: " + JSON.stringify(simResult3.integrityReport.violations),
      suggestedFix: "Corregir aislamiento de combatientes fusionados en combatLog"
    });
  } else {
    oracleEventsValidated++;
  }
}

// Test Suite 4: Majin Buu Viscous Absorption Check (Rule 16)
testRuns++;
const charBuu = INITIAL_CHARACTERS.find(c => c.id?.includes('buu') || c.id?.includes('majin')) || {
  id: 'super-buu',
  name: 'Super Buu (Maldad Pura)',
  universe: 'Dragon Ball Z',
  tierExact: '4-B',
  sourceKi: 25000000,
  forms: [{ id: 'base', name: 'Base' }]
};

const charPiccolo = INITIAL_CHARACTERS.find(c => c.id?.includes('piccolo')) || {
  id: 'piccolo-buu-saga',
  name: 'Piccolo (Saga Buu)',
  universe: 'Dragon Ball Z',
  tierExact: '4-C',
  sourceKi: 2000000,
  forms: [{ id: 'base', name: 'Base' }]
};

const snapshot4 = createCombatSnapshot({
  scenario: { name: "Tierra Devastada", ruleset: "apex-standard", allowFusion: false },
  teamA: [charBuu],
  teamB: [charPiccolo],
  selectedOracleEvents: ["majin-buu-absorption"]
});

const simResult4 = executeCombatSimulation(snapshot4);
if (!simResult4.createdAbsorptions || simResult4.createdAbsorptions.length === 0) {
  issues.push({
    phase: 3,
    type: "absorption-not-created",
    severity: "high",
    message: "Absorción no fue registrada en createdAbsorptions",
    suggestedFix: "Verificar triggerOracleEvent para majin-buu-absorption"
  });
} else {
  const abs = simResult4.createdAbsorptions[0];
  if (abs.absorbedActorStatus !== 'absorbed' || abs.absorbedIndependentActorAvailable !== false) {
    issues.push({
      phase: 3,
      type: "absorption-isolation-broken",
      severity: "critical",
      message: "Combatiente absorbido no tiene los flags correctos de aislamiento",
      suggestedFix: "Asegurar que createAbsorptionState configure absorbedActorStatus: 'absorbed'"
    });
  } else if (!simResult4.integrityReport?.isValid) {
    issues.push({
      phase: 3,
      type: "integrity-rule16-violation",
      severity: "critical",
      message: "Fallo en integridad de simulación con Absorción: " + JSON.stringify(simResult4.integrityReport.violations),
      suggestedFix: "Corregir aislamiento de entidad absorbida en combatLog"
    });
  } else {
    oracleEventsValidated++;
  }
}

// Test Suite 5: Canonical Technique & Saga Restriction Advisory (Rule 17)
testRuns++;
const fakeCombatLog = [
  { turn: 1, actorId: 'goku-z', technique: 'kaio-ken x20', currentForm: 'ssj3' },
  { turn: 2, actorId: 'yamcha', technique: 'shunkan-ido', currentForm: 'base' }
];

const testValidation = validateSimulationIntegrity({
  snapshot: snapshot1,
  combatLog: fakeCombatLog,
  verdict: simResult1.verdict
});

const hasKaiokenWarning = (testValidation.warnings || []).some(w => w.rule === 17 && w.message.includes('Kaiō-ken'));
const hasShunkanWarning = (testValidation.warnings || []).some(w => w.rule === 17 && w.message.includes('Shunkan Idō'));

if (!hasKaiokenWarning || !hasShunkanWarning) {
  issues.push({
    phase: 3,
    type: "technique-restrictions-not-flagged",
    severity: "medium",
    message: "Rule 17 no detectó Kaiō-ken en SSJ3 o Shunkan Idō no autorizado",
    suggestedFix: "Revisar lógica de Rule 17 en simulationIntegrityValidator.js"
  });
}

// Write report
const report = {
  timestamp: new Date().toISOString(),
  testRuns,
  validSnapshots,
  oracleEventsValidated,
  issuesFound: issues.length,
  issues
};

const reportPath = path.join(rootDir, 'src/data/simulationAuditReport.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log("Auditoría de simulación completada exitosamente.");
console.log(JSON.stringify(report, null, 2));
