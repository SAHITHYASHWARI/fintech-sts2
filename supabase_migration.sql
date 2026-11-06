-- ============================================================================
-- STS FINTECH: SUPABASE POSTGRESQL CLOUD DATABASE MIGRATION
-- Project: Universal AI Bill Scanner, OCR Intelligence & Payment Ledger
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Bills Table
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT 'usr_sts_default',
    supplier_name TEXT NOT NULL DEFAULT 'Verified Merchant',
    supplier_gstin TEXT,
    customer_gstin TEXT,
    invoice_number TEXT,
    invoice_date DATE,
    supplier_address TEXT,
    customer_name TEXT,
    customer_address TEXT,
    taxable_amount NUMERIC(12, 2) DEFAULT 0.00,
    cgst NUMERIC(12, 2) DEFAULT 0.00,
    sgst NUMERIC(12, 2) DEFAULT 0.00,
    igst NUMERIC(12, 2) DEFAULT 0.00,
    total_tax NUMERIC(12, 2) DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'unpaid', 'partially_paid', 'needs_confirmation')),
    payment_mode TEXT DEFAULT 'Cash',
    remaining_balance NUMERIC(12, 2) DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    category TEXT DEFAULT 'General',
    bill_type TEXT DEFAULT 'General Bill',
    original_image_url TEXT,
    enhanced_image_url TEXT,
    complete_ocr_text TEXT,
    gst_verification_status TEXT DEFAULT 'GSTIN Not Provided',
    gst_api_response JSONB DEFAULT '{}'::jsonb,
    entry_source TEXT DEFAULT 'OCR_UPLOAD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Bill Items Table
CREATE TABLE IF NOT EXISTS public.bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    hsn_sac_code TEXT,
    quantity NUMERIC(10, 2) DEFAULT 1.00,
    unit_price NUMERIC(12, 2) DEFAULT 0.00,
    taxable_value NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Indexes for High-Speed Queries and Filtering
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON public.bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bills_supplier_gstin ON public.bills(supplier_gstin);
CREATE INDEX IF NOT EXISTS idx_bills_invoice_date ON public.bills(invoice_date);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON public.bills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON public.bill_items(bill_id);

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bills_updated_at ON public.bills;
CREATE TRIGGER trigger_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Allow public anon read/write for demo user or auth user
CREATE POLICY "Allow select on bills" ON public.bills
    FOR SELECT USING (true);

CREATE POLICY "Allow insert on bills" ON public.bills
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on bills" ON public.bills
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete on bills" ON public.bills
    FOR DELETE USING (true);

CREATE POLICY "Allow select on bill_items" ON public.bill_items
    FOR SELECT USING (true);

CREATE POLICY "Allow insert on bill_items" ON public.bill_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on bill_items" ON public.bill_items
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete on bill_items" ON public.bill_items
    FOR DELETE USING (true);

-- 8. Storage Bucket Setup (Run in Supabase Storage or Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bills', 'bills', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
CREATE POLICY "Public Read Bills Bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'bills');

CREATE POLICY "Public Insert Bills Bucket" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'bills');

CREATE POLICY "Public Update Bills Bucket" ON storage.objects
    FOR UPDATE USING (bucket_id = 'bills');

CREATE POLICY "Public Delete Bills Bucket" ON storage.objects
    FOR DELETE USING (bucket_id = 'bills');
