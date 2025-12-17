"use client";

import type { ColumnDef } from "@tanstack/react-table";
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
import type { ParticipantListItem } from "@/lib/validation/participant/participant-list";
import ParticipantRowActions from "./ParticipantRowActions";

interface ParticipantListProps {
  participantList: ParticipantListItem[];
}

export const participantListColumns: ColumnDef<ParticipantListItem>[] = [
  {
    accessorKey: "affiliation",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant={"ghost"}
        >
          Affiliation
          {column.getIsSorted() === "asc" ? (
            <ArrowDownAZ />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpZA />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const { affiliation } = row.original;
      return <>{affiliation}</>;
    },
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant={"ghost"}
        >
          First Name
          {column.getIsSorted() === "asc" ? (
            <ArrowDownAZ />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpZA />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const { firstName } = row.original;
      return <>{firstName}</>;
    },
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant={"ghost"}
        >
          Last Name
          {column.getIsSorted() === "asc" ? (
            <ArrowDownAZ />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpZA />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const { lastName } = row.original;
      return <>{lastName}</>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant={"ghost"}
        >
          Email
          {column.getIsSorted() === "asc" ? (
            <ArrowDownAZ />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpZA />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const { email } = row.original;
      return <>{email}</>;
    },
  },
  {
    accessorKey: "contactNumber",
    header: "Contact Number",
    cell: ({ row }) => {
      const { contactNumber } = row.original;
      return <>{contactNumber}</>;
    },
  },

  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const { paymentStatus } = row.original;
      return <>{paymentStatus}</>;
    },
  },
  {
    accessorKey: "registrationDate",
    sortingFn: "datetime",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant={"ghost"}
        >
          Registration Date
          {column.getIsSorted() === "asc" ? (
            <CalendarArrowDown />
          ) : column.getIsSorted() === "desc" ? (
            <CalendarArrowUp />
          ) : (
            ""
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const { registrationDate } = row.original;
      return <>{new Date(registrationDate).toLocaleDateString()}</>;
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const { registrationId } = row.original;

      return <ParticipantRowActions registrationId={registrationId} />;
    },
  },
];

export default function ParticipantListTable({
  participantList,
}: ParticipantListProps) {
  const handleExport = async (data: ParticipantListItem[]) => {
    await exportToExcel({
      data,
      columns: participantListColumns,
      filename: "participants",
      sheetName: "Participants",
      excludeColumns: ["actions"],
    });
  };
  return (
    <div className="space-y-2">
      <div className="flex h-8 justify-between">
        <div>{participantList.length} results</div>
        <Button
          onClick={() => {
            handleExport(participantList);
          }}
          size="sm"
          variant="outline"
        >
          <Download className="size-4" />
          Export to Excel
        </Button>
      </div>
      <DataTable columns={participantListColumns} data={participantList} />
    </div>
  );
}
