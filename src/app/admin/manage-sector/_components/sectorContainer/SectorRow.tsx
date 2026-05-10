import { Building2 } from "lucide-react";
import { cookies } from "next/headers";
import { getSectors } from "@/server/sectors/queries";
import SectorRowItem from "./SectorRowItem";

export default async function SectorRow({ search }: { search?: string }) {
  const cookieStore = await cookies();
  const sectors = await getSectors(cookieStore.getAll(), search);

  if (sectors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Building2 className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-foreground">
            No sectors found
          </h3>
          <p className="text-muted-foreground text-sm">
            {search
              ? `No results for "${search}"`
              : "Get started by creating a new sector."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Sectors
        </p>
        <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground text-xs">
          {sectors.length}
        </span>
      </div>

      <ul className="divide-y">
        {sectors.map((sector) => (
          <SectorRowItem
            key={sector.sectorId}
            memberCount={sector.memberCount}
            sectorId={sector.sectorId}
            sectorName={sector.sectorName}
          />
        ))}
      </ul>
    </div>
  );
}
