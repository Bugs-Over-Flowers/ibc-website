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
import PrintNametagsLoading from "./_components/PrintNametagsLoading";

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
