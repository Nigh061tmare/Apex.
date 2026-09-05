import { INITIAL_CHARACTERS } from './src/data/characters.js';
const targetIds = ['martian-manhunter','wonder-woman','zen-buu-dbm-u4','bardock-superviviente-brokoly',
  'xxi-hechicero-dbm-u5','dr-raichi-dbm-u3','pan-ssj-dbm-u16','ribrianne-dragon-ball-super-396',
  'androide-13-base-pel-culas-dbz-toei-646','arqua-torneo-del-otro-mundo-715',
  'maraikoh-torneo-del-otro-mundo-620','mijorin-torneo-del-otro-mundo-618',
  'olibu-torneo-del-otro-mundo-109','scarlet-witch','doctor-strange','hulk','thanos'];
let badBurst = 0, badDura = 0;
for (const c of INITIAL_CHARACTERS) {
  const ns = c.numericStats;
  if (!ns || ns.apexKi === undefined) continue;
  const br = ns.burstKi / ns.apexKi;
  if (ns.durabilityKi !== ns.apexKi) badDura++;
  if (br < 1 || br > 2.5) badBurst++;
}
console.log('ratio burst/apex fuera de [1,2.5]:', badBurst, '| durability!=apex:', badDura);
const byId = new Map(INITIAL_CHARACTERS.map(c => [c.id, c]));
for (const t of targetIds) {
  const c = byId.get(t);
  if (!c) { console.log('  ', t.padEnd(44), 'NO ENCONTRADO'); continue; }
  const ns = c.numericStats;
  console.log('  ', t.padEnd(44),
    'apex=', String(ns?.apexKi ?? 'N/A').padEnd(18),
    'burst=', String(ns?.burstKi ?? 'N/A').padEnd(18),
    'dura=', String(ns?.durabilityKi ?? 'N/A').padEnd(18),
    'tier=', c.tier);
}