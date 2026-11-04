const { parseReceiptText, decodeGSTIN } = require('./billParser');

const testCases = [
  {
    type: 'Hotel Bill',
    text: `
HOTEL GRAND PALACE RESORT
No. 42, Beach Road, T. Nagar, Chennai - 600017
GSTIN: 33AAAAH1234F1Z5
ROOM TARIFF INVOICE #HGP-8841
Date: 24/10/2026   Time: 12:00 PM
Guest: John Doe    Room No: 304
Room Charges: 3200.00
CGST 6%: 192.00
SGST 6%: 192.00
TOTAL AMOUNT: 3584.00
Payment: CASH
    `,
    expectedCategory: 'Hotel & Lodging',
  },
  {
    type: 'Indian Railways UTS Ticket',
    text: `
INDIAN RAILWAYS
UTS NO: CXRPEGG1G6
HAPPY JOURNEY
SALEM JN TO KATPADI JN
KM: 243   CLASS: SECOND MAIL
ADULT: 1   CHILD: 0
FARE: RS. 170.00
AME 02891234
DATE: 18/09/2026   14:51
GSTIN: 33AAAGM0289C1ZQ
MODE: CARDLESS
    `,
    expectedCategory: 'Travel & Transit',
  },
  {
    type: 'IRCTC Vande Bharat Express Ticket',
    text: `
IRCTC Electronic Reservation Slip (ERS)
PNR: 4238912345
Train No. & Name: 20607 / VANDE BHARAT EXP
From: CHENNAI CENTRAL (MAS) To: KSR BENGALURU (SBC)
Date of Journey: 28-Oct-2026
Class: CC   Adult: 1
Ticket Fare: ₹ 980.00
Convenience Fee: ₹ 35.40
Total Amount Payable: ₹ 1015.40
Payment Mode: UPI
    `,
    expectedCategory: 'Travel & Transit',
  },
  {
    type: 'Restaurant / Dining Bill',
    text: `
KAFE BISTRO & DINING
100 Feet Road, Indiranagar, Bangalore - 560038
GSTIN: 29ABCDE1234F1Z5
Date: 28/10/2026 20:45
Table: 12   Dine In
Subtotal: 760.00
CGST 2.5%: 19.00
SGST 2.5%: 19.00
GRAND TOTAL: ₹ 798.00
Paid via UPI
    `,
    expectedCategory: 'Dining & Restaurant',
  },
  {
    type: 'Fuel / Petrol Receipt',
    text: `
INDIANOIL
SRI BALAJI FUELS
NH-44 Bypass Road, Salem, Tamil Nadu - 636005
GST: 33AABCS1423B1Z2
Date: 29/10/2026 09:15
Dispenser No: 02   Nozzle: 01
Product: Petrol
Rate: 102.50
Volume: 14.63 L
TOTAL AMOUNT: 1500.00
Mode: Card
    `,
    expectedCategory: 'Fuel & Auto',
  },
  {
    type: 'Supermarket Bill (DMart)',
    text: `
DMART - AVENUE SUPERMARTS LTD
Plot 12, Gachibowli Main Road, Hyderabad - 500032
GSTIN: 36AABCA1234A1Z9
TAX INVOICE NO: DM-HYD-99120
Date: 25/10/2026 16:30
Total Items: 8
Subtotal: 2150.00
CGST: 75.00
SGST: 75.00
NET PAYABLE: 2300.00
Payment: UPI / PhonePe
    `,
    expectedCategory: 'Groceries & Supplies',
  },
  {
    type: 'Flight Ticket (IndiGo)',
    text: `
IndiGo Airlines
Flight 6E-204
PNR: ABC123AIR
Date: 26/10/2026
Passenger: Jane Doe
From: MAA (Chennai) To: DEL (New Delhi)
Airfare & Taxes:
Base Fare: 4200.00
K3 GST: 210.00
User Development Fee: 350.00
TOTAL FARE: 4760.00
Payment: Net Banking
    `,
    expectedCategory: 'Travel & Transit',
  },
  {
    type: 'Uber Cab Ride Invoice',
    text: `
Uber Rides
Trip Invoice #UB-882194
Date: 27/10/2026 17:30
Driver: Ramesh K
Trip: Koramangala to Kempegowda Airport, Bangalore
Distance: 38.5 KM
Ride Fare: 850.00
Toll Charges: 110.00
TOTAL FARE: 960.00
Payment: Cash
    `,
    expectedCategory: 'Trip & Commute',
  },
  {
    type: 'Pharmacy / Medical Bill (Apollo)',
    text: `
APOLLO PHARMACY
Ground Floor, Anna Nagar, Chennai - 600040
GSTIN: 33AAACA1029R1ZO
Cash Memo / Tax Invoice
Date: 29/10/2026 11:20
Dr. Sundar / Patient: Ravi
Medicine Subtotal: 620.00
GST 12%: 74.40
TOTAL PAYABLE: 694.40
Mode: Card
    `,
    expectedCategory: 'Health & Medical',
  },
  {
    type: 'Electricity / Utility Bill',
    text: `
BESCOM ELECTRICITY BILL
Bangalore Electricity Supply Company Limited
Account ID: 9942817291
Koramangala Sub-division, Bangalore - 560034
Billing Month: Oct 2026
Units Consumed: 210 kWh
Energy Charges: 1420.00
FPPCA & Tax: 160.00
TOTAL AMOUNT DUE: 1580.00
Due Date: 05/11/2026
    `,
    expectedCategory: 'Utilities',
  },
];

console.log('================================================================');
console.log('🧪 TESTING UNIVERSAL MULTI-BILL PARSER ON 10 DIVERSE BILL TYPES');
console.log('================================================================\n');

let passedCount = 0;

testCases.forEach((tc, idx) => {
  const result = parseReceiptText(tc.text);
  const isMatch = result.category === tc.expectedCategory && parseFloat(result.total) > 0;
  if (isMatch) passedCount++;

  console.log(`[TEST ${idx + 1}] ${tc.type}:`);
  console.log(`   🏷️  Merchant: "${result.merchant}"`);
  console.log(`   📍 Location: "${result.location}"`);
  console.log(`   🏢 GSTIN: "${result.gstin || 'N/A'}" (${result.gstinDetails ? result.gstinDetails.stateName : 'No GST'})`);
  console.log(`   💰 Total: ₹${result.total} (Subtotal: ₹${result.subtotal}, Tax: ₹${result.tax})`);
  console.log(`   💳 Payment: ${result.paymentMode} | Date: ${result.rawDateStr || result.date}`);
  console.log(`   📋 Category: ${result.category} (${result.billTypeLabel})`);
  console.log(`   💬 Explanation: ${result.explanation}`);
  console.log(`   ${isMatch ? '✅ PASSED' : '❌ FAILED'}\n`);
});

console.log('================================================================');
console.log(`🎯 RESULT: ${passedCount} / ${testCases.length} Bills Parsed Accurately!`);
console.log('================================================================');

if (passedCount === testCases.length) {
  process.exit(0);
} else {
  process.exit(1);
}
