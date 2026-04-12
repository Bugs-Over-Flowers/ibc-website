"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import {
  ArrowDownAZ,
  ArrowUpZA,
  CalendarArrowDown,
  CalendarArrowUp,
  Download,
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/export/excel";
import type { ParticipantListItem } from "@/lib/validation/registration-management";
import ParticipantRowActions from "./ParticipantRowActions";

interface ParticipantListProps {
  eventTitle: string;
  participantList: ParticipantListItem[];
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

export const participantListColumns: ColumnDef<ParticipantListItem>[] = [
  {
    accessorKey: "affiliation",
    header: ({ column }) => (
      <SortHeader
        label="Affiliation"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
    cell: ({ row }) => {
      const { affiliation } = row.original;
      return <span className="text-muted-foreground">{affiliation}</span>;
    },
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <SortHeader
        label="First Name"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
    cell: ({ row }) => {
      const { firstName } = row.original;
      return <span className="text-sm">{firstName}</span>;
    },
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <SortHeader
        label="Last Name"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
    ),
    cell: ({ row }) => {
      const { lastName } = row.original;
      return <span className="text-sm">{lastName}</span>;
    },
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
    cell: ({ row }) => {
      const { email } = row.original;
      return <span className="text-muted-foreground">{email}</span>;
    },
  },
  {
    accessorKey: "contactNumber",
    header: "Contact Number",
    cell: ({ row }) => {
      const { contactNumber } = row.original;
      return <span className="text-muted-foreground">{contactNumber}</span>;
    },
  },
  {
    accessorKey: "registrationDate",
    sortingFn: "datetime",
    header: ({ column }) => (
      <Button
        className="h-auto p-0 font-medium text-[11px] text-muted-foreground uppercase tracking-wider hover:bg-transparent hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        type="button"
        variant="ghost"
      >
        Registration Date
        {column.getIsSorted() === "asc" ? (
          <CalendarArrowDown className="ml-1 size-3" />
        ) : column.getIsSorted() === "desc" ? (
          <CalendarArrowUp className="ml-1 size-3" />
        ) : null}
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {formatDate(
            new Date(row.original.registrationDate),
            "MMM d, h:mm aaa",
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => {
      const { registrationId } = row.original;

      return <ParticipantRowActions registrationId={registrationId} />;
    },
  },
];

const getExcelColumns = (): ColumnDef<ParticipantListItem>[] => [
  {
    accessorKey: "affiliation",
    header: "Company/Organization", // Custom Excel header
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "contactNumber",
    header: "Contact Number",
  },
  {
    accessorKey: "registrationDate",
    header: "Registration Date",
  },
];

export default function ParticipantListTable({
  eventTitle,
  participantList,
}: ParticipantListProps) {
  const handleExport = async (data: ParticipantListItem[]) => {
    await exportToExcel({
      data,
      columns: getExcelColumns(),
      filename: `${eventTitle}-Participants-${new Date().toISOString().split("T")[0]}.xlsx`,
      sheetName: "Participants",
      excludeColumns: ["actions"],
    });
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
          {participantList.length}{" "}
          {participantList.length === 1 ? "participant" : "participants"}
        </span>
        <Button
          className="gap-1.5"
          disabled={participantList.length === 0}
          onClick={() => {
            handleExport(participantList);
          }}
          size="sm"
          variant="outline"
        >
          <Download className="size-3.5" />
          Export to Excel
        </Button>
      </div>
      <DataTable
        columns={participantListColumns}
        data={participantList}
        enableClearSorting
      />
    </div>
  );
}
