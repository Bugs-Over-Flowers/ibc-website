"use client";

import { Clock3, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useDashboardSearch } from "@/app/admin/_hooks/useDashboardSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DashboardActivityItem } from "@/server/admin/queries/getDashboardData";

type RecentActivityPanelProps = {
  initialActivities: DashboardActivityItem[];
};

function formatActivityDate(date: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function RecentActivityPanel({
  initialActivities,
}: RecentActivityPanelProps) {
  const { query, setQuery, activities, isLoading, error } = useDashboardSearch({
    initialActivities,
  });

  return (
    <Card className="border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search applications, members, and events"
            value={query}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="text-muted-foreground text-sm">Searching activity...</p>
        ) : null}

        {!isLoading && activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No activity matched your search.
          </p>
        ) : null}

        <ul className="space-y-2">
          {activities.map((activity) => (
            <li key={activity.id}>
              <Link
                className="block rounded-lg border border-border/50 bg-background/80 p-3 transition-colors hover:bg-muted/40"
                href={activity.href as Route}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {activity.subtitle}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatActivityDate(activity.date)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
