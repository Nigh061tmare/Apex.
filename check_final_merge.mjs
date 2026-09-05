import { INITIAL_CHARACTERS } from './src/data/characters.js';
const ids = ['martian-manhunter','wonder-woman','zen-buu-dbm-u4','bardock-superviviente-brokoly',
             'xxi-hechicero-dbm-u5','dr-raichi-dbm-u3','pan-ssj-dbm-u16','ribrianne-dragon-ball-super-396',
             'androide-13-base-pel-culas-dbz-toei-646','arqua-torneo-del-otro-mundo-715',
             'maraikoh-torneo-del-otro-mundo-620','mijorin-torneo-del-otro-mundo-618',
             'olibu-torneo-del-otro-mundo-109','scarlet-witch','doctor-strange','hulk','thanos'];
for (const id of ids) {
  const c = INITIAL_CHARACTERS.find(x => x.id === id);
  if (!c) { console.log(id, 'NO ENCONTRADO'); continue; }
  const ns = c.numericStats || {};
  const f0 = (c.forms || [])[0] || {};
  const source = ns.apexKi !== undefined ? 'numericStats' : (c.baseKiNumeric !== undefined ? 'baseKiNumeric' : 'NINGUNO');
  console.log([
    id.padEnd(42),
    'tierUI:', (c.tier || '').padEnd(6),
    'baseKi:', String(c.baseKiNumeric).padEnd(20),
    'ns.apexKi:', ns.apexKi !== undefined ? ns.apexKi : '—',
    'form0.ki:', f0.kiNumeric !== undefined ? f0.kiNumeric : '—',
    '=> FUENTE:', source
  ].join(' '));
}