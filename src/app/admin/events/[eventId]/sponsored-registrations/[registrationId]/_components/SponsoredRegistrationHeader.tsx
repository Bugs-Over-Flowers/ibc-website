"use client";

import { Edit2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { updateSRSponsorName } from "@/server/sponsored-registrations/actions/updateSR";
import { getStatusColor } from "../../_components/utils";

type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SponsoredRegistrationHeaderProps {
  sponsoredRegistration: SponsoredRegistration;
  eventTitle: string;
  eventId: string;
}

export function SponsoredRegistrationHeader({
  sponsoredRegistration,
  eventTitle,
  eventId,
}: SponsoredRegistrationHeaderProps) {
  const router = useRouter();
  const [isEditingSponsorName, setIsEditingSponsorName] = useState(false);
  const [sponsorName, setSponsorName] = useState(
    sponsoredRegistration.sponsoredBy,
  );

  const { execute: updateSponsorName, isPending: isUpdatingSponsorName } =
    useAction(
      tryCatch(async (): Promise<{ success: boolean }> => {
        await updateSRSponsorName({
          sponsoredRegistrationId:
            sponsoredRegistration.sponsoredRegistrationId,
          eventId,
          sponsoredBy: sponsorName.trim(),
        });
        return { success: true };
      }),
      {
        onSuccess: () => {
          toast.success("Sponsor name updated successfully");
          setIsEditingSponsorName(false);
          router.refresh();
        },
        onError: (error: unknown) => {
          if (typeof error === "string") {
            toast.error(error);
          } else if (error instanceof Error) {
            toast.error(error.message);
          } else {
            toast.error("Failed to update sponsor name");
          }
        },
      },
    );

  const handleSaveSponsorName = async () => {
    if (!sponsorName.trim()) {
      toast.error("Sponsor name cannot be empty");
      return;
    }
    if (sponsorName.trim() === sponsoredRegistration.sponsoredBy) {
      setIsEditingSponsorName(false);
      return;
    }
    await updateSponsorName();
  };

  const handleCancelEdit = () => {
    setSponsorName(sponsoredRegistration.sponsoredBy);
    setIsEditingSponsorName(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          {isEditingSponsorName ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                className="h-11 w-lg font-bold text-2xl"
                disabled={isUpdatingSponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="Enter sponsor name"
                value={sponsorName}
              />
              <div className="flex gap-2">
                <Button
                  className="h-11 gap-2 rounded-lg"
                  disabled={isUpdatingSponsorName || !sponsorName.trim()}
                  onClick={handleSaveSponsorName}
                  size="sm"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  className="h-11 gap-2 rounded-lg"
                  disabled={isUpdatingSponsorName}
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-2xl text-foreground sm:text-3xl">
                {sponsoredRegistration.sponsoredBy}
              </h1>
              <Button
                className="h-10 gap-1.5 hover:bg-transparent"
                onClick={() => setIsEditingSponsorName(true)}
                size="sm"
                variant="ghost"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          )}
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
            getStatusColor(sponsoredRegistration.status),
          )}
        >
          {sponsoredRegistration.status}
        </span>
      </div>
    </div>
  );
}
