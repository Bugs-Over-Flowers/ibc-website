import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Suspense } from "react";
import BackNavigation from "@/app/admin/_components/BackNavigation";
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
  const headersList = await headers();
  const referer = headersList.get("referer");
  const previousPath = referer
    ? new URL(referer).pathname.replace(/\/+$/, "")
    : "";
  const showBack = previousPath !== "/admin/events";

  const { data: event } = await tryCatch(
    getEventById(requestCookies, { id: eventId }),
  );

  return (
    <div className="space-y-6">
      <BackNavigation showBack={showBack} />
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
    </div>
  );
}
