import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import type { RegistrationRouteProps } from "@/lib/types/route";
import { stripRichText } from "@/lib/utils/stripRichText";
import { getRegistrationEventDetails } from "@/server/registration/queries/getRegistrationEventDetails";
import { RegistrationPageContent } from "./_components/RegistrationPageContent";
import Loading from "./loading";

export async function generateMetadata({
  params,
}: RegistrationRouteProps): Promise<Metadata> {
  const { eventId } = await params;

  const event = await getRegistrationEventDetails((await cookies()).getAll(), {
    eventId,
  }).catch(() => null);

  if (!event) {
    return {
      title: "Event Registration",
      description: "Complete your registration for the event.",
    };
  }

  return {
    title: `Register - ${event.eventTitle}`,
    description: stripRichText(event.description).slice(0, 160),
  };
}

export default function Page({ params, searchParams }: RegistrationRouteProps) {
  return (
    <main className="min-h-screen w-full bg-linear-to-b from-background via-background to-muted/30 pb-20">
      <Suspense fallback={<Loading />}>
        <RegistrationPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
