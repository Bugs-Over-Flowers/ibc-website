"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import {
  approveApplication,
  rejectApplication,
} from "@/server/applications/mutations/approveReject";
import { useSelectedApplications } from "../_context/SelectedApplicationsContext";

export default function BulkActions() {
  const { selectedApplicationIds, clearSelection } = useSelectedApplications();

  const { execute: approve, isPending: isApproving } = useAction(
    tryCatch(approveApplication),
    {
      onSuccess: () => {
        toast.success("Applications approved");
        clearSelection();
      },
      onError: (err) => toast.error(err || "Failed to approve"),
    },
  );

  const { execute: reject, isPending: isRejecting } = useAction(
    tryCatch(rejectApplication),
    {
      onSuccess: () => {
        toast.success("Applications rejected");
        clearSelection();
      },
      onError: (err) => toast.error(err || "Failed to reject"),
    },
  );

  const selectedCount = selectedApplicationIds.size;
  const hasSelection = selectedCount > 0;

  const handleApprove = async () => {
    for (const id of selectedApplicationIds) {
      await approve({ applicationId: id, action: "approve" });
    }
  };

  const handleReject = async () => {
    for (const id of selectedApplicationIds) {
      await reject({ applicationId: id, action: "reject" });
    }
  };

  return (
    <Card className="flex h-64 flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          Bulk Actions
          <span className="font-normal text-muted-foreground text-sm">
            ({selectedCount})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-3 pt-0">
        <p className="text-muted-foreground text-xs">
          {selectedCount} application{selectedCount !== 1 ? "s" : ""} selected
        </p>

        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="border-status-green text-status-green hover:bg-status-green/10"
              disabled={!hasSelection || isApproving || isRejecting}
              onClick={handleApprove}
              size="sm"
              variant="outline"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {isApproving ? "Approving..." : "Approve"}
            </Button>
            <Button
              className="border-status-red text-status-red hover:bg-status-red/10"
              disabled={!hasSelection || isApproving || isRejecting}
              onClick={handleReject}
              size="sm"
              variant="outline"
            >
              <XCircle className="mr-1 h-4 w-4" />
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
          </div>
          <Button
            className="w-full"
            disabled={!hasSelection}
            onClick={clearSelection}
            size="sm"
            variant="outline"
          >
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
