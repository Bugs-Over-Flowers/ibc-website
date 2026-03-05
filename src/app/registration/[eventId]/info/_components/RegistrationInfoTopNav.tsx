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
      <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
        <Link
          className="inline-flex items-center gap-1 font-medium text-primary text-sm transition-colors hover:text-primary/80"
          href={`/events/${eventId}`}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Events
        </Link>
      </div>
    </div>
  );
}
