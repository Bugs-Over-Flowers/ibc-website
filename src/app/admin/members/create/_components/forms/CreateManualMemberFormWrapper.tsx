"use client";

import { useEffect } from "react";
import useCreateManualMemberStore from "@/hooks/createManualMember.store";
import { CreateManualMemberForm } from "./CreateManualMemberForm";

interface CreateManualMemberFormWrapperProps {
  sectors: Array<{ sectorId: number; sectorName: string }>;
}

export function CreateManualMemberFormWrapper({
  sectors,
}: CreateManualMemberFormWrapperProps) {
  const resetStore = useCreateManualMemberStore((state) => state.resetStore);

  useEffect(() => {
    resetStore();
  }, [resetStore]);

  return <CreateManualMemberForm sectors={sectors} />;
}
