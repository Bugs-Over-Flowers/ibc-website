"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBulkActions } from "../_hooks/useApplicationBulkActions";
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
    <Card className="flex h-full flex-col gap-0 rounded-2xl">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>Bulk Actions</span>
          <Badge className="ml-auto" variant="secondary">
            {selectedCount} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-4">
        <p className="text-muted-foreground text-xs">
          Apply an action to all selected applications at once.
        </p>

        <div className="mt-auto border-t pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="border-status-green text-status-green hover:bg-status-green/10"
              disabled={!hasSelection || isPending}
              onClick={handleApprove}
              size="sm"
              variant="outline"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {isPending ? "Processing..." : "Approve"}
            </Button>
            <Button
              className="border-status-red text-status-red hover:bg-status-red/10"
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
            className="mt-2 w-full"
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
