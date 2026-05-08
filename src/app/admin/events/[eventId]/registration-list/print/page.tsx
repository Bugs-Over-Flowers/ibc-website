import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Suspense } from "react";
import BackNavigation from "@/app/admin/_components/BackNavigation";
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
  const headersList = await headers();
  const referer = headersList.get("referer");
  const previousPath = referer
    ? new URL(referer).pathname.replace(/\/+$/, "")
    : "";
  const showBack = previousPath !== "/admin/events";

  const [eventDetails, participants] = await Promise.all([
    tryCatch(getEventById(cookieStore.getAll(), { id: eventId })),
    tryCatch(getEventParticipantsForPrint(cookieStore.getAll(), { eventId })),
  ]);

  return (
    <div className="space-y-6">
      <BackNavigation showBack={showBack} />

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
