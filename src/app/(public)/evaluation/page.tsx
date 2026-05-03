import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { getEventById } from "@/server/events/queries/getEventById";
import { EvaluationForm } from "./_components/EvaluationForm";
import { Header } from "./_components/Header";
import EvaluationLoading from "./loading";

interface EvaluationPageProps {
  searchParams: Promise<{ eventId?: string }>;
}

export async function generateMetadata({
  searchParams,
}: EvaluationPageProps): Promise<Metadata> {
  const { eventId } = await searchParams;

  if (!eventId) {
    return {
      title: "Event Evaluation",
      description: "Provide feedback on your event experience.",
    };
  }

  const event = await getEventById((await cookies()).getAll(), {
    id: eventId,
  }).catch(() => null);

  if (!event) {
    return {
      title: "Event Evaluation",
      description: "Provide feedback on your event experience.",
    };
  }

  return {
    title: `${event.eventTitle} - Evaluation`,
    description: `Share your feedback on ${event.eventTitle}. Your input helps us improve future events.`,
  };
}

export default async function EvaluationPage({
  searchParams,
}: EvaluationPageProps) {
  const { eventId } = await searchParams;

  if (!eventId) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="bg-background py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p>Event ID is required.</p>
          </div>
        </section>
      </main>
    );
  }

  const event = await getEventById((await cookies()).getAll(), { id: eventId });

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<EvaluationLoading />}>
        <Header />
        <section className="bg-background py-8 sm:py-12 lg:py-16">
          <div className="mx-auto w-full max-w-7xl">
            <EvaluationForm eventData={event} eventId={eventId} />
          </div>
        </section>
      </Suspense>
    </main>
  );
}
