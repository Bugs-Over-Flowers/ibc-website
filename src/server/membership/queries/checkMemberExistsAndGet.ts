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
  businessMemberIdentifier?: string;
  businessMemberId?: string;
  companyAddress?: string;
  sectorId?: number;
  websiteURL?: string;
  logoImageURL?: string;
  emailAddress?: string;
  landline?: string;
  mobileNumber?: string;
  principalRepresentative?: {
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    mobileNumber?: string;
    landline?: string;
    mailingAddress?: string;
    companyDesignation?: string;
    birthdate?: string;
    nationality?: string;
    sex?: string;
  };
  alternateRepresentative?: {
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    mobileNumber?: string;
    landline?: string;
    mailingAddress?: string;
    companyDesignation?: string;
    birthdate?: string;
    nationality?: string;
    sex?: string;
  };
  message?: string;
};

export async function checkMemberExistsAndGet(
  input: CheckMemberInput,
): Promise<CheckMemberOutput> {
  const trimmedIdentifier = input.identifier?.trim().toLowerCase();

  if (!trimmedIdentifier) {
    throw new Error("Business Member Identifier is required");
  }

  const supabase = await createActionClient();

  const rpcInput = {
    p_identifier: trimmedIdentifier,
    p_application_type: input.applicationType,
  };

  const { data, error } = await supabase.rpc(
    "check_member_exists_and_get",
    rpcInput,
  );

  if (
    error &&
    (error.message.includes("check_member_exists_and_get") ||
      error.message.includes("Could not find the function"))
  ) {
    const { data: fallbackData, error: fallbackError } = await supabase.rpc(
      "check_member_exists",
      rpcInput,
    );

    if (fallbackError) {
      console.error("[checkMemberExistsAndGet] Fallback error:", fallbackError);
      throw new Error(
        `Unable to verify Business Member Identifier: ${fallbackError.message}`,
      );
    }

    return fallbackData as CheckMemberOutput;
  }

  if (error) {
    console.error("[checkMemberExistsAndGet] Error:", error);
    throw new Error(
      `Unable to verify Business Member Identifier: ${error.message}`,
    );
  }

  return data as CheckMemberOutput;
}
