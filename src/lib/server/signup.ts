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
    return [parsed.error.issues[0].message, null];
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
    return [error.message, null];
  }

  return [null, { sessionCreated: !!data.session }];
};
