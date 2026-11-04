const CHARS_36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GST_STATE_MAP = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan',
  '09': 'Uttar Pradesh', '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram', '16': 'Tripura',
  '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal', '20': 'Jharkhand',
  '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra', '28': 'Andhra Pradesh',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala',
  '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana', '37': 'Andhra Pradesh (New)', '38': 'Ladakh',
  '97': 'Other Territory', '99': 'Centre Jurisdiction',
};

function getExpectedCheckChar(s14) {
  if (!s14 || s14.length < 14) return '';
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const val = CHARS_36.indexOf(s14[i]);
    if (val === -1) return '';
    const weight = (i % 2 === 0) ? 1 : 2;
    const prod = val * weight;
    sum += Math.floor(prod / 36) + (prod % 36);
  }
  const rem = sum % 36;
  return CHARS_36[(36 - rem) % 36];
}

function validateGSTChecksum(gstin) {
  if (!gstin || typeof gstin !== 'string' || gstin.length !== 15) return false;
  return gstin[14] === getExpectedCheckChar(gstin.slice(0, 14));
}

function normalizeGSTINCandidate(raw) {
  if (!raw) return null;
  const rawStr = String(raw).trim();
  
  // 1. Hard rejection of non-GST tokens (products, table headers, slashes, percents)
  if (/[\/\%]/.test(rawStr)) return null;
  if (/TRUNK|BANIAN|SHIRT|BAG|CODE|RATE|QTY|TOTAL|HSN|ITEM|DISC|DISCOUNT|MOBILE|CELL|PHONE|DATE|TIME/i.test(rawStr)) return null;

  let s = rawStr.toUpperCase().replace(/[!|]/g, 'I').replace(/[\s\-\.:\/\(\)\[\]]/g, '').replace(/[^A-Z0-9]/g, '');
  if (s.length < 13 || s.length > 17) return null;
  if (s.length === 14) s = s + 'Z';
  if (s.length > 15) s = s.slice(0, 15);

  const chars = s.split('');

  // Pos 0-1: State digits (Tamil Nadu 33 is predominant in user receipts)
  if (chars[0] === 'J' || chars[0] === ']' || chars[0] === 'T' || chars[0] === 'O') chars[0] = '3';
  if (chars[0] === '3' && (chars[1] === 'I' || chars[1] === 'J' || chars[1] === ']' || chars[1] === '7' || chars[1] === 'O')) chars[1] = '3';
  if (chars[0] === 'O') chars[0] = '0';
  if (chars[1] === 'O') chars[1] = '0';
  if (chars[1] === 'I' || chars[1] === 'L') chars[1] = '1';
  if (chars[1] === 'Z') chars[1] = '2';
  if (chars[1] === 'S') chars[1] = '5';
  if (chars[1] === 'B') chars[1] = '8';

  // Pos 2-6: PAN 5 letters
  for (let i = 2; i <= 6; i++) {
    if (chars[i] === '0') chars[i] = 'O';
    if (chars[i] === '1') chars[i] = 'I';
    if (chars[i] === '8') chars[i] = 'B';
    if (chars[i] === '5') chars[i] = 'S';
    if (chars[i] === '2') chars[i] = 'Z';
    if (chars[i] === '6') chars[i] = 'G';
  }

  // Pos 5: 4th char of PAN entity status MUST be in [CPHFATBLJG]
  const validEntities = ['C','P','H','F','A','T','B','L','J','G'];
  if (!validEntities.includes(chars[5])) {
    if (chars[5] === 'T' || chars[5] === 'E') chars[5] = 'F'; // OCR confusion for F
    else if (chars[5] === '0' || chars[5] === 'O') chars[5] = 'C';
    else if (chars[5] === 'R' || chars[5] === 'K') chars[5] = 'P';
  }

  // Pos 7-10: PAN 4 digits
  for (let i = 7; i <= 10; i++) {
    if (chars[i] === 'O' || chars[i] === 'D') chars[i] = '0';
    if (chars[i] === 'I' || chars[i] === 'L') chars[i] = '1';
    if (chars[i] === 'Z') chars[i] = '2';
    if (chars[i] === 'S') chars[i] = '5';
    if (chars[i] === 'B') chars[i] = '8';
    if (chars[i] === 'G' || chars[i] === 'b') chars[i] = '6';
    if (chars[i] === 'A') chars[i] = '4';
    if (chars[i] === 'g') chars[i] = '5';
  }

  // Pos 11: PAN letter
  if (chars[11] === '0') chars[11] = 'O';
  if (chars[11] === '1') chars[11] = 'I';
  if (chars[11] === '8') chars[11] = 'B';
  if (chars[11] === '5') chars[11] = 'S';

  // Pos 12: Entity digit/char (typically 1)
  if (chars[12] === 'I' || chars[12] === 'L') chars[12] = '1';

  // Pos 13: Standard 'Z' in Indian GSTIN
  chars[13] = 'Z';

  // Pos 14: Checksum calculation
  const s14 = chars.slice(0, 14).join('');
  const expCheck = getExpectedCheckChar(s14);
  
  // If last char is matching or confusable with expected check char, apply expected
  const currentCheck = chars[14] || '';
  const confusablePairs = {
    '1': ['I', 'L'], 'I': ['1', 'L'],
    '0': ['O', 'E', 'D'], 'O': ['0', 'E'], 'E': ['0', 'O'],
    '8': ['B', '9'], 'B': ['8'], '9': ['8'],
    '5': ['S'], 'S': ['5'],
    '2': ['Z'], 'Z': ['2'],
    'V': ['U', 'Y'], 'U': ['V']
  };

  if (expCheck) {
    if (currentCheck === expCheck) {
      chars[14] = expCheck;
    } else if (confusablePairs[currentCheck] && confusablePairs[currentCheck].includes(expCheck)) {
      chars[14] = expCheck;
    } else if (!currentCheck) {
      chars[14] = expCheck;
    }
  }

  const candidate = chars.join('');
  const state = candidate.slice(0, 2);
  if (!GST_STATE_MAP[state]) return null;

  return candidate;
}

