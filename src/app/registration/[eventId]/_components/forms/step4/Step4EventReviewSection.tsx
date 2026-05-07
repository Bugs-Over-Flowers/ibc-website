import { formatDate } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Step4EventReviewSectionProps {
  eventStartDate?: string | null;
  eventTitle?: string | null;
}

export default function Step4EventReviewSection({
  eventStartDate,
  eventTitle,
}: Step4EventReviewSectionProps) {
  return (
    <Card className="rounded-2xl border border-border/50 bg-background">
      <CardContent className="space-y-6 px-7 py-0">
        <div className="flex items-center gap-2 font-bold text-primary">
          <CalendarDays className="h-5 w-5" />
          <span className="text-base uppercase tracking-wide">Event</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Event Name
            </span>
            <span className="font-semibold text-base leading-tight">
              {eventTitle}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Event Date
            </span>
            <span className="font-semibold text-base leading-tight">
              {eventStartDate
                ? formatDate(eventStartDate, "MMMM d, yyyy")
                : "Date TBA"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
