"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type RegistrationInfoTopNavProps = {
  eventId: string;
};

export function RegistrationInfoTopNav({
  eventId,
}: RegistrationInfoTopNavProps) {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pt-8">
      <div className="flex items-center">
        <button
          className="inline-flex items-center gap-1 rounded-md py-2 font-medium text-md text-primary transition-colors hover:text-primary/80"
          onClick={() => router.push(`/events/${eventId}`)}
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Events
        </button>
      </div>
    </div>
  );
}
