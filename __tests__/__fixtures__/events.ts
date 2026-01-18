import type { Database } from "@/lib/supabase/db.types";

type Event = Database["public"]["Tables"]["Event"]["Row"];

export const mockEvent: Event = {
  eventId: "event-001",
  eventTitle: "Sample Event",
  description: "This is a sample event for testing purposes.",
  venue: "Sample Venue",
  eventHeaderUrl: null,
  eventStartDate: "2024-12-01T10:00:00Z",
  eventEndDate: "2024-12-01T18:00:00Z",
  eventType: "public",
  registrationFee: 100,
  publishedAt: "2024-11-01T09:00:00Z",
  updatedAt: "2024-11-15T12:00:00Z",
};
