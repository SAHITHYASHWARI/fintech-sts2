/**
 * STS FINTECH – Unified Supabase Server Client for Vercel Functions
 * Handles resilient connection to Supabase PostgreSQL & Storage with fallback.
 */

import { createClient } from '@supabase/supabase-js';

const getEnv = (key) => process.env[key] || '';

const supabaseUrl =
  getEnv('SUPABASE_URL') ||
  getEnv('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnv('VITE_SUPABASE_URL');

const supabaseKey =
  getEnv('SUPABASE_SERVICE_ROLE_KEY') ||
  getEnv('SUPABASE_ANON_KEY') ||
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabaseServer = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

/**
 * Uploads a base64 or buffer image to Supabase Storage bucket 'bills'
 * @param {string} base64Data - Data URL or base64 string
 * @param {string} filePath - Path in bucket (e.g. "originals/user123/bill-abc.jpg")
 * @returns {Promise<string|null>} Public URL of uploaded image
 */
export async function uploadBillImageToStorage(base64Data, filePath) {
  if (!isSupabaseConfigured || !supabaseServer || !base64Data) return null;

  try {
    let cleanBase64 = base64Data;
    let contentType = 'image/jpeg';

    if (base64Data.startsWith('data:')) {
      const parts = base64Data.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) contentType = match[1];
      cleanBase64 = parts[1];
    }

    const buffer = Buffer.from(cleanBase64, 'base64');

    const { error: uploadError } = await supabaseServer.storage
      .from('bills')
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn('[Supabase Storage] Upload notice:', uploadError.message);
      return null;
    }

    const { data: publicData } = supabaseServer.storage
      .from('bills')
      .getPublicUrl(filePath);

    return publicData?.publicUrl || null;
  } catch (err) {
    console.warn('[Supabase Storage] Exception during upload:', err.message);
    return null;
  }
}

