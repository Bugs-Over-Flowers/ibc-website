import { Suspense } from "react";
import CreateSectorButton from "../CreateSectorButton";
import SectorFilters from "../SectorFilters";
import SectorRow from "./SectorRow";

const SectorContent = ({ search }: { search?: string }) => {
  return (
    <div className="select-none space-y-6 px-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl text-foreground">
            Sectors Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage and organize your sectors
          </p>
        </div>
        <CreateSectorButton />
      </div>

      <Suspense
        fallback={<div className="h-12 animate-pulse rounded bg-muted" />}
      >
        <SectorFilters />
      </Suspense>

      <SectorRow search={search} />
    </div>
  );
};

export default SectorContent;
