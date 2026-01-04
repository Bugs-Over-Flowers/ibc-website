import { Suspense } from "react";
import FiltersSkeleton from "./_components/FiltersSkeleton";
import FiltersWrapper from "./_components/FiltersWrapper";
import MembersList from "./_components/MembersList";
import MembersListSkeleton from "./_components/MembersListSkeleton";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    sectorName?: string;
    search?: string;
  }>;
}

export default function MembersPage({ searchParams }: PageProps) {
  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="font-bold text-3xl">Members Directory</h1>
        <p className="mt-2 text-muted-foreground">
          View and manage active members
        </p>
      </div>

      <Suspense fallback={<FiltersSkeleton />}>
        <FiltersWrapper />
      </Suspense>

      <Suspense fallback={<MembersListSkeleton />}>
        <MembersList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
