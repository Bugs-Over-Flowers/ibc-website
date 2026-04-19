import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { getAppDataEncryptionKey } from "@/lib/security/encryption";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

export async function getSponsoredRegistrationById(
  requestCookies: RequestCookie[],
  id: string,
): Promise<SponsoredRegistration | null> {
  const supabase = await createClient(requestCookies);
  const encryptionKey = getAppDataEncryptionKey();

  const { data, error } = await supabase
    .rpc("get_sponsored_registration_by_id", {
      registration_id: id,
      p_encryption_key: encryptionKey,
    })
    .maybeSingle();

  if (error) {
    console.error("Error fetching sponsored registration:", error);
    throw new Error(`Failed to fetch sponsored registration: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return data;
}
