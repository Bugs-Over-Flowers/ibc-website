import { Building2 } from "lucide-react";
import { getSectors } from "@/server/sectors/queries";
import SectorActionsDropdown from "./SectorActionsDropdown";

export default async function SectorRow() {
  const sectors = await getSectors();

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

              <SectorActionsDropdown sectorId={sector.sectorId} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
