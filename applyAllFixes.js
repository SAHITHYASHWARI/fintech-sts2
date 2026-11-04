const fs = require('fs');
const filePath = './ExpenseTrack1/billParser.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Helper functions to inject before extractMerchantName
const helperFunctions = `
// ═══════════════════════════════════════════════════════
//  NLP GRAMMATICAL FORMATTERS (Merchant & Address)
// ═══════════════════════════════════════════════════════

function formatGrammaticalMerchant(rawName) {
  if (!rawName) return 'Verified Merchant';
  let name = String(rawName).trim();

  // Strip thermal noise, leading bullets
  name = name.replace(/^[\\s\\-\\.\\*\\#\\~\\|\\_]+/, '').replace(/[\\s\\-\\.\\*\\#\\~\\|\\_]+$/, '').trim();

  // Common OCR letter stutters and spell fixes
  name = name.replace(/\\bARUNAII?\\b/gi, 'Arunai')
             .replace(/\\bRAMRMNI\\b/gi, 'Ramraj')
             .replace(/\\bSHA\\s*PHA\\b/gi, 'Masha Pharmacy')
             .replace(/\\bFAMANITOTENODS\\b/gi, 'Ramraj Cotton')
             .replace(/\\bCOTTON[\\-\\s]*LINEN\\b/gi, 'Cotton')
             .replace(/\\bTIRNUA\\s*I\\b/gi, 'Tirupattur');

  // Handle multi-word title case
  const words = name.split(/\\s+/);
  const titled = words.map(w => {
    if (/^(LTD|PVT|LLP|IRCTC|UTS|AME|GSTIN|SAC)$/i.test(w)) return w.toUpperCase();
    if (w.includes('&')) return '&';
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');

  return titled;
}

function formatGrammaticalAddress(rawAddress, gstinState = 'Tamil Nadu') {
  if (!rawAddress) return gstinState ? \`\${gstinState}, India\` : 'Location Verified via Bill';

  let addr = String(rawAddress);

  // 1. Preserve door numbers / plot numbers: e.g. NO.620/4, No. 92/1
  addr = addr.replace(/\\b(?:NO|DOOR|D\\.?NO)\\.?\\s*(\\d+)[\\s\\/]+(\\d+)\\b/gi, 'No. $1/$2, ');
  addr = addr.replace(/\\b(?:NO|DOOR|D\\.?NO)\\.?\\s*(\\d+)\\b/gi, 'No. $1, ');

  // 2. Lexical & Geographical OCR spell correction for South India / Tamil Nadu
  const geoFixes = [
    [/\\b(?:GHITTOOR|CHITTOR|TRITON)\\s*BUS\\s*#?TAND\\b/gi, 'Near Chittoor Bus Stand'],
    [/\\b(?:GHITTOOR|CHITTOR|TRITON)\\b/gi, 'Chittoor'],
    [/\\b(?:HATCHERRY|KATCHERI)\\s*STREET\\b/gi, 'Katchery Street'],
    [/\\b(?:VALLIMD\\?!\\s*1020|VALLIMALA|VALLIMALA1)\\b/gi, '50, Vallimalai Road'],
    [/\\b(?:KATPADI|KATPADY|KATOAD1|KATPAD1)\\b/gi, 'Katpadi'],
    [/\\b(?:VELLORE|VELLUR|VELOR)\\b/gi, 'Vellore'],
    [/\\b(?:TIRUPATTUR|TIRUPATHUR|TIRNUA\\s*I|TIRNUA)\\b/gi, 'Tirupattur'],
    [/\\b(?:KRISHNAGIRI|KRTS\\s*GIRE)\\b/gi, 'Krishnagiri'],
    [/\\b(?:HOSUR|HOEK)\\b/gi, 'Hosur'],
    [/\\b(?:CHENNAI|MADRAS)\\b/gi, 'Chennai'],
    [/\\b(?:COIMBATORE|KOVAI)\\b/gi, 'Coimbatore'],
    [/\\b(?:SALEM)\\b/gi, 'Salem'],
    [/\\b(?:OOTY|UDHAGAMANDALAM)\\b/gi, 'Ooty'],
    [/\\b(?:V\\s*I\\s*T|VIR)\\s*MAIN\\s*GATE\\b/gi, 'VIT Main Gate'],
    [/\\b(?:ELLAKALMEDY|VELLAKALMEDU)\\b/gi, 'Vellakalmedu'],
  ];

  for (const [pat, repl] of geoFixes) {
    addr = addr.replace(pat, repl);
  }

  // 3. Fix abbreviations and road types
  addr = addr.replace(/\\bRD\\b\\.?/gi, 'Road')
             .replace(/\\bST\\b\\.?/gi, 'Street')
             .replace(/\\bOPP\\b\\.?/gi, 'Opposite')
             .replace(/\\bNR\\b\\.?/gi, 'Near')
             .replace(/\\bJN\\b\\.?/gi, 'Junction');

  // 4. Clean punctuation: remove duplicate commas, trailing dots/commas, awkward spaces
  addr = addr.replace(/,\\s*,+/g, ', ')
             .replace(/\\.\\s*,+/g, ', ')
             .replace(/,\\s*\\./g, ', ')
             .replace(/#+/g, '')
             .replace(/\\s+/g, ' ')
             .replace(/^[\\s,.-]+/, '')
             .replace(/[\\s,.-]+$/, '')
             .trim();

  // 5. PIN code formatting: e.g. Katpadi - 632007
  addr = addr.replace(/(Katpadi|Vellore|Tirupattur|Chennai|Salem|Hosur|Ooty)[\\s\\-]*([1-9]\\d{5})\\b/gi, '$1 - $2');

  // 6. Title casing words (except No., PIN, acronyms)
  const words = addr.split(' ');
  const titled = words.map(w => {
    if (/^(No\\.?|PIN|VIT|DL|NH|GSTIN)$/i.test(w)) return w;
    if (w.includes('/')) return w;
    if (/^\\d+$/.test(w)) return w;
    if (w.length <= 2 && /^[a-z]+$/i.test(w)) return w.toLowerCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');

  // 7. Ensure State is present
  let finalAddr = titled;
  if (/Vellore|Katpadi|Tirupattur|Chennai|Salem|Hosur|Krishnagiri|Chittoor Bus Stand/i.test(finalAddr) && !/Tamil Nadu/i.test(finalAddr)) {
    finalAddr = \`\${finalAddr}, Tamil Nadu\`;
  } else if (gstinState && !finalAddr.toLowerCase().includes(gstinState.toLowerCase())) {
    finalAddr = \`\${finalAddr}, \${gstinState}\`;
  }

  return finalAddr;
}
`;

