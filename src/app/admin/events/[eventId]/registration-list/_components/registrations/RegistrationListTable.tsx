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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RegistrationItem } from "@/lib/validation/registration/registration-list";
import RegistrationRowActions from "./RegistrationRowActions";

interface RegistrationListProps {
  registrationList: RegistrationItem[];
}

export const registrationListColumns: ColumnDef<RegistrationItem>[] = [
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
      const data = row.original;

      if (data.isMember) {
        return (
          <Tooltip>
            <TooltipTrigger>{data.businessName}</TooltipTrigger>
            <TooltipContent>
              {data.businessName} (id: {data.businessMemberId})
            </TooltipContent>
          </Tooltip>
        );
      }

      return <>{data.affiliation}</>;
    },
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
          variant={"ghost"}
        >
          Registrant
          {column.getIsSorted() === "asc" ? (
            <ArrowDownAZ />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowUpZA />
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
      return <>{formatDate(registrationDate, "MMM d, h:mm aaa")}</>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          "rounded-full",
          row.original.paymentStatus === "verified"
            ? "bg-green-600"
            : "bg-yellow-600",
        )}
      >
        {row.getValue("paymentStatus")}
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
          registrationIdentifier: row.original.registrationIdentifer,
          paymentStatus: row.original.paymentStatus,
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
    <DataTable columns={registrationListColumns} data={registrationList} />
  );
}
