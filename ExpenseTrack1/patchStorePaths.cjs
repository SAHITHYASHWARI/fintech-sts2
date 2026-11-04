// patch-store-paths.cjs
const fs = require('fs');
const filePath = require('path').join(__dirname, 'server.js');
let src = fs.readFileSync(filePath, 'utf8');

const target = "const SEGREGATION_STORE_PATH = path.join(DATA_DIR, 'segregation_store.json');";
const replacement = `const SEGREGATION_STORE_PATH = path.join(DATA_DIR, 'segregation_store.json');
const PAYMENTS_HISTORY_PATH = path.join(DATA_DIR, 'payments_history.json');
const DUPLICATE_HASHES_PATH = path.join(DATA_DIR, 'duplicate_hashes.json');`;

if (src.includes(target)) {
  src = src.replace(target, replacement);
  fs.writeFileSync(filePath, src, 'utf8');
  console.log('Store paths added ✅');
} else {
  console.log('Pattern not found');
}
