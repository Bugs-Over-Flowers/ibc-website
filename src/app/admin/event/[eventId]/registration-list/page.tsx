import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import BackButton from "./_components/BackButton";
import { StatsSkeleton, TableSkeleton } from "./_components/page-skeletons";
import RegistrationListStats from "./_components/RegistrationListStats";
import RegistrationTabs from "./_components/RegistrationsTabs";
import RegistrationListTable from "./_components/registrations/RegistrationListTable";
import RegistrationSearchAndFilter from "./_components/registrations/RegistrationSearchAndFilter";

type RegistrationListPageProps =
  PageProps<"/admin/event/[eventId]/registration-list">;

export default function RegistrationPageWrapper({
  params,
  searchParams,
}: RegistrationListPageProps) {
  return (
    <main className="flex flex-col gap-4 p-5 md:p-10">
      <Suspense
        fallback={
          <Link href={`/admin/events` as Route}>
            <Button variant="outline">Back to Event Page</Button>
          </Link>
        }
      >
        <BackButton params={params} />
      </Suspense>
      <RegistrationTabs>
        <TabsContent className="flex flex-col gap-4" value="registrations">
          <Suspense fallback={<StatsSkeleton />}>
            <RegistrationListStats
              params={params}
              searchParams={searchParams}
            />
          </Suspense>
          <Suspense
            fallback={<Skeleton className="h-32 rounded-xl bg-neutral-200" />}
          >
            <RegistrationSearchAndFilter />
          </Suspense>

          <Suspense fallback={<TableSkeleton />}>
            <RegistrationListTable
              params={params}
              searchParams={searchParams}
            />
          </Suspense>
        </TabsContent>
        <TabsContent
          className="flex flex-col gap-4"
          value="registrations"
        ></TabsContent>
      </RegistrationTabs>
    </main>
  );
}
