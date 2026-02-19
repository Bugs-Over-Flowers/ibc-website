import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { updateMembershipStatus } from "@/server/members/actions/updateMembershipStatus";

type MembershipStatus = Database["public"]["Enums"]["MembershipStatus"];

export function useMemberSelection() {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(),
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { execute, isPending } = useAction(tryCatch(updateMembershipStatus), {
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedMembers(new Set());
      setSelectedStatus(null);
    },
    onError: (error) => {
      toast.error(String(error));
    },
  });

  const handleSelectMember = (memberId: string, selected: boolean) => {
    const newSelection = new Set(selectedMembers);
    if (selected) {
      newSelection.add(memberId);
    } else {
      newSelection.delete(memberId);
    }
    setSelectedMembers(newSelection);
  };

  const handleUpdateStatus = async () => {
    if (selectedMembers.size === 0) {
      toast.error("Please select at least one member");
      return;
    }

    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    await execute({
      memberIds: Array.from(selectedMembers),
      status: selectedStatus as MembershipStatus,
    });
  };

  const isUpdateDisabled =
    isPending || selectedMembers.size === 0 || !selectedStatus;

  return {
    selectedMembers,
    selectedStatus,
    setSelectedStatus,
    handleSelectMember,
    handleUpdateStatus,
    isPending,
    isUpdateDisabled,
  };
}
