import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getEventById } from "@/server/events/queries/getEventById";
import { EvaluationSuccessContent } from "./_components/EvaluationSuccessContent";

interface EvaluationSuccessPageProps {
  searchParams: Promise<{ eventId?: string }>;
}

export async function generateMetadata({
  searchParams,
}: EvaluationSuccessPageProps): Promise<Metadata> {
  const { eventId } = await searchParams;

  if (!eventId) {
    return {
      title: "Evaluation Submitted",
      description: "Thank you for sharing your feedback.",
    };
  }

  const event = await getEventById((await cookies()).getAll(), {
    id: eventId,
  }).catch(() => null);

  if (!event) {
    return {
      title: "Evaluation Submitted",
      description: "Thank you for sharing your feedback.",
    };
  }

  return {
    title: `Thank You - ${event.eventTitle} Evaluation`,
    description: `Your feedback on ${event.eventTitle} has been submitted. Thank you for helping us improve!`,
  };
}

export default async function EvaluationSuccessPage({
  searchParams,
}: EvaluationSuccessPageProps) {
  const { eventId } = await searchParams;

  const event = eventId
    ? await getEventById((await cookies()).getAll(), { id: eventId })
    : null;

  return <EvaluationSuccessContent eventTitle={event?.eventTitle ?? null} />;
}
