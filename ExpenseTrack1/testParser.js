const { parseReceiptText } = require('./billParser');

// Test 1: Hotel Bill
const hotelSample = `
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
`;
const res1 = parseReceiptText(hotelSample);
console.log('--- TEST 1: HOTEL ---');
console.log('Merchant:', res1.merchant);
console.log('Location:', res1.location);
console.log('GSTIN:', res1.gstin, res1.gstinDetails?.stateName);
console.log('Total:', res1.total, 'Subtotal:', res1.subtotal, 'Tax:', res1.tax);

// Test 2: Railway UTS Ticket
const railwaySample = `
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
`;
const res2 = parseReceiptText(railwaySample);
console.log('\n--- TEST 2: RAILWAY UTS ---');
console.log('Merchant:', res2.merchant);
console.log('Location:', res2.location);
console.log('GSTIN:', res2.gstin, res2.gstinDetails?.stateName);
console.log('Total:', res2.total, 'Tax:', res2.tax);
console.log('Invoice:', res2.invoiceRef);

// Test 3: IRCTC Train Ticket
const irctcSample = `
IRCTC Electronic Reservation Slip (ERS)
PNR: 4238912345
Train No. & Name: 12675 / KOVAI EXPRESS
From: CHENNAI CENTRAL (MAS) To: KSR BENGALURU (SBC)
Date of Journey: 28-Oct-2026
Class: CC   Adult: 2
Ticket Fare: ₹ 890.00
IRCTC Convenience Fee: ₹ 35.40
Total Fare: ₹ 925.40
Payment Mode: UPI
`;
const res3 = parseReceiptText(irctcSample);
console.log('\n--- TEST 3: IRCTC TRAIN ---');
console.log('Merchant:', res3.merchant);
console.log('Location:', res3.location);
console.log('Total:', res3.total);
console.log('Invoice:', res3.invoiceRef);

// Test 4: Restaurant / Dining Bill
const diningSample = `
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
`;
const res4 = parseReceiptText(diningSample);
console.log('\n--- TEST 4: DINING ---');
console.log('Merchant:', res4.merchant);
console.log('Location:', res4.location);
console.log('GSTIN:', res4.gstin, res4.gstinDetails?.stateName);
console.log('Total:', res4.total, 'Subtotal:', res4.subtotal, 'Tax:', res4.tax);

// Test 5: Fuel Bill
const fuelSample = `
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
`;
const res5 = parseReceiptText(fuelSample);
console.log('\n--- TEST 5: FUEL ---');
console.log('Merchant:', res5.merchant);
console.log('Location:', res5.location);
console.log('GSTIN:', res5.gstin, res5.gstinDetails?.stateName);
console.log('Total:', res5.total);
