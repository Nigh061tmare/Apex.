import { INITIAL_CHARACTERS } from './src/data/characters.js';
let withSourceKi = 0, withoutSourceKi = 0, mismatchNoSrc = 0;
const critical = [];
for (const c of INITIAL_CHARACTERS) {
  const ns = c.numericStats;
  const bk = c.baseKiNumeric;
  const hasSrc = c.sourceKi !== null && c.sourceKi !== undefined;
  if (hasSrc) withSourceKi++;
  else withoutSourceKi++;
  if (ns && ns.apexKi !== undefined && bk !== undefined && Math.abs(bk / ns.apexKi - 1) > 0.001) {
    if (!hasSrc) {
      mismatchNoSrc++;
      if (critical.length < 40) critical.push([c.id, ns.apexKi, bk, (bk / ns.apexKi).toFixed(3), c.tier]);
    }
  }
}
console.log('Con sourceKi:', withSourceKi, '| Sin sourceKi:', withoutSourceKi);
console.log('Discrepancia numericStats vs baseKi SIN sourceKi (impacto real en motor):', mismatchNoSrc);
for (const s of critical) console.log('  ', s[0].padEnd(42), 'ns=', String(s[1]).padEnd(18), 'baseKi=', String(s[2]).padEnd(18), 'ratio', s[3], 'tier', s[4]);