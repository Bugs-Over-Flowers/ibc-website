"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Loader2, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { PaymentStatusBadge } from "@/app/admin/events/_components/table/AdminTableControls";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import type { CheckInDayParticipantListItem } from "@/server/check-in/queries/getEventDayParticipantList";
import { useScanQR } from "../../_hooks/useScanQR";

interface CheckInParticipantTableProps {
  eventDayId: string;
  eventId: string;
  participantList: CheckInDayParticipantListItem[];
}

const getColumns = ({
  eventDayId,
  activeParticipantIdentifier,
  scanParticipant,
  isPending,
}: {
  eventDayId: string;
  activeParticipantIdentifier: string | null;
  scanParticipant: (participantIdentifier: string, eventDayId: string) => void;
  isPending: boolean;
}): ColumnDef<CheckInDayParticipantListItem>[] => [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">
            {p.firstName} {p.lastName}
          </span>
          {p.participantIdentifier ? (
            <code className="font-mono text-muted-foreground text-xs">
              {p.participantIdentifier}
            </code>
          ) : (
            <span className="text-muted-foreground text-xs italic">
              No identifier
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "affiliation",
    header: "Affiliation",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.affiliation}
      </span>
    ),
  },
  {
    accessorKey: "checkedIn",
    header: "Status",
    cell: ({ row }) =>
      row.original.checkedIn ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#97C459] bg-[#EAF3DE] px-2 py-0.5 font-medium text-[#27500A] text-xs">
          <CheckCircle2 className="size-3" />
          Checked in
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-muted-foreground text-xs">
          Not checked in
        </span>
      ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <PaymentStatusBadge
        className="capitalize"
        status={row.original.paymentStatus}
      />
    ),
  },
  {
    id: "checkIn",
    header: "",
    enableHiding: false,
    cell: ({ row }) => {
      const canCheckIn = Boolean(row.original.participantIdentifier);
      const isRowLoading =
        isPending &&
        activeParticipantIdentifier === row.original.participantIdentifier;
      return (
        <Button
          className="h-7 gap-1.5 px-2.5 text-xs"
          disabled={!canCheckIn || isPending}
          onClick={(event) => {
            event.stopPropagation();
            if (!row.original.participantIdentifier) return;
            scanParticipant(row.original.participantIdentifier, eventDayId);
          }}
          size="sm"
          variant="outline"
        >
          {isRowLoading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <ScanLine className="size-3" />
          )}
          Check in
        </Button>
      );
    },
  },
];

export default function CheckInParticipantTable({
  eventDayId,
  eventId,
  participantList,
}: CheckInParticipantTableProps) {
  const [activeParticipantIdentifier, setActiveParticipantIdentifier] =
    useState<string | null>(null);
  const { execute: scanParticipant, isPending } = useScanQR({ eventId });

  useEffect(() => {
    if (!isPending) {
      setActiveParticipantIdentifier(null);
    }
  }, [isPending]);

  const handleScanParticipant = (
    participantIdentifier: string,
    eventDayId: string,
  ) => {
    setActiveParticipantIdentifier(participantIdentifier);
    scanParticipant(participantIdentifier, eventDayId);
  };

  return (
    <DataTable
      columns={getColumns({
        activeParticipantIdentifier,
        eventDayId,
        isPending,
        scanParticipant: handleScanParticipant,
      })}
      data={participantList}
      onRowDoubleClick={(row) => {
        if (isPending || !row.participantIdentifier) return;
        handleScanParticipant(row.participantIdentifier, eventDayId);
      }}
      tableContainerClassName="rounded-none border-0"
      tableHeaderClassName="bg-muted/20"
    />
  );
}
