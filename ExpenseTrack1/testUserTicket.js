const { parseReceiptText } = require('./billParser');

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
21484 18109 2026 14:51 SATO AMEB9712234`;

const res = parseReceiptText(ticketRaw, 'ticket.jpeg');
console.log('--- USER REAL TICKET PARSED ---');
console.log('Category:', res.category);
console.log('Merchant:', res.merchant);
console.log('Location:', res.location);
console.log('GSTIN:', res.gstin);
console.log('Total:', res.total);
console.log('Date:', res.rawDateStr || res.date);
console.log('Payment:', res.paymentMode);
console.log('Invoice:', res.invoiceRef);
