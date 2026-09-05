import fs from 'fs';

const content = fs.readFileSync('src/data/characters.js', 'utf8');
const charMatches = content.match(/id:\s*[\r\n]*\s*["'][^"']+["']/g);
console.log('Matches found:', charMatches ? charMatches.length : 0);
if (charMatches) {
  console.log('First 5:', charMatches.slice(0, 5));
}