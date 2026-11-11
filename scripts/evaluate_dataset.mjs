import fs from 'fs';
import path from 'path';
import Tesseract from '../ExpenseTrack/node_modules/tesseract.js/src/index.js';
import { extractAllGSTINs, extractStructuredFinancialFields } from '../ExpenseTrack/src/lib/multiPassOcrEngine.js';
import { validateFinancialBill } from '../ExpenseTrack/src/lib/financialValidationEngine.js';

async function runBenchmark() {
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════');
  console.log('   STS FINTECH UNIVERSAL OCR & BILL INTELLIGENCE BENCHMARK – FULL DATASET ACCURACY        ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════════════\n');

  const testCases = [
    {
      id: '01 Godrej & Premier Appliances',
      file: './data/bills/clear_pack/01_handwritten_electronics_clear.jpg',
      expMerchant: 'Godrej',
      expGSTIN: '',
      expTotal: '23200.00',
      minItems: 0
    },
    {
      id: '02 Masha Pharmacy',
      file: './data/bills/clear_pack/02_masha_pharmacy_clear.jpg',
      expMerchant: 'Masha Pharmacy',
      expGSTIN: '33ACEFM3457F1ZE',
      expTotal: '417.00',
      minItems: 1
    },
    {
      id: '03 Arunai Medicals (Bill 1)',
      file: './data/bills/clear_pack/05_arunai_medicals_bill_2_clear.jpg',
      expMerchant: 'Arunai Medicals',
      expGSTIN: '33CMOPS3767A1ZV',
      expTotal: '2753.00',
      minItems: 1
    },
    {
      id: '04 Arunai Medicals (Bill 2)',
      file: './data/bills/clear_pack/06_arunai_medicals_bill_3_clear.jpg',
      expMerchant: 'Arunai Medicals',
      expGSTIN: '33CMOPS3767A1ZV',
      expTotal: '2827.00',
      minItems: 1
    },
    {
      id: '05 Arunai Medicals (Bill 3)',
      file: './data/bills/clear_pack/03_arunai_medicals_bill_1_clear.jpg',
      expMerchant: 'Arunai Medicals',
      expGSTIN: '33CMOPS3767A1ZV',
      expTotal: '2978.00',
      minItems: 1
    },
    {
      id: '06 Ramraj Cotton',
      file: './data/bills/clear_pack/04_ramraj_cotton_clear.jpg',
      expMerchant: 'Ramraj Cotton',
      expGSTIN: '33AAHFR2641F1ZI',
      expTotal: '1050.05',
      minItems: 1
    },
    {
      id: '07 Katpadi Kitchen',
      file: './data/bills/clear_pack/07_katpadi_kitchen_clear.jpg',
      expMerchant: 'Katpadi Kitchen',
      expGSTIN: '',
      expTotal: '510.00',
      minItems: 1
    },
    {
      id: '08 Southern Railway Ticket',
      file: './data/bills/clear_pack/08_indian_railways_ticket_clear.jpg',
      expMerchant: 'Southern Railway',
      expGSTIN: '33AAAGM0239C1ZQ',
      expTotal: '170.00',
      minItems: 0
    },
    {
      id: '09 The Lake Hill Restaurant (1)',
      file: './data/bills/printed/demo printed bills/d14.jfif',
      expMerchant: 'The Lake Hill',
      expGSTIN: '05AEBFS0701F1ZP',
      expTotal: '1650.00',
      minItems: 1
    },
    {
      id: '10 Classik Family Restaurant',
      file: './data/bills/printed/demo printed bills/d13.jfif',
      expMerchant: 'Classik Family Restaurant',
      expGSTIN: '27AAGFH4645G2ZB',
      expTotal: '165.00',
      minItems: 1
    },
    {
      id: '11 Sleek Bill Invoice',
      file: './data/bills/printed/demo printed bills/d11.png',
      expMerchant: 'Sleek Bill',
      expGSTIN: '27AAFCV2419G1ZT',
      expTotal: '1068.00',
      minItems: 0
    },
    {
      id: '12 Hotel Roopali Pune',
      file: './data/bills/printed/demo printed bills/d22.jfif',
      expMerchant: 'Hotel Roopali',
      expGSTIN: '27ADNPS1534J1ZF',
      expTotal: '224.00',
      minItems: 0
    },
    {
      id: '13 Odisha Hotel',
      file: './data/bills/printed/demo printed bills/d19.jfif',
      expMerchant: 'Odisha Hotel',
      expGSTIN: '21FZPPS1850H1Z4',
      expTotal: '777.00',
      minItems: 0
    },
    {
      id: '14 Hotel Dhruvathare',
      file: './data/bills/printed/demo printed bills/d31.jfif',
      expMerchant: 'Hotel Dhruvathare',
      expGSTIN: '29AADCL1443Q1Z2',
      expTotal: '320.25',
      minItems: 0
    },
    {
      id: '15 The Lake Hill Restaurant (2)',
      file: './data/bills/printed/demo printed bills/d20.jfif',
      expMerchant: 'The Lake Hill',
      expGSTIN: '05AEBFS0701F1ZP',
      expTotal: '1650.00',
      minItems: 1
    },
    {
      id: '16 LAVACAKES Restaurant',
      file: './data/bills/clear_pack/09_lavacakes_bill.jpg',
      expMerchant: 'LAVACAKES',
      expGSTIN: '33DFSPJ4128G1ZD',
      expTotal: '170.00',
      minItems: 0
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
    const itemCount = fields.items ? fields.items.length : 0;
    const matchItems = itemCount >= (c.minItems || 0);

    const ok = matchMerchant && matchGSTIN && matchTotal && matchItems;
    if (ok) passed++;

    const valStatus = fields.financialValidation ? fields.financialValidation.status : 'N/A';

    console.log(
      `${ok ? '✓ PASS' : '✗ FAIL'} ${c.id.padEnd(30)} | Merch: ${fields.supplierName.padEnd(20)} | GST: ${(fields.supplierGSTIN || 'NONE').padEnd(16)} | Total: ₹${fields.totalAmount.padEnd(8)} (exp: ₹${c.expTotal}) | Items: ${String(itemCount).padStart(2)} | Val: ${valStatus}`
    );
  }

  const accuracyPct = Math.round((passed / testCases.length) * 100);
  console.log(`\n═══════════════════════════════════════════════════════════════════════════════════════════`);
  console.log(`Final Evaluation Result: ${passed} / ${testCases.length} Passed (${accuracyPct}% Production Accuracy)`);
  console.log(`═══════════════════════════════════════════════════════════════════════════════════════════\n`);
}

runBenchmark().catch(console.error);
