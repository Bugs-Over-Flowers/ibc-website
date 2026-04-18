"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { getAppDataEncryptionKey } from "@/lib/security/encryption";
import { createActionClient } from "@/lib/supabase/server";
import {
  type QuickOnsiteRegistrationInput,
  QuickOnsiteRegistrationInputSchema,
  type QuickOnsiteRegistrationResult,
  QuickOnsiteRegistrationResultSchema,
} from "@/lib/validation/registration/quickRegistration";
import { SubmitRegistrationResponseSchema } from "@/lib/validation/registration/standard";
import { createRegistrationIdentifier } from "@/lib/validation/utils";

export async function quickOnsiteRegistrationRPC(
  data: QuickOnsiteRegistrationInput,
): Promise<QuickOnsiteRegistrationResult> {
  const parsedData = QuickOnsiteRegistrationInputSchema.parse(data);

  const supabase = await createActionClient();
  const encryptionKey = getAppDataEncryptionKey();

  const registrationIdentifier = createRegistrationIdentifier();

  const { memberDetails, registrant, eventId, eventDayId, remark } = parsedData;

  const { data: rpcResults, error } = await supabase.rpc(
    "quick_onsite_registration",
    {
      p_event_day_id: eventDayId,
      p_event_id: eventId,
      p_business_member_id:
        memberDetails.member === "member"
          ? memberDetails.businessMemberId
          : undefined,
      p_registrant: registrant,
      p_non_member_name:
        memberDetails.member === "nonmember"
          ? memberDetails.nonMemberName
          : undefined,
      p_member_type: memberDetails.member,
      p_identifier: registrationIdentifier,
      p_remark: remark?.trim() || undefined,
      p_encryption_key: encryptionKey,
    },
  );

  if (error) {
    console.error(error);
    throw new Error(
      error.message ||
        "Failed to submit quick onsite registration. Please try again or contact support if the problem persists.",
    );
  }

  if (!rpcResults) {
    throw new Error("No data returned from quick onsite registration");
  }

  updateTag(CACHE_TAGS.registrations.all);
  updateTag(CACHE_TAGS.registrations.list);
  updateTag(CACHE_TAGS.registrations.details);
  updateTag(CACHE_TAGS.registrations.stats);
  updateTag(CACHE_TAGS.registrations.event);
  updateTag(CACHE_TAGS.events.registrations);
  updateTag(CACHE_TAGS.checkIns.stats);

  revalidatePath(`/admin/events/check-in`);

  const validatedResponse = SubmitRegistrationResponseSchema.parse(rpcResults);

  return QuickOnsiteRegistrationResultSchema.parse({
    rpcResults: validatedResponse,
    identifier: registrationIdentifier,
  });
}
