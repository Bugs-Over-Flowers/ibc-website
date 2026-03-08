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
  eventTitle: string;
  checkIns: CheckInListItem[];
  eventDayId: string;
  eventDayLabel: string;
}

type CheckInListRow = CheckInListItem & { name: string };

const SORTABLE_HEADER_CLASS =
  "inline-flex items-center gap-1 rounded-sm p-0 text-left font-medium hover:text-foreground/80";

const getCheckInListColumns = (
  eventDayId: string,
): ColumnDef<CheckInListRow>[] => [
  {
    accessorKey: "checkInTime",
    sortingFn: "datetime",
    header: ({ column }) => (
      <button
        className={SORTABLE_HEADER_CLASS}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        type="button"
      >
        Check-In Time
        {column.getIsSorted() === "asc" ? (
          <Clock className="size-4 rotate-180" />
        ) : column.getIsSorted() === "desc" ? (
          <Clock className="size-4" />
        ) : null}
      </button>
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
    accessorKey: "firstName",
    header: ({ column }) => (
      <button
        className={SORTABLE_HEADER_CLASS}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        type="button"
      >
        First Name
        {column.getIsSorted() === "asc" ? (
          <ArrowDownAZ className="size-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUpZA className="size-4" />
        ) : null}
      </button>
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <button
        className={SORTABLE_HEADER_CLASS}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        type="button"
      >
        Last Name
        {column.getIsSorted() === "asc" ? (
          <ArrowDownAZ className="size-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUpZA className="size-4" />
        ) : null}
      </button>
    ),
  },
  {
    accessorKey: "affiliation",
    header: ({ column }) => (
      <button
        className={SORTABLE_HEADER_CLASS}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        type="button"
      >
        Affiliation
        {column.getIsSorted() === "asc" ? (
          <ArrowDownAZ className="size-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUpZA className="size-4" />
        ) : null}
      </button>
    ),
    cell: ({ row }) => row.original.affiliation,
  },

  {
    accessorKey: "email",
    header: ({ column }) => (
      <button
        className={SORTABLE_HEADER_CLASS}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        type="button"
      >
        Email
        {column.getIsSorted() === "asc" ? (
          <ArrowDownAZ className="size-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUpZA className="size-4" />
        ) : null}
      </button>
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
    accessorKey: "firstName",
    header: "First Name", // Custom Excel header
  },
  {
    accessorKey: "lastName",
    header: "Last Name", // Custom Excel header
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
  eventTitle,
  checkIns,
  eventDayId,
  eventDayLabel,
}: CheckInTableProps) {
  const tableData: CheckInListRow[] = checkIns.map((checkIn) => ({
    ...checkIn,
    name: `${checkIn.firstName} ${checkIn.lastName}`,
  }));

  const handleExportToExcel = async () => {
    await exportToExcel({
      data: tableData,
      columns: getExcelColumns(),
      filename: `${eventTitle}-${eventDayLabel}-CheckIns-${new Date().toISOString().split("T")[0]}.xlsx`,
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
      <DataTable
        columns={getCheckInListColumns(eventDayId)}
        data={tableData}
        enableClearSorting
      />
    </div>
  );
}
