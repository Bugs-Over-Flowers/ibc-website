import { cookies } from "next/headers";
import tryCatch from "@/lib/server/tryCatch";
import { getEvaluationsByEventId } from "@/server/evaluation/queries/getAllEvaluations";
import { getEventById } from "@/server/events/queries/getEventById";
import EventEvaluationsTable from "./EventEvaluationsTable";

type EventEvaluationsPageProps =
  PageProps<"/admin/events/[eventId]/evaluations">;

export async function EventEvaluationsTableWrapper({
  params,
}: {
  params: EventEvaluationsPageProps["params"];
}) {
  const { eventId } = await params;
  const requestCookies = (await cookies()).getAll();

  const [{ data: event }, { data: evaluations, error }] = await Promise.all([
    tryCatch(getEventById(requestCookies, { id: eventId })),
    tryCatch(getEvaluationsByEventId(requestCookies, eventId)),
  ]);

  if (!event) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-destructive">
        Event not found.
      </div>
    );
  }

  if (error || !evaluations) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-destructive">
        Failed to load evaluation submissions. Please try again later.
      </div>
    );
  }

  return (
    <EventEvaluationsTable
      evaluations={evaluations}
      eventId={eventId}
      eventTitle={event.eventTitle}
    />
  );
}
