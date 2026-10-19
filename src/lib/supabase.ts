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

// Allowlist for Admin accounts
export const ADMIN_ALLOWLIST = ['numanalmuqorrin@gmail.com', 'inabahijab@gmail.com'];

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
