import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/lib/events/eventUtils";

export function getStatusBadge(status: EventStatus | string) {
  switch (status) {
    case "ongoing":
      return (
        <Badge className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
          <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-white" />
          Happening Now
        </Badge>
      );
    case "upcoming":
      return (
        <Badge className="bg-primary text-primary-foreground dark:bg-primary/80">
          Upcoming
        </Badge>
      );
    case "past":
      return <Badge variant="secondary">Past Event</Badge>;
    case "draft":
      return (
        <Badge className="border border-border bg-muted text-muted-foreground dark:border-border/60 dark:bg-muted/60 dark:text-muted-foreground/80">
          Draft
        </Badge>
      );
    case "published":
      return (
        <Badge className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
          Published
        </Badge>
      );
    case "finished":
      return (
        <Badge className="bg-green-700 text-white hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-900">
          Finished
        </Badge>
      );
    default:
      return null;
  }
}
