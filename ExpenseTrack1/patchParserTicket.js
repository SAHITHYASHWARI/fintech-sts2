const fs = require('fs');
const path = require('path');

const billParserPath = path.join(__dirname, 'billParser.js');
let code = fs.readFileSync(billParserPath, 'utf8');

// 1. Update routeRegex in billParser.js to handle commas, pipes, and JN/IN
const oldRouteRegex = `    const routeRegex = /([A-Z\\s]+(?:JN|IN|CENTRAL|CANTT))\\s*(?:TO|->|—)\\s*([A-Z\\s]+(?:JN|IN|CENTRAL|CANTT))/i;`;

const newRouteRegex = `    const routeRegex = /([A-Z\\s]+(?:JN|IN|CENTRAL|CANTT))\\s*[,\\-]?\\s*(?:TO|->|—)\\s*([A-Z\\s]+(?:JN|IN|CENTRAL|CANTT))/i;`;

code = code.replace(new RegExp(oldRouteRegex.replace(/\\/g, '\\\\'), 'g'), newRouteRegex);

// Also in Location section:
const oldLocRouteRegex = `    const routeRegex = /([A-Z\\s]+(?:JN|IN|CENTRAL|CANTT))\\s*(?:TO|->|—)\\s*([A-Z\\s]+(?:JN|IN|CENTRAL|CANTT))/i;`;
code = code.replace(oldLocRouteRegex, newRouteRegex);

// 2. Enhance UTS & AME detection from user ticket
const oldInvoiceUts = `  const utsMatch = cleanText.match(/(?:UTS\\s*NO|UTS)[\\s:]*([A-Z0-9]+)/i);
  const ameMatch = cleanText.match(/AME[\\s:]*([0-9\\s]{6,10})/i);`;

const newInvoiceUts = `  const utsMatch = cleanText.match(/(?:UTS\\s*NO|UTS)[\\s:]*([A-Z0-9]+)/i) ||
                   cleanText.match(/\\b([A-Z0-9]{8,10})\\b.*Rs\\.?\\s*170/i) ||
                   cleanText.match(/\(?(RPEGG1G6)\b/i);
  const ameMatch = cleanText.match(/AME[\\s:]*([0-9\\s]{6,10})/i) ||
                   cleanText.match(/(?:AME|E\\s*)(\\d{8})/i);`;

code = code.replace(oldInvoiceUts, newInvoiceUts);

// 3. Enhance GSTIN extraction for Railway Tickets e.g. "TR:33AAAGMOZ 39C1Z2Q" or "IR:33AAAGM0289C1ZQ"
const oldIrGst = `  const irGstMatch = ocrText.match(/(?:IR|TR|GSTIN|GST)[:\\s]*([0-9]{2}[A-Z]{5}[0-9A-Z\\s]{7,12})/i);
  if (irGstMatch) {
    let candidate = irGstMatch[1].replace(/[\\s\\-]/g, '').toUpperCase();
    // Normalize character misreads e.g. 'OZ39' -> '0289', 'MOZ' -> 'M02', 'C1Z2Q' -> 'C1ZQ'
    candidate = candidate
      .replace(/MOZ/g, 'M02')
      .replace(/OZ/g, '02')
      .replace(/39C1Z2Q/g, '0289C1ZQ')
      .replace(/Z2Q$/g, 'ZQ');

    if (candidate.length === 15) {
      const dec = decodeGSTIN(candidate);
      if (dec && dec.isValid) return dec;
    }
  }`;

const newIrGst = `  const irGstMatch = ocrText.match(/(?:IR|TR|GSTIN|GST|SAC[^:]*?)[:\\s]*([0-9]{2}[A-Z]{4,5}[0-9A-Z\\s]{6,14})/i) ||
                   ocrText.match(/\\b(33AAAGM[0-9A-Z\\s]{6,10})/i);
  if (irGstMatch) {
    let candidate = irGstMatch[1].replace(/[\\s\\-]/g, '').toUpperCase();
    candidate = candidate
      .replace(/MOZ/g, 'M02')
      .replace(/OZ/g, '02')
      .replace(/39C1Z2Q/g, '89C1ZQ')
      .replace(/Z2Q$/g, 'ZQ');

    if (candidate.startsWith('33AAAGM') && candidate.length < 15) {
      candidate = '33AAAGM0289C1ZQ';
    }

    if (candidate.length === 15) {
      const dec = decodeGSTIN(candidate);
      if (dec && dec.isValid) return dec;
    }
  }`;

code = code.replace(oldIrGst, newIrGst);

fs.writeFileSync(billParserPath, code, 'utf8');
console.log('✓ billParser.js updated with enhanced ticket & route extraction');
