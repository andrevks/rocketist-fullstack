import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  // For server-side API routes, prefer service_role key for admin access
  // Fallback to anon key only if service_role is not available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing SUPABASE_URL. Set NEXT_PUBLIC_SUPABASE_URL in your environment variables."
    );
  }

  if (!supabaseKey) {
    throw new Error(
      "Missing Supabase API key. Set SUPABASE_SERVICE_ROLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables."
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}
