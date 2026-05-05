import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import type { RegistrationInformationPageProps } from "@/lib/types/route";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import { RegistrationInfoPageContent } from "./_components/RegistrationInfoPageContent";
import Loading from "./loading";

export async function generateMetadata({
  params,
}: RegistrationInformationPageProps): Promise<Metadata> {
  const { eventId } = await params;

  const event = await getRegistrationEventDetails((await cookies()).getAll(), {
    eventId,
  }).catch(() => null);

  if (!event) {
    return {
      title: "Registration Information",
      description: "Review and confirm your event registration details.",
    };
  }

  return {
    title: `Registration Details - ${event.eventTitle}`,
    description: `Review your registration for ${event.eventTitle}. Confirm your details and complete your registration.`,
  };
}

export default function InfoPageWrapper({
  params,
  searchParams,
}: RegistrationInformationPageProps) {
  return (
    <main className="min-h-screen w-full bg-background pb-20">
      <Suspense fallback={<Loading />}>
        <RegistrationInfoPageContent
          params={params}
          searchParams={searchParams}
        />
      </Suspense>
    </main>
  );
}
