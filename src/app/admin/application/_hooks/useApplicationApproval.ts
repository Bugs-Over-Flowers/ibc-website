import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import {
  approveApplication,
  rejectApplication,
} from "@/server/applications/mutations/approveReject";

export function useApplicationApproval(applicationId: string) {
  const router = useRouter();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { execute: executeApprove, isPending: isApproving } = useAction(
    tryCatch(approveApplication),
    {
      onSuccess: () => {
        toast.success("Application approved successfully!");
        router.push("/admin/members" as Route);
        router.refresh();
      },
      onError: (error) => {
        toast.error(error || "Failed to approve application");
      },
    },
  );

  const { execute: executeReject, isPending: isRejecting } = useAction(
    tryCatch(rejectApplication),
    {
      onSuccess: () => {
        toast.success("Application rejected");
        router.push("/admin/application" as Route);
        router.refresh();
      },
      onError: (error) => {
        toast.error(error || "Failed to reject application");
      },
    },
  );

  const handleApprove = async () => {
    await executeApprove({
      applicationId,
      action: "approve",
    });
    setShowApproveDialog(false);
  };

  const handleReject = async () => {
    await executeReject({
      applicationId,
      action: "reject",
    });
    setShowRejectDialog(false);
  };

  return {
    showApproveDialog,
    setShowApproveDialog,
    showRejectDialog,
    setShowRejectDialog,
    isApproving,
    isRejecting,
    handleApprove,
    handleReject,
  };
}
