import { Printer } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import BackButton from "@/app/admin/_components/BackButton";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationListPageProps } from "@/lib/types/route";
import { getEventById } from "@/server/events/queries/getEventById";
import { getRegistrationListStats } from "@/server/registration/queries/getRegistrationListStats";
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

export const metadata: Metadata = {
  title: "Registration List | Admin",
  description: "View and manage event registrations and participants.",
};

export default function RegistrationPageWrapper({
  params,
  searchParams,
}: RegistrationListPageProps) {
  return (
    <Suspense fallback={<RegistrationListPageLoading />}>
      <RegistrationPage params={params} searchParams={searchParams} />
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

async function RegistrationPage({
  params,
  searchParams,
}: RegistrationListPageProps) {
  const { eventId } = await params;
  const cookieStore = await cookies();

  const [eventDetails, registrationStats] = await Promise.all([
    tryCatch(getEventById(cookieStore.getAll(), { id: eventId })),
    tryCatch(getRegistrationListStats(cookieStore.getAll(), { eventId })),
  ]);

  return (
    <div className="space-y-6">
      <BackButtonWrapper params={params} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-bold text-3xl text-foreground">
            {eventDetails.success
              ? `${eventDetails.data.eventTitle} Registration List`
              : "Registration List"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review registrations and participants for this event
          </p>
        </div>
        <Link href={`/admin/events/${eventId}/registration-list/print`}>
          <Button className="gap-2" variant="outline">
            <Printer className="size-4" />
            Print Nametags
          </Button>
        </Link>
      </div>

      <RegistrationTabs>
        <div className="mt-4">
          <Suspense fallback={<RegistrationStatsSkeleton />}>
            <RegistrationListStats statsResult={registrationStats} />
          </Suspense>
        </div>

        <TabsContent className="mt-4 flex flex-col gap-4" value="registrations">
          <Suspense fallback={<RegistrationFiltersSkeleton />}>
            <RegistrationsSearchAndFilter />
          </Suspense>

          <Suspense
            fallback={<RegistrationTableSkeleton variant="registrations" />}
          >
            <RegistrationList
              eventTitle={
                eventDetails.success ? eventDetails.data.eventTitle : "Event"
              }
              params={params}
              searchParams={searchParams}
            />
          </Suspense>
        </TabsContent>

        <TabsContent className="mt-4 flex flex-col gap-4" value="participants">
          <Suspense fallback={<RegistrationFiltersSkeleton />}>
            <ParticipantsSearchAndFilter />
          </Suspense>

          <Suspense
            fallback={<RegistrationTableSkeleton variant="participants" />}
          >
            <ParticipantList
              eventTitle={
                eventDetails.success ? eventDetails.data.eventTitle : "Event"
              }
              params={params}
              searchParams={searchParams}
            />
          </Suspense>
        </TabsContent>
      </RegistrationTabs>
    </div>
  );
}
