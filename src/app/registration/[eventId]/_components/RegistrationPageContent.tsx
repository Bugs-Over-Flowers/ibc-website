import { format } from "date-fns";
import { Building2, Calendar, ChevronLeft, Tag } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import type { RegistrationRouteProps } from "@/lib/types/route";
import { getAllMembers } from "@/server/members/queries/getAllMembers";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import { getSponsoredRegistrationByUuid } from "@/server/sponsored-registrations/queries/getSponsoredRegistrationByUuid";
import RegistrationForm from "./forms/RegistrationForm";
import NotReadyEvent from "./NotReadyEvent";
import Stepper from "./Stepper";

interface RegistrationPageContentProps {
  params: RegistrationRouteProps["params"];
  searchParams: RegistrationRouteProps["searchParams"];
}

const sponsorUuidSchema = z.string().uuid();

export async function RegistrationPageContent({
  params,
  searchParams,
}: RegistrationPageContentProps) {
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

  let sponsorInfo: {
    sponsorUuid: string;
    sponsoredRegistrationId: string;
    feeDeduction: number;
    sponsoredBy: string;
  } | null = null;

  if (sponsorUuid) {
    const isSponsorUuidValid = sponsorUuidSchema.safeParse(sponsorUuid).success;

    if (isSponsorUuidValid) {
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

  if (eventData.eventType === null) {
    return <NotReadyEvent title={eventData.eventTitle} />;
  }

  const eventDate = format(
    new Date(eventData.eventStartDate || Date.now()),
    "EEEE, MMMM d, yyyy",
  );

  return (
    <div>
      <div className="bg-primary px-4 pt-8 pb-24 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link href={`/events/${eventId}`}>
              <Button className="text-primary-foreground" variant="ghost">
                <ChevronLeft className="h-4 w-4" />
                Back to Event
              </Button>
            </Link>
            <span className="rounded-full bg-primary-foreground/20 px-3 py-2 font-medium text-sm backdrop-blur-sm">
              {sponsorInfo
                ? `Sponsored by ${sponsorInfo.sponsoredBy}`
                : "Standard Registration"}
            </span>
          </div>

          <div className="mb-4 inline-flex items-center rounded-full bg-primary-foreground/20 px-3 py-1 font-medium text-sm backdrop-blur-sm">
            <Tag className="mr-2 h-4 w-4" />
            {eventData.eventType}
          </div>

          <h1 className="mb-4 font-extrabold text-4xl text-primary-foreground tracking-tight md:text-5xl">
            {eventData.eventTitle}
          </h1>

          <div className="flex flex-wrap gap-6 font-medium text-primary-foreground/90">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 opacity-80" />
              {eventDate}
            </div>
            <div className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 opacity-80" />
              Base Fee: Php {eventData.registrationFee.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/50 bg-background p-6 pb-3 shadow-xl md:p-8 md:pb-4">
          <Stepper />
          <div className="mt-8">
            <RegistrationForm
              initialEventDetails={eventData}
              members={members}
              sponsoredRegistrationId={sponsorInfo?.sponsoredRegistrationId}
              sponsorFeeDeduction={sponsorInfo?.feeDeduction}
              sponsorName={sponsorInfo?.sponsoredBy}
              sponsorUuid={sponsorInfo?.sponsorUuid}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
