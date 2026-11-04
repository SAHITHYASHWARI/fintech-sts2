// Test all 3 receipt types from user's actual bills
const { parseReceiptText } = require('./billParser.js');

// Test 1: KATPADI KITCHEN (Restaurant)
const katpadiText = `KATPADI KITCHEN
3rd Street opp VIT Main Gate
Vellakalmedu Katpadi Vellore
Contact No: 8248252048
29 October 2026 03:01 PM
Customer Copy
Dine In
KOT No: 6

Table:: Table 8                    User : KKcaptain
Item                Qty    Rate    Total
Aloo Paratha         1      45      45
Paneer Paratha       1      55      55
Gobi Paratha         1      45      45
Onion Paratha        1      45      45
Butter Nan           3      40     120
Hydrabadi Chicken    1     200     200
Total :              8             Rs 510.00

Grand Total : Rs 510.00

Powered by TMBill v7.4.46`;

// Test 2: Railway Ticket (SALEM JN to KATPADI JN)
const railwayText = `HAPPY JOURNEY
AME 89712234
SECOND MAIL/EXP JOURNEY ATVM
SALEM JN TO KATPADI JN  KM 204
Via JTJ
ADULT: 2  CHILD:0
JCOON: 18/09/2026
UTS NO :CXRPEGG1G6
SAC:996421 IR:33AAAGM0289C1ZQ        MODE:CARD
S C No: SC0288244
Rs. 170/-
R21484 18/09/202614:51 SAT06 AME89712234`;

// Test 3: ARUNAI MEDICALS (Medical bill with ₹2,753.00 total)
const arunaiText1 = `ARUNAI MEDICALS
No. 72/1, Katchery Street
Tirupattur - 635601
Ph: 04179-220088
GSTIN: 33AABCA1234B1Z5

Bill No: AM-2891          Date: 01/09/2026

S.No  Item Name              Qty   Rate     Amount
1     Paracetamol 500mg       3    12.50     37.50
2     Azithromycin 500mg      2   125.00    250.00
3     Pantoprazole 40mg       2    28.00     56.00
4     ORS Powder              5    15.00     75.00
5     Vitamin D3 60000IU      4    85.00    340.00

Subtotal:                                  758.50
Discount (10%):                             75.85
Net Amount:                                682.65
CGST (9%):                                  61.44
SGST (9%):                                  61.44
Grand Total:                               805.53

Payment Mode: Cash`;

// Test 4: ARUNAI MEDICALS bill with ₹2,753 grand total (comma format)
const arunaiText2 = `ARUNAI MEDICALS
No. 72/1, Katchery Street
Tirupattur - 635601

Date: 21/10/2026    Bill No: AM-3412

S.No  Item                   Qty   Rate      Amount
1     Metformin 500mg         30    8.50      255.00
2     Atorvastatin 10mg       30   15.00      450.00
3     Amlodipine 5mg          30   12.50      375.00
4     Telmisartan 40mg        30   22.00      660.00
5     Aspirin 75mg            30    3.37      101.10

Subtotal:                                  1,841.10
Discount:                                    485.88
Net Taxable:                               1,355.22
CGST 9%:                                     121.97
SGST 9%:                                     121.97
Sub Taxable + Tax:                         1,599.16
Previous Balance:                          1,153.84
Grand Total:                               2,753.00

Mode: Cash`;

const tests = [
  { name: 'Katpadi Kitchen', text: katpadiText, expectMerchant: 'KATPADI KITCHEN', expectTotal: '510.00', expectCategory: 'Dining' },
  { name: 'Railway Ticket',  text: railwayText, expectMerchant: 'Indian Railways', expectTotal: '170.00', expectCategory: 'Travel' },
  { name: 'Arunai Medicals 1', text: arunaiText1, expectMerchant: 'ARUNAI', expectTotal: '805.53', expectCategory: 'Medical' },
  { name: 'Arunai Medicals 2 (2753)', text: arunaiText2, expectMerchant: 'ARUNAI', expectTotal: '2753.00', expectCategory: 'Medical' },
];

let passed = 0;
console.log('\n═══════════════════════════════════════════════════════');
console.log('  STS FINTECH – billParser.js Test Results');
console.log('═══════════════════════════════════════════════════════\n');

tests.forEach((t, i) => {
  const result = parseReceiptText(t.text, `test${i+1}.jpg`);
  const okMerchant = result.merchant.toUpperCase().includes(t.expectMerchant.toUpperCase());
  const okTotal    = Math.abs(parseFloat(result.total) - parseFloat(t.expectTotal)) < 0.02;
  const okCategory = result.category.includes(t.expectCategory);

  const status = okMerchant && okTotal && okCategory ? '✅ PASS' : '❌ FAIL';
  if (okMerchant && okTotal && okCategory) passed++;

  console.log(`Test ${i+1}: ${t.name}  [${status}]`);
  console.log(`  Category : ${result.category}  ${okCategory ? '✓' : `✗ expected "${t.expectCategory}"`}`);
  console.log(`  Merchant : ${result.merchant}  ${okMerchant ? '✓' : `✗ expected "${t.expectMerchant}"`}`);
  console.log(`  Total    : ₹${result.total}  ${okTotal ? '✓' : `✗ expected ₹${t.expectTotal}`}`);
  console.log(`  Date     : ${result.rawDateStr}`);
  console.log(`  Location : ${result.location}`);
  console.log(`  GSTIN    : ${result.gstin || '(none)'}`);
  if (result.items && result.items.length > 0) {
    console.log(`  Items    : ${result.items.length} line items`);
    result.items.slice(0, 3).forEach(it => console.log(`             ${it.name} × ${it.qty} = ₹${it.amount}`));
  }
  if (result.amountWarning) console.log(`  ⚠ ${result.amountWarning}`);
  console.log(`  Hash     : ${result.receiptHash}`);
  console.log(`  Confidence: Merchant=${result.confidence.merchant?.label}, Total=${result.confidence.total?.label}, Date=${result.confidence.date?.label}`);
  console.log();
});

console.log(`═══════════════════════════════════════════════════════`);
console.log(`RESULT: ${passed}/${tests.length} tests passed`);
console.log(`═══════════════════════════════════════════════════════\n`);
process.exit(passed === tests.length ? 0 : 1);
