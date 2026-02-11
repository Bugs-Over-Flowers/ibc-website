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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SponsoredRegistrationWithEvent } from "@/server/sponsored-registrations/queries/getAllSponsoredRegistrations";

interface SponsoredRegistrationCardProps {
  registration: SponsoredRegistrationWithEvent;
  onCopyLink: () => void;
  onToggleStatus: () => void;
  onDeleteClick: () => void;
  onOpenLink: () => void;
  onViewDetails: () => void;
  isDeleting: boolean;
}

function getStatusBadgeVariant(
  status: "active" | "inactive" | "full" | "disabled",
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "full":
      return "destructive";
    case "disabled":
      return "secondary";
    default:
      return "default";
  }
}

export function SponsoredRegistrationCard({
  registration,
  onCopyLink,
  onToggleStatus,
  onDeleteClick,
  onOpenLink,
  onViewDetails,
  isDeleting,
}: SponsoredRegistrationCardProps) {
  const maxGuests = Number(registration.maxSponsoredGuests ?? 0);
  const usedCount = Number(registration.usedCount);

  const remainingGuests = maxGuests - usedCount;
  const totalGuests = maxGuests;

  const utilizationPercent =
    totalGuests > 0 ? (usedCount / totalGuests) * 100 : 0;
  const isStatusFull = registration.status === "full";
  const createdAt = registration.createdAt;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick();
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus();
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyLink();
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenLink();
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails();
  };

  return (
    <button
      className={cn(
        "group relative w-full rounded-xl border bg-card text-left",
        "cursor-pointer transition-all duration-200",
        "hover:border-primary/50 hover:bg-accent/5 hover:shadow-lg",
      )}
      onClick={handleViewDetails}
      type="button"
    >
      <div className="flex flex-col gap-5 p-5">
        {/* Header Row - Name and Event Badge */}
        <div className="flex items-start gap-4">
          {/* Sponsor Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-semibold text-base text-foreground">
                {registration.sponsoredBy}
              </h3>
              <Badge
                className="h-5 shrink-0 px-2 font-medium text-xs"
                variant={getStatusBadgeVariant(registration.status)}
              >
                {registration.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              Event:{" "}
              {registration.eventTitle || registration.eventName || "N/A"}
            </p>
            {registration.eventStartDate && (
              <p className="text-muted-foreground text-xs">
                {format(new Date(registration.eventStartDate), "MMM d, yyyy")}
                {registration.eventEndDate &&
                  registration.eventStartDate !== registration.eventEndDate &&
                  ` - ${format(new Date(registration.eventEndDate), "MMM d, yyyy")}`}
                {" • "}
                Created: {format(createdAt, "MMM d, yyyy")} at{" "}
                {format(createdAt, "h:mm a")}
              </p>
            )}
            {!registration.eventStartDate && (
              <p className="text-muted-foreground text-xs">
                Created: {format(createdAt, "MMM d, yyyy")} at{" "}
                {format(createdAt, "h:mm a")}
              </p>
            )}
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
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

            {/* Divider */}
            <div className="mx-1 h-6 w-px bg-border" />

            {/* Status Toggle */}
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
              title={
                isStatusFull ? "Cannot toggle full status" : "Toggle status"
              }
              variant="ghost"
            >
              {registration.status === "active" ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </Button>

            {/* Delete */}
            <Button
              className="h-9 w-9 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              disabled={isDeleting}
              onClick={handleDelete}
              size="icon"
              title="Delete sponsored registration"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
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
            disabled={isDeleting}
            onClick={handleDelete}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </button>
  );
}
