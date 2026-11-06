/**
 * STS FINTECH – Frontend Supabase Client
 * Handles real-time cloud database syncing, image uploads to storage bucket 'bills',
 * and instant bill management.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseClientConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseClientConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads an image (DataURL or Blob) directly to Supabase storage bucket 'bills'
 * @param {string|Blob} imageData - Data URL or image Blob
 * @param {string} fileName - File name / path in storage bucket
 * @returns {Promise<string|null>} Permanent public storage URL
 */
export async function uploadImageToSupabaseStorage(imageData, fileName) {
  if (!supabase || !isSupabaseClientConfigured || !imageData) return null;

  try {
    let blob;
    let contentType = 'image/jpeg';

    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      const parts = imageData.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      contentType = mime;
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else if (imageData instanceof Blob) {
      blob = imageData;
      contentType = imageData.type || 'image/jpeg';
    } else {
      return null;
    }

    const cleanPath = `${fileName.replace(/[^a-zA-Z0-9_\-\.\/]/g, '_')}`;

    const { error } = await supabase.storage
      .from('bills')
      .upload(cleanPath, blob, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn('[Supabase Client Storage] Upload notice:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('bills')
      .getPublicUrl(cleanPath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn('[Supabase Client Storage] Upload error:', err);
    return null;
  }
}
