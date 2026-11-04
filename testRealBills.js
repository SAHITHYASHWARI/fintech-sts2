const { parseReceiptText } = require('./ExpenseTrack1/billParser');

const ramrajText = `RAMRAJ
COTTON-LINEN
RAMRAJ COTTON
UNIT OF VENNILA CLOTHING COMPANY
NO.620/4, VELLORE ROAD, NEAR
CHITTOOR BUS STAND, KATPADI-632007.
Ph: 6369702147   GST: 33AAHFR2641F1ZI
Bill No R220/CC8578   Date : 01/11/26
Time : 11:40 AM
Customer Name : MOURISHWAR
Mobile : 7305190110
HSN/ GST %/CATEGORY
Code/ Item Rate Disc Net Rate Qty Total
61071100/5%/TRUNKS
1248/TARGET_WOP_100_MULTI CLR
185.00 0.00 185.00 1.00 185.00
61071100/5%/TRUNKS
1248/TARGET_WOP_100_MULTI CLR
185.00 0.00 185.00 2.00 370.00
61091000/5%/BANIAN
1042/SUKRA COLOUR_RN_100_MULTI CL
165.00 0.00 165.00 3.00 495.00
39232990/18%/BAG
RCBAG33/NON WOVEN HANDLE BAG L_RC
0.01 0.00 0.01 5.00 0.05
Total : 1050.05
Total Pcs: 11.00 Rs. 1050.00
Payment Mode : CREDIT CARD BILL
TAX SUMMARY
Taxable CGST SGST Total
Value
1000.00 2.50 25.00 2.50 25.00 1050.00
Remarks: online shopping www.ramrajcotton.in`;

const res = parseReceiptText(ramrajText, 'bill4.jpeg');
console.log('--- RAMRAJ TEST ---');
console.log('Merchant:', res.merchant);
console.log('Category:', res.category);
console.log('GSTIN:', res.gstin);
console.log('Total:', res.total);
console.log('Date:', res.date);
console.log('Location:', res.location);

