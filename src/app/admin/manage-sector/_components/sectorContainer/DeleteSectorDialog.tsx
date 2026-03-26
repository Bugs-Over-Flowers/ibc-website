"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/DataTable";
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
  const [memberAssignments, setMemberAssignments] = useState<
    Record<string, string>
  >({});

  const handlePreviewError = useCallback((error: string | Error) => {
    toast.error(error instanceof Error ? error.message : error);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    toast.success("Sector deleted successfully");
    setSelectedSectorId("");
    setMemberAssignments({});
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

  const handleMemberAssignmentChange = useCallback(
    (memberId: string, value: string | null) => {
      setMemberAssignments((prev) => ({
        ...prev,
        [memberId]: value ?? "",
      }));
    },
    [],
  );

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
    setMemberAssignments({});
    resetPreview();
  }, [id, loadPreview, open, resetPreview]);

  const members = (previewData?.members as MemberPreview[]) ?? [];
  const alternativeSectors =
    (previewData?.alternativeSectors as SectorOption[]) ?? [];

  const handleGeneralSectorChange = useCallback(
    (value: string | null, _event?: unknown) => {
      setSelectedSectorId(value ?? "");
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setMemberAssignments((prev) => {
      const next: Record<string, string> = {};
      members.forEach((member) => {
        if (prev[member.businessMemberId]) {
          next[member.businessMemberId] = prev[member.businessMemberId];
        }
      });
      return next;
    });
  }, [members, open]);

  const resolveMemberSector = useCallback(
    (memberId: string) => memberAssignments[memberId] ?? selectedSectorId ?? "",
    [memberAssignments, selectedSectorId],
  );

  const requiresReassignment = members.length > 0;
  const noAlternativeSectors =
    requiresReassignment && alternativeSectors.length === 0;
  const hasPreviewError = Boolean(previewError);
  const hasIncompleteAssignments = useMemo(() => {
    if (!requiresReassignment) {
      return false;
    }

    return members.some(
      (member) => !resolveMemberSector(member.businessMemberId),
    );
  }, [members, requiresReassignment, resolveMemberSector]);
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

    return hasIncompleteAssignments;
  }, [
    hasPreviewError,
    hasIncompleteAssignments,
    isDeleting,
    isLoadingPreview,
    noAlternativeSectors,
    requiresReassignment,
  ]);

  const disableMemberSelection =
    isDeleting || isLoadingPreview || hasPreviewError || noAlternativeSectors;

  const memberColumns = useMemo<ColumnDef<MemberPreview>[]>(
    () => [
      {
        accessorKey: "businessName",
        header: "Member",
        enableSorting: false,
        cell: ({ row }) => {
          const member = row.original;
          // const memberValue = resolveMemberSector(member.businessMemberId);
          // const selectedOption = alternativeSectors.find(
          //   (sector) => String(sector.sectorId) === memberValue,
          // );

          return (
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm">{member.businessName}</p>
            </div>
          );
        },
      },
      {
        id: "sector",
        header: () => (
          <div className="flex justify-end">
            <span>Assign To</span>
          </div>
        ),
        enableSorting: false,
        cell: ({ row }) => {
          const member = row.original;
          const memberValue = resolveMemberSector(member.businessMemberId);

          return (
            <div className="flex justify-end">
              <Select
                disabled={disableMemberSelection}
                onValueChange={(value) =>
                  handleMemberAssignmentChange(member.businessMemberId, value)
                }
                value={memberValue ?? ""}
              >
                <SelectTrigger aria-label="Choose sector" className="w-full">
                  {alternativeSectors.find(
                    (sector) => sector.sectorId === Number(memberValue),
                  )?.sectorName ?? (
                    <SelectValue placeholder="Choose a sector" />
                  )}
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
            </div>
          );
        },
      },
    ],
    [
      alternativeSectors,
      disableMemberSelection,
      handleMemberAssignmentChange,
      resolveMemberSector,
    ],
  );

  const handleDelete = async () => {
    if (requiresReassignment) {
      if (noAlternativeSectors) {
        toast.error("Create another sector before deleting this one.");
        return;
      }

      if (hasIncompleteAssignments) {
        toast.error("Assign a new sector for every member listed.");
        return;
      }

      const hasOverrides = Object.values(memberAssignments).some((value) =>
        Boolean(value?.length),
      );
      const generalSectorIdNumber = selectedSectorId
        ? Number(selectedSectorId)
        : undefined;
      const finalAssignments = members.map((member) => ({
        memberId: member.businessMemberId,
        sectorId: Number(resolveMemberSector(member.businessMemberId)),
      }));
      const useBulkReassign =
        !hasOverrides && typeof generalSectorIdNumber === "number";

      await submitDelete({
        id,
        reassignSectorId: useBulkReassign ? generalSectorIdNumber : undefined,
        memberReassignments: useBulkReassign ? undefined : finalAssignments,
      });
      return;
    }

    await submitDelete({ id });
  };

  const description = isLoadingPreview
    ? "Fetching members assigned to this sector..."
    : requiresReassignment
      ? "This sector has active members. Move them to a new sector before deleting."
      : "This sector has no members and can be safely removed.";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {sectorName}
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
                  will be affected. Select a new sector per member here or use
                  the dropdown below to move everyone at once. Individual
                  choices will override the bulk selection.
                </p>
                <div className="max-h-[calc(3*6.5rem+2rem)] overflow-y-auto pr-1">
                  <DataTable columns={memberColumns} data={members} />
                </div>
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
              onValueChange={handleGeneralSectorChange}
              value={selectedSectorId ?? ""}
            >
              <SelectTrigger className="w-full">
                {alternativeSectors.find(
                  (sector) => sector.sectorId === Number(selectedSectorId),
                )?.sectorName ?? (
                  <SelectValue placeholder="Choose the new sector" />
                )}
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
