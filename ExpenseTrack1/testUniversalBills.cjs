/**
 * STS FINTECH - Universal Bill, Receipt and Invoice Recognition Engine Test Suite
 * Tests all 8 reference bills + unseen merchants across all categories
 */

const { parseReceiptText } = require('./billParser');
const { defaultGSTService } = require('./gstService');

const billsToTest = [
  // 1. RAMRAJ COTTON (Critical User Fix)
  {
    name: 'RAMRAJ COTTON (User Receipt)',
    text: `RAMRMNI K
RAMRAJ COTTON
CHITTOOR BUS STAND, KATPADI-632007, TAMIL NADU
GSTIN : 33AAHFR2641F1ZI
Bill No: R220/CC8578
Date: 01/11/2026   Time: 11:40 AM

Item                 Qty     Rate      Amount
Dhoti Single 3.6m      5    120.00     600.00
Cotton Shirt 40        2    225.00     450.05

Total Pcs: 11
Total: ₹1,050.05
RRN Amount: ₹0.00
Discount Amount: ₹0.00
Rounded displayed amount: ₹1,050.00
Payment mode: CREDIT CARD BILL`,
    expected: {
      merchant: 'RAMRAJ COTTON',
      category: 'Clothing & Apparel',
      gstin: '33AAHFR2641F1ZI',
      total: '1050.00',
      subtotal: '1050.05',
      date: '2026-11-01',
      invoiceRef: 'Bill No: R220/CC8578',
      location: 'CHITTOOR BUS STAND, KATPADI-632007, TAMIL NADU',
      paymentMode: 'Card / Cardless',
    }
  },

  // 2. GREENCARE PHARMACY
  {
    name: 'GreenCare Pharmacy',
    text: `GREENCARE PHARMACY
14, Gandhi Road, Chennai - 600001
GSTIN: 33AABCT2345D1Z4
Ph: 044-28392011

Invoice No: GC-8812        Date: 12/10/2026   Time: 10:15 AM
Doctor: Dr. S. K. Raman     Patient: Self

Particulars            Qty    Rate     Amount
Amoxicillin 500mg       10    14.00    140.00
Cetirizine 10mg         10     4.50     45.00
Cough Syrup 100ml        1   115.00    115.00

Subtotal:                              300.00
Discount (5%):                          15.00
Net Amount:                            285.00
CGST 6%:                                17.10
SGST 6%:                                17.10
Grand Total:                           319.20
Payment Mode: UPI`,
    expected: {
      merchant: 'GREENCARE PHARMACY',
      category: 'Health & Medical',
      gstin: '33AABCT2345D1Z4',
      total: '319.20',
      date: '2026-10-12',
      paymentMode: 'UPI',
    }
  },

  // 3. THE TAMIL TABLE (Restaurant)
  {
    name: 'The Tamil Table',
    text: `THE TAMIL TABLE
88, Anna Salai, Chennai - 600002
GST NO : 33AAACT1984M1Z2
Tel: 044-43920199

Date: 25/10/2026  Time: 08:30 PM
Bill No: TT/9921   Table: 12   Server: Murugan
Dine In

Items                 Qty     Rate     Total
Chettinad Chicken       1    280.00    280.00
Malabar Parotta         4     35.00    140.00
Filter Coffee           2     45.00     90.00

Subtotal:                              510.00
CGST 2.5%:                              12.75
SGST 2.5%:                              12.75
Grand Total:                          535.50
Mode of Payment: CASH`,
    expected: {
      merchant: 'THE TAMIL TABLE',
      category: 'Dining & Restaurant',
      gstin: '33AAACT1984M1Z2',
      total: '535.50',
      date: '2026-10-25',
      paymentMode: 'Cash',
    }
  },

  // 4. NORTHSTAR APPARELS
  {
    name: 'NorthStar Apparels',
    text: `NORTHSTAR APPARELS
52, Main Bazaar, Coimbatore - 641001
GSTIN: 33AAAFN5521C1Z8

Tax Invoice No: NS-4410
Invoice Date: 28/10/2026

Description            Qty    Price    Amount
Men Slim Denim          1   1499.00   1499.00
Formal Cotton Shirt     1    999.00    999.00

Total:                                2498.00
Discount:                              249.80
Net Taxable:                          2248.20
IGST 5%:                               112.41
Grand Total:                          2360.61
Payment: Credit Card`,
    expected: {
      merchant: 'NORTHSTAR APPARELS',
      category: 'Clothing & Apparel',
      gstin: '33AAAFN5521C1Z8',
      total: '2360.61',
      date: '2026-10-28',
      paymentMode: 'Card / Cardless',
    }
  },

  // 5. SOUTHERN REGIONAL TRANSPORT
  {
    name: 'Southern Regional Transport',
    text: `SOUTHERN REGIONAL TRANSPORT
Central Bus Stand, Madurai - 625001
GSTIN / UIN: 33AAACT9012B1Z6
PASSENGER BUS TICKET

Ticket No: SRT/EX/5812
Journey Date: 15/10/2026   Departure: 06:30 AM
From: MADURAI To: CHENNAI
Passengers: 2 Adult

Fare per Seat: ₹450.00
Reservation Fee: ₹20.00
Total Fare: ₹920.00
Payment Mode: UPI QR`,
    expected: {
      merchant: 'SOUTHERN REGIONAL TRANSPORT',
      category: 'Travel & Transit',
      gstin: '33AAACT9012B1Z6',
      total: '920.00',
      date: '2026-10-15',
      paymentMode: 'UPI',
    }
  },

  // 6. ARUNAI MEDICALS (01/09/2026)
  {
    name: 'Arunai Medicals 1',
    text: `ARUNAI MEDICALS
No. 72/1, Katchery Street
Tirupattur - 635601
Ph: 04179-220088
GSTIN: 33AABCA1234B1Z5

Bill No: AM-2891          Date: 01/09/2026

S.No  Item Name              Qty   Rate     Amount
1     Paracetamol 500mg       3    12.50     37.50

Subtotal: 758.50
CGST: 61.44
SGST: 61.44
Grand Total: 805.53
Payment Mode: Cash`,
    expected: {
      merchant: 'ARUNAI MEDICALS',
      category: 'Health & Medical',
      gstin: '33AABCA1234B1Z5',
      total: '805.53',
      date: '2026-09-01',
    }
  },

  // 7. ARUNAI MEDICALS (21/10/2026 - ₹2,753.00)
  {
    name: 'Arunai Medicals 2 (2753)',
    text: `ARUNAI MEDICALS
No. 72/1, Katchery Street
Tirupattur - 635601

Date: 21/10/2026    Bill No: AM-3412

Subtotal: 1,841.10
Previous Balance: 1,153.84
Grand Total: 2,753.00
Mode: Cash`,
    expected: {
      merchant: 'ARUNAI MEDICALS',
      category: 'Health & Medical',
      total: '2753.00',
      date: '2026-10-21',
    }
  },

  // 8. KATPADI KITCHEN (29/10/2026)
  {
    name: 'Katpadi Kitchen',
    text: `KATPADI KITCHEN
3rd Street opp VIT Main Gate
Vellakalmedu Katpadi Vellore
Contact No: 8248252048
29 October 2026 03:01 PM
Customer Copy
Dine In
KOT No: 6

Table:: Table 8
Item                Qty    Rate    Total
Aloo Paratha         1      45      45
Butter Nan           3      40     120
Hydrabadi Chicken    1     200     200
Total :              8             Rs 510.00
Grand Total : Rs 510.00`,
    expected: {
      merchant: 'KATPADI KITCHEN',
      category: 'Dining & Restaurant',
      total: '510.00',
      date: '2026-10-29',
    }
  },

  // 9. INDIAN RAILWAYS (18/09/2026)
  {
    name: 'Indian Railways Ticket',
    text: `HAPPY JOURNEY
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
R21484 18/09/202614:51 SAT06 AME89712234`,
    expected: {
      merchant: 'INDIAN RAILWAYS',
      category: 'Travel & Transit',
      gstin: '33AAAGM0289C1ZQ',
      total: '170.00',
      date: '2026-09-18',
      paymentMode: 'Card / Cardless',
    }
  },

  // 10. UNSEEN NEW MERCHANT: BENGALURU ORGANIC ROASTERS (Cafe)
  {
    name: 'Unseen Merchant: BENGALURU ORGANIC ROASTERS',
    text: `BENGALURU ORGANIC ROASTERS
100 Feet Road, Indiranagar, Bangalore - 560038
GSTIN: 29AABCB8812D1Z9
Bill # BOR-2041
Date: 31/10/2026   Time: 16:20

Item                   Qty     Rate     Total
Cold Brew Bottle         2   180.00    360.00
Almond Croissant         1   150.00    150.00

Subtotal:                              510.00
CGST (2.5%):                            12.75
SGST (2.5%):                            12.75
Net Payable:                           535.50
Paid via UPI`,
    expected: {
      merchant: 'BENGALURU ORGANIC ROASTERS',
      category: 'Dining & Restaurant',
      total: '535.50',
      date: '2026-10-31',
      paymentMode: 'UPI',
    }
  }
];

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('  STS FINTECH – UNIVERSAL DOCUMENT RECOGNITION AUDIT (10 BILLS)');
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${details}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details}`);
    }
  }

  for (const b of billsToTest) {
    console.log(`\n--- TESTING: ${b.name} ---`);
    const parsed = parseReceiptText(b.text, `${b.name}.jpg`);

    if (b.expected.merchant) {
      assert(
        parsed.merchant.toUpperCase().includes(b.expected.merchant.toUpperCase()),
        `${b.name} - Merchant Name`,
        `[Got "${parsed.merchant}", Expected "${b.expected.merchant}"]`
      );
    }

    if (b.expected.category) {
      assert(
        parsed.category === b.expected.category,
        `${b.name} - Category Classification`,
        `[Got "${parsed.category}", Expected "${b.expected.category}"]`
      );
    }

    if (b.expected.gstin) {
      assert(
        parsed.gstin === b.expected.gstin,
        `${b.name} - GSTIN Extraction`,
        `[Got "${parsed.gstin}", Expected "${b.expected.gstin}"]`
      );

      // Verify GST Service response
      const report = await defaultGSTService.verifyGSTIN(parsed.gstin, parsed.merchant);
      assert(
        report.status === 'Verified',
        `${b.name} - GST API Status`,
        `[Status: ${report.status}, Entity: ${report.legalName || report.tradeName}]`
      );
    }

    if (b.expected.total) {
      assert(
        parsed.total === b.expected.total,
        `${b.name} - Grand Total`,
        `[Got "${parsed.total}", Expected "${b.expected.total}"]`
      );
    }

    if (b.expected.date) {
      assert(
        parsed.date === b.expected.date,
        `${b.name} - Bill Date`,
        `[Got "${parsed.date}", Expected "${b.expected.date}"]`
      );
    }

    if (b.expected.paymentMode) {
      assert(
        parsed.paymentMode === b.expected.paymentMode,
        `${b.name} - Payment Mode`,
        `[Got "${parsed.paymentMode}", Expected "${b.expected.paymentMode}"]`
      );
    }

    if (b.expected.location) {
      assert(
        parsed.location.toUpperCase().includes('CHITTOOR') && parsed.location.toUpperCase().includes('KATPADI'),
        `${b.name} - Location Extraction`,
        `[Got "${parsed.location}"]`
      );
    }

    if (b.expected.invoiceRef) {
      assert(
        parsed.invoiceRef.includes('R220/CC8578'),
        `${b.name} - Invoice Ref`,
        `[Got "${parsed.invoiceRef}"]`
      );
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════');
  console.log(`  TEST RESULTS: ${passed}/${total} ASSERTIONS PASSED (${Math.round(passed / total * 100)}% SUCCESS)`);
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  process.exit(passed === total ? 0 : 1);
}

runAllTests();

