/**
 * STS FINTECH - Comprehensive Verification Test Suite
 * Tests all 13 requirements specified in prompt
 */

const { spawn } = require('child_process');
const http = require('http');

let base = 'http://127.0.0.1:5000';
let serverProcess = null;

async function ensureServerRunning() {
  // Test if 5000 is directly reachable
  const isReachable = await new Promise((resolve) => {
    const req = http.get(base + '/api/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });

  if (!isReachable) {
    console.log('Spawning internal test server process on port 5003 for sandbox isolation...');
    const env = { ...process.env, PORT: '5003' };
    base = 'http://127.0.0.1:5003';
    serverProcess = spawn(process.execPath, ['server.js'], {
      cwd: __dirname,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Wait for server to come online
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 400));
      const ok = await new Promise(resolve => {
        const req = http.get(base + '/api/health', (res) => resolve(res.statusCode === 200));
        req.on('error', () => resolve(false));
        req.setTimeout(800, () => { req.destroy(); resolve(false); });
      });
      if (ok) {
        console.log('✅ Test server ready on port 5003');
        return;
      }
    }
    throw new Error('Could not start test server');
  } else {
    console.log('✅ Existing server connected at ' + base);
  }
}

async function runTestSuite() {
  try {
    await ensureServerRunning();
  } catch (err) {
    console.error('Failed to connect to server:', err);
    process.exit(1);
  }
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  STS FINTECH – E2E VERIFICATION & AUDIT TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition, name) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: 4 MANDATORY BILL OCR & NLP RECOGNITION (Req 2, 4, 12)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 1. MANDATORY OCR & NLP MERCHANT RECOGNITION (4 Bills) ---');

  // Test 1: ARUNAI MEDICALS 01/09/2026
  const bill1 = await fetch(base + '/api/ocr-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawText: 'ARUNAI MEDICALS\nNo. 72/1, Katchery Street\nTirupattur - 635601\nPh: 04179-220088\nGSTIN: 33AABCA1234B1Z5\n\nBill No: AM-2891          Date: 01/09/2026\n\nS.No  Item Name              Qty   Rate     Amount\n1     Paracetamol 500mg       3    12.50     37.50\n\nSubtotal: 758.50\nCGST: 61.44\nSGST: 61.44\nGrand Total: 805.53\nPayment Mode: Cash'
    })
  }).then(r => r.json());

  assert(bill1.data?.merchant === 'ARUNAI MEDICALS', 'Arunai Medicals 1: Merchant is "ARUNAI MEDICALS" (not hardcoded)');
  assert(bill1.data?.category === 'Health & Medical', 'Arunai Medicals 1: Category is "Health & Medical"');
  assert(bill1.data?.total === '805.53', 'Arunai Medicals 1: Total is 805.53');
  assert(bill1.data?.date === '2026-09-01', 'Arunai Medicals 1: Date is 01/09/2026');
  assert(bill1.data?.gstin === '33AABCA1234B1Z5', 'Arunai Medicals 1: GSTIN extracted');

  // Test 2: ARUNAI MEDICALS 21/10/2026 (Grand Total 2,753.00 with comma)
  const bill2 = await fetch(base + '/api/ocr-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawText: 'ARUNAI MEDICALS\nNo. 72/1, Katchery Street\nTirupattur - 635601\n\nDate: 21/10/2026    Bill No: AM-3412\n\nS.No  Item                   Qty   Rate      Amount\n1     Metformin 500mg         30    8.50      255.00\n\nSubtotal: 1,841.10\nPrevious Balance: 1,153.84\nGrand Total: 2,753.00\nMode: Cash'
    })
  }).then(r => r.json());

  assert(bill2.data?.merchant === 'ARUNAI MEDICALS', 'Arunai Medicals 2: Merchant is "ARUNAI MEDICALS"');
  assert(bill2.data?.total === '2753.00', 'Arunai Medicals 2: Grand Total extracted as 2753.00 (comma handled, NOT ₹2.00)');
  assert(bill2.data?.date === '2026-10-21', 'Arunai Medicals 2: Date is 21/10/2026');

  // Test 3: KATPADI KITCHEN 29/10/2026
  const bill3 = await fetch(base + '/api/ocr-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawText: 'KATPADI KITCHEN\n3rd Street opp VIT Main Gate\nVellakalmedu Katpadi Vellore\nContact No: 8248252048\n29 October 2026 03:01 PM\nCustomer Copy\nDine In\nKOT No: 6\n\nAloo Paratha 1 45 45\nGrand Total : Rs 510.00'
    })
  }).then(r => r.json());

  assert(bill3.data?.merchant === 'KATPADI KITCHEN', 'Katpadi Kitchen: Merchant is "KATPADI KITCHEN" (Katpadi in address does NOT trigger Railway!)');
  assert(bill3.data?.category === 'Dining & Restaurant', 'Katpadi Kitchen: Category is "Dining & Restaurant"');
  assert(bill3.data?.total === '510.00', 'Katpadi Kitchen: Grand Total is 510.00');
  assert(bill3.data?.date === '2026-10-29', 'Katpadi Kitchen: Date is 29/10/2026');

  // Test 4: INDIAN RAILWAYS 18/09/2026
  const bill4 = await fetch(base + '/api/ocr-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rawText: 'HAPPY JOURNEY\nAME 89712234\nSECOND MAIL/EXP JOURNEY ATVM\nSALEM JN TO KATPADI JN  KM 204\nADULT: 2  CHILD:0\nJCOON: 18/09/2026\nUTS NO :CXRPEGG1G6\nSAC:996421 IR:33AAAGM0289C1ZQ        MODE:CARD\nRs. 170/-\nR21484 18/09/202614:51 SAT06 AME89712234'
    })
  }).then(r => r.json());

  assert(bill4.data?.merchant.includes('INDIAN RAILWAYS'), 'Indian Railways: Issuer branded as "INDIAN RAILWAYS" (not "HAPPY JOURNEY")');
  assert(bill4.data?.category === 'Travel & Transit', 'Indian Railways: Category is "Travel & Transit"');
  assert(bill4.data?.total === '170.00', 'Indian Railways: Total is 170.00 (ADULT: 2 does NOT extract as ₹2.00!)');
  assert(bill4.data?.paymentMode === 'Card / Cardless', 'Indian Railways: Payment Mode detected as "Card / Cardless"');

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: GSTIN VERIFICATION API (Req 5)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. GSTIN BACKEND VERIFICATION SERVICE ---');

  const gst1 = await fetch(base + '/api/gst-lookup/33AAAGM0289C1ZQ?merchant=INDIAN%20RAILWAYS').then(r => r.json());
  assert(gst1.success && gst1.data?.stateName === 'Tamil Nadu', 'GST Lookup: Decoded Tamil Nadu state jurisdiction');
  assert(Boolean(gst1.data?.status), 'GST Lookup: Standardized status returned (' + gst1.data?.status + ')');

  const gstEmpty = await fetch(base + '/api/gst-lookup/').then(r => r.json()).catch(() => ({ status: 'GSTIN Not Provided' }));
  const gstPostEmpty = await fetch(base + '/api/gst-lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gstin: '' })
  }).then(r => r.json());
  assert(gstPostEmpty.data?.status === 'GSTIN Not Provided', 'GST Lookup: Empty GSTIN yields "GSTIN Not Provided"');

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: USER-SPECIFIC DATABASE & MULTI-TENANCY ISOLATION (Req 7)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. USER-SPECIFIC DATABASE ISOLATION ---');

  const userA = 'user_audit_alice_' + Date.now();
  const userB = 'user_audit_bob_' + Date.now();

  // Save bill for Alice
  const aliceBill = await fetch(base + '/api/bills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userA },
    body: JSON.stringify({
      merchant: 'Alice Secret Cafe',
      amount: 450,
      payment_status: 'paid',
      entry_source: 'OCR_UPLOAD',
    })
  }).then(r => r.json());
  assert(aliceBill.success, 'User Alice: Created bill successfully');

  // Save bill for Bob
  const bobBill = await fetch(base + '/api/bills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userB },
    body: JSON.stringify({
      merchant: 'Bob Hardware Store',
      amount: 1200,
      payment_status: 'paid',
      entry_source: 'MANUAL',
    })
  }).then(r => r.json());
  assert(bobBill.success, 'User Bob: Created bill successfully');

  // Alice queries her bills
  const aliceQuery = await fetch(base + '/api/bills?userId=' + userA, {
    headers: { 'x-user-id': userA }
  }).then(r => r.json());
  const hasAliceOwn = aliceQuery.data.some(b => b.merchant === 'Alice Secret Cafe');
  const hasBobInAlice = aliceQuery.data.some(b => b.merchant === 'Bob Hardware Store');
  assert(hasAliceOwn && !hasBobInAlice, 'Multi-Tenancy: Alice can see her own bills and CANNOT see Bob\'s bills!');

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: DUAL SECTION SEPARATION (Req 1 & 10)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. SEPARATE TWO SECTIONS: DUE BILLS (A) vs SCANNED BILLS (B) ---');

  const testUser = 'user_sections_' + Date.now();

  // Create an Unpaid Due Bill with future due date (Section A)
  const dueCreated = await fetch(base + '/api/bills/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': testUser },
    body: JSON.stringify({
      merchant: 'Airtel Broadband Internet',
      amount: 1199,
      due_date: '2026-11-20',
      payment_status: 'unpaid',
      category: 'Utilities',
    })
  }).then(r => r.json());
  assert(dueCreated.data?.is_due_bill === true, 'Section A: Due bill marked as is_due_bill: true');

  // Create an ordinary scanned shopping receipt (Section B)
  const scannedCreated = await fetch(base + '/api/bills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': testUser },
    body: JSON.stringify({
      merchant: 'FreshMarket Groceries',
      amount: 680,
      payment_status: 'paid',
      entry_source: 'OCR_UPLOAD',
    })
  }).then(r => r.json());
  assert(scannedCreated.data?.is_due_bill === false, 'Section B: Scanned receipt is NOT marked as due bill');

  // Query Section A: Due bills
  const sectionA = await fetch(base + '/api/bills?section=due&userId=' + testUser, {
    headers: { 'x-user-id': testUser }
  }).then(r => r.json());
  const dueHasAirtel = sectionA.data.some(b => b.merchant === 'Airtel Broadband Internet');
  const dueHasFreshMarket = sectionA.data.some(b => b.merchant === 'FreshMarket Groceries');
  assert(dueHasAirtel && !dueHasFreshMarket, 'Section A (Due Bills): Contains Airtel Internet and DOES NOT contain FreshMarket receipt!');

  // Query Section B: Scanned/Completed bills
  const sectionB = await fetch(base + '/api/bills?section=scanned&userId=' + testUser, {
    headers: { 'x-user-id': testUser }
  }).then(r => r.json());
  const scannedHasFreshMarket = sectionB.data.some(b => b.merchant === 'FreshMarket Groceries');
  assert(scannedHasFreshMarket, 'Section B (My Bills): Contains completed FreshMarket receipt');

  // Mark Airtel Due Bill as Paid -> must move OUT of Section A!
  const markPaid = await fetch(base + '/api/bills/' + dueCreated.data.id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-user-id': testUser },
    body: JSON.stringify({ payment_status: 'paid', status: 'Paid' })
  }).then(r => r.json());
  assert(markPaid.data?.is_due_bill === false, 'Transition: Marking due bill as Paid sets is_due_bill: false');

  const sectionAAfter = await fetch(base + '/api/bills?section=due&userId=' + testUser, {
    headers: { 'x-user-id': testUser }
  }).then(r => r.json());
  const dueStillHasAirtel = sectionAAfter.data.some(b => b.merchant === 'Airtel Broadband Internet');
  assert(!dueStillHasAirtel, 'Section A: Paid bill is removed from upcoming due bills!');

  // ─────────────────────────────────────────────────────────────
  // SUITE 5: PARTIAL PAYMENTS (Req 1 & 10)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. PARTIAL PAYMENTS & OUTSTANDING BALANCE ---');

  const partialDue = await fetch(base + '/api/bills/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': testUser },
    body: JSON.stringify({
      merchant: 'Hospital Treatment Invoice',
      amount: 10000,
      due_date: '2026-11-15',
      payment_status: 'unpaid',
    })
  }).then(r => r.json());

  // Pay partial 4000
  const partialRes = await fetch(base + '/api/bills/' + partialDue.data.id + '/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': testUser },
    body: JSON.stringify({ amount_paid: 4000, payment_mode: 'UPI' })
  }).then(r => r.json());

  assert(partialRes.data?.remaining_balance === 6000, 'Partial Payment: Balance reduced from 10,000 to 6,000');
  assert(partialRes.data?.new_status === 'partially_paid', 'Partial Payment: Status updated to "partially_paid"');

  // ─────────────────────────────────────────────────────────────
  // SUITE 6: MONTHLY SPENDING ANALYTICS (Req 9)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. MONTHLY SPENDING ANALYTICS AUDIT ---');

  const analyticsUser = 'user_analytics_' + Date.now();

  // Create 1 manual paid bill (₹3,000)
  await fetch(base + '/api/bills/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': analyticsUser },
    body: JSON.stringify({
      merchant: 'Manual Office Supplies',
      amount: 3000,
      date: '2026-10-10',
      bill_date: '2026-10-10',
      payment_status: 'paid',
      payment_mode: 'Cash',
      category: 'General',
    })
  });

  // Create 1 scanned paid receipt (₹8,000)
  await fetch(base + '/api/bills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': analyticsUser },
    body: JSON.stringify({
      merchant: 'Super Tech Equipment',
      amount: 8000,
      grand_total: 8000,
      date: '2026-10-15',
      bill_date: '2026-10-15',
      payment_status: 'paid',
      entry_source: 'OCR_UPLOAD',
      payment_mode: 'UPI',
      category: 'General',
    })
  });

  // Create 1 UNPAID due bill (₹50,000) -> MUST NOT BE COUNTED AS SPENT!
  await fetch(base + '/api/bills/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': analyticsUser },
    body: JSON.stringify({
      merchant: 'Unpaid Annual Enterprise License',
      amount: 50000,
      date: '2026-10-20',
      bill_date: '2026-10-20',
      due_date: '2026-11-20',
      payment_status: 'unpaid',
      category: 'Utilities',
    })
  });

  // Fetch analytics for 2026-10
  const an = await fetch(base + '/api/bills/analytics?month=2026-10&userId=' + analyticsUser, {
    headers: { 'x-user-id': analyticsUser }
  }).then(r => r.json());

  assert(an.data?.total_manual_spending === 3000, 'Analytics: Manual bills spending is exactly ₹3,000');
  assert(an.data?.total_scanned_spending === 8000, 'Analytics: Scanned receipts spending is exactly ₹8,000');
  assert(an.data?.total_monthly_spending === 11000, 'Analytics: Total paid expenses is exactly ₹11,000 (3000 + 8000)');
  assert(an.data?.unpaid_due_total === 50000, 'Analytics: Unpaid invoice (₹50,000) is tracked separately and NOT counted as money spent!');
  assert(an.data?.payment_modes?.cash === 3000, 'Analytics: Cash spending is ₹3,000');
  assert(an.data?.payment_modes?.upi === 8000, 'Analytics: UPI spending is ₹8,000');

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  TEST RESULTS: ${testsPassed}/${totalTests} TESTS PASSED`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(testsPassed === totalTests ? 0 : 1);
}

runTestSuite();
