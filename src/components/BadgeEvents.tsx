import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/lib/events/eventUtils";

export function getStatusBadge(status: EventStatus) {
  switch (status) {
    case "ongoing":
      return (
        <Badge className="bg-green-500 text-white hover:bg-green-600">
          <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-white" />
          Happening Now
        </Badge>
      );
    case "upcoming":
      return (
        <Badge className="bg-primary text-primary-foreground">Upcoming</Badge>
      );
    case "past":
      return <Badge variant="secondary">Past Event</Badge>;
    default:
      return null;
  }
}
