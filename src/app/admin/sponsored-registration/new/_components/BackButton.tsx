"use client";

import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const handleClick = () => {
    window.history.back();
  };

  return (
    <button
      className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
      onClick={handleClick}
      type="button"
    >
      <ChevronLeft className="h-5 w-5" />
      Back to Sponsored Registrations
    </button>
  );
}
