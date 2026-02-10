import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getSectors() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase.from("Sector").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
