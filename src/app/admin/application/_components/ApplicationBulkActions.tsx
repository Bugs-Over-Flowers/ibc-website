"use client";

import { CheckCircle2, LayoutGrid, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBulkActions } from "../_hooks/useApplicationBulkActions";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";

type ConfirmMode = "approve" | "reject" | null;

export default function BulkActions() {
  const { selectedApplicationIds, clearSelection } =
    useSelectedApplicationsStore();

  const { bulkApprove, bulkReject, isPending } = useBulkActions(() => {
    clearSelection();
  });
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);

  const selectedCount = selectedApplicationIds.size;
  const hasSelection = selectedCount > 0;

  const handleConfirm = async () => {
    if (confirmMode === "approve") await bulkApprove(selectedApplicationIds);
    if (confirmMode === "reject") await bulkReject(selectedApplicationIds);
    setConfirmMode(null);
  };

  return (
    <Card className="h-auto overflow-hidden rounded-2xl py-2">
      <CardHeader className="space-y-1.5 border-b px-5 py-4">
        <CardTitle className="flex items-center gap-2 font-medium text-sm">
          <span>Bulk Actions</span>
          <Badge
            className={
              hasSelection
                ? "border border-[#85B7EB] bg-[#E6F1FB] text-[#0C447C] dark:border-[#185FA5] dark:bg-[#0C447C] dark:text-[#B5D4F4]"
                : ""
            }
            variant={hasSelection ? "default" : "secondary"}
          >
            {selectedCount} selected
          </Badge>
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          {hasSelection
            ? "Apply a status update to all selected applications."
            : "Select applications from the list to take action."}
        </p>
      </CardHeader>
      <CardContent className="px-5 py-4">
        {!hasSelection && (
          <div className="flex flex-col items-center gap-2.5 py-4 text-center">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <LayoutGrid className="size-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              No applications selected.
              <br />
              Check boxes in the list to begin.
            </p>
          </div>
        )}

        {hasSelection && (
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
              <div>
                <p className="text-[11px] text-muted-foreground">Selected</p>
                <p className="font-medium text-sm">
                  {selectedCount} applications
                </p>
              </div>
              <button
                className="text-muted-foreground text-xs underline underline-offset-2 transition-colors hover:text-foreground"
                onClick={clearSelection}
                type="button"
              >
                Clear
              </button>
            </div>

            {confirmMode && !isPending && (
              <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-card px-3 py-3">
                <div>
                  <p className="font-medium text-sm">
                    {confirmMode === "approve" ? "Approve" : "Reject"}{" "}
                    {selectedCount} application
                    {selectedCount !== 1 ? "s" : ""}?
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs leading-relaxed">
                    {confirmMode === "approve"
                      ? "This will mark them as approved and notify applicants."
                      : "This will mark them as rejected and notify applicants."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="h-8 flex-1 text-xs"
                    onClick={() => setConfirmMode(null)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className={
                      confirmMode === "approve"
                        ? "h-8 flex-1 border border-[#97C459] bg-[#EAF3DE] text-[#27500A] text-xs hover:bg-[#C0DD97] dark:border-[#3B6D11] dark:bg-[#27500A] dark:text-[#C0DD97] dark:hover:bg-[#3B6D11]"
                        : "h-8 flex-1 border border-[#F09595] bg-[#FCEBEB] text-[#791F1F] text-xs hover:bg-[#F7C1C1] dark:border-[#A32D2D] dark:bg-[#791F1F] dark:text-[#F7C1C1] dark:hover:bg-[#A32D2D]"
                    }
                    onClick={handleConfirm}
                    size="sm"
                    type="button"
                  >
                    Yes, {confirmMode}
                  </Button>
                </div>
              </div>
            )}

            {isPending && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                <div className="size-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                <span className="text-muted-foreground text-xs">
                  {confirmMode === "approve" ? "Approving" : "Rejecting"}{" "}
                  {selectedCount} applications...
                </span>
              </div>
            )}

            <Button
              className="h-9 w-full gap-1.5 border-[#97C459] bg-[#EAF3DE] text-[#27500A] hover:bg-[#C0DD97] dark:border-[#3B6D11] dark:bg-[#27500A] dark:text-[#C0DD97] dark:hover:bg-[#3B6D11]"
              disabled={!hasSelection || isPending}
              onClick={() => setConfirmMode("approve")}
              size="sm"
              type="button"
              variant="outline"
            >
              <CheckCircle2 className="size-3.5" />
              Approve all
            </Button>
            <Button
              className="h-9 w-full gap-1.5 border-[#F09595] bg-[#FCEBEB] text-[#791F1F] hover:bg-[#F7C1C1] dark:border-[#A32D2D] dark:bg-[#791F1F] dark:text-[#F7C1C1] dark:hover:bg-[#A32D2D]"
              disabled={!hasSelection || isPending}
              onClick={() => setConfirmMode("reject")}
              size="sm"
              type="button"
              variant="outline"
            >
              <XCircle className="size-3.5" />
              Reject all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
