"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { Download } from "lucide-react";
import {
  AdminTableDateSortHeader,
  AdminTableSortHeader,
} from "@/app/admin/events/_components/table/AdminTableControls";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { type ExportEventDetails, exportToExcel } from "@/lib/export/excel";
import type { ParticipantListItem } from "@/lib/validation/registration-management";
import ParticipantRowActions from "./ParticipantRowActions";

interface ParticipantListProps {
  participantList: ParticipantListItem[];
  eventDetails: ExportEventDetails;
}

export const participantListColumns: ColumnDef<ParticipantListItem>[] = [
  {
    accessorKey: "affiliation",
    header: ({ column }) => (
      <AdminTableSortHeader
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
      <AdminTableSortHeader
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
      <AdminTableSortHeader
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
      <AdminTableSortHeader
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
      <AdminTableDateSortHeader
        label="Registration Date"
        onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sorted={column.getIsSorted()}
      />
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
  participantList,
  eventDetails,
}: ParticipantListProps) {
  const handleExport = async (data: ParticipantListItem[]) => {
    await exportToExcel({
      data,
      columns: getExcelColumns(),
      event: eventDetails,
      filename: `${eventDetails.title}-Participants-${new Date().toISOString().split("T")[0]}.xlsx`,
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
