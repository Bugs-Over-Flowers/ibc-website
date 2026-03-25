"use client";

import { XCircle } from "lucide-react";
import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SlotUtilizationCardProps {
  sponsoredRegistration: SponsoredRegistration;
  registrationCount: number;
}

export function SlotUtilizationCard({
  sponsoredRegistration,
  registrationCount,
}: SlotUtilizationCardProps) {
  const maxGuests = sponsoredRegistration.maxSponsoredGuests ?? 0;
  const usedSlots = sponsoredRegistration.usedCount;
  const remainingSlots = maxGuests - usedSlots;
  const utilizationPercent = maxGuests > 0 ? (usedSlots / maxGuests) * 100 : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-5">
        <div>
          <p className="text-muted-foreground text-sm">Fee Deduction</p>
          <p className="mt-1 font-semibold text-lg">
            ₱{sponsoredRegistration.feeDeduction.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Max Guests</p>
          <p className="mt-1 font-semibold text-lg">{maxGuests}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Registered</p>
          <p className="mt-1 font-semibold text-lg">{registrationCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Used</p>
          <p className="mt-1 font-semibold text-lg">{usedSlots}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Remaining</p>
          <p
            className={cn(
              "mt-1 font-semibold text-lg",
              remainingSlots === 0 ? "text-destructive" : "text-green-600",
            )}
          >
            {remainingSlots}
          </p>
        </div>
      </div>

      {/* Utilization Progress Bar */}
      <div className="mt-6 space-y-2">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              "shadow-sm",
              remainingSlots === 0
                ? "bg-linear-to-r from-destructive to-red-600"
                : utilizationPercent > 75
                  ? "bg-linear-to-r from-amber-400 to-amber-600"
                  : "bg-linear-to-r from-green-500 to-emerald-600",
            )}
            style={{ width: `${utilizationPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          {remainingSlots === 0 ? (
            <span className="flex items-center gap-1.5 font-semibold text-destructive">
              <XCircle className="h-3.5 w-3.5" />
              All slots filled
            </span>
          ) : (
            <span className="font-medium text-muted-foreground">
              <span className="font-semibold text-foreground">
                {remainingSlots}
              </span>{" "}
              slot{remainingSlots !== 1 ? "s" : ""} remaining
            </span>
          )}
          <span className="font-semibold text-muted-foreground tabular-nums">
            {utilizationPercent.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
