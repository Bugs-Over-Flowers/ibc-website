"use client";

import useMembershipApplicationStore from "@/hooks/membershipApplication.store";
import type { Sector } from "@/server/membership/queries/getSectors";
import { MembershipApplicationForm } from "./MembershipApplicationForm";

interface MembershipApplicationFormWrapperProps {
  sectors: Sector[];
}

export function MembershipApplicationFormWrapper({
  sectors,
}: MembershipApplicationFormWrapperProps) {
  const resetKey = useMembershipApplicationStore((state) => state.resetKey);

  // Using resetKey as the key prop forces complete component remount
  // This ensures all hooks (useMembershipStep1, etc.) reinitialize with fresh store values
  return <MembershipApplicationForm key={resetKey} sectors={sectors} />;
}
