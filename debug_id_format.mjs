import fs from 'fs';

const content = fs.readFileSync('src/data/characters.js', 'utf8');

// Find all lines containing "id"
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"id"')) {
    console.log('Line', i+1, ':', lines[i].substring(0, 100));
    if (i+1 < lines.length) {
      console.log('  Next line:', lines[i+1].substring(0, 100));
    }
    console.log('---');
  }
}