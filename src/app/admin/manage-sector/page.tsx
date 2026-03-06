import { Suspense } from "react";
import SectorContent from "./_components/sectorContainer/SectorContent";

interface SearchParams {
  search?: string;
}

const page = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) => {
  const sp = await searchParams;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SectorContent search={sp.search} />
    </Suspense>
  );
};

export default page;
