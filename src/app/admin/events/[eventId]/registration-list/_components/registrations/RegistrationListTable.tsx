"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import {
  ArrowDownAZ,
  ArrowUpZA,
  CalendarArrowDown,
  CalendarArrowUp,
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RegistrationItem } from "@/lib/validation/registration-management";
import RegistrationRowActions from "./RegistrationRowActions";

interface RegistrationListProps {
  registrationList: RegistrationItem[];
}
export const registrationListColumns: ColumnDef<RegistrationItem>[] = [
  {
    accessorKey: "registrationIdentifer",
    header: "Identifier",
    cell: ({ row }) => <pre>{row.original.registrationIdentifier}</pre>,
  },
  {
    accessorKey: "affiliation",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          type="button"
          variant={"ghost"}
        >
          Affiliation
          {column.getIsSorted() === "asc" ? (
            <ArrowDownAZ className="size-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpZA className="size-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => row.original.affiliation,
  },
  {
    accessorKey: "registrant",
    sortingFn: (rowA, rowB) => {
      const aName = `${rowA.original.registrant.firstName} ${rowA.original.registrant.lastName} (${rowA.original.registrant.email})`;
      const bName = `${rowB.original.registrant.firstName} ${rowB.original.registrant.lastName} (${rowB.original.registrant.email})`;
      return aName.localeCompare(bName);
    },
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          type="button"
          variant={"ghost"}
        >
          Registrant
          {column.getIsSorted() === "asc" ? (
            <ArrowDownAZ className="size-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpZA className="size-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const { email, firstName, lastName } = row.original.registrant;
      return (
        <>
          {firstName} {lastName} ({email})
        </>
      );
    },
  },
  {
    accessorKey: "registrationDate",
    sortingFn: "datetime",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          type="button"
          variant={"ghost"}
        >
          Registration Date
          {column.getIsSorted() === "asc" ? (
            <CalendarArrowDown className="size-4" />
          ) : column.getIsSorted() === "desc" ? (
            <CalendarArrowUp className="size-4" />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const { registrationDate } = row.original;
      return <>{formatDate(registrationDate, "MMM d, h:mm aaa")}</>;
    },
  },
  {
    accessorKey: "paymentProofStatus",
    header: "Payment Status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          "rounded-full",
          row.original.paymentProofStatus === "accepted"
            ? "bg-green-600"
            : row.original.paymentProofStatus === "rejected"
              ? "bg-red-600"
              : "bg-yellow-600",
        )}
      >
        {row.original.paymentProofStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => <Badge>{row.getValue("paymentMethod")}</Badge>,
  },
  {
    accessorKey: "people",
    header: "People",
    cell: ({ row }) => <>{row.getValue("people")}</>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <RegistrationRowActions
        data={{
          affiliation: row.original.affiliation,
          registrationIdentifier: row.original.registrationIdentifier,
          paymentProofStatus: row.original.paymentProofStatus,
          paymentMethod: row.original.paymentMethod,
          email: row.original.registrant.email,
          registrationId: row.original.registrationId,
        }}
        isDetailsPage={false}
      />
    ),
  },
];

export default function RegistrationListTable({
  registrationList,
}: RegistrationListProps) {
  return (
    <DataTable
      columns={registrationListColumns}
      data={registrationList}
      enableClearSorting
    />
  );
}
