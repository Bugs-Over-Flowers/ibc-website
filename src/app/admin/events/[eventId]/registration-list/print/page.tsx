import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import { getEventParticipantsForPrint } from "@/server/registration/queries/getEventParticipantsForPrint";
import NametagPrintPage from "./_components/NametagPrintPage";

interface PrintPageProps {
  params: Promise<{ eventId: string }>;
}

export const metadata: Metadata = {
  title: "Print Nametags | Admin",
  description: "Print participant nametags with QR codes for event check-in.",
};

export default function PrintNametagsPageWrapper({ params }: PrintPageProps) {
  return (
    <Suspense fallback={<PrintNametagsLoading />}>
      <PrintNametagsPage params={params} />
    </Suspense>
  );
}

function PrintNametagsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            className="aspect-3/4 animate-pulse rounded-xl bg-muted"
            key={n}
          />
        ))}
      </div>
    </div>
  );
}

async function PrintNametagsPage({ params }: PrintPageProps) {
  const { eventId } = await params;
  const cookieStore = await cookies();

  const [eventDetails, participants] = await Promise.all([
    tryCatch(getEventById(cookieStore.getAll(), { id: eventId })),
    tryCatch(getEventParticipantsForPrint(cookieStore.getAll(), { eventId })),
  ]);

  return (
    <div className="space-y-6">
      <Button
        nativeButton={false}
        render={
          <Link href={`/admin/events/${eventId}/registration-list`}>
            <ChevronLeft />
            Back
          </Link>
        }
        variant={"ghost"}
      />

      <div>
        <h1 className="font-bold text-3xl text-foreground">
          {eventDetails.success
            ? `Print Nametags — ${eventDetails.data.eventTitle}`
            : "Print Nametags"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Select participants and print their nametags with QR codes for
          check-in.
        </p>
      </div>

      <NametagPrintPage
        eventTitle={
          eventDetails.success ? eventDetails.data.eventTitle : "Event"
        }
        participants={participants.success ? participants.data : []}
      />
    </div>
  );
}
