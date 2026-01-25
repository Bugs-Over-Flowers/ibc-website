"use server";

import type { ServerFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";
import { LoginSchema } from "@/lib/validation/authentication/login";

export const login: ServerFunction<
  [LoginSchema],
  { mfaRequired: boolean; emailVerified: boolean }
> = async (input) => {
  const parsed = LoginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      data: null,
    };
  }

  const supabase = await createActionClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  if (data.user && !data.user.confirmed_at) {
    await supabase.auth.signOut();
    return { success: false, error: "Email not verified", data: null };
  }

  // Check if user has any verified MFA factors
  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();

  if (factorsError) {
    return { success: false, error: factorsError.message, data: null };
  }

  const hasVerifiedFactor = factors.all.some(
    (factor) => factor.status === "verified" && factor.factor_type === "totp",
  );

  return {
    success: true,
    data: { mfaRequired: hasVerifiedFactor, emailVerified: true },
    error: null,
  };
};
