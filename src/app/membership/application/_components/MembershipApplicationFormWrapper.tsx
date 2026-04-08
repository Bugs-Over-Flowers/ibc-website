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

  return <MembershipApplicationForm key={resetKey} sectors={sectors} />;
}
