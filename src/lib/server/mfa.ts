"use server";

import type { ServerFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";

export type EnrollMfaOutput = {
  id: string;
  type: "totp";
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
};

export const enrollMfa: ServerFunction<
  [undefined],
  EnrollMfaOutput
> = async () => {
  const supabase = await createActionClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return ["Could not retrieve user details", null];
  }

  const { data: factors, error: listError } =
    await supabase.auth.mfa.listFactors();

  if (listError) {
    return [listError.message, null];
  }

  // Unenroll ALL TOTP factors (verified or unverified) to prevent duplicates
  // and allow resetting MFA if the user is on the setup page.
  const totpFactors = factors.all.filter((f) => f.factor_type === "totp");

  for (const factor of totpFactors) {
    await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `IBC Admin (${user.email})`,
  });

  if (error) {
    return [error.message, null];
  }

  return [null, data];
};

export const verifyMfa: ServerFunction<
  [{ factorId: string; code: string }],
  { success: boolean }
> = async ({ factorId, code }) => {
  const supabase = await createActionClient();

  const { data: challengeData, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId,
    });

  if (challengeError) {
    return [challengeError.message, null];
  }

  if (!challengeData) {
    return ["Failed to create challenge", null];
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  });

  if (verifyError) {
    return [verifyError.message, null];
  }

  return [null, { success: true }];
};

export const loginVerifyMfa: ServerFunction<
  [string],
  { success: boolean }
> = async (code) => {
  const supabase = await createActionClient();

  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();

  if (factorsError) {
    return [factorsError.message, null];
  }

  const totpFactor = factors.all.find(
    (f) => f.factor_type === "totp" && f.status === "verified",
  );

  if (!totpFactor) {
    return ["No verified MFA factor found", null];
  }

  const { data: challengeData, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId: totpFactor.id,
    });

  if (challengeError) {
    return [challengeError.message, null];
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challengeData.id,
    code,
  });

  if (verifyError) {
    return [verifyError.message, null];
  }

  return [null, { success: true }];
};
