"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import { DataTable } from "@/components/DataTable";
import type { CheckInItem } from "@/lib/validation/checkin/checkin-list";
import CheckInRowActions from "./CheckInRowActions";

const checkInListColumns: ColumnDef<CheckInItem>[] = [
  {
    accessorKey: "checkedInAt",
    header: "Checked In",
    cell: ({ getValue }) => {
      const date = getValue<string>();
      return formatDate(new Date(date), "hh:mm:ss aaa");
    },
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
    accessorKey: "affiliation",
    header: "Affiliation",
  },
  {
    id: "Actions",
    header: "Actions",
    cell: ({ row }) => {
      return <CheckInRowActions registrationId={row.original.registrationId} />;
    },
  },
];

interface CheckInTableProps {
  checkInItems: CheckInItem[];
}

export default function CheckInTable({ checkInItems }: CheckInTableProps) {
  return <DataTable columns={checkInListColumns} data={checkInItems} />;
}
