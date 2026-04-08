"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { getStatusColor } from "./utils";

type Event = Database["public"]["Tables"]["Event"]["Row"];
type SponsoredRegistration =
  Database["public"]["Tables"]["SponsoredRegistration"]["Row"];

interface SponsoredRegistrationCardProps {
  event: Event;
  registration: SponsoredRegistration;
  onCopyLink: (uuid: string, eventId: string) => void;
  onToggleStatus: (id: string) => void;
  onDeleteClick: (registration: SponsoredRegistration) => Promise<void>;
  isDeleting: boolean;
}

export function SponsoredRegistrationCard({
  event,
  registration,
  onCopyLink,
  onToggleStatus,
  onDeleteClick,
  isDeleting,
}: SponsoredRegistrationCardProps) {
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const isDeleteDisabled = registration.usedCount > 0;

  const remainingGuests =
    (registration.maxSponsoredGuests ?? 0) - registration.usedCount;
  const totalGuests = registration.maxSponsoredGuests ?? 0;
  const utilizationPercent =
    totalGuests > 0 ? (registration.usedCount / totalGuests) * 100 : 0;
  const isStatusFull = registration.status === "full";
  const createdAt = new Date(registration.createdAt);
  const eventTypeLabel = event.eventType
    ? `${event.eventType.charAt(0).toUpperCase()}${event.eventType.slice(1)}`
    : "Unspecified";

  const handleDelete = () => {
    if (isDeleteDisabled) {
      return;
    }

    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    await onDeleteClick(registration);
    setOpenDeleteDialog(false);
  };

  const handleToggleStatus = () => {
    onToggleStatus(registration.sponsoredRegistrationId);
  };

  const handleCopyLink = () => {
    onCopyLink(registration.uuid, event.eventId);
  };

  const handleOpenLink = () => {
    router.push(
      `/events/${event.eventId}/register?sr=${registration.uuid}` as Route,
    );
  };

  const handleViewDetails = () => {
    router.push(
      `/admin/events/${event.eventId}/sponsored-registrations/${registration.sponsoredRegistrationId}` as Route,
    );
  };

  return (
    <>
      <div
        className={cn(
          "group relative w-full rounded-xl border bg-card",
          "transition-all duration-200",
          "hover:border-primary/50 hover:bg-accent/5 hover:shadow-lg",
        )}
      >
        <button
          className="w-full text-left"
          onClick={handleViewDetails}
          type="button"
        >
          <div className="flex flex-col gap-5 p-5">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex h-5 shrink-0 items-center rounded-full border border-primary/30 bg-primary/10 px-2 font-semibold text-primary text-xs uppercase tracking-wide">
                    {eventTypeLabel} event
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-5 shrink-0 items-center rounded-full px-2 font-medium text-xs uppercase",
                      getStatusColor(registration.status),
                    )}
                  >
                    {registration.status}
                  </span>
                </div>
                <h3 className="font-semibold text-base text-foreground">
                  {registration.sponsoredBy}
                </h3>
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 px-3 py-2">
              <p className="text-muted-foreground text-xs">
                Created {format(createdAt, "MMM d, yyyy")} at{" "}
                {format(createdAt, "h:mm a")}
              </p>
            </div>

            {/* Divider */}
            <div className="-mx-5 border-t" />

            {/* Guest Utilization Section */}
            <div className="space-y-3">
              {/* Header with Icon and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground text-sm">
                    Guest Slots
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-3xl text-foreground tabular-nums">
                    {registration.usedCount}
                  </span>
                  <span className="font-medium text-base text-muted-foreground">
                    / {totalGuests}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      "shadow-sm",
                      remainingGuests === 0
                        ? "bg-linear-to-r from-destructive to-red-600"
                        : utilizationPercent > 75
                          ? "bg-linear-to-r from-amber-400 to-amber-600"
                          : "bg-linear-to-r from-green-500 to-emerald-600",
                    )}
                    style={{ width: `${utilizationPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  {remainingGuests === 0 ? (
                    <span className="flex items-center gap-1.5 font-semibold text-destructive">
                      <XCircle className="h-3.5 w-3.5" />
                      All slots filled
                    </span>
                  ) : (
                    <span className="font-medium text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {remainingGuests}
                      </span>{" "}
                      slot{remainingGuests !== 1 ? "s" : ""} remaining
                    </span>
                  )}
                  <span className="font-semibold text-muted-foreground tabular-nums">
                    {utilizationPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </button>

        <div className="absolute top-4 right-4 hidden gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
          <Button
            className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={handleViewDetails}
            size="icon"
            title="View details"
            variant="ghost"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={handleCopyLink}
            size="icon"
            title="Copy registration link"
            variant="ghost"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={handleOpenLink}
            size="icon"
            title="Open registration link"
            variant="ghost"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>

          <div className="mx-1 h-6 w-px bg-border" />

          <Button
            className={cn(
              "h-9 w-9 transition-colors",
              registration.status === "active"
                ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                : "text-muted-foreground hover:bg-green-50 hover:text-green-600",
            )}
            disabled={isStatusFull}
            onClick={handleToggleStatus}
            size="icon"
            title={isStatusFull ? "Cannot toggle full status" : "Toggle status"}
            variant="ghost"
          >
            {registration.status === "active" ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </Button>

          <Button
            className="h-9 w-9 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            disabled={isDeleting || isDeleteDisabled}
            onClick={handleDelete}
            size="icon"
            title={
              isDeleteDisabled
                ? "Cannot delete: this sponsored registration has already been used"
                : "Delete sponsored registration"
            }
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className="-mx-5 flex items-center justify-end gap-1 border-t px-5 pt-2 sm:hidden">
          <Button
            className="h-8 gap-1.5 text-xs"
            onClick={handleViewDetails}
            size="sm"
            variant="ghost"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>

          <Button
            className="h-8 gap-1.5 text-xs"
            onClick={handleCopyLink}
            size="sm"
            variant="ghost"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>

          <div className="mx-1 h-5 w-px bg-border" />

          <Button
            className="h-8 gap-1.5 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
            disabled={isDeleting || isDeleteDisabled}
            onClick={handleDelete}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <ConfirmDeleteDialog
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onOpenChange={setOpenDeleteDialog}
        open={openDeleteDialog}
        sponsorName={registration.sponsoredBy}
      />
    </>
  );
}
