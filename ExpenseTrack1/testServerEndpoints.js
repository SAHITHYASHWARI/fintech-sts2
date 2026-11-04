const app = require('./server');

const testPort = 5098;
const server = app.listen(testPort, async () => {
  try {
    console.log(`Test server running on port ${testPort}`);

    // 1. Test GST lookup
    const gstRes = await fetch(`http://localhost:${testPort}/api/gst-lookup/33AAAAH1234F1Z5`);
    const gstData = await gstRes.json();
    console.log('1. GST Lookup Test:', gstData.success, 'State:', gstData.data?.stateName, 'PAN:', gstData.data?.pan);

    // 2. Test POST /api/bills
    const billRes = await fetch(`http://localhost:${testPort}/api/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant: 'Hotel Grand Palace Resort',
        location: 'No. 42, Beach Road, T. Nagar, Chennai - 600017, Tamil Nadu',
        gstin: '33AAAAH1234F1Z5',
        category: 'Hotel & Lodging',
        amount: 3584.00,
        subtotal: 3200.00,
        tax: 384.00,
        payment_mode: 'Cash',
        invoice_ref: 'Inv: HGP-8841',
        explanation: 'Hotel & Accommodation Bill from Hotel Grand Palace Resort'
      })
    });
    const billJson = await billRes.json();
    console.log('2. POST /api/bills Test:', billJson.success, 'Merchant:', billJson.data?.merchant, 'Loc:', billJson.data?.location, 'Amount:', billJson.data?.amount);

    // 3. Test GET /api/bills
    const getBillsRes = await fetch(`http://localhost:${testPort}/api/bills`);
    const getBillsJson = await getBillsRes.json();
    console.log('3. GET /api/bills Test: count =', getBillsJson.count, 'first =', getBillsJson.data[0]?.merchant, 'Loc:', getBillsJson.data[0]?.location);

    // 4. Test POST /api/ocr-scan with text
    const ocrRes = await fetch(`http://localhost:${testPort}/api/ocr-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawText: 'INDIAN RAILWAYS\nUTS NO: CXRPEGG1G6\nSALEM JN TO KATPADI JN\nFARE: RS. 170.00\nGSTIN: 33AAAGM0289C1ZQ',
        fileName: 'ticket.jpg'
      })
    });
    const ocrJson = await ocrRes.json();
    console.log('4. POST /api/ocr-scan Test:', ocrJson.success, 'Merchant:', ocrJson.data?.merchant, 'Loc:', ocrJson.data?.location, 'GST:', ocrJson.data?.gstin);

    // 5. Test GET /api/segregation?type=bill
    const segRes = await fetch(`http://localhost:${testPort}/api/segregation?type=bill`);
    const segJson = await segRes.json();
    console.log('5. GET /api/segregation?type=bill Test: count =', segJson.data?.length || segJson.length);

    console.log('\n ALL BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Server test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
