import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof process !== 'undefined' && (
    process.env?.SUPABASE_URL ||
    process.env?.NEXT_PUBLIC_SUPABASE_URL ||
    process.env?.EXPO_PUBLIC_SUPABASE_URL
  )) ||
  'https://rowyjdwzpiyjamtrftuo.supabase.co';

const supabaseAnonKey =
  (typeof process !== 'undefined' && (
    process.env?.SUPABASE_ANON_KEY ||
    process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    process.env?.SUPABASE_KEY ||
    process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd3lqZHd6cGl5amFtdHJmdHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODg0MTksImV4cCI6MjEwMjQ2NDQxOX0.u5Slwdc4SgH1IEeAFze_dw3mk-9TQzjAODELtBOk9I8';

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
