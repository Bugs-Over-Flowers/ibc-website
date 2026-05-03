"use client";

import { Building2 } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const membersHref = `/admin/manage-sector/${sectorId}/members` as Route;

  return (
    <li
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
      onDoubleClick={() => router.push(membersHref)}
      title="Double-click to view members"
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
    </li>
  );
}
