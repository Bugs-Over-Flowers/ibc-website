import "server-only";

import { cookies } from "next/headers";
import { getAppDataEncryptionKey } from "@/lib/security/encryption";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

export async function getSRbyEventId(
  eventId: string,
): Promise<SponsoredRegistration[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());
  const encryptionKey = getAppDataEncryptionKey();

  const { data, error } = await supabase.rpc("get_sr_by_event_id", {
    p_event_id: eventId,
    p_encryption_key: encryptionKey,
  });

  if (error) {
    console.error(
      "Error fetching sponsored registrations:",
      error.code,
      error.message,
      error.details,
    );
    throw new Error("Failed to fetch sponsored registrations");
  }

  if (!data) {
    return [];
  }

  return data as SponsoredRegistration[];
}
