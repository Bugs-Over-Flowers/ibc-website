"use server";

import type { ServerFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";
import { LoginSchema } from "@/lib/validation/authentication/login";

export const login: ServerFunction<
  [LoginSchema],
  { mfaRequired: boolean }
> = async (input) => {
  const parsed = LoginSchema.safeParse(input);

  if (!parsed.success) {
    return [parsed.error.issues[0].message, null];
  }

  const supabase = await createActionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return [error.message, null];
  }

  // Check if user has any verified MFA factors
  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();

  if (factorsError) {
    return [factorsError.message, null];
  }

  const hasVerifiedFactor = factors.all.some(
    (factor) => factor.status === "verified" && factor.factor_type === "totp",
  );

  return [null, { mfaRequired: hasVerifiedFactor }];
};
