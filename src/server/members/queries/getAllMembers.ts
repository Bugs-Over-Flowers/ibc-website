import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getAllMembers = cache(async (cookieStore: RequestCookie[]) => {
  const supabase = await createClient(cookieStore);
  const { data } = await supabase
    .from("BusinessMember")
    .select(
      "businessMemberId, businessName, sectorId, logoImageURL, websiteURL",
    )
    .order("businessName")
    .throwOnError();

  if (!data) {
    throw new Error("Failed to fetch members");
  }
  return data;
});
