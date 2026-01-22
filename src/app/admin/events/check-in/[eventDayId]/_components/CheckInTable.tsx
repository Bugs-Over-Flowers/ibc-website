"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SelectableRowDataTable } from "@/components/SelectableRowDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import type { ParticipantCheckInRow } from "../_types/checkInTable";
import RemarksModal from "./RemarksModal";

interface CheckInTableProps {
  /**
   * Optimistic scanned data - may include temporary check-ins
   * before server confirmation
   */
  data: GetCheckInForDateSchema;
}

// Helper: Transform scanned data to table rows
function transformParticipants(
  data: GetCheckInForDateSchema,
): ParticipantCheckInRow[] {
  return data.participants.map((participant) => ({
    ...participant,
    registrationId: data.registrationId,
    identifier: data.identifier,
    affiliation: data.affiliation,
  }));
}

export default function CheckInTable({ data }: CheckInTableProps) {
  // Store selectors
  const selectedParticipants = useAttendanceStore(
    (s) => s.selectedParticipants,
  );
  const editedRemarks = useAttendanceStore((s) => s.editedRemarks);
  const toggleParticipantSelection = useAttendanceStore(
    (s) => s.toggleParticipantSelection,
  );
  const selectAllSelectableParticipants = useAttendanceStore(
    (s) => s.selectAllSelectableParticipants,
  );
  const setRemark = useAttendanceStore((s) => s.setRemark);
  const setSelectedParticipants = useAttendanceStore(
    (s) => s.setSelectedParticipants,
  );

  // Local state for remarks modal
  const [editingParticipant, setEditingParticipant] =
    useState<ParticipantCheckInRow | null>(null);

  // Transform data (data already includes optimistic updates from parent)
  const participants = useMemo(() => transformParticipants(data), [data]);

  // Get selectable participant IDs (not checked in)
  const selectableIds = useMemo(
    () =>
      participants
        .filter((p) => p.checkIn === null)
        .map((p) => p.participantId),
    [participants],
  );

  // Check if all selectable are selected
  const allSelectableSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedParticipants[id]);

  // Column definitions
  const columns: ColumnDef<ParticipantCheckInRow>[] = [
    // Select Column
    {
      id: "select",
      header: () => (
        <Checkbox
          aria-label="Select all participants"
          checked={allSelectableSelected}
          disabled={selectableIds.length === 0}
          onCheckedChange={() => selectAllSelectableParticipants(selectableIds)}
        />
      ),
      cell: ({ row }) => {
        const participant = row.original;
        const isDisabled = participant.checkIn !== null;
        const isSelected =
          selectedParticipants[participant.participantId] || false;

        return (
          <Checkbox
            aria-label={`Select ${participant.firstName} ${participant.lastName}`}
            checked={isSelected || isDisabled}
            className={cn(isDisabled ? "cursor-not-allowed" : "")}
            disabled={isDisabled}
            onCheckedChange={() => {
              !isDisabled &&
                toggleParticipantSelection(participant.participantId);
            }}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },

    // Name Column with Principal Badge
    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => {
        const { firstName, lastName, isPrincipal } = row.original;
        return (
          <div className="flex items-center gap-2">
            <span>
              {firstName} {lastName}
            </span>
            {isPrincipal && (
              <Badge className="text-xs" variant="secondary">
                Registrant
              </Badge>
            )}
          </div>
        );
      },
    },

    // Email Column
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email,
    },

    // Contact Number Column
    {
      accessorKey: "contactNumber",
      header: "Contact",
      cell: ({ row }) => row.original.contactNumber,
    },

    // Remarks Column with Button
    {
      id: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const participant = row.original;
        const originalRemark = participant.checkIn?.remarks;
        const editedRemark = editedRemarks[participant.participantId];
        const hasRemark = originalRemark || editedRemark;

        return (
          <Button
            onClick={() => setEditingParticipant(participant)}
            size="sm"
            variant={hasRemark ? "secondary" : "outline"}
          >
            {hasRemark ? "Edit Remark" : "Add Remark"}
          </Button>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="space-y-4">
        <div className="text-muted-foreground text-sm">
          {participants.length} participant
          {participants.length !== 1 ? "s" : ""}
          {selectableIds.length === 0 && participants.length > 0 && (
            <span className="ml-2 text-green-600">
              • All participants have been checked in ✓
            </span>
          )}
        </div>

        <SelectableRowDataTable
          columns={columns}
          customRowSelectHandler={(row) => {
            if (row.original.checkIn) {
              return;
            }
            toggleParticipantSelection(row.original.participantId);
          }}
          data={participants}
          onRowSelectionChange={setSelectedParticipants}
          rowSelection={selectedParticipants}
        />
      </div>

      <RemarksModal
        initialRemark={
          editingParticipant
            ? editedRemarks[editingParticipant.participantId] ||
              editingParticipant.checkIn?.remarks ||
              ""
            : ""
        }
        isOpen={editingParticipant !== null}
        onClose={() => setEditingParticipant(null)}
        onSave={(remark) => {
          if (editingParticipant) {
            setRemark(editingParticipant.participantId, remark);
            setEditingParticipant(null);
          }
        }}
        participantName={
          editingParticipant
            ? `${editingParticipant.firstName} ${editingParticipant.lastName}`
            : ""
        }
      />
    </>
  );
}
