"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  eventId: string;
}

export default function BackButton({ eventId: _eventId }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <button
      className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
      onClick={handleClick}
      type="button"
    >
      <ChevronLeft className="h-5 w-5" />
      Back to Event
    </button>
  );
}
