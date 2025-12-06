"use server";

import { createActionClient } from "@/lib/supabase/server";
import { ServerRegistrationSchema } from "@/lib/validation/registration/standard";

export const submitRegistration = async (data: ServerRegistrationSchema) => {
  const parsedData = ServerRegistrationSchema.parse(data);

  console.log("Full registration data:", parsedData);

  console.log("other registrants:", parsedData.step2.otherRegistrants);

  const supabase = await createActionClient();

  const { step1, step3, eventId, step2 } = parsedData;

  // create a new registration record
  const { data: newRegistrationData, error: newRegistrationDataError } =
    await supabase
      .from("Registration")
      .insert({
        eventId: eventId,
        paymentMethod: step3.paymentMethod === "online" ? "BPI" : "ONSITE",
        paymentStatus: step3.paymentMethod ? "pending" : "verified",
        businessMemberId:
          step1.member === "member" ? step1.businessMemberId : undefined,
        nonMemberName:
          step1.member === "nonmember" ? step1.nonMemberName : undefined,
        registrationDate: new Date().toISOString(),
      })
      .select(`registrationId, eventDetails:Event(eventTitle)`)
      .single();

  if (newRegistrationDataError) {
    console.error(newRegistrationDataError);
    throw new Error("Failed to create registration record");
  }

  // handle proof of payment
  if (step3.paymentMethod === "online") {
    // create a proof of payment record
    const { error } = await supabase.from("ProofImage").insert({
      url: step3.paymentProofId,
      registrationId: newRegistrationData.registrationId,
    });
    if (error) {
      console.error(error);
      throw new Error("Failed to create proof of payment record");
    }
  }

  const { otherRegistrants, principalRegistrant } = step2;

  // create new rows of registrants
  const { data: newRegistrantsData, error: newRegistrantDataError } =
    await supabase
      .from("Participant")
      .insert([
        {
          registrationId: newRegistrationData.registrationId,
          isPrincipal: true,
          ...principalRegistrant,
        },
        ...otherRegistrants.map((registrant) => ({
          registrationId: newRegistrationData.registrationId,
          isPrincipal: false,
          ...registrant,
        })),
      ])
      .select(`participantId`);

  if (newRegistrantDataError) {
    console.error(newRegistrantDataError);
    throw new Error("Failed to create registrant records");
  }
  console.log(
    `New registrants under: ${newRegistrationData.eventDetails.eventTitle}`,
    newRegistrantsData,
  );

  // QR Code logic here.

  return "success'ed bes'ed";
};

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
      p_payment_proof_id:
        step3.paymentMethod === "online" ? step3.paymentProofId : undefined,
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

  return "Registered Successfully!";
};
