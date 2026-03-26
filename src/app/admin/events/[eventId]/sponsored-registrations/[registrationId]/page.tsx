import { cookies } from "next/headers";
import { Suspense } from "react";
import { getEventStatus } from "@/lib/events/eventUtils";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import { getRegistrationsBySponsoredId } from "@/server/sponsored-registrations/queries/getRegistrationsBySponsoredId";
import { getSponsoredRegistrationById } from "@/server/sponsored-registrations/queries/getSponsoredRegistrationById";
import { DetailBackButton } from "./_components/DetailBackButton";
import { RegisteredGuestsTable } from "./_components/RegisteredGuestsTable";
import { SlotUtilizationCard } from "./_components/SlotUtilizationCard";
import { SponsoredLinkCard } from "./_components/SponsoredLinkCard";
import { SponsoredRegistrationActions } from "./_components/SponsoredRegistrationActions";
import { SponsoredRegistrationHeader } from "./_components/SponsoredRegistrationHeader";
import SponsoredRegistrationDetailLoading from "./loading";

type SponsoredRegistrationDetailProps =
  PageProps<"/admin/events/[eventId]/sponsored-registrations/[registrationId]">;

export default function SponsoredRegistrationDetailPage({
  params,
}: SponsoredRegistrationDetailProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<SponsoredRegistrationDetailLoading />}>
        <DetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function DetailContent({
  params,
}: {
  params: SponsoredRegistrationDetailProps["params"];
}) {
  const { eventId, registrationId } = await params;
  const cookieStore = await cookies();
  const requestCookies = cookieStore.getAll();

  console.log("Loading sponsored registration detail:", {
    eventId,
    registrationId,
  });

  const [eventResult, srResult, registrationsResult] = await Promise.all([
    tryCatch(getEventById(requestCookies, { id: eventId })),
    tryCatch(getSponsoredRegistrationById(requestCookies, registrationId)),
    tryCatch(getRegistrationsBySponsoredId(requestCookies, registrationId)),
  ]);

  console.log("Results:", {
    eventSuccess: eventResult.success,
    srSuccess: srResult.success,
    registrationsSuccess: registrationsResult.success,
  });

  const event = eventResult.success ? eventResult.data : null;
  const sponsoredRegistration = srResult.success ? srResult.data : null;
  const registrations = registrationsResult.success
    ? registrationsResult.data
    : [];

  // Handle errors
  if (!eventResult.success) {
    console.error("Event error:", eventResult.error);
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
        <p className="font-semibold text-destructive">Error loading event</p>
        <p className="mt-2 text-muted-foreground text-sm">
          {String(eventResult.error)}
        </p>
        <p className="mt-2 text-muted-foreground text-xs">
          Event ID: {eventId}
        </p>
      </div>
    );
  }

  if (!srResult.success) {
    console.error("Sponsored registration error:", srResult.error);
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
        <p className="font-semibold text-destructive">
          Error loading sponsored registration
        </p>
        <p className="mt-2 text-muted-foreground text-sm">
          {String(srResult.error)}
        </p>
        <p className="mt-2 text-muted-foreground text-xs">
          Registration ID: {registrationId}
        </p>
      </div>
    );
  }

  if (!event || !sponsoredRegistration) {
    console.log("Missing data:", {
      event: !!event,
      sponsoredRegistration: !!sponsoredRegistration,
    });
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">
          Sponsored registration not found
        </p>
        <p className="mt-2 text-muted-foreground text-xs">
          Event ID: {eventId} | Registration ID: {registrationId}
        </p>
        <p className="mt-1 text-muted-foreground text-xs">
          Event: {event ? "Found" : "Not found"} | Registration:{" "}
          {sponsoredRegistration ? "Found" : "Not found"}
        </p>
      </div>
    );
  }

  if (!registrationsResult.success) {
    console.error("Error loading registrations:", registrationsResult.error);
  }

  const maxSponsoredGuests = sponsoredRegistration.maxSponsoredGuests ?? 0;
  const isSlotsFull =
    sponsoredRegistration.status === "full" ||
    (maxSponsoredGuests > 0 &&
      sponsoredRegistration.usedCount >= maxSponsoredGuests);
  const isPastEvent =
    getEventStatus(event.eventStartDate, event.eventEndDate) === "past";

  const sponsoredLinkDisabledReason: "past-event" | "maxed-slots" | null =
    isPastEvent ? "past-event" : isSlotsFull ? "maxed-slots" : null;

  return (
    <>
      <DetailBackButton />

      <SponsoredRegistrationHeader
        eventId={eventId}
        eventTitle={event.eventTitle}
        sponsoredRegistration={sponsoredRegistration}
      />

      <SponsoredLinkCard
        disabledReason={sponsoredLinkDisabledReason}
        eventId={eventId}
        uuid={sponsoredRegistration.uuid}
      />

      <SlotUtilizationCard
        registrationCount={registrations.length}
        sponsoredRegistration={sponsoredRegistration}
      />

      <SponsoredRegistrationActions
        eventId={eventId}
        sponsoredRegistration={sponsoredRegistration}
      />

      <div>
        <h2 className="mb-4 font-bold text-foreground text-xl">
          Registered Guests
        </h2>
        <RegisteredGuestsTable
          error={registrationsResult.success ? null : registrationsResult.error}
          registrations={registrations}
        />
      </div>
    </>
  );
}
