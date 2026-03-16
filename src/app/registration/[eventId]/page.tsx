import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";
import RegistrationForm from "@/app/registration/[eventId]/_components/forms/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import type { RegistrationRouteProps } from "@/lib/types/route";
import { getAllMembers } from "@/server/members/queries/getAllMembers";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import { getSponsoredRegistrationByUuid } from "@/server/sponsored-registrations/queries/getSponsoredRegistrationByUuid";
import NotReadyEvent from "./_components/NotReadyEvent";
import RegistrationInformation from "./_components/RegistrationInfoHeader";

export default function Page({ params, searchParams }: RegistrationRouteProps) {
  return (
    <main className="flex min-h-screen w-full items-start justify-center px-5 py-8">
      <Suspense fallback={<Spinner />}>
        <RegistrationPage params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

interface RegistrationPageProps {
  params: RegistrationRouteProps["params"];
  searchParams: RegistrationRouteProps["searchParams"];
}

const sponsorUuidSchema = z.string().uuid();

async function RegistrationPage({
  params,
  searchParams,
}: RegistrationPageProps) {
  const { eventId } = await params;
  const { sr } = await searchParams;
  const sponsorUuidRaw =
    typeof sr === "string" ? sr : Array.isArray(sr) ? sr[0] : undefined;
  const sponsorUuid = sponsorUuidRaw?.trim() || undefined;
  const requestCookies = (await cookies()).getAll();

  const [eventData, members] = await Promise.all([
    getRegistrationEventDetails(requestCookies, { eventId }),
    getAllMembers(requestCookies),
  ]);

  // Validate sponsored registration if UUID provided
  let sponsorInfo: {
    sponsorUuid: string;
    sponsoredRegistrationId: string;
    feeDeduction: number;
    sponsoredBy: string;
  } | null = null;

  if (sponsorUuid) {
    const isSponsorUuidValid = sponsorUuidSchema.safeParse(sponsorUuid).success;

    if (!isSponsorUuidValid) {
    } else {
      const sponsoredRegistration =
        await getSponsoredRegistrationByUuid(sponsorUuid);

      if (
        sponsoredRegistration &&
        sponsoredRegistration.status === "active" &&
        sponsoredRegistration.eventId === eventId
      ) {
        sponsorInfo = {
          sponsorUuid,
          sponsoredRegistrationId:
            sponsoredRegistration.sponsoredRegistrationId,
          feeDeduction: Number(sponsoredRegistration.feeDeduction),
          sponsoredBy: sponsoredRegistration.sponsoredBy,
        };
      }
    }
  }

  // Handle if event is draft
  if (eventData.eventType === null) {
    return <NotReadyEvent title={eventData.eventTitle} />;
  }

  return (
    <div className="flex w-full max-w-7xl flex-col gap-4 md:flex-row">
      <RegistrationInformation {...eventData} />
      <div className="flex w-full flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/events/${eventId}`}>
            <Button size="icon" variant="ghost">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="text-muted-foreground text-sm">
            {sponsorInfo
              ? `Sponsored by ${sponsorInfo.sponsoredBy}`
              : "Standard Registration"}
          </span>
        </div>

        <RegistrationForm
          members={members}
          sponsoredRegistrationId={sponsorInfo?.sponsoredRegistrationId}
          sponsorFeeDeduction={sponsorInfo?.feeDeduction}
          sponsorName={sponsorInfo?.sponsoredBy}
          sponsorUuid={sponsorInfo?.sponsorUuid}
        />
      </div>
    </div>
  );
}
