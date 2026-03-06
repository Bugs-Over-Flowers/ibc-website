"use client";

import { Trash } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import {
  deleteSector,
  getSectorDeletionPreview,
} from "@/server/sectors/mutations";

interface DeleteSectorDialogProps {
  id: number;
  sectorName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MemberPreview {
  businessMemberId: string;
  businessName: string;
}

interface SectorOption {
  sectorId: number;
  sectorName: string;
}

export default function DeleteSectorDialog({
  id,
  sectorName,
  open,
  onOpenChange,
}: DeleteSectorDialogProps) {
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");

  const handlePreviewError = useCallback((error: string | Error) => {
    toast.error(error instanceof Error ? error.message : error);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    toast.success("Sector deleted successfully");
    setSelectedSectorId("");
    onOpenChange(false);
  }, [onOpenChange]);

  const handleDeleteError = useCallback((error: string | Error) => {
    toast.error(error instanceof Error ? error.message : error);
  }, []);

  const {
    execute: loadPreview,
    data: previewData,
    isPending: isLoadingPreview,
    error: previewError,
    reset: resetPreview,
  } = useAction(tryCatch(getSectorDeletionPreview), {
    persist: true,
    onError: handlePreviewError,
  });

  const handleSectorChange = useCallback((value: string | null) => {
    setSelectedSectorId(value ?? "");
  }, []);

  const { execute: submitDelete, isPending: isDeleting } = useAction(
    tryCatch(deleteSector),
    {
      onSuccess: handleDeleteSuccess,
      onError: handleDeleteError,
    },
  );

  useEffect(() => {
    if (open) {
      void loadPreview({ id });
      return;
    }

    setSelectedSectorId("");
    resetPreview();
  }, [id, loadPreview, open, resetPreview]);

  const members = (previewData?.members as MemberPreview[]) ?? [];
  const alternativeSectors =
    (previewData?.alternativeSectors as SectorOption[]) ?? [];
  const selectedSectorName = useMemo(() => {
    if (!selectedSectorId) {
      return "";
    }

    const match = alternativeSectors.find(
      (sector) => String(sector.sectorId) === selectedSectorId,
    );

    return match?.sectorName ?? "";
  }, [alternativeSectors, selectedSectorId]);

  const requiresReassignment = members.length > 0;
  const noAlternativeSectors =
    requiresReassignment && alternativeSectors.length === 0;
  const hasPreviewError = Boolean(previewError);
  const disableSubmit = useMemo(() => {
    if (isDeleting || isLoadingPreview || hasPreviewError) {
      return true;
    }

    if (!requiresReassignment) {
      return false;
    }

    if (noAlternativeSectors) {
      return true;
    }

    return selectedSectorId.length === 0;
  }, [
    hasPreviewError,
    isDeleting,
    isLoadingPreview,
    noAlternativeSectors,
    requiresReassignment,
    selectedSectorId,
  ]);

  const handleDelete = async () => {
    if (requiresReassignment && selectedSectorId.length === 0) {
      toast.error("Please choose a new sector for the affected members.");
      return;
    }

    await submitDelete({
      id,
      reassignSectorId: selectedSectorId ? Number(selectedSectorId) : undefined,
    });
  };

  const description = isLoadingPreview
    ? "Fetching members assigned to this sector..."
    : requiresReassignment
      ? "This sector has active members. Move them to a new sector before deleting."
      : "This sector has no members and can be safely removed.";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash className="h-4 w-4" />
            Delete {sectorName}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section className="rounded-lg border p-4">
            {isLoadingPreview ? (
              <div className="space-y-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
              </div>
            ) : previewError ? (
              <p className="text-destructive text-sm">
                Failed to load members for this sector.
              </p>
            ) : members.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No members are assigned to this sector.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-sm">
                  {members.length} {members.length === 1 ? "member" : "members"}{" "}
                  will be affected:
                </p>
                <ul className="max-h-48 space-y-2 overflow-y-auto pr-2">
                  {members.map((member) => (
                    <li
                      className="rounded-md border bg-muted/40 px-3 py-2 text-sm"
                      key={member.businessMemberId}
                    >
                      {member.businessName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between font-medium text-sm">
              <span>Assign members to</span>
              {requiresReassignment ? (
                <span className="text-muted-foreground">
                  Required when members exist
                </span>
              ) : (
                <span className="text-muted-foreground">Optional</span>
              )}
            </div>

            <Select
              disabled={
                !requiresReassignment ||
                isLoadingPreview ||
                noAlternativeSectors ||
                isDeleting ||
                hasPreviewError
              }
              onValueChange={handleSectorChange}
              value={selectedSectorId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose the new sector">
                  {selectedSectorName ? (
                    <span className="truncate">{selectedSectorName}</span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {alternativeSectors.map((sector) => (
                  <SelectItem
                    key={sector.sectorId}
                    value={String(sector.sectorId)}
                  >
                    {sector.sectorName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {noAlternativeSectors && (
              <p className="text-destructive text-xs">
                There are no other sectors available. Create another sector
                before deleting this one.
              </p>
            )}
          </section>
        </div>

        <DialogFooter>
          <Button
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={disableSubmit}
            onClick={handleDelete}
            type="button"
            variant="destructive"
          >
            {isDeleting ? "Deleting..." : "Delete sector"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
