import { Suspense } from "react";
import SectorContent from "./_components/sectorContainer/SectorContent";
import SectorManagementPageSkeleton from "./loading";

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
    <Suspense fallback={<SectorManagementPageSkeleton />}>
      <SectorContent search={sp.search} />
    </Suspense>
  );
};

export default page;
