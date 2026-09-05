import fs from 'fs';

const content = fs.readFileSync('src/data/characters.js', 'utf8');

// Test different regex patterns
const patterns = [
  /id:\s*[\r\n]*\s*["'][^"']+["']/g,
  /"id":\s*[\r\n]*\s*["'][^"']+["']/g,
  /"id"\s*:\s*[\r\n]*\s*["'][^"']+["']/g,
];

for (const pattern of patterns) {
  const matches = content.match(pattern);
  console.log('Pattern:', pattern.toString());
  console.log('Matches:', matches ? matches.length : 0);
  if (matches) {
    console.log('First:', matches[0].substring(0, 80));
  }
  console.log('---');
}