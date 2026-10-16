import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

// Without a backend, the dashboard can still be explored in development.
// Changes made in this mode live only in the current browser's localStorage.
export const isLocalPreviewAllowed =
  !isSupabaseConfigured &&
  (import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOCAL_PREVIEW === 'true');

export const STORAGE_BUCKET = 'media';
