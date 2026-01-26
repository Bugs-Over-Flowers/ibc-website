"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { ArrowDownAZ, ArrowUpZA, Clock, Download } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/export/excel";
import type { CheckInListItem } from "@/lib/validation/check-in/check-in-list";
import CheckInRowActions from "./CheckInRowActions";
import RemarksDialog from "./RemarksDialog";

interface CheckInTableProps {
  checkIns: CheckInListItem[];
  eventDayId: string;
}

type CheckInListRow = CheckInListItem & { name: string };

const getCheckInListColumns = (
  eventDayId: string,
): ColumnDef<CheckInListRow>[] => [
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
    accessorKey: "identifier",
    cell: ({ row }) => {
      return <pre>{row.original.identifier}</pre>;
    },
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
    accessorKey: "name",
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
    accessorKey: "remarks",
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

const getExcelColumns = (): ColumnDef<CheckInListRow>[] => [
  {
    accessorKey: "checkInTime",
    header: "Time", // Custom Excel header
  },
  {
    accessorKey: "identifier",
    header: "Identifier", // Custom Excel header
  },
  {
    accessorKey: "affiliation",
    header: "Affiliation", // Custom Excel header
  },
  {
    accessorKey: "name",
    header: "Full Name", // Custom Excel header
  },
  {
    accessorKey: "email",
    header: "Email Address", // Custom Excel header
  },
  {
    accessorKey: "contactNumber",
    header: "Phone Number", // Custom Excel header
  },
  {
    accessorKey: "remarks",
    header: "Remarks", // Custom Excel header
  },
];

export default function CheckInTable({
  checkIns,
  eventDayId,
}: CheckInTableProps) {
  const tableData: CheckInListRow[] = checkIns.map((checkIn) => ({
    ...checkIn,
    name: `${checkIn.firstName} ${checkIn.lastName}`,
  }));

  const handleExportToExcel = async () => {
    await exportToExcel({
      data: tableData,
      columns: getExcelColumns(),
      filename: "check-in-list",
      sheetName: "Check-In List",
      excludeColumns: ["actions"],
      formatters: {
        checkInTime: (value) => formatDate(new Date(String(value)), "h:mm aaa"),
      },
    });
  };
  return (
    <div className="space-y-2">
      <div className="flex h-8 items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {checkIns.length}{" "}
          {checkIns.length === 1 ? "participant" : "participants"} checked in
        </div>
        <div>
          <Button onClick={handleExportToExcel} size="sm" variant="outline">
            <Download className="size-4" />
            Export to Excel
          </Button>
        </div>
      </div>
      <DataTable columns={getCheckInListColumns(eventDayId)} data={tableData} />
    </div>
  );
}
