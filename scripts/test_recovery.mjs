import { calculateGSTINCheckDigit, validateGSTINChecksum, normalizeAndCorrectGSTIN } from '../ExpenseTrack/src/lib/multiPassOcrEngine.js';

console.log('Testing GSTIN recovery on real OCR outputs:');

const testCases = [
  '33CMOPS3767A1ZV', // pristine
  '330MOPS3767A1ZY', // O vs C and Y vs V
  'T3OMOFSE/67AI2V', // T3 vs 33, F vs P
  'SSOMFSTI&7AIZY',  // SS vs 33
  '33AADCM5146R1Z2', // Redbus
  '29AABCS8780M1ZP', // Hotel Anand Regency
];

for (const t of testCases) {
  const res = normalizeAndCorrectGSTIN(t);
  console.log(`Input: "${t}" -> Output: "${res.gstin}" (Valid: ${res.isValid}, Confidence: ${res.confidence})`);
}

