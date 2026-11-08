import fs from 'fs';
import path from 'path';
import Tesseract from '../ExpenseTrack/node_modules/tesseract.js/src/index.js';
import { extractAllGSTINs, extractStructuredFinancialFields } from '../ExpenseTrack/src/lib/multiPassOcrEngine.js';

async function runBenchmark() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('   STS FINTECH OCR BENCHMARK – REAL DATASET ACCURACY EVALUATION    ');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const testCases = [
    {
      id: 'Arunai Medicals - Bill 1',
      file: './data/bills/clear_pack/05_arunai_medicals_bill_2_clear.jpg',
      expMerchant: 'Arunai Medicals',
      expGSTIN: '33CMOPS3767A1ZV',
      expTotal: '2753.00'
    },
    {
      id: 'Arunai Medicals - Bill 2',
      file: './data/bills/clear_pack/06_arunai_medicals_bill_3_clear.jpg',
      expMerchant: 'Arunai Medicals',
      expGSTIN: '33CMOPS3767A1ZV',
      expTotal: '2827.00'
    },
    {
      id: 'Arunai Medicals - Bill 3',
      file: './data/bills/clear_pack/03_arunai_medicals_bill_1_clear.jpg',
      expMerchant: 'Arunai Medicals',
      expGSTIN: '33CMOPS3767A1ZV',
      expTotal: '2978.00'
    },
    {
      id: 'Masha Pharmacy',
      file: './data/bills/clear_pack/02_masha_pharmacy_clear.jpg',
      expMerchant: 'Masha Pharmacy',
      expGSTIN: '33ACEFM3457F1ZE',
      expTotal: '417.00'
    },
    {
      id: 'Ramraj Cotton',
      file: './data/bills/clear_pack/04_ramraj_cotton_clear.jpg',
      expMerchant: 'Ramraj Cotton',
      expGSTIN: '33AAHFR2641F1ZI',
      expTotal: '1050.05'
    },
    {
      id: 'Katpadi Kitchen',
      file: './data/bills/clear_pack/07_katpadi_kitchen_clear.jpg',
      expMerchant: 'Katpadi Kitchen',
      expGSTIN: '',
      expTotal: '510.00'
    },
    {
      id: 'Southern Railway (Train Ticket)',
      file: './data/bills/clear_pack/08_indian_railways_ticket_clear.jpg',
      expMerchant: 'Southern Railway',
      expGSTIN: '33AAAGM0239C1ZQ',
      expTotal: '170.00'
    }
  ];

  let passed = 0;
  for (const c of testCases) {
    if (!fs.existsSync(c.file)) {
      console.log(`[SKIP] File not found: ${c.file}`);
      continue;
    }
    const ocr = await Tesseract.recognize(c.file, 'eng');
    const text = ocr.data.text;
    const gstin = extractAllGSTINs(text);
    const fields = extractStructuredFinancialFields(text, text, gstin, c.file);

    const matchMerchant = fields.supplierName.toLowerCase().includes(c.expMerchant.toLowerCase());
    const matchGSTIN = (!c.expGSTIN && !fields.supplierGSTIN) || (fields.supplierGSTIN === c.expGSTIN);
    const matchTotal = fields.totalAmount === c.expTotal;
    const ok = matchMerchant && matchGSTIN && matchTotal;

    if (ok) passed++;
    console.log(
      `${ok ? '✓ PASS' : '✗ FAIL'} ${c.id.padEnd(28)} | Merch: ${fields.supplierName.padEnd(16)} | GST: ${(fields.supplierGSTIN || 'NONE').padEnd(16)} | Total: ₹${fields.totalAmount} (exp: ₹${c.expTotal})`
    );
  }

  console.log(`\n═══════════════════════════════════════════════════════════════════`);
  console.log(`Final Result: ${passed} / ${testCases.length} Passed (${Math.round((passed / testCases.length) * 100)}% Accuracy)`);
  console.log(`═══════════════════════════════════════════════════════════════════`);
}

runBenchmark().catch(console.error);
