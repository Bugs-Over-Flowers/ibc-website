"use server";

import { createActionClient } from "@/lib/supabase/server";
import { ServerRegistrationSchema } from "@/lib/validation/registration/standard";

interface SubmitRegistrationResponse {
  registrationId: string;
  message: string;
}
export const submitRegistrationRPC = async (data: ServerRegistrationSchema) => {
  const parsedData = ServerRegistrationSchema.parse(data);

  console.log("Full registration data:", parsedData);

  console.log("other registrants:", parsedData.step2.otherRegistrants);

  const supabase = await createActionClient();

  const { step1, step3, eventId, step2 } = parsedData;
  const { data: rpcResults, error } = await supabase.rpc(
    "submit_event_registration",
    {
      p_event_id: eventId,
      p_business_member_id:
        step1.member === "member" ? step1.businessMemberId : undefined,
      p_principal_registrant: step2.principalRegistrant,
      p_payment_path: step3.paymentMethod === "online" ? step3.path : undefined,
      p_payment_method: step3.paymentMethod,
      p_other_registrants: step2.otherRegistrants,
      p_non_member_name:
        step1.member === "nonmember" ? step1.nonMemberName : undefined,
      p_member_type: step1.member,
    },
  );

  if (error) {
    console.error(error);
    throw new Error("Failed to submit event registration");
  }

  if (!rpcResults) {
    throw new Error("No data returned from registration");
  }

  console.log(rpcResults);
  return rpcResults as unknown as SubmitRegistrationResponse;
};
