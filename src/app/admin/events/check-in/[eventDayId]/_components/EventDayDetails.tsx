import { Calendar, MapPin, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl">{eventDayData.eventTitle}</CardTitle>
        <CardDescription>Check-in details for this event day</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Event Day Label */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-primary/10 p-2">
              <Tag className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground text-sm">
                Event Day
              </p>
              <p className="font-semibold text-foreground">
                {eventDayData.label}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-blue-500/10 p-2">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground text-sm">Date</p>
              <p className="font-semibold text-foreground">
                {formatDate(eventDayData.eventDate)}
              </p>
            </div>
          </div>

          {/* Venue */}
          {eventDayData.venue && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-green-500/10 p-2">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground text-sm">
                  Venue
                </p>
                <p className="font-semibold text-foreground">
                  {eventDayData.venue}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
