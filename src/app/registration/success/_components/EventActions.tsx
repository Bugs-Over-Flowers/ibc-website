import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EventActionsProps {
  eventId: string;
}

export function EventActions({ eventId }: EventActionsProps) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      <Link className="flex-1" href={`/events/${eventId}` as Route}>
        <Button
          className="w-full gap-2 font-semibold text-foreground/90 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary hover:shadow-sm focus-visible:-translate-y-0.5 focus-visible:bg-primary/10 focus-visible:text-primary"
          size="lg"
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Event
        </Button>
      </Link>
      <Link className="flex-1" href="/events">
        <Button
          className="w-full font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:bg-primary/90"
          size="lg"
        >
          Browse All Events
        </Button>
      </Link>
    </div>
  );
}
