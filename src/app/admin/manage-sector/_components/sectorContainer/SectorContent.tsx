import React from "react";
import SectorRow from "./SectorRow";

const SectorContent = () => {
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
      </div>

      <SectorRow />
    </div>
  );
};

export default SectorContent;
