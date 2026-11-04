const {
  validateGSTChecksum,
  normalizeGSTINCandidate,
  decodeGSTINStructure,
  GST_STATE_MAP
} = require('./ExpenseTrack1/gstService');

console.log('--- TESTING 2-DIGIT YEAR EXPANSION ---');
function parseDateUniversal(cleanText) {
  const monthMap = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
  
  // DD Month YYYY (e.g. 29 October 2026)
  const pNamed = cleanText.match(/(\d{1,2})[\s\/\.\-]+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\/\.\-]+(\d{2,4})/i);
  if (pNamed) {
    const d = pNamed[1].padStart(2, '0');
    const m = monthMap[pNamed[2].toLowerCase().slice(0, 3)] || '01';
    let y = pNamed[3];
    if (y.length === 2) y = '20' + y;
    return { rawDateStr: `${d}/${m}/${y}`, date: `${y}-${m}-${d}` };
  }

  // Specifically labeled Date: e.g. Date : 01/11/26 or BillDate : 05/01/2026
  const pLabeled = cleanText.match(/(?:BILL\s*DATE|INVOICE\s*DATE|ISSUE\s*DATE|DATE|DT|JCOON)[:\s]*(\d{1,2})[\/\.\-]\s*(\d{1,2})[\/\.\-]\s*(\d{2,4})/i);
  if (pLabeled) {
    const d = pLabeled[1].padStart(2, '0');
    let m = pLabeled[2].padStart(2, '0');
    let y = pLabeled[3];
    if (y.length === 2) y = '20' + y;
    if (parseInt(m, 10) > 12) {
      return { rawDateStr: `${m}/${d}/${y}`, date: `${y}-${d}-${m}` };
    }
    return { rawDateStr: `${d}/${m}/${y}`, date: `${y}-${m}-${d}` };
  }

  // Numeric date DD/MM/YY or DD/MM/YYYY
  const pNum = cleanText.match(/\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})\b/);
  if (pNum) {
    const d = pNum[1].padStart(2, '0');
    let m = pNum[2].padStart(2, '0');
    let y = pNum[3];
    if (y.length === 2) y = '20' + y;
    return { rawDateStr: `${d}/${m}/${y}`, date: `${y}-${m}-${d}` };
  }

  return { rawDateStr: 'Pending Verification', date: new Date().toISOString().split('T')[0] };
}

console.log('Ramraj Date (01/11/26):', parseDateUniversal('Date : 01/11/26'));
console.log('Handwritten Date (08/10/25):', parseDateUniversal('DATE: 08/10/25'));
console.log('Masha Pharmacy (15/08/2026):', parseDateUniversal('Date: 15/08/2026 20:10'));
console.log('Arunai Medicals (05/01/2026):', parseDateUniversal('BillDate : 05/01/2026'));
console.log('Katpadi Kitchen (29 October 2026):', parseDateUniversal('29 October 2026 03:01 pM'));

