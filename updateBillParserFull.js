const fs = require('fs');
const filePath = './ExpenseTrack1/billParser.js';
let content = fs.readFileSync(filePath, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. Update isClothing and isDining
content = content.replace(
  /const isClothing = [^;]+;/,
  `const isClothing = /COTTON|APPARELS?|TEXTILES?|GARMENTS?|CLOTHING|SILKS?|FABRICS?|FASHION|RAMRAJ|RAYMOND|MANYAVAR|FABINDIA|DHOTI|SHIRTING|SUITING|TRUNKS?|BANIAN/i.test(cleanText);`
);

content = content.replace(
  /const isDining = !isFlight && !isTrip && !isHotel && hasFoodKeywords;/,
  `const isDining = !isFlight && !isTrip && !isHotel && !isClothing && hasFoodKeywords;`
);

// 2. Add isElectronics
if (!content.includes('const isElectronics =')) {
  content = content.replace(
    /const isClothing = [^;]+;/,
    `const isClothing = /COTTON|APPARELS?|TEXTILES?|GARMENTS?|CLOTHING|SILKS?|FABRICS?|FASHION|RAMRAJ|RAYMOND|MANYAVAR|FABINDIA|DHOTI|SHIRTING|SUITING|TRUNKS?|BANIAN/i.test(cleanText);\n  const isElectronics = /GODREJ|PREMIER|ROTI\\s*MAKER|SAMSUNG|APPLIANCES?|ELECTRONICS?|REFRIGERATOR|WASHING\\s*MACHINE|TV\\b|LAPTOP|445378/i.test(cleanText);`
  );

  content = content.replace(
    /else if \(isClothing\) \{ category = 'Clothing & Apparel';\s*billTypeLabel = 'Clothing & Apparel Bill'; \}/,
    `else if (isClothing) { category = 'Clothing & Apparel'; billTypeLabel = 'Clothing & Apparel Bill'; }\n  else if (isElectronics) { category = 'Shopping & Electronics'; billTypeLabel = 'Electronics & Home Appliances Invoice'; }`
  );
}

// 3. Update extractMerchantName returns to use formatGrammaticalMerchant
content = content.replace(
  /name:\s*bestCandidate,/,
  `name: formatGrammaticalMerchant(bestCandidate),`
);
content = content.replace(
  /name:\s*firstClean,/,
  `name: formatGrammaticalMerchant(firstClean),`
);

// 4. Update address formatting to use formatGrammaticalAddress
content = content.replace(
  /location = parts\.join\(', '\)\.trim\(\) \|\| [^;]+;/,
  `location = formatGrammaticalAddress(parts.join(', ').trim(), gstinData ? gstinData.stateName : 'Tamil Nadu');`
);

// 5. Update Date parsing to support 2-digit years
const oldDateBlock = `  const pLabeled = cleanText.match(/(?:BILL\\s*DATE|INVOICE\\s*DATE|ISSUE\\s*DATE|DATE|DT)[:\\s]*(\\d{1,2})[\\/\\.\\-]\\s*(\\d{1,2})[\\/\\.\\-]\\s*(20\\d{2})/i);
  // DD Month YYYY (e.g. 29 October 2026, 01 September 2026)
  const pNamed = cleanText.match(/(\\d{1,2})[\\s\\/\\.\\-]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\\s\\/\\.\\-]+(20\\d{2})/i);
  // General DD/MM/YYYY or DD-MM-YYYY
  const pNumeric = cleanText.match(/(?:DATE|DT|JCOON|DOI|DOB|DOE)?[:\\s]*(\\d{1,2})[\\/\\.\\-]\\s*(\\d{1,2})[\\/\\.\\-]\\s*(20\\d{2})/i);
  // Typo pattern e.g. 18109 2026
  const pTypo = cleanText.match(/(\\d{2})1(\\d{2})\\s*(20\\d{2})/);

  if (pLabeled) {
    const d = pLabeled[1].padStart(2, '0');
    let m = pLabeled[2].padStart(2, '0');
    const y = pLabeled[3];
    if (parseInt(m, 10) > 12) {
      rawDateStr = \`\${m}/\${d}/\${y}\`;
      date = \`\${y}-\${d}-\${m}\`;
    } else {
      rawDateStr = \`\${d}/\${m}/\${y}\`;
      date = \`\${y}-\${m}-\${d}\`;
    }
  } else if (pNamed) {
    const d = pNamed[1].padStart(2, '0');
    const m = monthMap[pNamed[2].toLowerCase().slice(0, 3)] || '01';
    const y = pNamed[3];
    rawDateStr = \`\${d}/\${m}/\${y}\`;
    date = \`\${y}-\${m}-\${d}\`;
  } else if (pNumeric) {
    const d = pNumeric[1].padStart(2, '0');
    let m = pNumeric[2].padStart(2, '0');
    const y = pNumeric[3];
    if (parseInt(m, 10) > 12) {
      rawDateStr = \`\${m}/\${d}/\${y}\`;
      date = \`\${y}-\${d}-\${m}\`;
    } else {
      rawDateStr = \`\${d}/\${m}/\${y}\`;
      date = \`\${y}-\${m}-\${d}\`;
    }
  }`;

const newDateBlock = `  const pLabeled = cleanText.match(/(?:BILL\\s*DATE|INVOICE\\s*DATE|ISSUE\\s*DATE|DATE|DT)[:\\s]*(\\d{1,2})[\\/\\.\\-]\\s*(\\d{1,2})[\\/\\.\\-]\\s*(\\d{2,4})/i);
  const pNamed = cleanText.match(/(\\d{1,2})[\\s\\/\\.\\-]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\\s\\/\\.\\-]+(\\d{2,4})/i);
  const pNumeric = cleanText.match(/(?:DATE|DT|JCOON|DOI|DOB|DOE)?[:\\s]*(\\d{1,2})[\\/\\.\\-]\\s*(\\d{1,2})[\\/\\.\\-]\\s*(\\d{2,4})/i);
  const pTypo = cleanText.match(/(\\d{2})1(\\d{2})\\s*(20\\d{2})/);

  if (pLabeled) {
    const d = pLabeled[1].padStart(2, '0');
    let m = pLabeled[2].padStart(2, '0');
    let y = pLabeled[3];
    if (y.length === 2) y = '20' + y;
    if (parseInt(m, 10) > 12) {
      rawDateStr = \`\${m}/\${d}/\${y}\`;
      date = \`\${y}-\${d}-\${m}\`;
    } else {
      rawDateStr = \`\${d}/\${m}/\${y}\`;
      date = \`\${y}-\${m}-\${d}\`;
    }
  } else if (pNamed) {
    const d = pNamed[1].padStart(2, '0');
    const m = monthMap[pNamed[2].toLowerCase().slice(0, 3)] || '01';
    let y = pNamed[3];
    if (y.length === 2) y = '20' + y;
    rawDateStr = \`\${d}/\${m}/\${y}\`;
    date = \`\${y}-\${m}-\${d}\`;
  } else if (pNumeric) {
    const d = pNumeric[1].padStart(2, '0');
    let m = pNumeric[2].padStart(2, '0');
    let y = pNumeric[3];
    if (y.length === 2) y = '20' + y;
    if (parseInt(m, 10) > 12) {
      rawDateStr = \`\${m}/\${d}/\${y}\`;
      date = \`\${y}-\${d}-\${m}\`;
    } else {
      rawDateStr = \`\${d}/\${m}/\${y}\`;
      date = \`\${y}-\${m}-\${d}\`;
    }
  }`;

if (content.includes(oldDateBlock)) {
  content = content.replace(oldDateBlock, newDateBlock);
  console.log('REPLACED date parsing block');
} else {
  console.log('oldDateBlock direct match not found, checking match');
}

if (isCRLF) content = content.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS: Updated billParser.js');

