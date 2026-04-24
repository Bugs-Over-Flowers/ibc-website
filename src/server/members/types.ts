import type { Database } from "@/lib/supabase/db.types";

export type MembershipStatus = Database["public"]["Enums"]["MembershipStatus"];

export type MemberStatusTransition = {
  businessMemberId: string;
  businessName: string;
  previousStatus: MembershipStatus;
  currentStatus: MembershipStatus;
};
