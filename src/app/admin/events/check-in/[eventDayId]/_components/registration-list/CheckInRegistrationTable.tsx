"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, ScanLine } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RegistrationItem } from "@/lib/validation/registration-management";
import { useScanQR } from "../../_hooks/useScanQR";

interface CheckInRegistrationTableProps {
  eventDayId: string;
  eventId: string;
  registrationList: RegistrationItem[];
}

function CheckInActionButton({
  eventDayId,
  registrationIdentifier,
  scanQRData,
  isPending,
}: {
  eventDayId: string;
  registrationIdentifier: string;
  scanQRData: (registrationIdentifier: string, eventDayId: string) => void;
  isPending: boolean;
}) {
  return (
    <Button
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation();
        scanQRData(registrationIdentifier, eventDayId);
      }}
      size="sm"
      variant="outline"
    >
      {isPending ? <Loader2 className="animate-spin" /> : <ScanLine />}
      Check-In
    </Button>
  );
}

const getColumns = ({
  eventDayId,
  scanQRData,
  isPending,
}: {
  eventDayId: string;
  scanQRData: (registrationIdentifier: string, eventDayId: string) => void;
  isPending: boolean;
}): ColumnDef<RegistrationItem>[] => [
  {
    accessorKey: "registrationIdentifier",
    header: "Identifier",
    cell: ({ row }) => <pre>{row.original.registrationIdentifier}</pre>,
  },
  {
    accessorKey: "affiliation",
    header: "Affiliation",
    cell: ({ row }) => {
      if (row.original.isMember) {
        return <>{row.original.businessName || row.original.affiliation}</>;
      }

      return <>{row.original.affiliation}</>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const paymentProofStatus = row.original.paymentProofStatus;
      return (
        <Badge
          className={cn(
            "rounded-full",
            paymentProofStatus === "accepted"
              ? "bg-green-600"
              : paymentProofStatus === "pending"
                ? "bg-yellow-600"
                : "bg-red-600",
          )}
        >
          {row.original.paymentProofStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "people",
    header: "People",
    cell: ({ row }) => <>{row.original.people}</>,
  },
  {
    accessorKey: "checkIn",
    header: "Check In",
    enableHiding: false,
    cell: ({ row }) => (
      <CheckInActionButton
        eventDayId={eventDayId}
        isPending={isPending}
        registrationIdentifier={row.original.registrationIdentifier}
        scanQRData={scanQRData}
      />
    ),
  },
];

export default function CheckInRegistrationTable({
  eventDayId,
  eventId,
  registrationList,
}: CheckInRegistrationTableProps) {
  const { execute: scanQRData, isPending } = useScanQR({ eventId });

  return (
    <DataTable
      columns={getColumns({ eventDayId, isPending, scanQRData })}
      data={registrationList}
    />
  );
}
