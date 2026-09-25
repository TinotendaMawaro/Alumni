import { createClient } from '@supabase/supabase-js';

const getRuntimeGlobal = (name) => {
  if (typeof globalThis !== 'undefined' && Object.prototype.hasOwnProperty.call(globalThis, name)) {
    return globalThis[name];
  }
  if (typeof window !== 'undefined' && Object.prototype.hasOwnProperty.call(window, name)) {
    return window[name];
  }
  return undefined;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || getRuntimeGlobal('__supabase_url') || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || getRuntimeGlobal('__supabase_anon_key') || '';
const tableName = import.meta.env.VITE_SUPABASE_TABLE || getRuntimeGlobal('__supabase_table') || 'alumni';

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

let supabase;

if (!isDemoMode) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export const getSupabase = () => supabase;

export const getAlumniTable = () => supabase.from(tableName);

export const initAuth = async () => {
  if (isDemoMode) return;
  // Supabase doesn't require explicit anonymous auth initialization
};

export { supabase, tableName };
