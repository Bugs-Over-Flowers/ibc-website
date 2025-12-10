import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import RegistrationForm from "@/app/(public)/registration/[e]/_components/forms/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import tryCatch from "@/lib/server/tryCatch";
import { getAllMembers } from "@/server/members/queries";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import RegistrationInformation from "./_components/RegistrationInformation";

type RegistrationRouteProps = PageProps<"/registration/[e]">;

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
  params: Promise<{ e: string }>;
}

async function RegistrationPage({ params }: RegistrationPageProps) {
  const { e } = await params;
  const requestCookies = (await cookies()).getAll();
  const {
    error: registrationEventDetailsMessage,
    data: eventData,
    success: registrationEventDetailsSuccess,
  } = await tryCatch(
    getRegistrationEventDetails(requestCookies, { eventId: e }),
  );

  const { data: members, success: getAllMembersSuccess } = await tryCatch(
    getAllMembers(requestCookies),
  );

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
        <Link href={"/events"}>
          <Button variant={"ghost"}>
            <ChevronLeft />
            Back to Event
          </Button>
        </Link>
        <RegistrationForm members={members} />
      </div>
    </div>
  );
}
