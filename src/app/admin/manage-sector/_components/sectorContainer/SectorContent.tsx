import { Suspense } from "react";
import CreateSectorButton from "../CreateSectorButton";
import SectorFilters from "../SectorFilters";
import SectorRow from "./SectorRow";

const SectorContent = ({ search }: { search?: string }) => {
  return (
    <div className="select-none space-y-6 px-2">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-bold text-2xl text-foreground md:text-3xl">
            Sectors Management
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage and organize your sectors
          </p>
        </div>
        <CreateSectorButton />
      </div>

      <div className="rounded-lg border bg-background p-4 md:p-6">
        <Suspense
          fallback={<div className="h-12 animate-pulse rounded bg-muted" />}
        >
          <SectorFilters />
        </Suspense>
      </div>

      <SectorRow search={search} />
    </div>
  );
};

export default SectorContent;
