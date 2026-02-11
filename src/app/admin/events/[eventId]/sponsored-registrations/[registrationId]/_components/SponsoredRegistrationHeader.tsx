"use client";

import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SponsoredRegistrationHeaderProps {
  sponsoredRegistration: SponsoredRegistration;
  eventTitle: string;
}

export function SponsoredRegistrationHeader({
  sponsoredRegistration,
  eventTitle,
}: SponsoredRegistrationHeaderProps) {
  const getStatusColor = () => {
    switch (sponsoredRegistration.status) {
      case "active":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "disabled":
        return "bg-muted text-muted-foreground";
      case "full":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="font-bold text-2xl text-foreground sm:text-3xl">
            {sponsoredRegistration.sponsoredBy}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            for{" "}
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary">
              {eventTitle}
            </span>
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center whitespace-nowrap rounded-full px-4 py-2 font-semibold text-sm uppercase",
            getStatusColor(),
          )}
        >
          {sponsoredRegistration.status}
        </span>
      </div>
    </div>
  );
}
