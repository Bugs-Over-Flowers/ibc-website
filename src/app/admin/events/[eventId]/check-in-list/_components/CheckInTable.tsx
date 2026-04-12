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

type CheckInListRow = CheckInListItem & { name: string };

interface CheckInTableProps {
  eventTitle: string;
  checkIns: CheckInListItem[];
  eventDayId: string;
  eventDayLabel: string;
}

const SortHeader = ({
  label,
  sorted,
  onSort,
}: {
  label: string;
  sorted: "asc" | "desc" | false;
  onSort: () => void;
}) => (
  <Button
    className="h-auto p-0 font-medium text-[11px] text-muted-foreground uppercase tracking-wider hover:bg-transparent hover:text-foreground"
    onClick={onSort}
    type="button"
    variant="ghost"
  >
    {label}
    {sorted === "asc" ? (
      <ArrowDownAZ className="ml-1 size-3" />
    ) : sorted === "desc" ? (
      <ArrowUpZA className="ml-1 size-3" />
    ) : null}
  </Button>
);

const getCheckInListColumns = (
  eventDayId: string,
): ColumnDef<CheckInListRow>[] => [
  {
    accessorKey: "checkInTime",
    sortingFn: "datetime",
    header: ({ column }) => (
      <SortHeader
        label="Time"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#85B7EB] bg-[#E6F1FB] px-2 py-0.5 font-medium text-[#0C447C] text-xs dark:border-[#185FA5] dark:bg-[#042C53] dark:text-[#B5D4F4]">
        <Clock className="size-3" />
        {formatDate(new Date(row.original.checkInTime), "h:mm aaa")}
      </span>
    ),
  },
  {
    accessorKey: "identifier",
    header: "Identifier",
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
        {row.original.identifier}
      </code>
    ),
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <SortHeader
        label="First name"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <SortHeader
        label="Last name"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
  },
  {
    accessorKey: "affiliation",
    header: ({ column }) => (
      <SortHeader
        label="Affiliation"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.affiliation}</span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <SortHeader
        label="Email"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "contactNumber",
    header: "Contact",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.contactNumber}
      </span>
    ),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => {
      const { remarks, firstName, lastName } = row.original;
      if (!remarks) {
        return <span className="text-muted-foreground/40">-</span>;
      }
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
    header: "",
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
  { accessorKey: "checkInTime", header: "Time" },
  { accessorKey: "identifier", header: "Identifier" },
  { accessorKey: "affiliation", header: "Affiliation" },
  { accessorKey: "firstName", header: "First Name" },
  { accessorKey: "lastName", header: "Last Name" },
  { accessorKey: "email", header: "Email Address" },
  { accessorKey: "contactNumber", header: "Phone Number" },
  { accessorKey: "remarks", header: "Remarks" },
];

export default function CheckInTable({
  eventTitle,
  checkIns,
  eventDayId,
  eventDayLabel,
}: CheckInTableProps) {
  const tableData: CheckInListRow[] = checkIns.map((c) => ({
    ...c,
    name: `${c.firstName} ${c.lastName}`,
  }));

  const handleExport = async () => {
    await exportToExcel({
      data: tableData,
      columns: getExcelColumns(),
      filename: `${eventTitle}-${eventDayLabel}-CheckIns-${new Date().toISOString().split("T")[0]}.xlsx`,
      sheetName: "Check-In List",
      excludeColumns: ["actions"],
      formatters: {
        checkInTime: (v) => formatDate(new Date(String(v)), "h:mm aaa"),
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
          {checkIns.length}{" "}
          {checkIns.length === 1 ? "participant" : "participants"} checked in
        </span>
        <Button
          className="gap-1.5"
          onClick={handleExport}
          size="sm"
          variant="outline"
        >
          <Download className="size-3.5" />
          Export to Excel
        </Button>
      </div>
      <DataTable
        columns={getCheckInListColumns(eventDayId)}
        data={tableData}
        enableClearSorting
      />
    </div>
  );
}
