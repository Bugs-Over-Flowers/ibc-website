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
    <Card className="overflow-hidden border-l-4 border-l-primary shadow-sm">
      <CardHeader className="bg-muted/30 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl leading-tight">
              {eventDayData.eventTitle}
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground/80 text-xs uppercase tracking-wider">
              Check-in Dashboard
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-4 p-4">
        {/* Event Day Label */}
        <div className="flex items-center gap-3 rounded-lg border p-3 shadow-sm transition-colors hover:bg-muted/50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-xs">
              Event Day
            </p>
            <p className="font-semibold text-foreground">
              {eventDayData.label}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 rounded-lg border p-3 shadow-sm transition-colors hover:bg-muted/50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-xs">Date</p>
            <p className="font-semibold text-foreground">
              {formatDate(eventDayData.eventDate)}
            </p>
          </div>
        </div>

        {/* Venue */}
        {eventDayData.venue && (
          <div className="flex items-center gap-3 rounded-lg border p-3 shadow-sm transition-colors hover:bg-muted/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground text-xs">Venue</p>
              <p className="font-semibold text-foreground">
                {eventDayData.venue}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
