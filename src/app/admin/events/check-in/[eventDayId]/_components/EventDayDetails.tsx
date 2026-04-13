import { Calendar, MapPin, Tag } from "lucide-react";
import { formatDate } from "@/lib/events/eventUtils";
import type { Database } from "@/lib/supabase/db.types";

interface EventDayDetailsProps {
  eventDayData: Pick<
    Database["public"]["Tables"]["EventDay"]["Row"],
    "label" | "eventDate"
  > & {
    eventTitle: string;
    venue?: string | null;
  };
}

export default function EventDayDetails({
  eventDayData,
}: EventDayDetailsProps) {
  const rows = [
    { icon: Tag, label: "Event day", value: eventDayData.label },
    {
      icon: Calendar,
      label: "Date",
      value: formatDate(eventDayData.eventDate),
    },
    ...(eventDayData.venue
      ? [{ icon: MapPin, label: "Venue", value: eventDayData.venue }]
      : []),
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="border-b bg-muted/30 px-4 py-3">
        <p className="font-medium text-sm">{eventDayData.eventTitle}</p>
        <p className="mt-0.5 text-muted-foreground text-xs">
          Event details for this check-in session
        </p>
      </div>
      <div className="flex flex-col gap-0 divide-y divide-border/50">
        {rows.map(({ icon: Icon, label, value }) => (
          <div className="flex items-center gap-3 px-4 py-3" key={label}>
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <p className="text-foreground text-sm">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
