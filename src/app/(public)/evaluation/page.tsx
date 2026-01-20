import { cookies } from "next/headers";
import { getEventById } from "@/server/events/queries/getEventById";
import { EvaluationForm } from "./_components/EvaluationForm";
import { Header } from "./_components/Header";

interface EvaluationPageProps {
  searchParams: Promise<{ eventId?: string }>;
}

export default async function EvaluationPage({
  searchParams,
}: EvaluationPageProps) {
  const { eventId } = await searchParams;

  if (!eventId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <span className="font-bold text-2xl text-destructive">!</span>
          </div>
          <h1 className="font-bold text-2xl text-foreground">
            Invalid Event ID
          </h1>
          <p className="mt-2 text-muted-foreground">
            Please access this page from an event listing.
          </p>
        </div>
      </div>
    );
  }

  const cookieStore = await cookies();

  try {
    const event = await getEventById(cookieStore.getAll(), { id: eventId });
    if (!event) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <span className="font-bold text-2xl text-destructive">!</span>
            </div>
            <h1 className="font-bold text-2xl text-foreground">
              Event Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              We couldn&apos;t find the event you&apos;re trying to evaluate. It
              may have been removed or the link is incorrect.
            </p>
          </div>
        </div>
      );
    }
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="bg-background py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <EvaluationForm eventData={event} eventId={eventId} />
          </div>
        </section>
      </main>
    );
  } catch (_error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <span className="font-bold text-2xl text-destructive">!</span>
          </div>
          <h1 className="font-bold text-2xl text-foreground">
            Unable to Load Event Evaluation
          </h1>
          <p className="mt-2 text-muted-foreground">
            An error occurred while loading this event. Please try again later
            or contact the organizer for a new link.
          </p>
        </div>
      </div>
    );
  }
}
