import { format } from "date-fns";
import { CalendarDays, DollarSign, Tag } from "lucide-react";
import type { CreateSREventOption } from "./types";

interface CreateSREventPreviewProps {
  event: CreateSREventOption;
}

export function CreateSREventPreview({ event }: CreateSREventPreviewProps) {
  return (
    <div className="fade-in slide-in-from-top-2 animate-in rounded-xl border border-primary/20 bg-primary/5 p-4 duration-200">
      <h3 className="mb-3 font-semibold text-primary text-xs uppercase tracking-wide">
        Selected Event
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-muted-foreground text-xs">Event</p>
            <p className="font-medium text-sm">{event.eventTitle}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-muted-foreground text-xs">Date</p>
            <p className="font-medium text-sm">
              {event.eventStartDate
                ? format(new Date(event.eventStartDate), "MMMM d, yyyy")
                : "TBA"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-muted-foreground text-xs">Registration Fee</p>
            <p className="font-medium text-sm">
              {`PHP ${event.registrationFee.toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-muted-foreground text-xs">Event Type</p>
            <p className="font-medium text-sm capitalize">
              {event.eventType ?? "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
