import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import BackButton from "@/app/admin/_components/BackButton";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import { SponsoredRegistrationsTableWrapper } from "./_components/SponsoredRegistrationsTableWrapper";
import SponsoredRegistrationsLoading from "./loading";

export const metadata: Metadata = {
  title: "Sponsored Registrations | Admin",
  description: "Manage sponsored registration links and guest usage.",
};

type SponsoredRegistrationsPageProps =
  PageProps<"/admin/events/[eventId]/sponsored-registrations">;

export default function SponsoredRegistrationsPage({
  params,
}: SponsoredRegistrationsPageProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<SponsoredRegistrationsLoading />}>
        <BackButtonWrapper params={params} />
        <EventHeader params={params} />
        <SponsoredRegistrationsTableWrapper params={params} />
      </Suspense>
    </div>
  );
}

async function EventHeader({
  params,
}: {
  params: SponsoredRegistrationsPageProps["params"];
}) {
  const { eventId } = await params;
  const cookieStore = await cookies();
  const requestCookies = cookieStore.getAll();

  const { data: event } = await tryCatch(
    getEventById(requestCookies, { id: eventId }),
  );

  return (
    <div>
      <div className="space-y-0">
        <h1 className="font-bold text-2xl text-foreground">
          {event?.eventTitle || "Sponsored Registrations"}
        </h1>
      </div>
      <p className="max-w-5xl text-muted-foreground text-sm">
        Manage sponsored registration links and track sponsored guest usage
      </p>
    </div>
  );
}

async function BackButtonWrapper({
  params,
}: {
  params: SponsoredRegistrationsPageProps["params"];
}) {
  const { eventId } = await params;
  return <BackButton eventId={eventId} />;
}
