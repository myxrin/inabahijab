import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://yrmnajmkibuuzyfhjoyw.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IY1FW4DrapR4iVavOv6-Mw_hDGhwfg5';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/** Only render product imagery served from this project's public Supabase Storage bucket. */
export function isProductStorageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  return value.startsWith(`${SUPABASE_URL}/storage/v1/object/public/product-images/`);
}

/** Only render public site banners served from this project's site-images bucket. */
export function isSiteStorageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  return value.startsWith(`${SUPABASE_URL}/storage/v1/object/public/site-images/`);
}


export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}

export function cleanPhoneNumber(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  return digits;
}
