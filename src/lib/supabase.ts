import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set"
  );
}

// IMPORTANT: This anon key is exposed to the browser (NEXT_PUBLIC_ prefix).
// All database access MUST go through server-side API routes, NEVER directly
// from client components. RLS policies on Supabase must restrict anon access
// to only the operations these API routes perform (INSERT on leads + rate_limits,
// SELECT/UPDATE on rate_limits). See supabase/migrations/002_rls_policies.sql.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);