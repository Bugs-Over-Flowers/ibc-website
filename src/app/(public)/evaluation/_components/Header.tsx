import { formatDate } from "@/lib/events/eventUtils";
import type { Database } from "@/lib/supabase/db.types";

interface HeaderProps {
  event: Database["public"]["Tables"]["Event"]["Row"] | null;
}

export function Header({ event }: HeaderProps) {
  return (
    <section className="relative mt-10 overflow-hidden bg-background sm:py-16">
      <div className="mx-auto max-w-2xl px-4">
        <div className="text-center">
          <h1 className="font-bold text-3xl text-foreground md:text-4xl">
            Give Feedback
          </h1>
          {event && (
            <div className="mt-4 space-y-2">
              <h2 className="font-semibold text-foreground text-xl">
                {event.eventName}
              </h2>
              {event.eventEndDate && (
                <p className="text-muted-foreground text-sm">
                  {formatDate(event.eventEndDate)}
                </p>
              )}
            </div>
          )}
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            Your feedback helps us improve our events. Please take a moment to
            share your thoughts.
          </p>
        </div>
      </div>
    </section>
  );
}
