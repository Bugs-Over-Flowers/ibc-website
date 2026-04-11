import { Suspense } from "react";
import BackButton from "@/app/admin/events/[eventId]/_components/BackButton";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import type { RegistrationListPageProps } from "@/lib/types/route";
import { StatsSkeleton, TableSkeleton } from "./_components/page-skeletons";
import ParticipantList from "./_components/participants/ParticipantList";
import ParticipantsSearchAndFilter from "./_components/participants/ParticipantsSearchAndFilter";
import RegistrationListStats from "./_components/RegistrationListStats";
import RegistrationTabs from "./_components/RegistrationsTabs";
import RegistrationList from "./_components/registrations/RegistrationList";
import RegistrationsSearchAndFilter from "./_components/registrations/RegistrationsSearchAndFilter";

export default function RegistrationPageWrapper({
  params,
  searchParams,
}: RegistrationListPageProps) {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <div className="size-3.5 animate-spin rounded-full border-2 border-border border-t-muted-foreground" />
            Loading registration data...
          </div>
        }
      >
        <BackButtonWrapper params={params} />
      </Suspense>

      <div>
        <h1 className="font-semibold text-2xl text-foreground">
          Registration list
        </h1>
        <p className="max-w-5xl text-muted-foreground text-sm">
          Review registrations and participants for this event.
        </p>
      </div>

      <RegistrationTabs>
        <div className="mt-4">
          <Suspense fallback={<StatsSkeleton />}>
            <RegistrationListStats params={params} />
          </Suspense>
        </div>

        <TabsContent className="mt-4 flex flex-col gap-4" value="registrations">
          <Suspense
            fallback={<Skeleton className="h-32 rounded-xl bg-neutral-200" />}
          >
            <RegistrationsSearchAndFilter />
          </Suspense>

          <Suspense fallback={<TableSkeleton columns={5} />}>
            <RegistrationList params={params} searchParams={searchParams} />
          </Suspense>
        </TabsContent>

        <TabsContent className="mt-4 flex flex-col gap-4" value="participants">
          <Suspense
            fallback={<Skeleton className="h-32 rounded-xl bg-neutral-200" />}
          >
            <ParticipantsSearchAndFilter />
          </Suspense>

          <Suspense fallback={<TableSkeleton columns={5} />}>
            <ParticipantList params={params} searchParams={searchParams} />
          </Suspense>
        </TabsContent>
      </RegistrationTabs>
    </div>
  );
}

async function BackButtonWrapper({
  params,
}: {
  params: RegistrationListPageProps["params"];
}) {
  const { eventId } = await params;
  return <BackButton eventId={eventId} />;
}
