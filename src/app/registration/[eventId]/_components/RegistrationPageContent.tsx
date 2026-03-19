import { format } from "date-fns";
import {
  Building2,
  Calendar,
  ChevronLeft,
  Clock3,
  Tag,
  UsersRound,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventStatus } from "@/lib/events/eventUtils";
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
  let sponsoredLinkUnavailableReason: "past-event" | "maxed-slots" | null =
    null;
  let sponsoredLinkSponsorName: string | undefined;

  const eventStatus = getEventStatus(
    eventData.eventStartDate,
    eventData.eventEndDate,
  );
  const isPastEvent = eventStatus === "past";

  if (sponsorUuid) {
    const isSponsorUuidValid = sponsorUuidSchema.safeParse(sponsorUuid).success;

    if (isSponsorUuidValid) {
      const sponsoredRegistration =
        await getSponsoredRegistrationByUuid(sponsorUuid);

      if (sponsoredRegistration && sponsoredRegistration.eventId === eventId) {
        const maxSponsoredGuests =
          sponsoredRegistration.maxSponsoredGuests ?? 0;
        const isMaxedSlots =
          sponsoredRegistration.status === "full" ||
          (maxSponsoredGuests > 0 &&
            sponsoredRegistration.usedCount >= maxSponsoredGuests);

        sponsoredLinkSponsorName = sponsoredRegistration.sponsoredBy;

        if (isPastEvent) {
          sponsoredLinkUnavailableReason = "past-event";
        } else if (isMaxedSlots) {
          sponsoredLinkUnavailableReason = "maxed-slots";
        } else if (sponsoredRegistration.status === "active") {
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
  }

  if (eventData.eventType === null) {
    return <NotReadyEvent title={eventData.eventTitle} />;
  }

  const eventDate = format(
    new Date(eventData.eventStartDate || Date.now()),
    "EEEE, MMMM d, yyyy",
  );

  const hasUnavailableSponsoredLink =
    Boolean(sponsorUuid) && sponsoredLinkUnavailableReason !== null;
  const unavailableLinkTitle =
    sponsoredLinkUnavailableReason === "past-event"
      ? "This sponsored link has expired."
      : "This sponsored link has reached its limit.";
  const unavailableLinkDescription =
    sponsoredLinkUnavailableReason === "past-event"
      ? "The event is already over, so this sponsored registration link can no longer be used."
      : "All sponsored guest slots have already been used for this link.";

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
              {hasUnavailableSponsoredLink
                ? "Sponsored Link Unavailable"
                : sponsorInfo
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
          {hasUnavailableSponsoredLink ? (
            <Card className="border-none bg-transparent py-2 shadow-none ring-0">
              <CardHeader className="pb-2 font-semibold">
                <CardTitle className="flex items-center gap-2 text-xl">
                  {sponsoredLinkUnavailableReason === "past-event" ? (
                    <Clock3 className="h-5 w-5 text-destructive" />
                  ) : (
                    <UsersRound className="h-5 w-5 text-destructive" />
                  )}
                  {unavailableLinkTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                  {unavailableLinkDescription}
                </p>
                {sponsoredLinkSponsorName ? (
                  <p className="text-muted-foreground text-sm">
                    Sponsor:{" "}
                    <span className="font-semibold">
                      {sponsoredLinkSponsorName}
                    </span>
                  </p>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href={`/events/${eventId}`}>
                    <Button className="w-full sm:w-auto" variant="outline">
                      Back to Event
                    </Button>
                  </Link>
                  <Link href={`/registration/${eventId}`}>
                    <Button className="w-full sm:w-auto">
                      Continue with Standard Registration
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
