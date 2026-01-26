"use server";

import { createActionClient } from "@/lib/supabase/server";

type CheckMemberInput = {
  identifier: string;
  applicationType: "renewal" | "updating";
};

type CheckMemberOutput = {
  exists: boolean;
  companyName?: string;
  membershipStatus?: string;
  businessMemberId?: string;
  message?: string;
};

export async function checkMemberExists(
  input: CheckMemberInput,
): Promise<CheckMemberOutput> {
  // Validate identifier format (ibc-mem-XXXXXXXX)
  const identifierRegex = /^ibc-mem-[a-f0-9]{8}$/i;
  const trimmedIdentifier = input.identifier?.trim().toLowerCase();

  if (!trimmedIdentifier || !identifierRegex.test(trimmedIdentifier)) {
    throw new Error(
      "Invalid member ID format. Expected format: ibc-mem-xxxxxxxx",
    );
  }

  const supabase = await createActionClient();

  const { data, error } = await supabase.rpc("check_member_exists", {
    p_identifier: trimmedIdentifier,
    p_application_type: input.applicationType,
  });

  if (error) {
    console.error("[checkMemberExists] Error:", error);
    throw new Error(`Unable to verify member ID: ${error.message}`);
  }

  return data as CheckMemberOutput;
}
