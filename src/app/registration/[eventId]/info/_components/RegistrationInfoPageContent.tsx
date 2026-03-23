import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationInformationPageProps } from "@/lib/types/route";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import NotReadyEvent from "../../_components/NotReadyEvent";
import RegistrationErrorComponent from "../../_components/RegistrationErrorComponent";
import { RegistrationInfoCta } from "./RegistrationInfoCta";
import { RegistrationInfoEventCard } from "./RegistrationInfoEventCard";
import { RegistrationInfoSteps } from "./RegistrationInfoSteps";
import { RegistrationInfoTopNav } from "./RegistrationInfoTopNav";

export async function RegistrationInfoPageContent({
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
    <>
      <RegistrationInfoTopNav eventId={eventId} />

      <div className="mx-auto max-w-5xl space-y-8 px-6 pt-8">
        <RegistrationInfoEventCard
          description={data.description}
          eventEndDate={data.eventEndDate}
          eventStartDate={data.eventStartDate}
          fee={data.registrationFee}
          headerUrl={data.eventHeaderUrl}
          title={data.eventTitle ?? "Event Header"}
        />
        <RegistrationInfoSteps />
        <RegistrationInfoCta eventId={eventId} />
      </div>
    </>
  );
}
