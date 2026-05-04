"use server";

import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { createActionClient } from "@/lib/supabase/server";
import {
  ServerRegistrationSchema,
  SubmitRegistrationResponseSchema,
} from "@/lib/validation/registration/standard";
import { createRegistrationIdentifier } from "@/lib/validation/utils";
import { invalidateRegistrationCaches } from "@/server/actions.utils";

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

  const { step1, step3, eventId, step2, sponsoredRegistrationId, step4 } =
    parsedData;

  const paymentPaths: string[] =
    step3.paymentMethod === "online" ? step3.paths : [];

  const { data: rpcResults, error } = await supabase.rpc(
    "submit_event_registration",
    {
      p_event_id: eventId,
      p_non_member_name:
        step1.member === "nonmember" ? step1.nonMemberName : undefined,
      p_member_type: step1.member,
      p_business_member_id:
        step1.member === "member" ? step1.businessMemberId : undefined,
      p_registrant: step2.registrant,
      p_payment_paths:
        paymentPaths.length > 0 ? paymentPaths.map((p) => ({ path: p })) : [],
      p_payment_method: step3.paymentMethod,
      p_other_participants: step2.otherParticipants,
      p_note: step4.note,
      p_identifier: registrationIdentifier,
      p_sponsored_registration_id: sponsoredRegistrationId || undefined,
    },
  );

  if (error) {
    console.error(error);

    const combinedErrorText = [error.message, error.details, error.hint]
      .filter(Boolean)
      .join(" ");

    const isSponsoredSlotExceeded =
      error.code === "23514" &&
      /SponsoredRegistration_used_check|maxSponsoredGuests|usedCount|sponsored\s+slot/i.test(
        combinedErrorText,
      );

    if (isSponsoredSlotExceeded) {
      throw new Error(
        "Not enough sponsored registration slots. This registration would exceed the maximum sponsored slots.",
      );
    }

    throw new Error(
      "Failed to submit event registration. Please try again or contact support if the problem persists.",
    );
  }

  if (!rpcResults) {
    throw new Error("No data returned from registration");
  }

  const validatedResponse = SubmitRegistrationResponseSchema.parse(rpcResults);

  invalidateRegistrationCaches();
  updateTag(CACHE_TAGS.checkIns.stats);

  if (sponsoredRegistrationId) {
    updateTag(CACHE_TAGS.sponsoredRegistrations.all);
    updateTag(CACHE_TAGS.sponsoredRegistrations.admin);
  }

  return {
    rpcResults: validatedResponse,
    identifier: registrationIdentifier,
    participants: validatedResponse.participants ?? [],
  };
};
