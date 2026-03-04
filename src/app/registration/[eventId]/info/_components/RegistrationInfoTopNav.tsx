import { ChevronLeft } from "lucide-react";
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
          className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
          href={`/events/${eventId}`}
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Events
        </Link>
      </div>
    </div>
  );
}
