"use client";

import { Edit2, Save, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { updateMaxSponsoredGuests } from "@/server/sponsored-registrations/mutations/updateSR";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SlotUtilizationCardProps {
  sponsoredRegistration: SponsoredRegistration;
  registrationCount: number;
  eventId: string;
}

export function SlotUtilizationCard({
  sponsoredRegistration,
  registrationCount,
  eventId,
}: SlotUtilizationCardProps) {
  const router = useRouter();
  const [isEditingMaxGuests, setIsEditingMaxGuests] = useState(false);
  const [maxGuestsInput, setMaxGuestsInput] = useState(
    String(sponsoredRegistration.maxSponsoredGuests ?? 0),
  );

  const { execute: updateMaxGuests, isPending: isUpdatingMaxGuests } =
    useAction(
      tryCatch(async (): Promise<{ success: boolean }> => {
        const numValue = parseInt(maxGuestsInput, 10);
        if (Number.isNaN(numValue) || numValue < 0) {
          throw new Error("Please enter a valid number");
        }
        await updateMaxSponsoredGuests({
          sponsoredRegistrationId:
            sponsoredRegistration.sponsoredRegistrationId,
          eventId,
          maxSponsoredGuests: numValue,
        });
        return { success: true };
      }),
      {
        onSuccess: () => {
          toast.success("Max guests updated successfully");
          setIsEditingMaxGuests(false);
          router.refresh();
        },
        onError: (error: unknown) => {
          if (typeof error === "string") {
            toast.error(error);
          } else if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("Failed to update max guests");
          }
        },
      },
    );

  const handleSaveMaxGuests = async () => {
    const numValue = parseInt(maxGuestsInput, 10);
    if (Number.isNaN(numValue) || numValue < 0) {
      toast.error("Please enter a valid number");
      return;
    }
    const currentMax = sponsoredRegistration.maxSponsoredGuests ?? 0;
    if (numValue === currentMax) {
      setIsEditingMaxGuests(false);
      return;
    }
    await updateMaxGuests();
  };

  const handleCancelEdit = () => {
    setMaxGuestsInput(String(sponsoredRegistration.maxSponsoredGuests ?? 0));
    setIsEditingMaxGuests(false);
  };

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
          {isEditingMaxGuests ? (
            <div className="mt-1 flex items-center gap-2">
              <Input
                className="h-9 w-24 font-semibold text-lg"
                disabled={isUpdatingMaxGuests}
                inputMode="numeric"
                onChange={(e) => setMaxGuestsInput(e.target.value)}
                placeholder="0"
                type="number"
                value={maxGuestsInput}
              />
              <Button
                className="h-9 gap-1 px-2"
                disabled={isUpdatingMaxGuests}
                onClick={handleSaveMaxGuests}
                size="sm"
              >
                <Save className="h-3.5 w-3.5" />
              </Button>
              <Button
                className="h-9 gap-1 px-2"
                disabled={isUpdatingMaxGuests}
                onClick={handleCancelEdit}
                size="sm"
                variant="outline"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <p className="font-semibold text-lg">{maxGuests}</p>
              <Button
                className="h-9 gap-1 px-2 hover:bg-transparent"
                onClick={() => setIsEditingMaxGuests(true)}
                size="sm"
                variant="ghost"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
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
