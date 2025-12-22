import "server-only";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { MemberFilterInput } from "@/lib/validation/application";

export async function getMembers(
  filters?: MemberFilterInput,
  requestCookies?: RequestCookie[],
) {
  const cookieStore = requestCookies || (await cookies()).getAll();
  const supabase = await createClient(cookieStore);

  let query = supabase
    .from("BusinessMember")
    .select(
      `
      *,
      Sector!inner(sectorId, sectorName)
    `,
    )
    .order("joinDate", { ascending: false });

  // Apply status filter
  if (filters?.status && filters.status !== "all") {
    query = query.eq("membershipStatus", filters.status);
  }

  // Apply sector filter
  if (filters?.sectorName) {
    query = query.eq("Sector.sectorName", filters.sectorName);
  }

  // Apply search filter
  if (filters?.search) {
    query = query.ilike("businessName", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch members: ${error.message}`);
  }

  return data;
}

export async function getSectors(requestCookies?: RequestCookie[]) {
  const cookieStore = requestCookies || (await cookies()).getAll();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("Sector")
    .select("*")
    .order("sectorName", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch sectors: ${error.message}`);
  }

  return data;
}
