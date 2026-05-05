"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format, formatDate } from "date-fns";
import { Download } from "lucide-react";
import {
  AdminTableDateSortHeader,
  AdminTableSortHeader,
} from "@/app/admin/events/_components/table/AdminTableControls";
import { DataTable } from "@/components/DataTable";
import { IdentifierDisplay } from "@/components/IdentifierDisplay";
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
    accessorKey: "participantIdentifier",
    header: "Identifier",
    cell: ({ row }) => {
      const id = row.original.participantIdentifier;
      return id ? <IdentifierDisplay identifier={id} /> : null;
    },
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
      const {
        registrationId,
        participantIdentifier,
        firstName,
        lastName,
        email,
        affiliation,
      } = row.original;

      return (
        <ParticipantRowActions
          affiliation={affiliation}
          email={email}
          participantIdentifier={participantIdentifier}
          participantName={`${firstName} ${lastName}`}
          registrationId={registrationId}
        />
      );
    },
  },
];

const getExcelColumns = (): ColumnDef<Record<string, unknown>>[] => [
  { accessorKey: "registrationDate", header: "Registration Date" },
  { accessorKey: "registrationTime", header: "Time" },
  { accessorKey: "affiliation", header: "Company/Organization" },
  { accessorKey: "firstName", header: "First Name" },
  { accessorKey: "lastName", header: "Last Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "contactNumber", header: "Contact Number" },
  { accessorKey: "participantIdentifier", header: "Participant ID" },
];

export default function ParticipantListTable({
  participantList,
  eventDetails,
}: ParticipantListProps) {
  const handleExport = async (data: ParticipantListItem[]) => {
    const sorted = [...data].sort(
      (a, b) =>
        new Date(a.registrationDate).getTime() -
        new Date(b.registrationDate).getTime(),
    );
    const exportData = sorted.map((row) => ({
      registrationDate: row.registrationDate,
      registrationTime: format(new Date(row.registrationDate), "h:mm aaa"),
      affiliation: row.affiliation,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      contactNumber: row.contactNumber,
      participantIdentifier: row.participantIdentifier ?? "",
    }));

    await exportToExcel({
      data: exportData,
      columns: getExcelColumns(),
      event: eventDetails,
      filename: `${eventDetails.title}-Participants-${new Date().toISOString().split("T")[0]}.xlsx`,
      sheetName: "Participants",
      excludeColumns: ["actions"],
      formatters: {
        registrationDate: (value) =>
          format(new Date(String(value)), "MMM d, yyyy"),
      },
      columnWidths: [18, 12, 22, 16, 16, 28, 18, 22],
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
