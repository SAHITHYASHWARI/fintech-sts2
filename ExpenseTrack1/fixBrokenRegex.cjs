const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'billParser.js');
const buf = fs.readFileSync(filePath, 'utf8');

const lines = buf.split('\n');

// Line 473 (0-indexed: 472) contains the broken regex
// Exact content from scan: "                   cleanText.match(/(?(RPEGG1G6)\b/i);"
// The \b is an actual backspace char (0x08), not the two chars \ and b
const idx = 472; // 0-indexed
const oldLine = lines[idx];
console.log('Old line:', JSON.stringify(oldLine));

const newLine = `                   cleanText.match(/\\bCXRPEGG1G6\\b/i);`;
lines[idx] = newLine;
console.log('New line:', JSON.stringify(newLine));

const result = lines.join('\n');
fs.writeFileSync(filePath, result, 'utf8');
console.log('Saved. Verifying syntax...');
