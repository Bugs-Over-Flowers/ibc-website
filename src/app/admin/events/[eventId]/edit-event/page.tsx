import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import tryCatch from "@/lib/server/tryCatch";
import { getEventById } from "@/server/events/queries/getEventById";
import { EditEventForm } from "./_components/EditEventForm";

interface EditEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = await params;
  const cookieStore = await cookies();
  const requestCookies = cookieStore.getAll();

  const { data: event, error } = await tryCatch(
    getEventById(requestCookies, { id: eventId }),
  );

  if (error || !event) {
    notFound();
  }

  return <EditEventForm event={event} />;
}
