import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof process !== 'undefined' && (
    process.env?.SUPABASE_URL ||
    process.env?.NEXT_PUBLIC_SUPABASE_URL ||
    process.env?.EXPO_PUBLIC_SUPABASE_URL
  )) ||
  'https://esdgxkddzbdkgjjymjcf.supabase.co';

const supabaseAnonKey =
  (typeof process !== 'undefined' && (
    process.env?.SUPABASE_SECRET_KEY ||
    process.env?.SUPABASE_ANON_KEY ||
    process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env?.SUPABASE_KEY ||
    process.env?.EXPO_PUBLIC_SUPABASE_KEY ||
    process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env?.SUPABASE_PUBLISHABLE_KEY
  )) ||
  'sb_publishable_bbAiIo1ueMxkaUvUp5S45g_LTi2shbV';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Alias for backwards compatibility if needed
export const sql = supabase;
export const isDbConfigured = isSupabaseConfigured;
