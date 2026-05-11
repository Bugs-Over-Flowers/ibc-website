"use client";

import { Building2 } from "lucide-react";
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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/manage-sector/${sectorId}/members`);
  };

  return (
    <li>
      <div className="group flex w-full items-center gap-4 rounded-md px-4 py-3.5 transition-colors hover:bg-muted/40">
        <button
          className="flex w-full items-center gap-4 bg-transparent p-0 text-left focus:outline-none focus:ring-2 focus:ring-ring"
          onDoubleClick={handleDoubleClick}
          type="button"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground text-lg md:text-xl">
              {sectorName}
            </p>
          </div>

          {/* Member count badge on the right to give a table-like column look */}
          <div className="flex items-center">
            <span
              className="rounded-full bg-primary/10 px-3 py-0.5 font-medium text-primary text-sm"
              title={`${memberCount} ${memberCount === 1 ? "member" : "members"}`}
            >
              {memberCount} {memberCount === 1 ? "Member" : "Members"}
            </span>
          </div>
        </button>

        <SectorActionsDropdown sectorId={sectorId} sectorName={sectorName} />
      </div>
    </li>
  );
}
