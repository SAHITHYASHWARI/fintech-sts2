const fs = require('fs');
const content = fs.readFileSync('ExpenseTrack1/server.js', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes("app.post('/api/ocr-scan"));
if (idx !== -1) {
  console.log(lines.slice(idx, idx + 70).join('\n'));
} else {
  console.log('ocr-scan not found');
}

