"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { Clock, Download, Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import {
  AdminTableSortHeader,
  PaymentStatusBadge,
} from "@/app/admin/events/_components/table/AdminTableControls";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ExportEventDetails, exportToExcel } from "@/lib/export/excel";
import type { CheckInListItem } from "@/lib/validation/check-in/check-in-list";
import CheckInRowActions from "./CheckInRowActions";
import ViewRemarkDialog from "./ViewRemarkDialog";

type CheckInListRow = CheckInListItem & { name: string };

interface CheckInTableProps {
  checkIns: CheckInListItem[];
  eventDayId: string;
  eventDayLabel: string;
  eventDetails: ExportEventDetails;
}

const getCheckInListColumns = (
  eventDayId: string,
): ColumnDef<CheckInListRow>[] => [
  {
    accessorKey: "checkInTime",
    sortingFn: "datetime",
    header: ({ column }) => (
      <AdminTableSortHeader
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
      <AdminTableSortHeader
        label="First name"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <AdminTableSortHeader
        label="Last name"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
  },
  {
    accessorKey: "affiliation",
    header: ({ column }) => (
      <AdminTableSortHeader
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
      <AdminTableSortHeader
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
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => {
      const { checkInId, remarks, firstName, lastName } = row.original;
      return (
        <ViewRemarkDialog
          checkInId={checkInId}
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
        participantName={`${row.original.firstName} ${row.original.lastName}`}
        registrationId={row.original.registrationId}
        remarks={row.original.remarks}
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
  { accessorKey: "paymentStatus", header: "Payment Status" },
  { accessorKey: "remarks", header: "Remarks" },
];

export default function CheckInTable({
  checkIns,
  eventDayId,
  eventDayLabel,
  eventDetails,
}: CheckInTableProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const tableData: CheckInListRow[] = useMemo(
    () =>
      checkIns.map((c) => ({
        ...c,
        name: `${c.firstName} ${c.lastName}`,
      })),
    [checkIns],
  );

  const filteredTableData = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return tableData;
    return tableData.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.identifier.toLowerCase().includes(q) ||
        c.affiliation.toLowerCase().includes(q),
    );
  }, [tableData, deferredSearch]);

  const handleExport = async () => {
    const sorted = [...filteredTableData].sort(
      (a, b) =>
        new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime(),
    );
    await exportToExcel({
      data: sorted,
      columns: getExcelColumns(),
      event: eventDetails,
      filename: `${eventDetails.title}-${eventDayLabel}-CheckIns-${new Date().toISOString().split("T")[0]}.xlsx`,
      sheetName: "Check-In List",
      excludeColumns: ["actions"],
      formatters: {
        checkInTime: (v) => formatDate(new Date(String(v)), "h:mm aaa"),
      },
    });
  };

  const searchActive = deferredSearch.trim().length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
          {searchActive
            ? `${filteredTableData.length} / ${checkIns.length}`
            : checkIns.length}{" "}
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
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-9 bg-background pr-8 pl-8 text-sm"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, identifier, or affiliation..."
          value={search}
        />
        {search !== "" && (
          <button
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setSearch("")}
            type="button"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <DataTable
        columns={getCheckInListColumns(eventDayId)}
        data={filteredTableData}
        enableClearSorting
      />
    </div>
  );
}
