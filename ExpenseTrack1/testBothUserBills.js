const { parseReceiptText } = require('./billParser');

// Let's test the Katpadi Kitchen bill
const katpadiRaw = `> 4
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

console.log('--- TESTING KATPADI KITCHEN ---');
const resKatpadi = parseReceiptText(katpadiRaw, 'bill1.jpeg');
console.log('Merchant:', resKatpadi.merchant);
console.log('Location:', resKatpadi.location);
console.log('Category:', resKatpadi.category);
console.log('Total:', resKatpadi.total);

// Let's test the Railway Ticket
const ticketRaw = `BSE | sani \\
gro
HAPPY JOURNEY ®) hE -
AM Le
E 897122 34
| a SECOND MAD JEXY JOURNEY ATVM
| fern of @ arms gu
| SALEM JN, TO KATPADI IN KM 204
| Cheam igh. SEL LEH! if, 1. GalsTE el
Via JT]
ADULT: 2 CHILD:0
JCOON: 18/0 3/2026
10 (RPEGG1G6 Rs. 170):
1064 TR:33AAAGMOZ 39C1Z2Q
Jo. SU0288244 MODE CARD
21484 18109 2026 14:51 SATO AME89712234`;

console.log('\n--- TESTING RAILWAY TICKET ---');
const resTicket = parseReceiptText(ticketRaw, 'ticket.jpeg');
console.log('Merchant:', resTicket.merchant);
console.log('Location:', resTicket.location);
console.log('Category:', resTicket.category);
console.log('Total:', resTicket.total);
