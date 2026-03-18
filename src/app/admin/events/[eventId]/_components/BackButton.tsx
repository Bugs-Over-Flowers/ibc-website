"use client";

import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  eventId: string;
}

export function BackButton({ eventId }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/admin/events/${eventId}` as Route);
  };

  return (
    <button
      className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
      onClick={() => handleClick()}
      type="button"
    >
      <ChevronLeft className="h-5 w-5" />
      Back to Event
    </button>
  );
}
