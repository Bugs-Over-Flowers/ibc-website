import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type MemberIdentity = Pick<
  Database["public"]["Tables"]["BusinessMember"]["Row"],
  "businessMemberId" | "primaryApplicationId" | "identifier"
>;

export async function getMemberById(
  businessMemberId: string,
  requestCookies: RequestCookie[],
): Promise<MemberIdentity> {
  "use cache";

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("BusinessMember")
    .select("businessMemberId, primaryApplicationId, identifier")
    .eq("businessMemberId", businessMemberId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch member: ${error.message}`);
  }

  return data;
}
