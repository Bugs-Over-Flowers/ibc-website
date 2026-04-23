"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { Clock, MessageSquare } from "lucide-react";
import { SelectableRowDataTable } from "@/components/SelectableRowDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import type { ParticipantCheckInRow } from "../_types/checkInTable";
import CheckInItemActions from "./CheckInItemActions";
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
  const participants: ParticipantCheckInRow[] = data.participants.map(
    (participant) => ({
      ...participant,
      eventId: data.event.eventId,
      registrationId: data.registrationId,
      identifier: data.identifier,
      affiliation: data.affiliation,
    }),
  );

  // Get selectable participant IDs (not checked in)
  const selectableIds = participants
    .filter((p) => p.checkIn === null)
    .map((p) => p.participantId);

  const allSelectableSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selectedParticipants[id]);

  const allCheckedIn = selectableIds.length === 0 && participants.length > 0;

  // Column definitions
  const columns: ColumnDef<ParticipantCheckInRow>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          aria-label="Select all"
          checked={allSelectableSelected}
          disabled={selectableIds.length === 0}
          onCheckedChange={() => selectAllSelectableParticipants(selectableIds)}
        />
      ),
      cell: ({ row }) => {
        const participant = row.original;
        const isCheckedIn = participant.checkIn !== null;

        return (
          <Checkbox
            aria-label={`Select ${participant.firstName}`}
            checked={
              isCheckedIn || !!selectedParticipants[participant.participantId]
            }
            className={cn(isCheckedIn && "cursor-not-allowed opacity-50")}
            disabled={isCheckedIn}
            onCheckedChange={() => {
              if (!isCheckedIn) {
                toggleParticipantSelection(participant.participantId);
              }
            }}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "firstName",
      header: "Name",
      cell: ({ row }) => {
        const { firstName, lastName, isPrincipal, checkIn } = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className={cn("text-sm", checkIn && "text-muted-foreground")}>
              {firstName} {lastName}
            </span>
            {isPrincipal && (
              <span className="rounded-full border border-[#85B7EB] bg-[#E6F1FB] px-2 py-0.5 font-medium text-[#0C447C] text-[10px] dark:border-[#185FA5] dark:bg-[#042C53] dark:text-[#B5D4F4]">
                Registrant
              </span>
            )}
          </div>
        );
      },
    },

    {
      id: "checkInTime",
      header: "Check-in time",
      cell: ({ row }) => {
        const time = row.original.checkIn?.checkInTime;
        if (!time) {
          return <span className="text-muted-foreground/50 text-xs">-</span>;
        }

        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#85B7EB] bg-[#E6F1FB] px-2 py-0.5 font-medium text-[#0C447C] text-xs dark:border-[#185FA5] dark:bg-[#042C53] dark:text-[#B5D4F4]">
            <Clock className="size-3" />
            {formatDate(time, "h:mm a")}
          </span>
        );
      },
    },

    {
      id: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const participant = row.original;
        const originalRemark = participant.checkIn?.remarks || "";
        const editedRemark = editedRemarks[participant.participantId];
        const hasRemark = participant.checkIn?.remarks || editedRemark;

        const hasBeenEdited =
          participant.checkIn !== null &&
          editedRemark !== undefined &&
          originalRemark !== editedRemark;

        return (
          <div className="flex items-center gap-2">
            <Button
              className="h-7 gap-1 px-2.5 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRemarkParticipantId(participant.participantId);
              }}
              size="sm"
              variant={hasRemark ? "secondary" : "outline"}
            >
              <MessageSquare className="size-3" />
              {hasRemark ? "Edit" : "Add"}
            </Button>
            {hasBeenEdited && (
              <Badge className="px-1.5 py-0 text-[10px]" variant="default">
                Edited
              </Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
    },

    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const participant = row.original;
        return (
          <CheckInItemActions
            eventId={row.original.eventId}
            participant={{
              contactNumber: participant.contactNumber,
              email: participant.email,
              firstName: participant.firstName,
              lastName: participant.lastName,
            }}
            registrationId={row.original.registrationId}
          />
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          {participants.length} participant
          {participants.length !== 1 ? "s" : ""}
        </span>
        {allCheckedIn && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#97C459] bg-[#EAF3DE] px-2.5 py-1 font-medium text-[#27500A] text-xs dark:border-[#3B6D11] dark:bg-[#173404] dark:text-[#C0DD97]">
            All participants checked in
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
        getRowId={(row) => row.participantId}
        onRowSelectionChange={setSelectedParticipants}
        rowSelection={selectedParticipants}
      />

      <RemarksModal />
    </>
  );
}
