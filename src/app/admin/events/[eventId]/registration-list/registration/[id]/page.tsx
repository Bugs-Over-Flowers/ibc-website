import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import tryCatch from "@/lib/server/tryCatch";
import { getRegistrationData } from "@/server/registration/queries/getRegistrationData";
import RegistrationDetails from "./_components/RegistrationDetails";

export const metadata: Metadata = {
  title: "Registration Details | Admin",
  description: "View individual registration and participant information.",
};

type RegistrationPageParams =
  PageProps<"/admin/events/[eventId]/registration-list/registration/[id]">["params"];
export default function RegistrationDetailsPageWrapper({
  params,
}: {
  params: RegistrationPageParams;
}) {
  return (
    <Suspense>
      <RegistrationDetailsPage params={params} />
    </Suspense>
  );
}

async function RegistrationDetailsPage({
  params,
}: {
  params: RegistrationPageParams;
}) {
  const { id } = await params;
  const cookieStore = await cookies();

  const {
    data: registration,
    success,
    error,
  } = await tryCatch(
    getRegistrationData(cookieStore.getAll(), {
      registrationId: id,
    }),
  );

  if (!success) {
    return <div>{error}</div>;
  }
  if (registration.event.eventType === null) {
    return (
      <div>This event is still not available. Please come back later.</div>
    );
  }

  return (
    <div className="space-y-6">
      <RegistrationDetails data={registration} />
    </div>
  );
}
