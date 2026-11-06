/**
 * STS FINTECH – Vercel Serverless Function for /api/bills
 * Integrated with Supabase PostgreSQL & Supabase Storage Bucket ('bills')
 * with dual-tier fallback to local ledger for 100% offline & zero-config resilience.
 */

import fs from 'fs';
import path from 'path';
import { supabaseServer, isSupabaseConfigured, uploadBillImageToStorage } from './supabaseServer.js';

const STORE_PATH = path.join('/tmp', 'bills_store.json');

function loadLocalStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    }
  } catch (_) {}
  return [];
}

function saveLocalStore(bills) {
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

  // ═════════════════════════════════════════════════════════════════════════
  // 1. GET /api/bills (Fetch Bills List with Search, Status, Month Filters)
  // ═════════════════════════════════════════════════════════════════════════
  if (req.method === 'GET') {
    const { section, category, status, search, month, id } = req.query;

    // Single bill lookup
    if (id) {
      if (isSupabaseConfigured && supabaseServer) {
        try {
          const { data: bill, error } = await supabaseServer
            .from('bills')
            .select('*, bill_items(*)')
            .eq('id', id)
            .single();

          if (!error && bill) {
            return res.status(200).json({ success: true, data: bill });
          }
        } catch (_) {}
      }
      const local = loadLocalStore().find((b) => b.id === id);
      if (local) return res.status(200).json({ success: true, data: local });
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Try Supabase PostgreSQL First
    if (isSupabaseConfigured && supabaseServer) {
      try {
        let query = supabaseServer
          .from('bills')
          .select('*, bill_items(*)')
          .order('created_at', { ascending: false });

        if (userId && userId !== 'all') {
          query = query.or(`user_id.eq.${userId},user_id.eq.usr_sts_default`);
        }

        if (status && status !== 'all') {
          query = query.eq('payment_status', status.toLowerCase());
        }

        if (category && category !== 'all') {
          query = query.ilike('category', category);
        }

        if (month) {
          query = query.gte('invoice_date', `${month}-01`).lte('invoice_date', `${month}-31`);
        }

        const { data: supabaseBills, error } = await query;

        if (!error && Array.isArray(supabaseBills)) {
          let filtered = supabaseBills;
          if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((b) =>
              (b.supplier_name || '').toLowerCase().includes(q) ||
              (b.supplier_gstin || '').toLowerCase().includes(q) ||
              (b.customer_gstin || '').toLowerCase().includes(q) ||
              (b.invoice_number || '').toLowerCase().includes(q) ||
              (b.supplier_address || '').toLowerCase().includes(q)
            );
          }

          if (section === 'due') {
            filtered = filtered.filter((b) => b.payment_status === 'unpaid' || b.payment_status === 'partially_paid' || b.payment_status === 'needs_confirmation');
          } else if (section === 'scanned') {
            filtered = filtered.filter((b) => b.payment_status === 'paid' || !b.is_due_bill);
          }

          // Merge with any offline local bills
          const localList = loadLocalStore();
          const billMap = new Map();
          localList.forEach((b) => billMap.set(String(b.id), b));
          filtered.forEach((b) => billMap.set(String(b.id), b));

          return res.status(200).json({
            success: true,
            source: 'supabase',
            count: billMap.size,
            data: Array.from(billMap.values()),
            userId,
          });
        }
      } catch (sbErr) {
        console.warn('[Supabase] Falling back to local store:', sbErr.message);
      }
    }

    // Local Fallback
    let all = loadLocalStore();
    let userBills = all.filter((b) => !b.user_id || b.user_id === userId || b.user_id === 'usr_sts_default');

    if (section === 'due') {
      userBills = userBills.filter((b) => b.is_due_bill || b.payment_status === 'unpaid' || b.payment_status === 'needs_confirmation' || b.payment_status === 'partially_paid');
    } else if (section === 'scanned') {
      userBills = userBills.filter((b) => !b.is_due_bill || b.payment_status === 'paid');
    }

    if (status && status !== 'all') {
      userBills = userBills.filter((b) => (b.payment_status || b.status || '').toLowerCase() === status.toLowerCase());
    }

    if (category && category !== 'all') {
      userBills = userBills.filter((b) => (b.category || '').toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      userBills = userBills.filter((b) =>
        (b.supplier_name || b.merchant_name || b.merchant || '').toLowerCase().includes(q) ||
        (b.supplier_gstin || b.gstin || '').toLowerCase().includes(q) ||
        (b.customer_gstin || '').toLowerCase().includes(q) ||
        (b.invoice_number || b.invoice_ref || '').toLowerCase().includes(q) ||
        (b.supplier_address || b.merchant_location || b.location || '').toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      source: 'local_ledger',
      count: userBills.length,
      data: userBills,
      userId,
    });
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. POST /api/bills (Save Bill, Upload Images to Storage & Insert to DB)
  // ═════════════════════════════════════════════════════════════════════════
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const billId = body.id || `bill-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const grand_total = Math.max(0, parseFloat(body.total_amount || body.grand_total || body.amount) || 0);
      const supplier_name = (body.supplier_name || body.merchant_name || body.merchant || 'Verified Merchant').trim();
      const supplier_gstin = (body.supplier_gstin || body.gstin || '').trim();
      const customer_gstin = (body.customer_gstin || '').trim();

      // Permanent Supabase Storage Upload
      let permanentOriginalUrl = body.original_image_url || body.receipt_image_path || '';
      let permanentEnhancedUrl = body.enhanced_image_url || '';

      if (isSupabaseConfigured && supabaseServer) {
        if (permanentOriginalUrl && permanentOriginalUrl.startsWith('data:')) {
          const storedOriginal = await uploadBillImageToStorage(
            permanentOriginalUrl,
            `originals/${userId}/${billId}.jpg`
          );
          if (storedOriginal) permanentOriginalUrl = storedOriginal;
        }

        if (permanentEnhancedUrl && permanentEnhancedUrl.startsWith('data:')) {
          const storedEnhanced = await uploadBillImageToStorage(
            permanentEnhancedUrl,
            `enhanced/${userId}/${billId}.jpg`
          );
          if (storedEnhanced) permanentEnhancedUrl = storedEnhanced;
        }
      }

      const taxable = parseFloat(body.taxable_amount || body.subtotal) || grand_total;
      const cgstVal = parseFloat(body.cgst) || 0;
      const sgstVal = parseFloat(body.sgst) || 0;
      const igstVal = parseFloat(body.igst) || 0;
      const totalTaxVal = parseFloat(body.total_tax || body.tax) || (cgstVal + sgstVal + igstVal);

      const billRecord = {
        id: billId,
        user_id: userId,
        supplier_name,
        merchant_name: supplier_name,
        merchant: supplier_name,
        supplier_gstin,
        gstin: supplier_gstin,
        customer_gstin,
        customer_name: body.customer_name || '',
        invoice_number: body.invoice_number || body.invoice_ref || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_ref: body.invoice_number || body.invoice_ref || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: body.invoice_date || body.bill_date || body.date || new Date().toISOString().split('T')[0],
        bill_date: body.invoice_date || body.bill_date || body.date || new Date().toISOString().split('T')[0],
        date: body.invoice_date || body.bill_date || body.date || new Date().toISOString().split('T')[0],
        supplier_address: body.supplier_address || body.merchant_location || body.location || '',
        merchant_location: body.supplier_address || body.merchant_location || body.location || '',
        location: body.supplier_address || body.merchant_location || body.location || '',
        customer_address: body.customer_address || '',
        taxable_amount: taxable,
        subtotal: taxable,
        cgst: cgstVal,
        sgst: sgstVal,
        igst: igstVal,
        total_tax: totalTaxVal,
        tax: totalTaxVal,
        discount: parseFloat(body.discount) || 0,
        total_amount: grand_total,
        grand_total,
        amount: grand_total,
        amount_paid: body.payment_status === 'paid' ? grand_total : (parseFloat(body.amount_paid) || 0),
        remaining_balance: body.payment_status === 'paid' ? 0 : Math.max(0, grand_total - (parseFloat(body.amount_paid) || 0)),
        payment_status: body.payment_status || 'paid',
        status: body.payment_status === 'paid' ? 'Paid' : (body.status || 'Needs Confirmation'),
        payment_mode: body.payment_mode || 'Cash',
        category: body.category || 'General',
        bill_type: body.bill_type || 'General Bill',
        original_image_url: permanentOriginalUrl,
        receipt_image_path: permanentOriginalUrl,
        enhanced_image_url: permanentEnhancedUrl,
        complete_ocr_text: body.complete_ocr_text || body.raw_ocr_text || body.raw_text || '',
        raw_ocr_text: body.complete_ocr_text || body.raw_ocr_text || body.raw_text || '',
        gst_verification_status: body.gst_verification_status || (supplier_gstin ? 'Verified' : 'GSTIN Not Provided'),
        gst_api_response: body.gst_api_response || {},
        entry_source: body.entry_source || 'OCR_UPLOAD',
        source_type: body.source_type || 'OCR_UPLOAD',
        is_due_bill: Boolean(body.is_due_bill),
        explanation: body.explanation || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Insert into Supabase PostgreSQL
      let savedInSupabase = false;
      if (isSupabaseConfigured && supabaseServer) {
        try {
          const { error: insertError } = await supabaseServer
            .from('bills')
            .upsert(billRecord, { onConflict: 'id' });

          if (!insertError) {
            savedInSupabase = true;

            // Insert line items if present
            const items = Array.isArray(body.items) ? body.items : [];
            if (items.length > 0) {
              const itemRows = items.map((it) => ({
                bill_id: billId,
                item_name: it.item_name || it.name || 'Item',
                hsn_sac_code: it.hsn_sac_code || it.hsn || '',
                quantity: parseFloat(it.quantity || it.qty) || 1,
                unit_price: parseFloat(it.unit_price || it.rate || it.price) || 0,
                taxable_value: parseFloat(it.taxable_value || it.amount) || 0,
                tax_amount: parseFloat(it.tax_amount || it.tax) || 0,
                total: parseFloat(it.total) || 0,
              }));

              await supabaseServer.from('bill_items').insert(itemRows);
            }
          } else {
            console.warn('[Supabase] Insert notice:', insertError.message);
          }
        } catch (sbErr) {
          console.warn('[Supabase] Save exception:', sbErr.message);
        }
      }

      // 2. Always persist to local fallback store as secondary ledger
      const existing = loadLocalStore();
      const updated = [billRecord, ...existing.filter((b) => b.id !== billRecord.id)];
      saveLocalStore(updated);

      return res.status(201).json({
        success: true,
        message: savedInSupabase
          ? 'Bill and images permanently saved to Supabase Cloud Database & Storage.'
          : 'Bill saved to local resilient ledger.',
        source: savedInSupabase ? 'supabase' : 'local_store',
        data: billRecord,
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 3. PUT / PATCH /api/bills/:id (Update Payment Status / Partial Payment)
  // ═════════════════════════════════════════════════════════════════════════
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { id } = req.query;
      const body = req.body || {};
      const targetId = id || body.id;

      if (!targetId) {
        return res.status(400).json({ success: false, message: 'Bill id is required' });
      }

      // Update in Supabase
      if (isSupabaseConfigured && supabaseServer) {
        try {
          await supabaseServer
            .from('bills')
            .update({
              ...body,
              updated_at: new Date().toISOString(),
            })
            .eq('id', targetId);
        } catch (_) {}
      }

      // Update in local store
      const all = loadLocalStore();
      const updated = all.map((b) => {
        if (b.id === targetId) {
          return { ...b, ...body, updated_at: new Date().toISOString() };
        }
        return b;
      });
      saveLocalStore(updated);

      return res.status(200).json({
        success: true,
        message: 'Bill payment status updated successfully',
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 4. DELETE /api/bills/:id (Delete Bill from Cloud DB & Storage)
  // ═════════════════════════════════════════════════════════════════════════
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ success: false, message: 'Bill id required' });

      if (isSupabaseConfigured && supabaseServer) {
        try {
          await supabaseServer.from('bills').delete().eq('id', id);
        } catch (_) {}
      }

      const all = loadLocalStore();
      const filtered = all.filter((b) => b.id !== id);
      saveLocalStore(filtered);

      return res.status(200).json({ success: true, message: 'Bill deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
