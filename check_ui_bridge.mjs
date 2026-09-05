import data from './src/data/characters.js';
const d = data.default || data;
console.log('Keys:', Object.keys(d).slice(0, 15).join(','));
console.log('DEPRECATED len:', d.DEPRECATED_RECORD_IDS ? d.DEPRECATED_RECORD_IDS.length : 'n/d');
console.log('INITIAL tipo:', Array.isArray(d.INITIAL_CHARACTERS) ? 'array len=' + d.INITIAL_CHARACTERS.length : typeof d.INITIAL_CHARACTERS);
console.log('MISSING tact:', (d.MISSING_TACTICAL_PROFILE_IDS || []).length);
if (Array.isArray(d.INITIAL_CHARACTERS)) {
  const samp = d.INITIAL_CHARACTERS[0];
  console.log('sample keys:', Object.keys(samp || {}).slice(0, 30).join(','));
  const ids = ['martian-manhunter', 'wonder-woman', 'scarlet-witch', 'doctor-strange', 'hulk', 'thanos', 'ribrianne-dragon-ball-super-396'];
  for (const id of ids) {
    const found = d.INITIAL_CHARACTERS.find(c => c && c.id === id);
    if (found) {
      const ns = found.numericStats || {};
      console.log('UI', id, '=> apexKi:', ns.apexKi, '| scouterKi:', ns.scouterKi, '| tier:', found.tier || found.baseTier);
    } else {
      console.log('UI', id, '=> NO ENCONTRADO (debe venir del V26)');
    }
  }
}