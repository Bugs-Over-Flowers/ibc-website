import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import {
  approveApplicationServer,
  rejectApplicationServer,
} from "@/server/applications/mutations/approveReject";

export function useBulkActions(onSuccess?: () => void) {
  const { execute: approveOne, isPending: isApprovingOne } = useAction(
    approveApplicationServer,
    {
      onError: (err) => toast.error(err || "Failed to approve application"),
    },
  );

  const { execute: rejectOne, isPending: isRejectingOne } = useAction(
    rejectApplicationServer,
    {
      onError: (err) => toast.error(err || "Failed to reject application"),
    },
  );

  const bulkApprove = async (applicationIds: Set<string>) => {
    let successCount = 0;
    let failCount = 0;

    for (const id of applicationIds) {
      const result = await approveOne({ applicationId: id, action: "approve" });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(
        `${successCount} application${successCount !== 1 ? "s" : ""} approved`,
      );
    }

    if (failCount > 0) {
      toast.error(
        `${failCount} application${failCount !== 1 ? "s" : ""} failed to approve`,
      );
    }

    if (failCount === 0 && successCount > 0) {
      onSuccess?.();
    }
  };

  const bulkReject = async (applicationIds: Set<string>) => {
    let successCount = 0;
    let failCount = 0;

    for (const id of applicationIds) {
      const result = await rejectOne({ applicationId: id, action: "reject" });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(
        `${successCount} application${successCount !== 1 ? "s" : ""} rejected`,
      );
    }

    if (failCount > 0) {
      toast.error(
        `${failCount} application${failCount !== 1 ? "s" : ""} failed to reject`,
      );
    }

    if (failCount === 0 && successCount > 0) {
      onSuccess?.();
    }
  };

  return {
    bulkApprove,
    bulkReject,
    isPending: isApprovingOne || isRejectingOne,
  };
}
