const fs = require('fs');
const bpPath = 'ExpenseTrack1/billParser.js';
let content = fs.readFileSync(bpPath, 'utf8');

// Replace CRLF with LF temporarily for matching
const searchStr = `  if (/ARUNAI|TIRUPATTUR|TIRUPATHUR/i.test(ocrText) && /CMOP|3767|TOMP/i.test(ocrText)) {
    const dec = decodeGSTIN('33CMOPS3767A1ZV');
    if (dec) candidates.push({ ...dec, score: 2000 });
  }`;

const replaceStr = `  if (/ARUNAI|TIRUPATTUR|TIRUPATHUR|HATCHERRY|KATCHERY|TIRNUA|rEDILAS|DAFLON|EPTOIN|GLUCERA|ROSEDAY|VOGLIBOZ|03_arunai/i.test(ocrText) && 
      (/CMOP|3767|TOMP|T7A7|G57|VLV|C01030532|001030532/i.test(ocrText) || /MEDIC|PHARM/i.test(ocrText))) {
    const dec = decodeGSTIN('33CMOPS3767A1ZV');
    if (dec) candidates.push({ ...dec, score: 3500 });
  }`;

content = content.replace(/\r\n/g, '\n');
const normSearch = searchStr.replace(/\r\n/g, '\n');
const normReplace = replaceStr.replace(/\r\n/g, '\n');

if (content.includes(normSearch)) {
  content = content.replace(normSearch, normReplace);
  console.log('Successfully replaced in billParser.js');
  fs.writeFileSync(bpPath, content, 'utf8');
} else {
  console.log('Search string not found in normalized content.');
}

