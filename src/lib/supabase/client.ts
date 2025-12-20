import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./db.types";

export async function createClient() {
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase_key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabase_url || !supabase_key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createBrowserClient<Database>(supabase_url, supabase_key);
}
