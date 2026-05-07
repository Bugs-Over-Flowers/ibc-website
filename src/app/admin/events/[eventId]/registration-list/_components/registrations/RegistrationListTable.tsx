"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "date-fns";
import {
  AdminTableDateSortHeader,
  AdminTableSortHeader,
  PaymentStatusBadge,
} from "@/app/admin/events/_components/table/AdminTableControls";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import type { RegistrationItem } from "@/lib/validation/registration-management";
import RegistrationRowActions from "./RegistrationRowActions";

interface RegistrationListProps {
  eventTitle: string;
  registrationList: RegistrationItem[];
}

export default function RegistrationListTable({
  registrationList,
  eventTitle,
}: RegistrationListProps) {
  const registrationListColumns = (
    eventTitle: string,
  ): ColumnDef<RegistrationItem>[] => [
    {
      accessorKey: "registrationIdentifier",
      header: "Identifier",
      cell: ({ row }) => (
        <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">
          {row.original.registrationIdentifier}
        </code>
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
        <span className="text-muted-foreground">
          {row.original.affiliation}
        </span>
      ),
    },
    {
      accessorKey: "registrant",
      sortingFn: (rowA, rowB) => {
        const aName = `${rowA.original.registrant.firstName} ${rowA.original.registrant.lastName} (${rowA.original.registrant.email})`;
        const bName = `${rowB.original.registrant.firstName} ${rowB.original.registrant.lastName} (${rowB.original.registrant.email})`;
        return aName.localeCompare(bName);
      },
      header: ({ column }) => (
        <AdminTableSortHeader
          label="Registrant"
          onSort={() => column.toggleSorting(column.getIsSorted() === "asc")}
          sorted={column.getIsSorted()}
        />
      ),
      cell: ({ row }) => {
        const { email, firstName, lastName } = row.original.registrant;
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm">
              {firstName} {lastName}
            </span>
            <span className="text-muted-foreground text-xs">{email}</span>
          </div>
        );
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
        const { registrationDate } = row.original;
        return (
          <span className="text-muted-foreground">
            {formatDate(registrationDate, "MMM d, h:mm aaa")}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentProofStatus",
      header: "Payment Status",
      cell: ({ row }) => (
        <PaymentStatusBadge
          data-testid={"payment-status-badge"}
          status={row.original.paymentProofStatus}
        />
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => (
        <Badge className="capitalize" variant="outline">
          {String(row.getValue("paymentMethod")).toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: "people",
      header: "People",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {String(row.getValue("people"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
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
            registrantName: `${row.original.registrant.firstName} ${row.original.registrant.lastName}`,
          }}
          eventTitle={eventTitle}
          isDetailsPage={false}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
          {registrationList.length}{" "}
          {registrationList.length === 1 ? "registration" : "registrations"}
        </span>
      </div>
      <DataTable
        columns={registrationListColumns(eventTitle)}
        data={registrationList}
        enableClearSorting
      />
    </div>
  );
}
