import "server-only";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getApplicationsByIds(
  applicationIds: string[],
  requestCookies?: RequestCookie[],
) {
  if (applicationIds.length === 0) {
    return [];
  }

  const cookieStore = requestCookies || (await cookies()).getAll();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from("Application")
    .select("applicationId, companyName")
    .in("applicationId", applicationIds);

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  return data;
}
