"use client";

import { Users } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import tryCatch from "@/lib/server/tryCatch";
import { deleteSR } from "@/server/sponsored-registrations/actions/deleteSR";
import { updateSRStatus } from "@/server/sponsored-registrations/actions/updateSR";
import type { SponsoredRegistrationWithEvent } from "@/server/sponsored-registrations/queries/getAllSponsoredRegistrations";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { SponsoredRegistrationCard } from "./SponsoredRegistrationCard";

interface SponsoredRegistrationListProps {
  registrations: SponsoredRegistrationWithEvent[];
  pageSize?: number;
}

export function SponsoredRegistrationList({
  registrations,
  pageSize = 10,
}: SponsoredRegistrationListProps) {
  const router = useRouter();
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingRegistration, setDeletingRegistration] =
    useState<SponsoredRegistrationWithEvent | null>(null);
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

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [displayedCount, registrations.length, pageSize, isLoadingMore]);

  const displayed = registrations.slice(0, displayedCount);

  const handleCopyLink = (uuid: string, eventId: string) => {
    const link = `${window.location.origin}/events/${eventId}/register?sr=${uuid}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleToggleStatus = async (id: string, eventId: string) => {
    const toastId = toast.loading("Updating status...");

    const { error } = await tryCatch(
      updateSRStatus({
        sponsoredRegistrationId: id,
        eventId,
      }),
    );

    if (error) {
      console.error(
        "[SponsoredRegistrationList] Error toggling status:",
        error,
      );
      toast.error(`Failed to update status: ${error}`, { id: toastId });
      return;
    }

    toast.success("Status updated!", { id: toastId });
    router.refresh();
  };

  const handleDeleteClick = (registration: SponsoredRegistrationWithEvent) => {
    setDeletingRegistration(registration);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRegistration) {
      console.warn("[SponsoredRegistrationList] No registration to delete");
      return;
    }

    setIsDeletingId(deletingRegistration.sponsoredRegistrationId);
    const toastId = toast.loading("Deleting sponsored registration...");

    const { error } = await tryCatch(
      deleteSR({
        sponsoredRegistrationId: deletingRegistration.sponsoredRegistrationId,
        eventId: deletingRegistration.eventId,
      }),
    );

    if (error) {
      console.error("[SponsoredRegistrationList] Delete error:", error);
      toast.error(`Failed to delete: ${error}`, { id: toastId });
      setIsDeletingId(null);
      return;
    }

    toast.success("Sponsored registration deleted!", { id: toastId });
    setOpenDeleteDialog(false);
    setDeletingRegistration(null);
    setIsDeletingId(null);
    router.refresh();
  };

  if (displayed.length === 0) {
    return (
      <div className="rounded-lg border border-border border-dashed bg-card/50 p-8 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-muted-foreground">
          No sponsored registrations found
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {displayed.map((registration) => (
          <SponsoredRegistrationCard
            isDeleting={isDeletingId === registration.sponsoredRegistrationId}
            key={registration.sponsoredRegistrationId}
            onCopyLink={() =>
              handleCopyLink(registration.uuid, registration.eventId)
            }
            onDeleteClick={() => handleDeleteClick(registration)}
            onOpenLink={() =>
              router.push(
                `/events/${registration.eventId}/register?sr=${registration.uuid}` as Route,
              )
            }
            onToggleStatus={() =>
              handleToggleStatus(
                registration.sponsoredRegistrationId,
                registration.eventId,
              )
            }
            onViewDetails={() =>
              router.push(
                `/admin/events/${registration.eventId}/sponsored-registrations/${registration.sponsoredRegistrationId}` as Route,
              )
            }
            registration={registration}
          />
        ))}

        {/* Loader for infinite scroll */}
        {displayedCount < registrations.length && (
          <div
            className="flex items-center justify-center py-8"
            ref={loaderRef}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        isLoading={isDeletingId !== null}
        onConfirm={handleConfirmDelete}
        onOpenChange={setOpenDeleteDialog}
        open={openDeleteDialog}
        sponsorName={deletingRegistration?.sponsoredBy || ""}
      />
    </>
  );
}
