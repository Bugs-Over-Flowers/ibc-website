import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import RegistrationForm from "@/app/registration/[eventId]/_components/forms/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import type { RegistrationRouteProps } from "@/lib/types/route";
import { getAllMembers } from "@/server/members/queries/getAllMembers";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import NotReadyEvent from "./_components/NotReadyEvent";
import RegistrationInformation from "./_components/RegistrationInfoHeader";

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

  // use a Promise.all to fetch event details and members concurrently
  // if an error occurs in either, it will be caught by the ./error.tsx boundary
  const [eventData, members] = await Promise.all([
    getRegistrationEventDetails(requestCookies, { eventId }),
    getAllMembers(requestCookies),
  ]);

  // Handle if event is draft
  if (eventData.eventType === null) {
    return <NotReadyEvent title={eventData.eventTitle} />;
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
