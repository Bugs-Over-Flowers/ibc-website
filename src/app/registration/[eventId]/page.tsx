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
    <main className="flex h-screen w-full items-center justify-center p-5">
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
  console.log("[SponsoredDebug][RegistrationPage] Parsed search params", {
    eventId,
    rawSr: sr,
    normalizedSr: sponsorUuid,
    sponsorUuid,
  });
  const requestCookies = (await cookies()).getAll();

  // use a Promise.all to fetch event details and members concurrently
  // if an error occurs in either, it will be caught by the ./error.tsx boundary
  const [eventData, members] = await Promise.all([
    getRegistrationEventDetails(requestCookies, { eventId }),
    getAllMembers(requestCookies),
  ]);

  // Validate sponsored registration if UUID provided
  let sponsorInfo: {
    sponsorUuid: string;
    sponsoredRegistrationId: string;
    feeDeduction: number;
  } | null = null;

  if (sponsorUuid) {
    const isSponsorUuidValid = sponsorUuidSchema.safeParse(sponsorUuid).success;

    if (!isSponsorUuidValid) {
      console.log("[SponsoredDebug][RegistrationPage] Sponsor info rejected", {
        reason: {
          invalidUuidFormat: true,
          missing: false,
          inactive: false,
          eventMismatch: false,
        },
      });
    } else {
      const sponsoredRegistration =
        await getSponsoredRegistrationByUuid(sponsorUuid);

      console.log(
        "[SponsoredDebug][RegistrationPage] Fetched sponsored registration",
        {
          sponsorUuid,
          found: !!sponsoredRegistration,
          sponsoredRegistrationId:
            sponsoredRegistration?.sponsoredRegistrationId ?? null,
          sponsoredEventId: sponsoredRegistration?.eventId ?? null,
          status: sponsoredRegistration?.status ?? null,
          feeDeduction: sponsoredRegistration?.feeDeduction ?? null,
        },
      );

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
        };

        console.log(
          "[SponsoredDebug][RegistrationPage] Sponsor info accepted",
          sponsorInfo,
        );
      } else {
        const reason = !sponsoredRegistration
          ? {
              invalidUuidFormat: false,
              missing: true,
              inactive: false,
              eventMismatch: false,
            }
          : {
              invalidUuidFormat: false,
              missing: false,
              inactive: sponsoredRegistration.status !== "active",
              eventMismatch: sponsoredRegistration.eventId !== eventId,
            };

        console.log(
          "[SponsoredDebug][RegistrationPage] Sponsor info rejected",
          {
            reason,
          },
        );
      }
    }
  } else {
    console.log(
      "[SponsoredDebug][RegistrationPage] No sponsor UUID provided in query",
    );
  }

  // Handle if event is draft
  if (eventData.eventType === null) {
    return <NotReadyEvent title={eventData.eventTitle} />;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 md:flex-row">
      <RegistrationInformation {...eventData} />
      <div className="flex h-full w-full flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/events/${eventId}`}>
            <Button variant={"ghost"}>
              <ChevronLeft />
              Back to Event
            </Button>
          </Link>

          <Link href={`/registration/${eventId}/info`}>
            <Button variant={"outline"}>Back to Info</Button>
          </Link>
        </div>

        <RegistrationForm
          members={members}
          sponsoredRegistrationId={sponsorInfo?.sponsoredRegistrationId}
          sponsorFeeDeduction={sponsorInfo?.feeDeduction}
          sponsorUuid={sponsorInfo?.sponsorUuid}
        />
      </div>
    </div>
  );
}
