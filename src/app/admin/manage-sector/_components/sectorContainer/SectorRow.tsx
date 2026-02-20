import { Building2 } from "lucide-react";
import { getSectors } from "@/server/sectors/queries";
import SectorActionsDropdown from "./SectorActionsDropdown";

export default async function SectorRow({ search }: { search?: string }) {
  const sectors = await getSectors(search);

  if (sectors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-background py-16 text-center shadow-sm">
        <Building2 className="h-10 w-10 text-muted-foreground" />
        <h3 className="font-semibold text-lg">No sectors found</h3>
        <p className="text-muted-foreground text-sm">
          {search
            ? `No sectors matching "${search}"`
            : "Get started by creating a new sector."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sectors.map((sector) => (
        <article
          className="flex flex-col items-start gap-4 overflow-hidden rounded-lg border bg-background p-4 shadow-sm md:flex-row md:items-center"
          key={sector.sectorId}
        >
          <div className="flex w-full flex-1 flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg md:text-xl">
                    {sector.sectorName}
                  </h3>
                </div>
              </div>

              <SectorActionsDropdown
                sectorId={sector.sectorId}
                sectorName={sector.sectorName}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