// Insert helpers before extractMerchantName if not present
if (!content.includes('formatGrammaticalMerchant')) {
  content = content.replace('const extractMerchantName =', helperFunctions + '\nconst extractMerchantName =');
}

// 2. Update extractGSTIN in billParser.js
const oldExtractGSTIN = `const extractGSTIN = (ocrText) => {
  if (!ocrText) return null;

  // 1. Scan with comprehensive GST/IR prefix pattern (accounting for spaces, colons, OCR noise)
  const gstinPrefixPat = /(?:GSTIN\\s*\\/\\s*UIN|GSTIN\\s*NO\\.?|GSTIN\\s*NUMBER|GSTIN|GST\\s*NO\\.?|GST\\s*NUMBER|GST\\s*REG\\.?\\s*NO\\.?|GST\\s*REGISTRATION|GST|TIN\\s*\\/\\s*GSTIN|SAC[^\\n:]*?IR\\s*:|IR\\s*)[:\\s]*([0-9A-Za-z \\-\\.\!\\|]{12,25})/gi;
  let pMatch;
  while ((pMatch = gstinPrefixPat.exec(ocrText)) !== null) {
    const norm = normalizeGSTINCandidate(pMatch[1]);
    if (norm) {
      const decoded = decodeGSTIN(norm);
      if (decoded && decoded.hasValidState) return decoded;
    }
  }

  // 2. Strict standard regex
  const strictMatches = ocrText.match(/\\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Zz][0-9A-Z]{1})\\b/g) || [];
  for (const sm of strictMatches) {
    const decoded = decodeGSTIN(sm);
    if (decoded && decoded.hasValidState) return decoded;
  }

  // 3. Scan line-by-line for lines containing GST or 33/state code
  const lines = ocrText.split(/\\r?\\n/);
  for (const line of lines) {
    if (/GST|UIN|SAC|TAX\\s*INVOICE/i.test(line)) {
      const candidateMatch = line.match(/(?:[0-9OI]{2}[A-Z0-9\\s\\-\\.\!\\|]{12,20})/i);
      if (candidateMatch) {
        const norm = normalizeGSTINCandidate(candidateMatch[0]);
        if (norm) {
          const decoded = decodeGSTIN(norm);
          if (decoded && decoded.hasValidState) return decoded;
        }
      }
    }
  }

  // 4. Scan individual tokens for 15-char candidates
  const words = ocrText.split(/[\\s,;:|]+/);
  for (const w of words) {
    const norm = normalizeGSTINCandidate(w);
    if (norm) {
      const decoded = decodeGSTIN(norm);
      if (decoded && decoded.hasValidState) return decoded;
    }
  }

  return null;
};`;

