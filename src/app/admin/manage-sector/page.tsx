import { Suspense } from "react";
import SectorContent from "./_components/sectorContainer/SectorContent";

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SectorContent />
    </Suspense>
  );
};

export default page;
