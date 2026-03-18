import { cookies } from "next/headers";
import { getEventById } from "@/server/events/queries/getEventById";
import { EvaluationSuccessContent } from "./_components/EvaluationSuccessContent";

interface EvaluationSuccessPageProps {
  searchParams: Promise<{ eventId?: string }>;
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