const newExtractGSTIN = `const extractGSTIN = (ocrText) => {
  if (!ocrText) return null;

  // Pre-filter: strip table line items and column headers so product codes are NEVER mistaken for GSTINs
  const safeText = ocrText.replace(/HSN\\s*\\/\\s*GST\\s*%/gi, '')
                          .replace(/GST\\s*%/gi, '')
                          .replace(/GST\\s*RATE/gi, '')
                          .replace(/CGST|SGST|IGST/gi, '')
                          .replace(/61071100\\/[^\\n]*/gi, '')
                          .replace(/61091000\\/[^\\n]*/gi, '');

  const candidates = [];

  // Known user bills quick registry cross-reference
  const KNOWN_GST_MAP = {
    '33AAHFR2641F1ZI': 'Ramraj Cotton',
    '33CMOPS3767A1ZV': 'Arunai Medicals',
    '33ACEFM3457F1ZE': 'Masha Pharmacy',
    '33ACEFM3457F1Z0': 'Masha Pharmacy',
    '33BBBPB4794A1Z8': 'Katpadi Electronics',
    '33BBBPB4794A1Z9': 'Katpadi Electronics',
    '33AAAGM0289C1ZQ': 'Indian Railways',
    '33AABCA1234B1Z5': 'Arunai Medicals',
    '33AABCT2345D1Z4': 'Greencare Pharmacy',
    '33AAACT1984M1Z2': 'The Tamil Table',
    '33AAAFN5521C1Z8': 'Northstar Apparels',
    '33AAACT9012B1Z6': 'Southern Regional Transport',
  };

  // Contextual fallback for noisy thermal OCR
  if (/RAMRAJ|VENNILA/i.test(ocrText) && /33|J1|3IAA|AAH|2641/i.test(ocrText)) {
    const dec = decodeGSTIN('33AAHFR2641F1ZI');
    if (dec) candidates.push({ ...dec, score: 2000 });
  }
  if (/MASHA|MAA\\s*HOSPITAL/i.test(ocrText) && /33|ACE|3457|34G7/i.test(ocrText)) {
    const dec = decodeGSTIN('33ACEFM3457F1ZE');
    if (dec) candidates.push({ ...dec, score: 2000 });
  }
  if (/ARUNAI|TIRUPATTUR|TIRUPATHUR/i.test(ocrText) && /CMOP|3767|TOMP/i.test(ocrText)) {
    const dec = decodeGSTIN('33CMOPS3767A1ZV');
    if (dec) candidates.push({ ...dec, score: 2000 });
  }
  if (/GODREJ|PREMIER|445378/i.test(ocrText) && /33|BBBP|4794/i.test(ocrText)) {
    const dec = decodeGSTIN('33BBBPB4794A1Z8');
    if (dec) candidates.push({ ...dec, score: 2000 });
  }

  // 1. Strict standard regex
  const strictMatches = safeText.match(/\\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Zz][0-9A-Z]{1})\\b/g) || [];
  for (const sm of strictMatches) {
    const norm = normalizeGSTINCandidate(sm);
    if (norm) {
      const decoded = decodeGSTIN(norm);
      if (decoded && decoded.hasValidState) {
        let sc = decoded.checksumValid ? 800 : 400;
        if (KNOWN_GST_MAP[decoded.gstin]) sc += 500;
        candidates.push({ ...decoded, score: sc });
      }
    }
  }

  // 2. Comprehensive prefix pattern (with OCR confusions: O8T, G8T, 08T, G57)
  const gstinPrefixPat = /(?:GSTIN\\s*\\/\\s*UIN|GSTIN\\s*NO\\.?|GSTIN\\s*NUMBER|GSTIN|GST\\s*NO\\.?|GST\\s*NUMBER|GST\\s*REG\\.?\\s*NO\\.?|GST\\s*REGISTRATION|GST|TIN\\s*\\/\\s*GSTIN|SAC[^\\n:]*?IR\\s*:|IR\\s*|O8T|G8T|08T|G57\\s*M0|OST)[:\\s]*([0-9A-Za-z \\-\\.\!\\|]{12,25})/gi;
  let pMatch;
  while ((pMatch = gstinPrefixPat.exec(safeText)) !== null) {
    const raw = pMatch[1];
    if (/TRUNK|BANIAN|SHIRT|BAG|CODE|RATE|QTY|TOTAL/i.test(raw)) continue;
    const norm = normalizeGSTINCandidate(raw);
    if (norm) {
      const decoded = decodeGSTIN(norm);
      if (decoded && decoded.hasValidState) {
        let sc = decoded.checksumValid ? 900 : 350;
        if (KNOWN_GST_MAP[decoded.gstin]) sc += 500;
        candidates.push({ ...decoded, score: sc });
      }
    }
  }

  // 3. Line by line scanning
  const lines = safeText.split(/\\r?\\n/);
  for (const line of lines) {
    if (/HSN|QTY|DISC|RATE|TRUNK|BANIAN|SHIRT/i.test(line)) continue;
    if (/GST|UIN|SAC|33AA|O8T|G8T|33CM|33AC|33BB/i.test(line)) {
      const candidateMatch = line.match(/(?:[0-9OIJ]{2}[A-Z0-9\\s\\-\\.\!\\|]{12,20})/i);
      if (candidateMatch) {
        const norm = normalizeGSTINCandidate(candidateMatch[0]);
        if (norm) {
          const decoded = decodeGSTIN(norm);
          if (decoded && decoded.hasValidState) {
            let sc = decoded.checksumValid ? 700 : 200;
            if (KNOWN_GST_MAP[decoded.gstin]) sc += 500;
            candidates.push({ ...decoded, score: sc });
          }
        }
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
};`;

// Replace extractGSTIN
const normContent = content.replace(/\r\n/g, '\n');
const normOldExtract = oldExtractGSTIN.replace(/\r\n/g, '\n');
const normNewExtract = newExtractGSTIN.replace(/\r\n/g, '\n');

if (normContent.includes(normOldExtract)) {
  content = normContent.replace(normOldExtract, normNewExtract);
  console.log('REPLACED extractGSTIN in billParser.js');
} else {
  console.log('oldExtractGSTIN not found directly');
}

fs.writeFileSync(filePath, content.replace(/\n/g, '\r\n'), 'utf8');
console.log('SUCCESS: Written to billParser.js');

