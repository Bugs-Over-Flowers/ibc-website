"use server";

import type { AsyncFunction } from "@/lib/server/types";
import { createActionClient } from "@/lib/supabase/server";

export const logout: AsyncFunction<[undefined], boolean> = async () => {
  const supabase = await createActionClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: true, error: null };
};
