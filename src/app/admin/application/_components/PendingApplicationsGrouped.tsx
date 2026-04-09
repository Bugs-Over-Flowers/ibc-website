"use client";
import { AlertCircle, Calendar, Clock, MapPin } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    const d = new Date(app.Interview.interviewDate);
    const venue = app.Interview.interviewVenue || "No venue";
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}-${venue}`;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        date: d,
        dateLabel: d.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        timeLabel: d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        venue,
        applications: [],
      });
    }
    groups.get(key)?.applications.push(app);
  }

  return {
    sortedGroups: Array.from(groups.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    ),
    unscheduled,
  };
}

const SHARED_COLS = [
  {
    className:
      "w-[24%] text-xs font-medium uppercase tracking-wide text-muted-foreground",
    label: "Company name",
  },
  {
    className:
      "w-[34%] text-xs font-medium uppercase tracking-wide text-muted-foreground",
    label: "Sector",
  },
  {
    className:
      "w-[16%] text-xs font-medium uppercase tracking-wide text-muted-foreground",
    label: "Application type",
  },
  {
    className:
      "w-[14%] text-xs font-medium uppercase tracking-wide text-muted-foreground",
    label: "Date applied",
  },
  {
    className:
      "w-[12%] pr-4 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground",
    label: "Actions",
  },
] as const;

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
    <div className="space-y-5">
      {sortedGroups.map((group) => {
        const ids = group.applications.map((a) => a.applicationId);
        const selCount = ids.filter((id) =>
          selectedApplicationIds.has(id),
        ).length;
        const allSelected = ids.length > 0 && selCount === ids.length;
        const someSelected = selCount > 0 && selCount < ids.length;

        return (
          <Card className="overflow-hidden rounded-2xl p-0" key={group.key}>
            {/* Group header */}
            <div className="flex items-center justify-between gap-4 border-b bg-muted/40 px-4 py-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="flex items-center gap-1.5 font-medium text-sm">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  {group.dateLabel}
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-muted-foreground text-xs">
                    <Clock className="size-3" />
                    {group.timeLabel}
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-muted-foreground text-xs">
                    <MapPin className="size-3" />
                    {group.venue}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-border bg-background px-2.5 py-0.5 text-muted-foreground text-xs">
                {group.applications.length} application
                {group.applications.length !== 1 ? "s" : ""}
              </span>
            </div>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[640px] table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          aria-label="Select all in group"
                          checked={allSelected}
                          data-indeterminate={someSelected}
                          onCheckedChange={() => {
                            if (allSelected) {
                              ids.forEach(toggleSelection);
                            } else {
                              selectAll(ids);
                            }
                          }}
                        />
                      </TableHead>
                      {SHARED_COLS.map((column) => (
                        <TableHead
                          className={column.className}
                          key={column.label}
                        >
                          {column.label}
                        </TableHead>
                      ))}
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
              </div>
            </CardContent>
          </Card>
        );
      })}

      {unscheduled.length > 0 && (
        <Card className="overflow-hidden rounded-2xl p-0">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <AlertCircle className="size-3.5 text-muted-foreground" />
            <span className="font-medium text-muted-foreground text-sm">
              No interview scheduled
            </span>
            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-muted-foreground text-xs">
              {unscheduled.length}
            </span>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[640px] table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox disabled />
                    </TableHead>
                    {SHARED_COLS.map((column) => (
                      <TableHead
                        className={column.className}
                        key={column.label}
                      >
                        {column.label}
                      </TableHead>
                    ))}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
