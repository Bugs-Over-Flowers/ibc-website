import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getSectors(search?: string) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  let query = supabase.from("Sector").select("*");

  if (search) {
    query = query.ilike("sectorName", `%${search}%`);
  }

  query = query.order("sectorName", { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
