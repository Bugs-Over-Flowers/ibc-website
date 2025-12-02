import type { ServerFunctionResult } from "@/lib/server/types";
import type { Database } from "@/lib/supabase/db.types";
import { createClient } from "@/lib/supabase/server";
import "server-only";

type GetAllMembersOutput =
  Database["public"]["Tables"]["BusinessMember"]["Row"][];

export const getAllMembers = async (): Promise<
  ServerFunctionResult<GetAllMembersOutput>
> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("BusinessMember").select("*");
  if (error) return [error.message, null];
  return [null, data];
};
