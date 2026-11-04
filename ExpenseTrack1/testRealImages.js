// Test parser on both user images
const { createWorker } = require('./node_modules/tesseract.js');
const { parseReceiptText } = require('./billParser');

async function testBothRealImages() {
  console.log('Testing both real user images...');
  const worker = await createWorker('eng');

  // 1. Katpadi Kitchen image
  const res1 = await worker.recognize('C:/Users/HP/.gemini/antigravity/brain/cd4a98a5-cd6f-4895-b8de-e7b2afc8cb1f/.user_uploaded/media_1793342746521_566f4212.jpg');
  const parsed1 = parseReceiptText(res1.data.text, 'bill1.jpeg');
  console.log('\n===========================================');
  console.log('🍽️ USER BILL 1: KATPADI KITCHEN');
  console.log('===========================================');
  console.log('Category:', parsed1.category, `(${parsed1.billTypeLabel})`);
  console.log('Merchant:', parsed1.merchant);
  console.log('Location:', parsed1.location);
  console.log('Total:', parsed1.total);
  console.log('Date:', parsed1.rawDateStr || parsed1.date, parsed1.timeStr);
  console.log('Payment:', parsed1.paymentMode);
  console.log('Explanation:', parsed1.explanation);

  // 2. Railway ticket image
  const res2 = await worker.recognize('C:/Users/HP/.gemini/antigravity/brain/cd4a98a5-cd6f-4895-b8de-e7b2afc8cb1f/.user_uploaded/media_1793342746574_6f3cb8ed.jpg');
  const parsed2 = parseReceiptText(res2.data.text, 'ticket.jpeg');
  console.log('\n===========================================');
  console.log('🚆 USER BILL 2: RAILWAY UTS TICKET');
  console.log('===========================================');
  console.log('Category:', parsed2.category, `(${parsed2.billTypeLabel})`);
  console.log('Merchant:', parsed2.merchant);
  console.log('Location:', parsed2.location);
  console.log('GSTIN:', parsed2.gstin, parsed2.gstinDetails?.stateName);
  console.log('Total:', parsed2.total);
  console.log('Date:', parsed2.rawDateStr || parsed2.date, parsed2.timeStr);
  console.log('Payment:', parsed2.paymentMode);
  console.log('Invoice:', parsed2.invoiceRef);
  console.log('Explanation:', parsed2.explanation);

  await worker.terminate();
}

testBothRealImages();
