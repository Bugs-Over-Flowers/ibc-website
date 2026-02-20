"use server";

import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationStatusResponse } from "@/lib/types/application";

export async function checkApplicationStatus(
  identifier: string,
  requestCookies?: RequestCookie[],
): Promise<ApplicationStatusResponse> {
  const cookieStore = requestCookies || (await cookies()).getAll();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase.rpc("check_application_status", {
    p_application_identifier: identifier,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as ApplicationStatusResponse;
}
