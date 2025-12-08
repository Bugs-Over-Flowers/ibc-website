import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import RegistrationForm from "@/app/(public)/registration/[e]/_components/forms/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import tryCatch from "@/lib/server/tryCatch";
import { getAllMembers } from "@/server/members/queries";
import { getRegistrationEventDetails } from "@/server/registration/queries";
import RegistrationInformation from "./_components/RegistrationInformation";

type RegistrationRouteProps = PageProps<"/registration/[e]">;

export default function Page({ params }: RegistrationRouteProps) {
  return (
    <main className="p-5 h-screen w-full flex items-center justify-center">
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
  const [registrationEventDetailsMessage, eventData] = await tryCatch(
    getRegistrationEventDetails(requestCookies, { eventId: e }),
  );

  const [getAllMembersMessage, members] = await tryCatch(
    getAllMembers(requestCookies),
  );

  if (registrationEventDetailsMessage || getAllMembersMessage) {
    return (
      <div className="flex flex-col gap-3 text-center items-center justify-center">
        {registrationEventDetailsMessage}
        <Link href={"/events"}>
          <Button>Return to Events</Button>
        </Link>
      </div>
    );
  }

  if (eventData?.eventType === null) {
    return (
      <div className="flex flex-col gap-3 text-center items-center justify-center">
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

  if (!eventData || !members) {
    throw redirect("/");
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full h-full">
      <RegistrationInformation {...eventData} />
      <div className="flex flex-col gap-4 w-full h-full p-5">
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
