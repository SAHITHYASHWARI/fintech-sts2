const { parseReceiptText } = require('./billParser');
const raw = `> 4
 KATPADI Kicpey
3rd Street opp yi Main Gate
_Vellakalmedy Katpadi Vellore
Contact No: 8248252048
29 October 2026 03:01 Pm
Customer Copy
Dine In
KOT No: 6 ; ra
———— ae ee E
Se Table User: KKcaptain
TE ri
Aloo Paratha 1 45 45
Paneer Paratha fs 55 55
Gobi Paratha 1 45 45
Onion Paratha wi 45 45
Butter Nan 3 40 ,
Hydrabadi Chicken _- :
Total: 0 :
Grand Total : Rs § 510.00
© Powered by TMBIIVT.4.46
EE`;

const res = parseReceiptText(raw, 'bill1.jpeg');
console.log('Result:', JSON.stringify(res, null, 2));
