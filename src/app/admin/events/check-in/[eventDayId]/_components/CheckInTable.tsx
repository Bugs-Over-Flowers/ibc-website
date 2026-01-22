"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
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
  data: GetCheckInForDateSchema;
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
  const setSelectedParticipants = useAttendanceStore(
    (s) => s.setSelectedParticipants,
  );

  const setSelectedRemarkParticipantId = useAttendanceStore(
    (s) => s.setSelectedRemarkParticipantId,
  );
  // Helper: Transform scanned data to table rows
  const transformParticipants = (
    data: GetCheckInForDateSchema,
  ): ParticipantCheckInRow[] => {
    return data.participants.map((participant) => ({
      ...participant,
      registrationId: data.registrationId,
      identifier: data.identifier,
      affiliation: data.affiliation,
    }));
  };

  // Transform data (data already includes optimistic updates from parent)
  const participants = transformParticipants(data);

  // Get selectable participant IDs (not checked in)
  const selectableIds = participants
    .filter((p) => p.checkIn === null)
    .map((p) => p.participantId);

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

    // Check in time
    {
      id: "checkInTime",
      header: "Check In Time",
      cell: ({ row }) =>
        row.original.checkIn?.checkInTime &&
        formatDate(row.original.checkIn?.checkInTime, "h:mm a"),
    },

    // Remarks Column with Button
    {
      id: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const participant = row.original;
        const originalRemark = participant.checkIn?.remarks || "";
        const editedRemark = editedRemarks[participant.participantId];
        const hasRemark = originalRemark || editedRemark;

        // Detect if remark was edited (changed from original)
        const hasBeenEdited =
          participant.checkIn !== null && // Is checked in
          editedRemark !== undefined && // Has an edited value
          originalRemark !== editedRemark; // Different from original

        return (
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRemarkParticipantId(participant.participantId);
              }}
              size="sm"
              variant={hasRemark ? "secondary" : "outline"}
            >
              {hasRemark ? "Edit Remark" : "Add Remark"}
            </Button>

            {/* Badge indicator for edited remarks */}
            {hasBeenEdited && (
              <Badge className="text-xs" variant="default">
                Edited
              </Badge>
            )}
          </div>
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
              All participants have been checked in ✓
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

      <RemarksModal />
    </>
  );
}
