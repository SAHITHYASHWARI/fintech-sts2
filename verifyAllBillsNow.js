const { parseReceiptText } = require('./ExpenseTrack1/billParser');

console.log('================ 1. RAMRAJ COTTON TEST ================');
const ramrajOcr = `
FARMS’ |.
| |W! FAMANITOTENODS
CXR ECHIERED.
bi SIFY: oe
TRITON BUS #TAND, KATOAD1 632001.
on. epr0aieT_ O8T: JIAAHTR2641F181
Bil No  R220/CCHSTS. Date : 01/11/26
Time 11:40 AM
Customer Name : MOUNIHWAR
Mobile : 7305190110
HSN GST %/CATEGORY
Code/ tem Rate Disc Net fate Qty _ Total
61071100/5%/TRUNKS
1248 TARGET WOP 100 MULTI CLR
185.00 0.00 185.00 1.00 185.00
61091000/5%/BANIAN
165.00 0.00 165.00 3.00 495.00
Total : 1050.05
Total Pcs: 11.00 Rs. 1050.00
Payment Mode : CREDIT CARD BILL
TAX SUMMARY
Taxable Value: 1000.00 CGST 25.00 SGST 25.00 Total 1050.05
Remarks: online shopping www.ramrajcotton.in
`;
const rRes = parseReceiptText(ramrajOcr, 'bill4.jpeg');
console.log('Merchant:', rRes.merchant);
console.log('GSTIN:', rRes.gstin);
console.log('Category:', rRes.category);
console.log('Total:', rRes.total);
console.log('Date:', rRes.date);
console.log('Payment Mode:', rRes.paymentMode);
console.log('Location:', rRes.location);

console.log('\n================ 2. MASHA PHARMACY TEST ================');
const mashaOcr = `
MASHA PHARMACY
50, Vallimalai Road, Katpadi, Vellore-632007
Phone: 9344663145
Email: maahospitalvlr@gmail.com
GSTIN: 33ACEFM3457F1Z0
Bill No: MASHA-10603
Date: 15/08/2026 20:10
Consultant: Dr. VINOTH KUMAR M.B.B.S
Name: Mrs. Uma Mageshwari
Payment Type: Cash
Amount Taxable 400.01 GST 16.76 CGST 8.38 SGST 8.38
Total: 416.77
Round Off: 0.23
Amount Receivable: 417.00
Amount Received: 417.00
`;
const mRes = parseReceiptText(mashaOcr, 'masha.jpg');
console.log('Merchant:', mRes.merchant);
console.log('GSTIN:', mRes.gstin);
console.log('Category:', mRes.category);
console.log('Total:', mRes.total);
console.log('Tax:', mRes.tax);
console.log('Date:', mRes.date);
console.log('Payment Mode:', mRes.paymentMode);
console.log('Location:', mRes.location);

console.log('\n================ 3. ARUNAI MEDICALS TEST ================');
const arunaiOcr = `
ARUNAII MEDICALS
No.92/1,Katchery Street,Tirupattur-635601.
DL.NO: VLV/1868/20,&21. GST NO: 33CMOPS3767A1ZV
Cell: 94426 69348.
BillNumber: C01030532
BillDate : 05/01/2026
CustName: ISWARADHASAN,S
Address : 422/2A,SIPCOT PHASE-II,HOSUR,KRISHNAGIRI HIGH WAY.
Doctor : LOGANATHAN,MD
Value: 3503.75
Discount : 15% 525.56
Total : 2978.00
`;
const aRes = parseReceiptText(arunaiOcr, 'arunai.jpg');
console.log('Merchant:', aRes.merchant);
console.log('GSTIN:', aRes.gstin);
console.log('Category:', aRes.category);
console.log('Total:', aRes.total);
console.log('Date:', aRes.date);
console.log('Location:', aRes.location);

console.log('\n================ 4. HANDWRITTEN ELECTRONICS TEST ================');
const hwOcr = `
445378
BRANCH: Katpadi
DATE: 08/10/25
CUSTOMER NAME: C.P. Babu
GST NO: [X] Yes [] No
If Yes, GST NO : 33BBBPB4794A1Z9
MOBILE NO: 9942105071 / 9952368688
1 Godrej WTEON HYS 95.50 FERH Grey 50322 23200
2 premier Roti maker 36859
CASH: 23200
Exchange: Model Old Exchange Samsung 8kg 800
`;
const hRes = parseReceiptText(hwOcr, 'handwritten.jpg');
console.log('Merchant:', hRes.merchant);
console.log('GSTIN:', hRes.gstin);
console.log('Category:', hRes.category);
console.log('Total:', hRes.total);
console.log('Date:', hRes.date);
console.log('Payment Mode:', hRes.paymentMode);
console.log('Location:', hRes.location);

