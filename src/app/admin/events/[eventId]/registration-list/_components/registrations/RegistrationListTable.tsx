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
  eventTitle: string;
  registrationList: RegistrationItem[];
}

const PAYMENT_STYLES = {
  accepted:
    "border-[#97C459] bg-[#EAF3DE] text-[#27500A] dark:border-[#3B6D11] dark:bg-[#173404] dark:text-[#C0DD97]",
  pending:
    "border-[#EF9F27] bg-[#FAEEDA] text-[#633806] dark:border-[#854F0B] dark:bg-[#412402] dark:text-[#FAC775]",
  rejected:
    "border-[#F09595] bg-[#FCEBEB] text-[#791F1F] dark:border-[#A32D2D] dark:bg-[#501313] dark:text-[#F7C1C1]",
} as const;

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
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {row.original.registrationIdentifier}
        </code>
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
        <SortHeader
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
      cell: ({ row }) => {
        const paymentProofStatus = row.original
          .paymentProofStatus as keyof typeof PAYMENT_STYLES;

        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 font-medium text-[11px] capitalize",
              PAYMENT_STYLES[paymentProofStatus] ?? PAYMENT_STYLES.pending,
            )}
          >
            {paymentProofStatus}
          </span>
        );
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => (
        <Badge className="capitalize" variant="outline">
          {String(row.getValue("paymentMethod")).toLowerCase()}
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