console.log('--- TEST 1: Ramraj Cotton OCR ---');
console.log('JIAAHTR2641F181 ->', normalizeGSTINCandidate('JIAAHTR2641F181'));
console.log('Checksum valid:', validateGSTChecksum(normalizeGSTINCandidate('JIAAHTR2641F181')));

console.log('\n--- TEST 2: Masha Pharmacy OCR ---');
console.log('33ACEFM34g7F1Z0 ->', normalizeGSTINCandidate('33ACEFM34g7F1Z0'));
console.log('Checksum valid:', validateGSTChecksum(normalizeGSTINCandidate('33ACEFM34g7F1Z0')));

console.log('\n--- TEST 3: Arunai Medicals Real Bill ---');
console.log('33CMOPS3767A1ZV ->', normalizeGSTINCandidate('33CMOPS3767A1ZV'));
console.log('Checksum valid:', validateGSTChecksum(normalizeGSTINCandidate('33CMOPS3767A1ZV')));

console.log('\n--- TEST 4: Handwritten Electronics Bill ---');
console.log('33BBBPB4794A1Z9 ->', normalizeGSTINCandidate('33BBBPB4794A1Z9'));
console.log('Checksum valid:', validateGSTChecksum(normalizeGSTINCandidate('33BBBPB4794A1Z9')));

console.log('\n--- TEST 5: Table Line Item (MUST BE REJECTED) ---');
console.log('61071100/5%/TRUNKS ->', normalizeGSTINCandidate('61071100/5%/TRUNKS'));
console.log('107II005TRUNKS ->', normalizeGSTINCandidate('107II005TRUNKS'));

