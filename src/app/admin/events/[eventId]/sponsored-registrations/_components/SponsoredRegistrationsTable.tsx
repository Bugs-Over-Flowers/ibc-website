import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { getSRbyEventId } from "@/server/sponsored-registrations/queries/getSRbyEventId";
import { SponsoredRegistrationsList } from "./SponsoredRegistrationsList";

type Event = Database["public"]["Tables"]["Event"]["Row"];
type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SponsoredRegistrationsTableProps {
  event: Event;
  eventId: string;
  onCopyLink?: (uuid: string) => void;
  onToggleStatus?: (id: string) => void;
  onDeleteClick?: (registration: SponsoredRegistration) => void;
}

export default async function SponsoredRegistrationsTable({
  event,
  eventId,
  onCopyLink = () => {},
  onToggleStatus = () => {},
  onDeleteClick = () => {},
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
    <div className="overflow-x-auto">
      <SponsoredRegistrationsList
        event={event}
        registrations={sponsoredRegistrations}
      />
    </div>
  );
}
