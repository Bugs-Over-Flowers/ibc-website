import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import BackButton from "./_components/BackButton";
import { StatsSkeleton, TableSkeleton } from "./_components/page-skeletons";
import ParticipantList from "./_components/participants/ParticipantList";
import ParticipantsSearchAndFilter from "./_components/participants/ParticipantsSearchAndFilter";
import RegistrationTabs from "./_components/RegistrationsTabs";
import RegistrationList from "./_components/registrations/RegistrationList";
import RegistrationListStats from "./_components/registrations/RegistrationListStats";
import RegistrationsSearchAndFilter from "./_components/registrations/RegistrationsSearchAndFilter";

type RegistrationListPageProps =
  PageProps<"/admin/events/[eventId]/registration-list">;

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
        <Suspense fallback={<StatsSkeleton />}>
          <RegistrationListStats params={params} searchParams={searchParams} />
        </Suspense>
        <TabsContent className="flex flex-col gap-4" value="registrations">
          {/* Stats */}

          {/* Search and Filter */}
          <Suspense
            fallback={<Skeleton className="h-32 rounded-xl bg-neutral-200" />}
          >
            <RegistrationsSearchAndFilter />
          </Suspense>

          {/* Table */}
          <Suspense fallback={<TableSkeleton columns={5} />}>
            <RegistrationList params={params} searchParams={searchParams} />
          </Suspense>
        </TabsContent>
        <TabsContent className="flex flex-col gap-4" value="participants">
          {/* Search and Filter*/}
          <Suspense
            fallback={<Skeleton className="h-32 rounded-xl bg-neutral-200" />}
          >
            <ParticipantsSearchAndFilter />
          </Suspense>

          {/* Table and export */}
          <Suspense fallback={<TableSkeleton columns={5} />}>
            <ParticipantList params={params} searchParams={searchParams} />
          </Suspense>
        </TabsContent>
      </RegistrationTabs>
    </main>
  );
}
