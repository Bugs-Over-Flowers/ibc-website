import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import { TableSkeleton } from "../registration-list/_components/page-skeletons";
import SponsoredRegistrationsTable from "./_components/SponsoredRegistrationsTable";

type SponsoredRegistrationsPageProps =
  PageProps<"/admin/events/[eventId]/sponsored-registrations">;

export default function SponsoredRegistrationsPageWrapper({
  params,
}: SponsoredRegistrationsPageProps) {
  return (
    <main className="flex flex-col gap-4 p-5 md:p-10">
      <Link href={`/admin/events` as Route}>
        <Button size="sm" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </Link>

      <div className="space-y-4">
        <div>
          <h1 className="font-bold text-3xl">Sponsored Registrations</h1>
          <p className="text-muted-foreground">
            Manage sponsored registration links and track sponsored guest usage
          </p>
        </div>

        <Suspense fallback={<TableSkeleton columns={8} />}>
          <SponsoredRegistrationsTableWrapper params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function SponsoredRegistrationsTableWrapper({
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

  if (!event) {
    return <div>Event not found</div>;
  }

  return <SponsoredRegistrationsTable event={event} eventId={eventId} />;
}
