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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
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
  const event = await getEventById(cookieStore.getAll(), { id: eventId }).catch(
    () => null,
  );

  return (
    <main className="min-h-screen bg-background">
      <Header event={event} />
      <section className="bg-background py-12">
        <div className="mx-auto max-w-2xl px-4">
          <EvaluationForm eventId={eventId} />
        </div>
      </section>
    </main>
  );
}
