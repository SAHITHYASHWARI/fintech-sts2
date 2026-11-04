const {
  validateGSTChecksum,
  normalizeGSTINCandidate,
  decodeGSTINStructure,
  GST_STATE_MAP,
  PAN_ENTITY_MAP
} = require('./ExpenseTrack1/gstService');

// Test on noisy OCR text from Ramraj Cotton
const noisyRamrajOcr = `
FARMS’ |.
| |W! FAMANITOTENODS
CXR ECHIERED.
bi SIFY: oe
TRITON BUS #TAND, KATOAD1 632001.
on. epr0aieT_ O8T: JIAAHTR2641F181
Bil No  R220/CCHSTS. Date ONS
Customer Name : MOUNIHWAR
HSN GST %/CATEGORY
Code/ tem Rate Disc Net fate Qty _ Total
61071100/5K/TRUNG
1248 TANGET Wo. 100, Muti cin g
18500 000 18500100 18500
TotalPes: 11.00 Rs. 1050.00
Payment Mod : CREDIT CARD BILL.
`;

console.log('Testing extraction on noisy Ramraj text...');

function extractBestGSTIN(text) {
  if (!text) return null;
  const candidates = [];

  // Ignore noisy sub-patterns
  const clean = text.replace(/HSN\s*\/\s*GST\s*%/gi, '')
                    .replace(/GST\s*%/gi, '')
                    .replace(/GST\s*RATE/gi, '')
                    .replace(/CGST|SGST|IGST/gi, '');

  // 1. Strict regex
  const strictMatches = clean.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z])\b/gi) || [];
  for (const m of strictMatches) {
    const norm = normalizeGSTINCandidate(m);
    if (norm) {
      const dec = decodeGSTINStructure(norm);
      if (dec && dec.hasValidState) {
        candidates.push({ ...dec, score: dec.checksumValid ? 500 : 100, source: 'strict' });
      }
    }
  }

  // 2. Prefix regex (including OCR typos: O8T, G8T, 08T, G57)
  const prefixRegex = /(?:GSTIN|GST\s*NO|GST|UIN|IR|SAC[^\n:]*?IR|O8T|G8T|08T|G57\s*M0|GST\s*REG|TIN)[:\s]*([0-9A-Za-z \-\.!|]{12,25})/gi;
  let pm;
  while ((pm = prefixRegex.exec(clean)) !== null) {
    const raw = pm[1];
    // Reject line item tokens
    if (/TRUNG|TRUNK|BANIAN|SHIRT|BAG|CODE|RATE|QTY|TOTAL/i.test(raw)) continue;
    
    const norm = normalizeGSTINCandidate(raw);
    if (norm) {
      const dec = decodeGSTINStructure(norm);
      if (dec && dec.hasValidState) {
        candidates.push({ ...dec, score: dec.checksumValid ? 600 : 200, source: 'prefix' });
      }
    }
  }

  // 3. Line by line fallback
  const lines = clean.split(/\r?\n/);
  for (const l of lines) {
    if (/HSN|QTY|DISC|RATE|TRUNK|BANIAN/i.test(l)) continue;
    if (/GST|UIN|SAC|33AA|O8T|G8T/i.test(l)) {
      const cm = l.match(/(?:[0-9OIJ]{2}[A-Z0-9\s\-\.!|]{12,20})/i);
      if (cm) {
        const norm = normalizeGSTINCandidate(cm[0]);
        if (norm) {
          const dec = decodeGSTINStructure(norm);
          if (dec && dec.hasValidState) {
            candidates.push({ ...dec, score: dec.checksumValid ? 400 : 50, source: 'line' });
          }
        }
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

const best = extractBestGSTIN(noisyRamrajOcr);
console.log('BEST EXTRACTED GSTIN:', best);

