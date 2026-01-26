import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { createClient } from "@/lib/supabase/server";

export type Sector = {
  sectorId: number;
  sectorName: string;
};

export async function getSectors(
  requestCookies: RequestCookie[],
): Promise<Sector[]> {
  "use cache";

  const supabase = await createClient(requestCookies);

  const { data, error } = await supabase
    .from("Sector")
    .select("sectorId, sectorName")
    .order("sectorName", { ascending: true });

  if (error) {
    console.error("Error fetching sectors:", error);
    return [];
  }

  return data;
}
