"use server";

import type { ServerFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";

export const logout: ServerFunction<[undefined], boolean> = async () => {
  const supabase = await createActionClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return [error.message, null];
  }

  return [null, true];
};
