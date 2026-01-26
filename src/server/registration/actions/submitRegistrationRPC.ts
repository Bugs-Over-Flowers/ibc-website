"use server";

import { z } from "zod";
import { createActionClient } from "@/lib/supabase/server";
import { ServerRegistrationSchema } from "@/lib/validation/registration/standard";
import { createRegistrationIdentifier } from "@/lib/validation/utils";

/**
 * Zod schema for validating RPC response at runtime.
 * Ensures type safety for data returned from database.
 */
const SubmitRegistrationResponseSchema = z.object({
  registrationId: z.string().uuid(),
  message: z.string(),
});

/**
 * Server action to submit event registration to database via RPC call.
 *
 * SCHEMA TRANSFORMATION PATTERN:
 *
 * Client schema (StandardRegistrationSchema):
 * - step3.paymentProof: File object (browser File API)
 * - Cannot be sent to server actions (not serializable)
 *
 * Server schema (ServerRegistrationSchema):
 * - step3.path: string (file path in Supabase storage)
 * - Can be safely transmitted and stored in database
 *
 * Transformation happens in useSubmitRegistration:
 * 1. Client uploads File to Supabase Storage
 * 2. Client receives path string from storage
 * 3. Client calls this action with path instead of File
 *
 * Why discriminated unions:
 * - Online payment: requires path to uploaded proof
 * - Onsite payment: no path needed, payment at venue
 * - TypeScript ensures correct data for each payment method
 *
 * @param data - Registration data with file path (not File object)
 * @returns Registration ID and identifier for email/QR code
 */
export const submitRegistrationRPC = async (data: ServerRegistrationSchema) => {
  const parsedData = ServerRegistrationSchema.parse(data);

  const supabase = await createActionClient();

  const registrationIdentifier = createRegistrationIdentifier();

  const { step1, step3, eventId, step2 } = parsedData;

  // Call database RPC function with transformed data
  const { data: rpcResults, error } = await supabase.rpc(
    "submit_event_registration",
    {
      p_event_id: eventId,
      // Member: send businessMemberId, Non-member: undefined
      p_business_member_id:
        step1.member === "member" ? step1.businessMemberId : undefined,
      p_registrant: step2.registrant,
      // Online payment: send storage path, Onsite: undefined
      p_payment_path: step3.paymentMethod === "online" ? step3.path : undefined,
      p_payment_method: step3.paymentMethod,
      p_other_participants: step2.otherParticipants,
      // Non-member: send name, Member: undefined
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

  // Validate RPC response with Zod for type safety
  const validatedResponse = SubmitRegistrationResponseSchema.parse(rpcResults);

  return {
    rpcResults: validatedResponse,
    identifier: registrationIdentifier,
  };
};
