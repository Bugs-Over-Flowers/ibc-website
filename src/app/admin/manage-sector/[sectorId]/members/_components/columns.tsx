"use client";

import type { ColumnDef } from "@tanstack/react-table";

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
    header: "Company",
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
