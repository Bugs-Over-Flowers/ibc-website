"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RegistrationItem } from "@/lib/validation/registration-management";
import CheckInRegistrationRowActions from "./CheckInRegistrationRowActions";

interface CheckInRegistrationTableProps {
  eventDayId: string;
  eventId: string;
  registrationList: RegistrationItem[];
}

const getColumns = ({
  eventDayId,
  eventId,
}: {
  eventDayId: string;
  eventId: string;
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
    cell: ({ row }) => (
      <Badge
        className={cn(
          "rounded-full",
          row.original.paymentProofStatus === "accepted"
            ? "bg-green-600"
            : "bg-yellow-600",
        )}
      >
        {row.original.paymentProofStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "people",
    header: "People",
    cell: ({ row }) => <>{row.original.people}</>,
  },
  {
    accessorKey: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => (
      <CheckInRegistrationRowActions
        eventDayId={eventDayId}
        eventId={eventId}
        registrationIdentifier={row.original.registrationIdentifier}
      />
    ),
  },
];

export default function CheckInRegistrationTable({
  eventDayId,
  eventId,
  registrationList,
}: CheckInRegistrationTableProps) {
  return (
    <DataTable
      columns={getColumns({ eventDayId, eventId })}
      data={registrationList}
    />
  );
}
