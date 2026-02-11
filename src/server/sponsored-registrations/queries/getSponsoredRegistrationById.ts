import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

export async function getSponsoredRegistrationById(
  requestCookies: RequestCookie[],
  id: string,
): Promise<SponsoredRegistration | null> {
  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .rpc("get_sponsored_registration_by_id", {
      registration_id: id,
    })
    .single();

  if (error) {
    console.error("Error fetching sponsored registration:", error);
    throw new Error(`Failed to fetch sponsored registration: ${error.message}`);
  }

  return data;
}
