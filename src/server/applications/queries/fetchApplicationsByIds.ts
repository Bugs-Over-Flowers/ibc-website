"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function fetchApplicationsByIds(applicationIds: string[]) {
  if (applicationIds.length === 0) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore.getAll());

  const { data, error } = await supabase
    .from("Application")
    .select("applicationId, companyName")
    .in("applicationId", applicationIds);

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  return data;
}
