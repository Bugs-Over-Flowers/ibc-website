"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBulkActions } from "../_hooks/useBulkActions";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";

export default function BulkActions() {
  const { selectedApplicationIds, clearSelection } =
    useSelectedApplicationsStore();

  const { bulkApprove, bulkReject, isPending } = useBulkActions(() => {
    clearSelection();
  });

  const selectedCount = selectedApplicationIds.size;
  const hasSelection = selectedCount > 0;

  const handleApprove = async () => {
    await bulkApprove(selectedApplicationIds);
  };

  const handleReject = async () => {
    await bulkReject(selectedApplicationIds);
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
              className="border-status-green text-status-green hover:bg-status-green/10 active:scale-95 active:opacity-80"
              disabled={!hasSelection || isPending}
              onClick={handleApprove}
              size="sm"
              variant="outline"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {isPending ? "Processing..." : "Approve"}
            </Button>
            <Button
              className="border-status-red text-status-red hover:bg-status-red/10 active:scale-95 active:opacity-80"
              disabled={!hasSelection || isPending}
              onClick={handleReject}
              size="sm"
              variant="outline"
            >
              <XCircle className="mr-1 h-4 w-4" />
              {isPending ? "Processing..." : "Reject"}
            </Button>
          </div>
          <Button
            className="w-full active:scale-95 active:opacity-80"
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
