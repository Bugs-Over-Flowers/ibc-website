"use client";

import { Building2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import SectorActionsDropdown from "./SectorActionsDropdown";

type SectorRowItemProps = {
  sectorId: number;
  sectorName: string;
  memberCount: number;
};

export default function SectorRowItem({
  sectorId,
  sectorName,
  memberCount,
}: SectorRowItemProps) {
  const membersHref = `/admin/manage-sector/${sectorId}/members` as Route;

  return (
    <li>
      <Link
        className="group flex items-center gap-4 rounded-md px-4 py-3.5 transition-colors hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
        href={membersHref}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground text-lg md:text-xl">
            {sectorName}
          </p>
          <p className="text-muted-foreground text-xs">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </p>
        </div>

        <SectorActionsDropdown sectorId={sectorId} sectorName={sectorName} />
      </Link>
    </li>
  );
}
