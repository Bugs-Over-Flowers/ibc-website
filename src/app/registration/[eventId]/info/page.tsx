import { cookies } from "next/headers";
import { RegistrationInfoCta } from "@/app/registration/[eventId]/info/_components/RegistrationInfoCta";
import { RegistrationInfoEventCard } from "@/app/registration/[eventId]/info/_components/RegistrationInfoEventCard";
import { RegistrationInfoSteps } from "@/app/registration/[eventId]/info/_components/RegistrationInfoSteps";
import { RegistrationInfoTopNav } from "@/app/registration/[eventId]/info/_components/RegistrationInfoTopNav";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationInformationPageProps } from "@/lib/types/route";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import NotReadyEvent from "../_components/NotReadyEvent";
import RegistrationErrorComponent from "../_components/RegistrationErrorComponent";

export default async function InfoPageWrapper({
  params,
}: RegistrationInformationPageProps) {
  const { eventId } = await params;
  const requestCookies = (await cookies()).getAll();

  const {
    error: registrationEventDetailsMessage,
    data,
    success,
  } = await tryCatch(getRegistrationEventDetails(requestCookies, { eventId }));

  if (!success) {
    return (
      <RegistrationErrorComponent message={registrationEventDetailsMessage} />
    );
  }

  if (data.eventType === null) {
    return (
      <NotReadyEvent title={data.eventTitle ?? "Registration unavailable"} />
    );
  }

  if (!data.eventStartDate || !data.eventEndDate) {
    return <div>Error loading event.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <RegistrationInfoTopNav eventId={eventId} />

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <RegistrationInfoEventCard
          description={data.description}
          eventEndDate={data.eventEndDate}
          eventStartDate={data.eventStartDate}
          headerUrl={data.eventHeaderUrl}
          title={data.eventTitle ?? "Event Header"}
        />
        <RegistrationInfoSteps />
        <RegistrationInfoCta eventId={eventId} />
      </div>
    </div>
  );
}
