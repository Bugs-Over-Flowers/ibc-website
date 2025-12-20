"use server";

import { createActionClient } from "@/lib/supabase/server";
import { RegistrationCheckInListRPCSchema } from "@/lib/validation/checkin/checkin-list";
import type { RegistrationIdentifier } from "@/lib/validation/qr/standard";

export const getRegistrationListCheckInRPC = async (
  registrationIdentifier: RegistrationIdentifier,
) => {
  const supabase = await createActionClient();

  const { data, error } = await supabase.rpc("get_registration_list_checkin", {
    p_identifier: registrationIdentifier,
  });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  console.log(data);

  return RegistrationCheckInListRPCSchema.parse(data);
};
