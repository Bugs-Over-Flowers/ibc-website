"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { ArrowDownAZ, ArrowUpZA, Clock } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import type { CheckInListItem } from "@/lib/validation/check-in/check-in-list";
import CheckInRowActions from "./CheckInRowActions";
import RemarksDialog from "./RemarksDialog";

interface CheckInTableProps {
  checkIns: CheckInListItem[];
  eventDayId: string;
}

const getCheckInListColumns = (
  eventDayId: string,
): ColumnDef<CheckInListItem>[] => [
  {
    accessorKey: "checkInTime",
    sortingFn: "datetime",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Check-In Time
        {column.getIsSorted() === "asc" ? (
          <Clock className="rotate-180" />
        ) : column.getIsSorted() === "desc" ? (
          <Clock />
        ) : null}
      </Button>
    ),
    cell: ({ row }) =>
      formatDate(new Date(row.original.checkInTime), "h:mm aaa"),
  },
  {
    accessorKey: "affiliation",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Affiliation
        {column.getIsSorted() === "asc" ? (
          <ArrowDownAZ />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUpZA />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => row.original.affiliation,
  },
  {
    id: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    sortingFn: (rowA, rowB) => {
      const aName = `${rowA.original.firstName} ${rowA.original.lastName}`;
      const bName = `${rowB.original.firstName} ${rowB.original.lastName}`;
      return aName.localeCompare(bName);
    },
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Name
        {column.getIsSorted() === "asc" ? (
          <ArrowDownAZ />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUpZA />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        variant="ghost"
      >
        Email
        {column.getIsSorted() === "asc" ? (
          <ArrowDownAZ />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUpZA />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: "contactNumber",
    header: "Contact Number",
    cell: ({ row }) => row.original.contactNumber,
  },
  {
    id: "remarks",
    header: "Remarks",
    cell: ({ row }) => {
      const { remarks, firstName, lastName } = row.original;
      if (!remarks) return null;
      return (
        <RemarksDialog
          participantName={`${firstName} ${lastName}`}
          remarks={remarks}
        />
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => (
      <CheckInRowActions
        checkInId={row.original.checkInId}
        checkInTime={row.original.checkInTime}
        eventDayId={eventDayId}
        registrationId={row.original.registrationId}
      />
    ),
  },
];

export default function CheckInTable({
  checkIns,
  eventDayId,
}: CheckInTableProps) {
  return (
    <div className="space-y-2">
      <div className="flex h-8 items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {checkIns.length}{" "}
          {checkIns.length === 1 ? "participant" : "participants"} checked in
        </div>
      </div>
      <DataTable columns={getCheckInListColumns(eventDayId)} data={checkIns} />
    </div>
  );
}
