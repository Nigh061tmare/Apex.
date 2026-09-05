import { INITIAL_CHARACTERS } from './src/data/characters.js';
let mis = 0;
let total = 0;
const samples = [];
for (const c of INITIAL_CHARACTERS) {
  total++;
  const ns = c.numericStats;
  const bk = c.baseKiNumeric;
  if (ns && ns.apexKi !== undefined && bk !== undefined) {
    const ratio = bk / ns.apexKi;
    if (Math.abs(ratio - 1) > 0.001) {
      mis++;
      if (samples.length < 25) samples.push([c.id, ns.apexKi, bk, ratio.toFixed(4)]);
    }
  }
}
console.log('Total:', total, '| numericStats.apexKi != baseKiNumeric:', mis);
for (const s of samples) console.log('  ', s[0].padEnd(42), 'ns=', String(s[1]).padEnd(20), 'baseKi=', String(s[2]).padEnd(20), 'ratio', s[3]);