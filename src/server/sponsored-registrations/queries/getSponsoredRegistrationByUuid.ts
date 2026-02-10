import "server-only";

import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

export async function getSponsoredRegistrationByUuid(
  uuid: string,
): Promise<SponsoredRegistration | null> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase.rpc(
    "get_sponsored_registration_by_uuid",
    { p_uuid: uuid },
  );

  if (error || !data) {
    return null;
  }

  return data as SponsoredRegistration;
}
