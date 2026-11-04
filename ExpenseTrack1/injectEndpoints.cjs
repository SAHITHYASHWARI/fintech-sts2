// inject-new-endpoints.cjs
// Injects new API endpoints into server.js before the "// Root route" comment

const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'server.js');
let src = fs.readFileSync(filePath, 'utf8');

const INJECT_BEFORE = '// Root route';

const NEW_ENDPOINTS = `
// =========================================================================
// BILL PAYMENT STATUS & PARTIAL PAYMENTS
// =========================================================================

/**
 * PUT /api/bills/:id
 * Update a bill record (payment status, amounts, notes)
 */
app.put('/api/bills/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      merchant, location, gstin, bill_type, category,
      amount, subtotal, tax, payment_mode, invoice_ref,
      date, time, explanation, status, payment_status,
    } = req.body;

    // Update in PostgreSQL
    try {
      const sql = \`UPDATE bills SET
        merchant = COALESCE($1, merchant),
        location = COALESCE($2, location),
        gstin = COALESCE($3, gstin),
        bill_type = COALESCE($4, bill_type),
        category = COALESCE($5, category),
        amount = COALESCE($6, amount),
        subtotal = COALESCE($7, subtotal),
        tax = COALESCE($8, tax),
        payment_mode = COALESCE($9, payment_mode),
        invoice_ref = COALESCE($10, invoice_ref),
        status = COALESCE($11, status)
      WHERE id = $12
      RETURNING *;\`;
      await query(sql, [merchant, location, gstin, bill_type, category,
        parseFloat(amount) || null, parseFloat(subtotal) || null, parseFloat(tax) || null,
        payment_mode, invoice_ref, payment_status || status, id]);
    } catch (dbErr) { console.warn('DB update skipped:', dbErr.message); }

    // Update in disk store
    const existing = loadJsonStore(BILLS_STORE_PATH, []);
    const updated = existing.map(b => {
      if (String(b.id) === String(id)) {
        return {
          ...b,
          ...(merchant && { merchant, name: merchant }),
          ...(location && { location }),
          ...(gstin && { gstin }),
          ...(bill_type && { bill_type }),
          ...(category && { category }),
          ...(amount !== undefined && { amount: parseFloat(amount) }),
          ...(subtotal !== undefined && { subtotal: parseFloat(subtotal) }),
          ...(tax !== undefined && { tax: parseFloat(tax) }),
          ...(payment_mode && { payment_mode }),
          ...(invoice_ref && { invoice_ref }),
          ...((payment_status || status) && { status: payment_status || status }),
          updated_at: new Date().toISOString(),
        };
      }
      return b;
    });
    saveJsonStore(BILLS_STORE_PATH, updated);

    const found = updated.find(b => String(b.id) === String(id));
    return res.status(200).json({ success: true, message: 'Bill updated', data: found || { id } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/bills/:id/payment
 * Record a payment (full or partial) against a bill
 */
app.post('/api/bills/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount_paid, payment_mode = 'Cash', payment_date, notes = '' } = req.body;

    const paid = parseFloat(amount_paid);
    if (isNaN(paid) || paid <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount required.' });
    }

    // Load bill
    const existing = loadJsonStore(BILLS_STORE_PATH, []);
    const billIdx = existing.findIndex(b => String(b.id) === String(id));
    if (billIdx === -1) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }

    const bill = existing[billIdx];
    const totalAmount = parseFloat(bill.amount) || 0;
    const alreadyPaid = parseFloat(bill.amount_paid) || 0;
    const newTotalPaid = alreadyPaid + paid;
    const remaining = Math.max(0, totalAmount - newTotalPaid);

    let newStatus = 'Unpaid';
    if (newTotalPaid >= totalAmount) newStatus = 'Paid';
    else if (newTotalPaid > 0) newStatus = 'Partially Paid';

    const paymentRecord = {
      id: \`pmt-\${Date.now()}\`,
      bill_id: id,
      amount_paid: paid,
      payment_mode,
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      notes,
      created_at: new Date().toISOString(),
    };

    // Save payment history
    const history = loadJsonStore(PAYMENTS_HISTORY_PATH, []);
    history.unshift(paymentRecord);
    saveJsonStore(PAYMENTS_HISTORY_PATH, history);

    // Update bill record
    existing[billIdx] = {
      ...bill,
      amount_paid: newTotalPaid,
      remaining_balance: remaining,
      status: newStatus,
      payment_mode,
      last_payment_date: paymentRecord.payment_date,
      updated_at: new Date().toISOString(),
    };
    saveJsonStore(BILLS_STORE_PATH, existing);

    console.log(\`[STS FINTECH] Payment ₹\${paid} recorded for bill \${id}. New status: \${newStatus}\`);

    return res.status(201).json({
      success: true,
      message: \`Payment of ₹\${paid} recorded. Remaining balance: ₹\${remaining.toFixed(2)}\`,
      data: {
        payment: paymentRecord,
        bill: existing[billIdx],
        remaining_balance: remaining,
        new_status: newStatus,
      },
      company: COMPANY_NAME,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/bills/:id/payments
 * Get payment history for a specific bill
 */
app.get('/api/bills/:id/payments', (req, res) => {
  const { id } = req.params;
  const history = loadJsonStore(PAYMENTS_HISTORY_PATH, []);
  const billPayments = history.filter(p => String(p.bill_id) === String(id));
  return res.status(200).json({ success: true, data: billPayments, count: billPayments.length });
});

// =========================================================================
// DUPLICATE DETECTION
// =========================================================================

/**
 * POST /api/bills/duplicate-check
 * Check if a bill (by hash or merchant+date+amount) already exists
 */
app.post('/api/bills/duplicate-check', (req, res) => {
  try {
    const { merchant, total, date, invoice_ref, receipt_hash } = req.body;
    const hash = receipt_hash || generateReceiptHash(merchant, total, date, invoice_ref);

    const existing = loadJsonStore(BILLS_STORE_PATH, []);
    const savedHashes = loadJsonStore(DUPLICATE_HASHES_PATH, {});

    // Check hash-based duplicate
    if (savedHashes[hash]) {
      const dupBill = existing.find(b => String(b.id) === String(savedHashes[hash]));
      return res.status(200).json({
        isDuplicate: true,
        confidence: 'high',
        message: \`Duplicate receipt detected: \${merchant} on \${date} for ₹\${total}\`,
        existingBill: dupBill || null,
        hash,
      });
    }

    // Fuzzy check: same merchant + date + amount
    const fuzzyDup = existing.find(b => {
      const sameMerchant = b.merchant && merchant && b.merchant.toLowerCase().includes(merchant.toLowerCase().slice(0, 8));
      const sameAmount = Math.abs(parseFloat(b.amount) - parseFloat(total)) < 0.01;
      const sameDate = b.date && date && b.date.slice(0, 10) === date.slice(0, 10);
      return sameMerchant && sameAmount && sameDate;
    });

    if (fuzzyDup) {
      return res.status(200).json({
        isDuplicate: true,
        confidence: 'medium',
        message: \`Similar bill found: \${fuzzyDup.merchant} on \${fuzzyDup.date} for ₹\${fuzzyDup.amount}\`,
        existingBill: fuzzyDup,
        hash,
      });
    }

    return res.status(200).json({ isDuplicate: false, hash });
  } catch (err) {
    return res.status(200).json({ isDuplicate: false, error: err.message });
  }
});

/**
 * POST /api/bills/register-hash
 * Register a bill hash after saving (call after successful save)
 */
app.post('/api/bills/register-hash', (req, res) => {
  const { hash, bill_id } = req.body;
  if (!hash || !bill_id) return res.status(400).json({ success: false });
  const hashes = loadJsonStore(DUPLICATE_HASHES_PATH, {});
  hashes[hash] = bill_id;
  saveJsonStore(DUPLICATE_HASHES_PATH, hashes);
  return res.status(200).json({ success: true });
});

// =========================================================================
// MONTHLY ANALYTICS DASHBOARD
// =========================================================================

/**
 * GET /api/bills/analytics
 * Monthly financial summary from all bills in database
 * Query params: ?month=2026-10 (YYYY-MM) or ?year=2026 or ?range=last3months
 */
app.get('/api/bills/analytics', (req, res) => {
  try {
    const { month, year, range, start_date, end_date } = req.query;
    const allBills = loadJsonStore(BILLS_STORE_PATH, []);

    // Date filter function
    const now = new Date();
    const filterBill = (bill) => {
      const billDate = new Date(bill.date || bill.created_at || now);
      if (month) {
        const [y, m] = month.split('-');
        return billDate.getFullYear() === parseInt(y) && (billDate.getMonth() + 1) === parseInt(m);
      }
      if (year) {
        return billDate.getFullYear() === parseInt(year);
      }
      if (range) {
        const days = range === 'last3months' ? 90 : range === 'last6months' ? 180 : range === 'thisyear' ? 365 : 30;
        const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
        return billDate >= cutoff;
      }
      if (start_date && end_date) {
        const s = new Date(start_date), e = new Date(end_date);
        return billDate >= s && billDate <= e;
      }
      // Default: current month
      return billDate.getFullYear() === now.getFullYear() && billDate.getMonth() === now.getMonth();
    };

    const filtered = allBills.filter(filterBill);

    // Compute summary
    const total_bills = filtered.length;
    const total_amount = filtered.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    const total_paid = filtered.filter(b => b.status === 'Paid').reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    const total_unpaid = filtered.filter(b => !b.status || b.status === 'Unpaid').reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    const total_partial_balance = filtered.filter(b => b.status === 'Partially Paid').reduce((s, b) => s + (parseFloat(b.remaining_balance) || parseFloat(b.amount) || 0), 0);
    const total_overdue = filtered.filter(b => b.status === 'Overdue').reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
    const count_paid = filtered.filter(b => b.status === 'Paid').length;
    const count_unpaid = filtered.filter(b => !b.status || b.status === 'Unpaid').length;
    const count_partial = filtered.filter(b => b.status === 'Partially Paid').length;
    const count_overdue = filtered.filter(b => b.status === 'Overdue').length;

    // By category
    const by_category = {};
    filtered.forEach(b => {
      const cat = b.category || 'General';
      if (!by_category[cat]) by_category[cat] = { count: 0, amount: 0 };
      by_category[cat].count++;
      by_category[cat].amount += parseFloat(b.amount) || 0;
    });

    // By payment mode
    const by_payment_mode = {};
    filtered.forEach(b => {
      const mode = b.payment_mode || 'Cash';
      if (!by_payment_mode[mode]) by_payment_mode[mode] = { count: 0, amount: 0 };
      by_payment_mode[mode].count++;
      by_payment_mode[mode].amount += parseFloat(b.amount) || 0;
    });

    // Monthly trend (last 6 months)
    const monthly_trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      const monthBills = allBills.filter(b => {
        const bd = new Date(b.date || b.created_at || now);
        return bd.getFullYear() === y && (bd.getMonth() + 1) === m;
      });
      monthly_trend.push({
        month: \`\${y}-\${String(m).padStart(2, '0')}\`,
        label: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
        total_bills: monthBills.length,
        total_amount: monthBills.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0),
        paid: monthBills.filter(b => b.status === 'Paid').reduce((s, b) => s + (parseFloat(b.amount) || 0), 0),
        unpaid: monthBills.filter(b => !b.status || b.status === 'Unpaid').reduce((s, b) => s + (parseFloat(b.amount) || 0), 0),
      });
    }

    return res.status(200).json({
      success: true,
      period: month || year || range || 'current_month',
      summary: {
        total_bills,
        total_amount: parseFloat(total_amount.toFixed(2)),
        total_paid: parseFloat(total_paid.toFixed(2)),
        total_unpaid: parseFloat(total_unpaid.toFixed(2)),
        total_partial_balance: parseFloat(total_partial_balance.toFixed(2)),
        total_overdue: parseFloat(total_overdue.toFixed(2)),
        count_paid,
        count_unpaid,
        count_partial,
        count_overdue,
      },
      by_category,
      by_payment_mode,
      monthly_trend,
      bills: filtered,
      company: COMPANY_NAME,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/bills/overdue
 * Get all overdue bills (unpaid past due date)
 */
app.get('/api/bills/overdue', (req, res) => {
  try {
    const allBills = loadJsonStore(BILLS_STORE_PATH, []);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = allBills.filter(b => {
      if (b.status === 'Paid') return false;
      const dueDate = b.due_date ? new Date(b.due_date) : null;
      if (!dueDate) return false;
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });

    // Auto-mark as overdue in store
    if (overdue.length > 0) {
      const updated = allBills.map(b => {
        const isOverdue = overdue.find(o => o.id === b.id);
        return isOverdue ? { ...b, status: 'Overdue' } : b;
      });
      saveJsonStore(BILLS_STORE_PATH, updated);
    }

    return res.status(200).json({
      success: true,
      count: overdue.length,
      data: overdue,
      total_overdue_amount: overdue.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0),
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/bills/manual
 * Create a bill manually (without OCR)
 */
app.post('/api/bills/manual', async (req, res) => {
  try {
    const {
      merchant = 'Manual Entry', location = '', gstin = '',
      bill_type = 'General Bill', category = 'General',
      amount, subtotal, tax = 0, discount = 0,
      payment_mode = 'Cash', invoice_ref = '',
      date, time, due_date, notes = '',
      payment_status = 'Unpaid', items = [],
    } = req.body;

    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return res.status(400).json({ success: false, message: 'Amount required.' });

    const cleanDate = date || new Date().toISOString().split('T')[0];
    const billRecord = {
      id: \`bill-\${Date.now()}\`,
      merchant: merchant.trim(),
      name: merchant.trim(),
      location: (location || '').trim(),
      gstin: (gstin || '').trim(),
      bill_type,
      category,
      amount: numAmount,
      subtotal: parseFloat(subtotal) || numAmount,
      tax: parseFloat(tax) || 0,
      discount: parseFloat(discount) || 0,
      payment_mode,
      invoice_ref: invoice_ref || \`MANUAL-\${Date.now()}\`,
      date: cleanDate,
      time: time || new Date().toTimeString().slice(0, 5),
      due_date: due_date || null,
      notes: notes.trim(),
      status: payment_status,
      amount_paid: payment_status === 'Paid' ? numAmount : 0,
      remaining_balance: payment_status === 'Paid' ? 0 : numAmount,
      entry_source: 'Manual',
      explanation: \`Manual entry: \${merchant.trim()} • ₹\${numAmount} • \${payment_status}\`,
      items,
      created_at: new Date().toISOString(),
    };

    const existing = loadJsonStore(BILLS_STORE_PATH, []);
    saveJsonStore(BILLS_STORE_PATH, [billRecord, ...existing]);

    // Also save to segregation store
    const segRecord = {
      ...billRecord,
      type: 'bill',
      schedule: \`Manual (\${payment_mode})\`,
      description: billRecord.explanation,
    };
    const existingSeg = loadJsonStore(SEGREGATION_STORE_PATH, []);
    saveJsonStore(SEGREGATION_STORE_PATH, [segRecord, ...existingSeg]);

    console.log(\`[STS FINTECH] Manual bill created: "\${billRecord.merchant}" ₹\${numAmount} [\${payment_status}]\`);

    return res.status(201).json({
      success: true, message: 'Manual bill created', data: billRecord, company: COMPANY_NAME,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/bills/search
 * Search bills by merchant, category, date range, status
 */
app.get('/api/bills/search', (req, res) => {
  try {
    const { q, category, status, start_date, end_date, month, entry_source } = req.query;
    let bills = loadJsonStore(BILLS_STORE_PATH, []);

    if (q) {
      const qLower = q.toLowerCase();
      bills = bills.filter(b =>
        (b.merchant || '').toLowerCase().includes(qLower) ||
        (b.location || '').toLowerCase().includes(qLower) ||
        (b.gstin || '').toLowerCase().includes(qLower) ||
        (b.invoice_ref || '').toLowerCase().includes(qLower)
      );
    }
    if (category) bills = bills.filter(b => (b.category || '').toLowerCase() === category.toLowerCase());
    if (status) bills = bills.filter(b => (b.status || '').toLowerCase() === status.toLowerCase());
    if (entry_source) bills = bills.filter(b => (b.entry_source || 'OCR').toLowerCase() === entry_source.toLowerCase());
    if (month) {
      bills = bills.filter(b => b.date && b.date.startsWith(month));
    } else if (start_date && end_date) {
      const s = new Date(start_date), e = new Date(end_date);
      bills = bills.filter(b => {
        const d = new Date(b.date || b.created_at);
        return d >= s && d <= e;
      });
    }

    return res.status(200).json({ success: true, count: bills.length, data: bills });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

`;

if (src.includes(INJECT_BEFORE)) {
  src = src.replace(INJECT_BEFORE, NEW_ENDPOINTS + INJECT_BEFORE);
  fs.writeFileSync(filePath, src, 'utf8');
  console.log('New endpoints injected ✅ Lines added:', NEW_ENDPOINTS.split('\n').length);
} else {
  console.log('Injection point not found');
}
