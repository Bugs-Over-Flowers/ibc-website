import { Suspense } from "react";
import BackButton from "@/app/admin/_components/BackButton";
import { TabsContent } from "@/components/ui/tabs";
import type { RegistrationListPageProps } from "@/lib/types/route";
import ParticipantList from "./_components/participants/ParticipantList";
import ParticipantsSearchAndFilter from "./_components/participants/ParticipantsSearchAndFilter";
import RegistrationListStats from "./_components/RegistrationListStats";
import RegistrationTabs from "./_components/RegistrationsTabs";
import RegistrationList from "./_components/registrations/RegistrationList";
import RegistrationsSearchAndFilter from "./_components/registrations/RegistrationsSearchAndFilter";
import RegistrationListPageLoading, {
  RegistrationFiltersSkeleton,
  RegistrationStatsSkeleton,
  RegistrationTableSkeleton,
} from "./loading";

export default function RegistrationPageWrapper({
  params,
  searchParams,
}: RegistrationListPageProps) {
  return (
    <Suspense fallback={<RegistrationListPageLoading />}>
      <div className="space-y-6">
        <BackButtonWrapper params={params} />

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-3xl text-foreground">
              Registration List
            </h1>
            <p className="mt-2 text-muted-foreground">
              Review registrations and participants for this event
            </p>
          </div>
        </div>

        <RegistrationTabs>
          <div className="mt-4">
            <Suspense fallback={<RegistrationStatsSkeleton />}>
              <RegistrationListStats params={params} />
            </Suspense>
          </div>

          <TabsContent
            className="mt-4 flex flex-col gap-4"
            value="registrations"
          >
            <Suspense fallback={<RegistrationFiltersSkeleton />}>
              <RegistrationsSearchAndFilter />
            </Suspense>

            <Suspense
              fallback={<RegistrationTableSkeleton variant="registrations" />}
            >
              <RegistrationList params={params} searchParams={searchParams} />
            </Suspense>
          </TabsContent>

          <TabsContent
            className="mt-4 flex flex-col gap-4"
            value="participants"
          >
            <Suspense fallback={<RegistrationFiltersSkeleton />}>
              <ParticipantsSearchAndFilter />
            </Suspense>

            <Suspense
              fallback={<RegistrationTableSkeleton variant="participants" />}
            >
              <ParticipantList params={params} searchParams={searchParams} />
            </Suspense>
          </TabsContent>
        </RegistrationTabs>
      </div>
    </Suspense>
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
