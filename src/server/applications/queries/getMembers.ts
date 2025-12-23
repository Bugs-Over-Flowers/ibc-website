import "server-only";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";
import type { MemberFilterInput } from "@/lib/validation/application";

export async function getMembers(
  requestCookies: RequestCookie[],
  filters?: MemberFilterInput,
) {
  "use cache";
  const supabase = await createClient(requestCookies);

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

export async function getSectors(requestCookies: RequestCookie[]) {
  "use cache";
  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Sector")
    .select("*")
    .order("sectorName", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch sectors: ${error.message}`);
  }

  return data;
}
