import { cookies } from "next/headers";
import { Suspense } from "react";
import RegistrationForm from "@/app/registration/[eventId]/_components/forms/RegistrationForm";
import { Header } from "@/components/navbar/Header";
import { Spinner } from "@/components/ui/spinner";
import type { RegistrationRouteProps } from "@/lib/types/route";
import { getAllMembers } from "@/server/members/queries/getAllMembers";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import NotReadyEvent from "./_components/NotReadyEvent";
import RegistrationInformation from "./_components/RegistrationInfoHeader";

export default function Page({ params }: RegistrationRouteProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-5">
      <Header />
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
    <div className="mx-auto mt-20 flex h-full w-full max-w-6xl flex-col gap-6 md:flex-row">
      <RegistrationInformation {...eventData} />
      <div className="flex h-full flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-2"></div>
        <RegistrationForm members={members} />
      </div>
    </div>
  );
}
