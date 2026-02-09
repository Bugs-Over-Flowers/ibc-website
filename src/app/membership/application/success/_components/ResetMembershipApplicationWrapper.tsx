"use client";
import { useEffect } from "react";
import useMembershipApplicationStore from "@/hooks/membershipApplication.store";

export default function ResetMembershipApplicationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const resetStore = useMembershipApplicationStore((state) => state.resetStore);

  useEffect(() => {
    resetStore();
  }, [resetStore]);

  return <>{children}</>;
}
