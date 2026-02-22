import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import RegistrationForm from "@/app/registration/[eventId]/_components/forms/RegistrationForm";
import NotReadyEvent from "@/app/registration/[eventId]/_components/NotReadyEvent";
import RegistrationInformation from "@/app/registration/[eventId]/_components/RegistrationInfoHeader";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { RegistrationRouteProps } from "@/lib/types/route";
import { getAllMembers } from "@/server/members/queries/getAllMembers";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import { getSponsoredRegistrationByUuid } from "@/server/sponsored-registrations/queries/getSponsoredRegistrationByUuid";
import SponsoredRegistrationDisabled from "./_components/SponsoredRegistrationDisabled";

interface SponsoredRegisterPageProps extends RegistrationRouteProps {
  searchParams: Promise<{ sr?: string }>;
}

export default function Page({
  params,
  searchParams,
}: SponsoredRegisterPageProps) {
  return (
    <main className="flex min-h-screen w-full items-start justify-center px-5 py-8">
      <Suspense fallback={<Spinner />}>
        <SponsoredRegisterPageContent
          params={params}
          searchParams={searchParams}
        />
      </Suspense>
    </main>
  );
}

interface SponsoredRegisterPageContentProps {
  params: RegistrationRouteProps["params"];
  searchParams: Promise<{ sr?: string }>;
}

async function SponsoredRegisterPageContent({
  params,
  searchParams,
}: SponsoredRegisterPageContentProps) {
  const { eventId } = await params;
  const { sr: sponsorUuid } = await searchParams;
  const requestCookies = (await cookies()).getAll();

  const [eventData, members] = await Promise.all([
    getRegistrationEventDetails(requestCookies, { eventId }),
    getAllMembers(requestCookies),
  ]);

  if (eventData.eventType === null) {
    return <NotReadyEvent title={eventData.eventTitle} />;
  }

  if (!sponsorUuid) {
    return <SponsoredRegistrationDisabled />;
  }

  const sponsoredRegistration =
    await getSponsoredRegistrationByUuid(sponsorUuid);

  if (
    !sponsoredRegistration ||
    sponsoredRegistration.eventId !== eventId ||
    sponsoredRegistration.status !== "active"
  ) {
    return <SponsoredRegistrationDisabled />;
  }

  const spotsRemaining =
    (sponsoredRegistration.maxSponsoredGuests ?? 0) -
    sponsoredRegistration.usedCount;

  if (spotsRemaining <= 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-bold text-2xl">No Spots Available</h1>
        <p className="text-muted-foreground">
          This sponsorship has reached its maximum number of guests.
        </p>
        <Link href={`/events/${eventId}`}>
          <Button variant="outline">Back to Event</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-16 flex w-full max-w-7xl flex-col gap-4 md:flex-row">
      <RegistrationInformation {...eventData} />
      <div className="flex w-full flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/events/${eventId}`}>
            <Button size="icon" variant="ghost">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-muted-foreground text-sm">
            Sponsored Registration for {sponsoredRegistration.sponsoredBy}
          </span>
        </div>
        <RegistrationForm
          members={members}
          sponsoredRegistrationId={
            sponsoredRegistration.sponsoredRegistrationId
          }
          sponsorFeeDeduction={sponsoredRegistration.feeDeduction}
          sponsorUuid={sponsorUuid}
        />
      </div>
    </div>
  );
}
