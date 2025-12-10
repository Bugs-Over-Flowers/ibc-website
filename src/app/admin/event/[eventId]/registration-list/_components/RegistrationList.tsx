"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type * as React from "react";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
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
    header: "Affiliation",
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
    accessorKey: "principalParticipant",
    header: "Registered By",
    cell: ({ row }) => {
      const { email, firstName, lastName } = row.original.principalParticipant;
      return (
        <>
          {firstName} {lastName} ({email})
        </>
      );
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
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <RegistrationRowActions
        data={{
          paymentStatus: row.original.paymentStatus,
          email: row.original.principalParticipant.email,
          eventId: row.original.eventId,
          registrationId: row.original.registrationId,
        }}
      />
    ),
  },
];

const RegistrationList: React.FC<RegistrationListProps> = ({
  registrationList,
}: RegistrationListProps) => {
  return (
    <DataTable columns={registrationListColumns} data={registrationList} />
  );
};

export default RegistrationList;
