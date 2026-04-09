import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/db.types";

/**
 * Create admin Supabase client for E2E test seeding/cleanup.
 * Bypasses RLS and uses anon key.
 */
export function createE2EAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and secret key (SUPABASE_SECRET_KEY)",
    );
  }

  return createClient<Database>(supabaseUrl, supabaseSecretKey);
}
