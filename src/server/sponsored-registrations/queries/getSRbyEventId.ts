import "server-only";

import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

export async function getSRbyEventId(
  eventId: string,
): Promise<SponsoredRegistration[]> {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase
    .from("SponsoredRegistration")
    .select("*")
    .eq("eventId", eventId);

  if (error) {
    console.error("Error fetching sponsored registrations:", error);
    throw new Error(
      `Failed to fetch sponsored registrations: ${error.message}`,
    );
  }

  return (data as SponsoredRegistration[]) || [];
}
