"use server";

import { createActionClient } from "@/lib/supabase/server";
import { ServerRegistrationSchema } from "@/lib/validation/registration/standard";
import { createRegistrationIdentifier } from "@/lib/validation/utils";

interface SubmitRegistrationResponse {
  registrationId: string;
  message: string;
}
export const submitRegistrationRPC = async (data: ServerRegistrationSchema) => {
  const parsedData = ServerRegistrationSchema.parse(data);

  const supabase = await createActionClient();

  const registrationIdentifier = createRegistrationIdentifier();

  const { step1, step3, eventId, step2 } = parsedData;

  const { data: rpcResults, error } = await supabase.rpc(
    "submit_event_registration",
    {
      p_event_id: eventId,
      p_business_member_id:
        step1.member === "member" ? step1.businessMemberId : undefined,
      p_registrant: step2.registrant,
      p_payment_path: step3.paymentMethod === "online" ? step3.path : undefined,
      p_payment_method: step3.paymentMethod,
      p_other_participants: step2.otherParticipants,
      p_non_member_name:
        step1.member === "nonmember" ? step1.nonMemberName : undefined,
      p_member_type: step1.member,
      p_identifier: registrationIdentifier,
    },
  );

  if (error) {
    console.error("Submit Registration RPC Error:", error);
    throw new Error(`Failed to submit event registration: ${error.message}`);
  }

  if (!rpcResults) {
    throw new Error("No data returned from registration");
  }
  return {
    rpcResults: rpcResults as unknown as SubmitRegistrationResponse,
    identifier: registrationIdentifier,
  };
};
