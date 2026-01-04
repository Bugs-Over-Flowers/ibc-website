import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import {
  approveApplicationServer,
  rejectApplicationServer,
} from "@/server/applications/mutations/approveReject";

export function useApplicationApproval(applicationId: string) {
  const router = useRouter();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { execute: executeApprove, isPending: isApproving } = useAction(
    approveApplicationServer,
    {
      onSuccess: (data) => {
        toast.success(data.message ?? "Application approved successfully!");
        router.push("/admin/members" as Route);
        router.refresh();
      },
      onError: (error) => {
        toast.error(error || "Failed to approve application");
      },
    },
  );

  const { execute: executeReject, isPending: isRejecting } = useAction(
    rejectApplicationServer,
    {
      onSuccess: (data) => {
        toast.success(data.message ?? "Application rejected");
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
