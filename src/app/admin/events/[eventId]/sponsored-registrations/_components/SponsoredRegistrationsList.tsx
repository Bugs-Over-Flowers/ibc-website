"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { deleteSR } from "@/server/sponsored-registrations/mutations/deleteSR";
import { updateSRStatus } from "@/server/sponsored-registrations/mutations/updateSR";
import { SponsoredRegistrationCard } from "./SponsoredRegistrationCard";

type Event = Database["public"]["Tables"]["Event"]["Row"];
type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SponsoredRegistrationsListProps {
  event: Event;
  registrations: SponsoredRegistration[];
  pageSize?: number;
}

export function SponsoredRegistrationsList({
  event,
  registrations,
  pageSize = 10,
}: SponsoredRegistrationsListProps) {
  const router = useRouter();
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const lastEntry = entries[0];
        if (
          lastEntry.isIntersecting &&
          displayedCount < registrations.length &&
          !isLoadingMore
        ) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setDisplayedCount((prev) =>
              Math.min(prev + pageSize, registrations.length),
            );
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [displayedCount, registrations.length, pageSize, isLoadingMore]);

  const displayedRegistrations = registrations.slice(0, displayedCount);

  const handleCopyLink = (uuid: string, eventId: string) => {
    const link = `${window.location.origin}/events/${eventId}/register?sr=${uuid}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleToggleStatus = async (id: string) => {
    const toastId = toast.loading("Updating status...");

    const { error } = await tryCatch(
      updateSRStatus({
        sponsoredRegistrationId: id,
        eventId: event.eventId,
      }),
    );

    if (error) {
      toast.error(`Failed to update status: ${error}`, { id: toastId });
      return;
    }

    toast.success("Status updated!", { id: toastId });
    router.refresh();
  };

  const handleDeleteClick = async (registration: SponsoredRegistration) => {
    if (registration.usedCount > 0) {
      toast.error(
        "Cannot delete this sponsored registration because it has already been used.",
      );
      return;
    }

    setIsDeletingId(registration.sponsoredRegistrationId);
    const toastId = toast.loading("Deleting...");

    const { error } = await tryCatch(
      deleteSR({
        sponsoredRegistrationId: registration.sponsoredRegistrationId,
        eventId: event.eventId,
      }),
    );

    setIsDeletingId(null);

    if (error) {
      toast.error(`Failed to delete: ${error}`, { id: toastId });
      return;
    }

    toast.success("Deleted successfully!", { id: toastId });
    router.push("/admin/sponsored-registration");
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {displayedRegistrations.map((registration, _index) => (
        <SponsoredRegistrationCard
          event={event}
          isDeleting={isDeletingId === registration.sponsoredRegistrationId}
          key={registration.sponsoredRegistrationId}
          onCopyLink={handleCopyLink}
          onDeleteClick={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
          registration={registration}
        />
      ))}

      {displayedCount < registrations.length && (
        <div className="col-span-2 py-4 text-center" ref={loaderRef}>
          {isLoadingMore ? (
            <span className="text-muted-foreground text-sm">
              Loading more...
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              Scroll to load more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
