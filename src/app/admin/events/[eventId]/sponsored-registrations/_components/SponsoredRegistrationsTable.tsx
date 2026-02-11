import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { getSRbyEventId } from "@/server/sponsored-registrations/queries/getSRbyEventId";
import { SponsoredRegistrationsFilterWrapper } from "./SponsoredRegistrationsFilterWrapper";

type Event = Database["public"]["Tables"]["Event"]["Row"];

interface SponsoredRegistrationsTableProps {
  event: Event;
  eventId: string;
}

export default async function SponsoredRegistrationsTable({
  event,
  eventId,
}: SponsoredRegistrationsTableProps) {
  const { data: sponsoredRegistrations, error } = await tryCatch(
    getSRbyEventId(eventId),
  );

  if (error) {
    return (
      <div className="overflow-x-auto rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <p className="text-destructive">
          Error loading sponsored registrations: {String(error)}
        </p>
      </div>
    );
  }

  if (!sponsoredRegistrations || sponsoredRegistrations.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-muted bg-muted/20 p-8 text-center">
        <p className="text-muted-foreground">
          No sponsored registrations found for this event.
        </p>
      </div>
    );
  }

  return (
    <SponsoredRegistrationsFilterWrapper
      event={event}
      registrations={sponsoredRegistrations}
    />
  );
}
