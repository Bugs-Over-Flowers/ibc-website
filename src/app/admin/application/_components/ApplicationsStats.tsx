"use client";

import { Calendar, CheckCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ApplicationTab } from "./ApplicationsTabs";

interface ApplicationsStatsProps {
  activeTab: ApplicationTab;
  counts: {
    new: number;
    pending: number;
    finished: number;
  };
  onTabChange: (tab: ApplicationTab) => void;
}

export default function ApplicationsStats({
  activeTab,
  counts,
  onTabChange,
}: ApplicationsStatsProps) {
  const items = [
    {
      tab: "new" as const,
      label: "New Applications",
      value: counts.new,
      icon: Users,
      iconClass: "text-status-green",
      valueClass: "text-status-green",
      iconWrapperClass: "bg-status-green/15",
    },
    {
      tab: "pending" as const,
      label: "Pending Interviews",
      value: counts.pending,
      icon: Calendar,
      iconClass: "text-status-blue",
      valueClass: "text-status-blue",
      iconWrapperClass: "bg-status-blue/15",
    },
    {
      tab: "finished" as const,
      label: "Finished Meetings",
      value: counts.finished,
      icon: CheckCircle,
      iconClass: "text-status-orange",
      valueClass: "text-status-orange",
      iconWrapperClass: "bg-status-orange/15",
    },
  ];

  return (
    <div className="grid h-full grid-cols-1 grid-rows-3 gap-4">
      {items.map(
        ({
          tab,
          label,
          value,
          icon: Icon,
          iconClass,
          valueClass,
          iconWrapperClass,
        }) => (
          <button
            aria-pressed={activeTab === tab}
            className="h-full text-left"
            key={label}
            onClick={() => onTabChange(tab)}
            type="button"
          >
            <Card
              className={cn(
                "h-full rounded-2xl border border-border/70 transition-colors",
                activeTab === tab && "border-primary/70 bg-primary/5",
              )}
            >
              <CardContent className="flex items-center gap-4 px-6">
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-2xl border border-border/70",
                    iconWrapperClass,
                  )}
                >
                  <Icon className={cn("size-5", iconClass)} />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-muted-foreground text-sm">
                    {label}
                  </div>
                  <div
                    className={cn(
                      "font-semibold text-3xl leading-none",
                      valueClass,
                    )}
                  >
                    {value}
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ),
      )}
    </div>
  );
}
