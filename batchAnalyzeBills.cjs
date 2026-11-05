const fs = require('fs');
const path = require('path');
const Tesseract = require('./ExpenseTrack1/node_modules/tesseract.js');
const { parseReceiptText } = require('./ExpenseTrack1/billParser');

async function analyzeDirectory(dirName, label) {
  const dirPath = path.join(__dirname, dirName);
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return;
  }
  const files = fs.readdirSync(dirPath).filter(f => /\.(jpe?g|png|jfif|webp)$/i.test(f));
  console.log(`\n======================================================`);
  console.log(`ANALYZING ${label.toUpperCase()} (${files.length} files)`);
  console.log(`======================================================`);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    try {
      console.log(`\n--- Scanning [${label}]: ${file} ---`);
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
        logger: () => {}
      });
      const parsed = parseReceiptText(text, file);
      console.log(`Raw snippet:`, text.replace(/\s+/g, ' ').slice(0, 150));
      console.log(`Merchant: "${parsed.merchant}" | Total: ₹${parsed.total} | GSTIN: ${parsed.gstin || 'None'} | Date: ${parsed.date || 'None'} | Category: ${parsed.category}`);
    } catch (err) {
      console.error(`Error analyzing ${file}:`, err.message);
    }
  }
}

async function run() {
  await analyzeDirectory('handwritten demo bills', 'Handwritten');
  await analyzeDirectory('demo printed bills', 'Printed');
}

run().catch(console.error);
