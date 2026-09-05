const fs = require('fs');

const CHARACTERS_FILE = 'src/data/characters.js';
const content = fs.readFileSync(CHARACTERS_FILE, 'utf8');
const charMatches = content.match(/id:\s*["'][^"']+["']/g);
console.log('Matches found:', charMatches ? charMatches.length : 0);
if (charMatches) {
  console.log('First 5:', charMatches.slice(0, 5));
}