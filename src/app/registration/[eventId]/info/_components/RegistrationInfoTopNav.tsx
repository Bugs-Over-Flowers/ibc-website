import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type RegistrationInfoTopNavProps = {
  eventId: string;
};

export function RegistrationInfoTopNav({
  eventId,
}: RegistrationInfoTopNavProps) {
  return (
    <div className="sticky top-0 z-10 border-border border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-13 max-w-7xl items-center px-6">
        <Link
          className="group inline-flex items-center gap-1.5 text-muted text-sm transition-colors hover:text-foreground"
          href={`/events/${eventId}`}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Event
        </Link>
      </div>
    </div>
  );
}
