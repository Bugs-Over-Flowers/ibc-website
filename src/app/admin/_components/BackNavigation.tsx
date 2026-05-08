"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackNavigation({ showBack }: { showBack: boolean }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      {showBack && (
        <>
          <button
            className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
            onClick={() => router.back()}
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <span className="text-muted-foreground/30">|</span>
        </>
      )}
      <button
        className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
        onClick={() => router.push("/admin/events")}
        type="button"
      >
        <ChevronLeft className="h-5 w-5" />
        Back to Events
      </button>
    </div>
  );
}
