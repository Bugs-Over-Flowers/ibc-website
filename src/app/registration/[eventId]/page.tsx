import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import RegistrationForm from "@/app/registration/[eventId]/_components/forms/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import tryCatch from "@/lib/server/tryCatch";
import type { RegistrationRouteProps } from "@/lib/types/route";
import { getAllMembers } from "@/server/members/queries/getAllMembers";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import RegistrationInformation from "./_components/RegistrationInformation";

export default function Page({ params }: RegistrationRouteProps) {
  return (
    <main className="flex h-screen w-full items-center justify-center p-5">
      <Suspense fallback={<Spinner />}>
        <RegistrationPage params={params} />
      </Suspense>
    </main>
  );
}

interface RegistrationPageProps {
  params: RegistrationRouteProps["params"];
}

async function RegistrationPage({ params }: RegistrationPageProps) {
  const { eventId } = await params;
  const requestCookies = (await cookies()).getAll();
  const {
    error: registrationEventDetailsMessage,
    data: eventData,
    success: registrationEventDetailsSuccess,
  } = await tryCatch(getRegistrationEventDetails(requestCookies, { eventId }));

  const { data: members, success: getAllMembersSuccess } = await tryCatch(
    getAllMembers(requestCookies),
  );

  // Handle fetch errors
  //TODO: Improve error handling UI
  if (!registrationEventDetailsSuccess || !getAllMembersSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        {registrationEventDetailsMessage}
        <Link href={"/events"}>
          <Button>Return to Events</Button>
        </Link>
      </div>
    );
  }

  // Handle if event is draft
  //TODO: Transfer component to an empty component state later
  if (eventData.eventType === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <p>
          Event is still not yet available for registration. Please come back
          later.
        </p>
        <Link href={"/events"}>
          <Button>Return to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 md:flex-row">
      <RegistrationInformation {...eventData} />
      <div className="flex h-full w-full flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-2">
          <Link href={"/events"}>
            <Button variant={"ghost"}>
              <ChevronLeft />
              Back to Event
            </Button>
          </Link>

          <Link href={`/registration/${eventId}/info`}>
            <Button variant={"outline"}>Back to Info</Button>
          </Link>
        </div>

        <RegistrationForm members={members} />
      </div>
    </div>
  );
}
