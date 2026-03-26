/**
 * ApplicationHistoryList — Client component that owns the filter state
 * and renders the filtered list of ApplicationHistoryCards.
 *
 * Receives the full applications array from the server component and
 * delegates filtering to ApplicationHistoryFilters. Displays:
 * - Filter controls (search, type dropdown, date range picker)
 * - A results count showing "X of Y applications"
 * - The filtered list of clickable ApplicationHistoryCards
 * - Empty states for "no applications" and "no matches found"
 */
"use client";

import { useCallback, useState } from "react";
import type { ApplicationHistoryItem } from "@/server/applications/queries/getApplicationHistory";
import { ApplicationHistoryCard } from "./ApplicationHistoryCard";
import { ApplicationHistoryFilters } from "./ApplicationHistoryFilters";

interface ApplicationHistoryListProps {
  applications: ApplicationHistoryItem[];
  memberId: string;
}

export function ApplicationHistoryList({
  applications,
  memberId,
}: ApplicationHistoryListProps) {
  const [filteredApplications, setFilteredApplications] =
    useState<ApplicationHistoryItem[]>(applications);

  /** Callback passed to filters — updates the displayed list whenever filters change. */
  const handleFiltersChange = useCallback(
    (filtered: ApplicationHistoryItem[]) => {
      setFilteredApplications(filtered);
    },
    [],
  );

  // No applications at all — show empty state without filters
  if (applications.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 p-8 text-center">
        <p className="text-muted-foreground">
          No applications found for this member.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ApplicationHistoryFilters
        applications={applications}
        onFiltersChange={handleFiltersChange}
      />

      {/* Results count */}
      <p className="text-muted-foreground text-sm">
        Showing{" "}
        <span className="font-medium text-foreground">
          {filteredApplications.length}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {applications.length}
        </span>{" "}
        application{applications.length !== 1 ? "s" : ""}
      </p>

      {/* Filtered results or "no matches" empty state */}
      {filteredApplications.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 p-8 text-center">
          <p className="text-muted-foreground">
            No applications match the current filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((application) => (
            <ApplicationHistoryCard
              application={application}
              key={application.applicationId}
              memberId={memberId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
