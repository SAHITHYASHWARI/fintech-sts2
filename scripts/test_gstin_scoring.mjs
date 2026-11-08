const MOD36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GST_STATE_MAP = {
  '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
  '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
  '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa',
  '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry', '36': 'Telangana',
  '37': 'Andhra Pradesh', '38': 'Ladakh', '97': 'Other Territory', '99': 'Centre Jurisdiction',
};

function calculateGSTINCheckDigit(clean14) {
  if (!clean14 || clean14.length < 14) return '';
  let factor = 1, sum = 0;
  for (let i = 0; i < 14; i++) {
    const cp = MOD36.indexOf(clean14.charAt(i));
    if (cp === -1) return '';
    let digit = factor * cp;
    factor = factor === 2 ? 1 : 2;
    digit = Math.floor(digit / 36) + (digit % 36);
    sum += digit;
  }
  return MOD36.charAt((36 - (sum % 36)) % 36);
}

function validateGSTINChecksum(gstin) {
  if (!gstin || gstin.length !== 15) return false;
  return gstin[14] === calculateGSTINCheckDigit(gstin.slice(0, 14));
}

const CONFUSABLES = {
  'V': ['Y', 'U', 'W'],
  'Y': ['V'],
  '8': ['B', '9'],
  'B': ['8'],
  '0': ['O', 'D', 'Q'],
  'O': ['0', 'C'],
  'C': ['0', 'O', 'G'],
  '1': ['I', 'L', 'T'],
  'I': ['1', 'L', 'T'],
  '5': ['S'],
  'S': ['5', '3'],
  '2': ['Z'],
  'Z': ['2'],
};

function normalizeAndCorrectGSTIN(raw) {
  if (!raw) return { gstin: '', isValid: false, original: '', confidence: 0 };
  let s = String(raw).toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (s.length < 13) return { gstin: '', isValid: false, original: raw, confidence: 0 };
  if (s.length === 14) {
    // If missing 15th check digit
    s = s + 'Z';
  }
  if (s.length > 15) s = s.slice(0, 15);

  const rawChars = s.split('');
  const chars = [...rawChars];

  // 1. State code (chars 0, 1)
  if (chars[0] === 'T' || chars[0] === 'S') chars[0] = '3';
  if (chars[1] === 'S' || chars[1] === 'T') chars[1] = '3';
  if (chars[0] === 'O' || chars[0] === 'D') chars[0] = '0';
  if (chars[1] === 'O' || chars[1] === 'D') chars[1] = '0';
  if (chars[0] === 'I' || chars[0] === 'L') chars[0] = '1';
  if (chars[1] === 'I' || chars[1] === 'L') chars[1] = '1';
  if (chars[0] === 'Z') chars[0] = '2';
  if (chars[1] === 'Z') chars[1] = '2';

  // 2. PAN Letters (chars 2 to 6)
  for (let i = 2; i <= 6; i++) {
    if (chars[i] === '0') chars[i] = 'O';
    if (chars[i] === '1') chars[i] = 'I';
    if (chars[i] === '5') chars[i] = 'S';
    if (chars[i] === '8') chars[i] = 'B';
    if (chars[i] === '2') chars[i] = 'Z';
  }

  // 3. PAN 4 Digits (chars 7 to 10)
  for (let i = 7; i <= 10; i++) {
    if (['O', 'D', 'Q'].includes(chars[i])) chars[i] = '0';
    if (['I', 'L', 'T'].includes(chars[i])) chars[i] = '1';
    if (chars[i] === 'Z') chars[i] = '2';
    if (chars[i] === 'S') chars[i] = '5';
    if (chars[i] === 'B') chars[i] = '8';
  }

  // 4. PAN 10th Letter (char 11)
  if (chars[11] === '0') chars[11] = 'O';
  if (chars[11] === '4') chars[11] = 'A';

  // 5. Entity Number (char 12)
  if (chars[12] === 'I' || chars[12] === 'L') chars[12] = '1';
  if (chars[12] === 'O') chars[12] = '0';

  // 6. Default Z (char 13)
  chars[13] = 'Z';

  // Test candidate variations for pos 2 (C vs O) and pos 5 (P vs F)
  const pos2Opts = (chars[2] === 'O' || chars[2] === '0' || chars[2] === 'C') ? ['C', 'O'] : [chars[2]];
  const pos5Opts = (chars[5] === 'F' || chars[5] === 'P') ? ['P', 'F'] : [chars[5]];
  const origCheck = rawChars[14] || '';

  const evaluated = [];

  for (const p2 of pos2Opts) {
    for (const p5 of pos5Opts) {
      const cand = [...chars];
      cand[2] = p2;
      cand[5] = p5;
      const c14 = cand.slice(0, 14).join('');
      const calculatedCheck = calculateGSTINCheckDigit(c14);
      if (!calculatedCheck) continue;

      const fullCandidate = c14 + calculatedCheck;
      const stateCode = fullCandidate.slice(0, 2);
      const isStateValid = Boolean(GST_STATE_MAP[stateCode]);
      const panStatusChar = fullCandidate[5]; // P, C, F, H, etc.
      const isPanStatusValid = ['P', 'C', 'F', 'H', 'A', 'T', 'B', 'L', 'J', 'G'].includes(panStatusChar);

      let score = 0;
      if (isStateValid) score += 40;
      if (isPanStatusValid) score += 30;

      if (origCheck === calculatedCheck) {
        score += 50; // Exact check digit match!
      } else if (CONFUSABLES[calculatedCheck] && CONFUSABLES[calculatedCheck].includes(origCheck)) {
        score += 45; // Visual OCR confusion match (e.g. V vs Y)!
      } else if (CONFUSABLES[origCheck] && CONFUSABLES[origCheck].includes(calculatedCheck)) {
        score += 45;
      }

      evaluated.push({
        gstin: fullCandidate,
        score,
        isValid: isStateValid && validateGSTINChecksum(fullCandidate),
        calculatedCheck,
      });
    }
  }

  evaluated.sort((a, b) => b.score - a.score);

  if (evaluated.length > 0 && evaluated[0].isValid) {
    const best = evaluated[0];
    return {
      gstin: best.gstin,
      isValid: true,
      original: raw,
      confidence: Math.min(99, best.score),
    };
  }

  // Fallback candidate
  const fallback = chars.slice(0, 14).join('') + (calculateGSTINCheckDigit(chars.slice(0, 14).join('')) || chars[14] || '1');
  const sc = fallback.slice(0, 2);
  return {
    gstin: fallback,
    isValid: Boolean(GST_STATE_MAP[sc]) && validateGSTINChecksum(fallback),
    original: raw,
    confidence: Boolean(GST_STATE_MAP[sc]) ? 70 : 40,
  };
}

const testCases = [
  '33CMOPS3767A1ZV', // pristine
  '330MOPS3767A1ZY', // O vs C and Y vs V
  'T3OMOFSE/67AI2V', // T3 vs 33, F vs P
  'SSOMFSTI&7AIZY',  // SS vs 33
  '33AADCM5146R1Z2', // Redbus
  '29AABCS8780M1ZP', // Hotel Anand Regency
  '33AAHFR2641F1ZI', // Ramraj
];

console.log('--- RECOVERY RESULTS ---');
for (const t of testCases) {
  const r = normalizeAndCorrectGSTIN(t);
  console.log(`"${t}" => "${r.gstin}" (Valid: ${r.isValid}, Conf: ${r.confidence}%)`);
}

