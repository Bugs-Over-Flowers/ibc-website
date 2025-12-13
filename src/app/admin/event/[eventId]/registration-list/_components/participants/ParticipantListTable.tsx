"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
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
    header: "Affiliation",
    cell: ({ row }) => {
      const { affiliation } = row.original;
      return <>{affiliation}</>;
    },
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => {
      const { firstName } = row.original;
      return <>{firstName}</>;
    },
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => {
      const { lastName } = row.original;
      return <>{lastName}</>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
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
    header: "Registration Date",
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
    <div className="space-y-4">
      <div className="flex justify-end">
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
