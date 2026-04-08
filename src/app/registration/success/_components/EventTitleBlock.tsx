import { formatDate } from "date-fns";
import { CalendarDays } from "lucide-react";

interface EventTitleBlockProps {
  eventTitle: string;
  eventStartDate: Date;
}

export function EventTitleBlock({
  eventTitle,
  eventStartDate,
}: EventTitleBlockProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/[0.07] to-transparent p-5 ring-1 ring-primary/25 sm:p-6">
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative space-y-1.5">
        <p className="font-semibold text-primary text-xs uppercase tracking-widest">
          Registered Event
        </p>
        <p className="font-bold text-foreground text-xl leading-snug sm:text-2xl">
          {eventTitle}
        </p>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <CalendarDays className="size-3.5 text-primary" />
          {formatDate(eventStartDate, "EEEE, MMMM d, yyyy")}
        </div>
      </div>
    </div>
  );
}
