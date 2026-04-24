"use server";

import { createActionClient } from "@/lib/supabase/server";

export async function fetchApplicationsByIds(applicationIds: string[]) {
  if (applicationIds.length === 0) {
    return [];
  }

  const supabase = await createActionClient();

  const { data, error } = await supabase
    .from("Application")
    .select("applicationId, companyName")
    .in("applicationId", applicationIds);

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  return data;
}
