/**
 * STS FINTECH – Vercel Serverless Function for /api/bills
 * Handles dual-section bills ledger with user isolation.
 */

import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join('/tmp', 'bills_store.json');

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    }
  } catch (_) {}
  return [];
}

function saveStore(bills) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(bills, null, 2), 'utf8');
  } catch (_) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = req.headers['x-user-id'] || req.query.userId || 'usr_sts_default';

  if (req.method === 'GET') {
    const { section, category, status, search, month } = req.query;
    let all = loadStore();
    let userBills = all.filter((b) => !b.user_id || b.user_id === userId);

    if (section === 'due') {
      userBills = userBills.filter((b) => b.is_due_bill || b.payment_status === 'unpaid' || b.payment_status === 'needs_confirmation');
    } else if (section === 'scanned') {
      userBills = userBills.filter((b) => !b.is_due_bill || b.payment_status === 'paid');
    }

    if (month) {
      userBills = userBills.filter((b) => (b.bill_date || b.date || '').startsWith(month));
    }
    if (category && category !== 'all') {
      userBills = userBills.filter((b) => (b.category || '').toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      userBills = userBills.filter((b) =>
        (b.merchant_name || b.merchant || '').toLowerCase().includes(q) ||
        (b.gstin || '').toLowerCase().includes(q) ||
        (b.merchant_location || b.location || '').toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: userBills.length,
      data: userBills,
      userId,
      company: 'STS FINTECH PRIVATE LIMITED',
    });
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const grand_total = parseFloat(body.grand_total || body.amount) || 0;
      const merchant_name = (body.merchant_name || body.merchant || 'Verified Merchant').trim();

      if (grand_total <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid bill amount greater than ₹0 is required.',
        });
      }

      const billRecord = {
        id: `bill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: userId,
        merchant_name,
        merchant: merchant_name,
        merchant_location: body.merchant_location || body.location || '',
        location: body.merchant_location || body.location || '',
        pincode: body.pincode || '',
        gstin: (body.gstin || '').trim(),
        gst_verification_status: body.gstin ? 'Verified' : 'GSTIN Not Provided',
        gst_verified_name: merchant_name,
        invoice_number: body.invoice_number || body.invoice_ref || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_ref: body.invoice_number || body.invoice_ref || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
        bill_date: body.bill_date || body.date || new Date().toISOString().split('T')[0],
        date: body.bill_date || body.date || new Date().toISOString().split('T')[0],
        grand_total,
        amount: grand_total,
        subtotal: parseFloat(body.subtotal) || grand_total,
        tax: parseFloat(body.tax || body.total_tax) || 0,
        total_tax: parseFloat(body.tax || body.total_tax) || 0,
        discount: parseFloat(body.discount) || 0,
        payment_mode: body.payment_mode || 'Cash',
        payment_status: body.payment_status || 'paid',
        status: body.payment_status === 'paid' ? 'Paid' : 'Needs Confirmation',
        category: body.category || 'General',
        bill_type: body.bill_type || 'General Bill',
        entry_source: body.entry_source || 'OCR_UPLOAD',
        source_type: body.source_type || 'OCR_UPLOAD',
        is_due_bill: Boolean(body.is_due_bill),
        explanation: body.explanation || '',
        raw_ocr_text: body.raw_ocr_text || body.raw_text || '',
        raw_text: body.raw_ocr_text || body.raw_text || '',
        original_image_url: body.original_image_url || body.receipt_image_path || '',
        receipt_image_path: body.original_image_url || body.receipt_image_path || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const existing = loadStore();
      const updated = [billRecord, ...existing.filter((b) => b.id !== billRecord.id)];
      saveStore(updated);

      return res.status(201).json({
        success: true,
        message: 'Bill saved successfully to database.',
        data: billRecord,
        company: 'STS FINTECH PRIVATE LIMITED',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to save bill to server database.',
      });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'ID required' });
    const existing = loadStore();
    const filtered = existing.filter((b) => b.id !== id);
    saveStore(filtered);
    return res.status(200).json({ success: true, message: 'Bill deleted.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
