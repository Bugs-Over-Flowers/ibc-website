"use server";

import { headers } from "next/headers";
import type { ServerFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";
import { SignupSchema } from "@/lib/validation/authentication/signup";

export const signup: ServerFunction<
  [SignupSchema],
  { sessionCreated: boolean }
> = async (input) => {
  const parsed = SignupSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
      data: null,
    };
  }

  const supabase = await createActionClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  if (data.session && !data.user?.confirmed_at) {
    await supabase.auth.signOut();
    return { success: true, data: { sessionCreated: false }, error: null };
  }

  return {
    success: true,
    data: { sessionCreated: !!data.session },
    error: null,
  };
};
