"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Member = {
  businessName: string | null;
  representativeName: string | null;
  representativePosition: string | null;
  businessEmail: string | null;
  businessPhoneNumber: string | null;
};

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "businessName",
    header: ({ column }) => {
      return (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          variant="ghost"
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "representativeName",
    header: "Representative",
  },
  {
    accessorKey: "representativePosition",
    header: "Role",
  },
  {
    accessorKey: "businessEmail",
    header: "Email",
  },
  {
    accessorKey: "businessPhoneNumber",
    header: "Phone",
  },
];
