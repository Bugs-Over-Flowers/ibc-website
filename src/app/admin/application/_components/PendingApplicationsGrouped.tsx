"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { getApplications } from "@/server/applications/queries/getApplications";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";
import { ApplicationsTableRow } from "./ApplicationsTableRow";

interface PendingApplicationsGroupedProps {
  applications: Awaited<ReturnType<typeof getApplications>>;
}

/**
 * Groups pending applications by their interview schedule.
 * Each unique combination of date + AM/PM period + venue gets its own group.
 */
function groupBySchedule(
  applications: PendingApplicationsGroupedProps["applications"],
) {
  const groups = new Map<
    string,
    {
      key: string;
      date: Date;
      dateLabel: string;
      timeLabel: string;
      venue: string;
      applications: typeof applications;
    }
  >();

  const unscheduled: typeof applications = [];

  for (const app of applications) {
    if (!app.Interview?.interviewDate) {
      unscheduled.push(app);
      continue;
    }

    const interviewDate = new Date(app.Interview.interviewDate);
    const venue = app.Interview.interviewVenue || "No venue";

    // Create a group key based on: year-month-day-hour-minute-venue
    // This groups by exact date+time+venue
    const year = interviewDate.getFullYear();
    const month = interviewDate.getMonth();
    const day = interviewDate.getDate();
    const hours = interviewDate.getHours();
    const minutes = interviewDate.getMinutes();

    const groupKey = `${year}-${month}-${day}-${hours}-${minutes}-${venue}`;

    const dateLabel = interviewDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timeLabel = interviewDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        date: interviewDate,
        dateLabel,
        timeLabel,
        venue,
        applications: [],
      });
    }

    const group = groups.get(groupKey);
    if (group) {
      group.applications.push(app);
    }
  }

  // Sort groups by date (earliest first)
  const sortedGroups = Array.from(groups.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  return { sortedGroups, unscheduled };
}

export function PendingApplicationsGrouped({
  applications,
}: PendingApplicationsGroupedProps) {
  const { selectedApplicationIds, selectAll, toggleSelection } =
    useSelectedApplicationsStore();

  const { sortedGroups, unscheduled } = useMemo(
    () => groupBySchedule(applications),
    [applications],
  );

  return (
    <div className="space-y-6">
      {sortedGroups.map((group) => {
        const groupAppIds = group.applications.map((a) => a.applicationId);
        const selectedInGroup = groupAppIds.filter((id) =>
          selectedApplicationIds.has(id),
        ).length;
        const allInGroupSelected =
          groupAppIds.length > 0 && selectedInGroup === groupAppIds.length;
        const someInGroupSelected =
          selectedInGroup > 0 && selectedInGroup < groupAppIds.length;

        return (
          <Card key={group.key}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Calendar className="size-4 text-muted-foreground" />
                    {group.dateLabel}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {group.timeLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {group.venue}
                    </span>
                  </div>
                </div>
                <span className="whitespace-nowrap text-muted-foreground text-sm">
                  {group.applications.length} application
                  {group.applications.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        aria-label="Select all in group"
                        checked={allInGroupSelected}
                        data-indeterminate={someInGroupSelected}
                        onCheckedChange={() => {
                          if (allInGroupSelected) {
                            // Deselect only this group's apps
                            groupAppIds.forEach((id) => {
                              toggleSelection(id);
                            });
                          } else {
                            selectAll(groupAppIds);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Application Type</TableHead>
                    <TableHead>Date Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.applications.map((app) => (
                    <ApplicationsTableRow
                      application={app}
                      key={app.applicationId}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {unscheduled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground md:text-lg">
              No Interview Scheduled
              <span className="ml-2 font-normal text-sm">
                ({unscheduled.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox disabled />
                  </TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Application Type</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unscheduled.map((app) => (
                  <ApplicationsTableRow
                    application={app}
                    key={app.applicationId}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
