import { createClient } from '@supabase/supabase-js';

const supabaseUrl = typeof __supabase_url !== 'undefined' ? __supabase_url : '';
const supabaseAnonKey = typeof __supabase_anon_key !== 'undefined' ? __supabase_anon_key : '';
const tableName = typeof __supabase_table !== 'undefined' ? __supabase_table : 'alumni';

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

export { supabase };
