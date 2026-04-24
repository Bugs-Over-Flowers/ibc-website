import { createClient } from "@/lib/supabase/client";
import type { ApplicationStatusResponse } from "@/lib/types/application";

export async function checkApplicationStatus(
  identifier: string,
): Promise<ApplicationStatusResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("check_application_status", {
    p_application_identifier: identifier,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as ApplicationStatusResponse;
}
