"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { getEventDays } from "@/server/events/mutations/getEventDays";
import CheckInListStats from "./CheckInListStats";
import DraftEventEmptyComponent from "./DraftEventEmptyComponent";

interface CheckInListTabWrapperProps {
  tabs: Awaited<ReturnType<typeof getEventDays>>;
  children: React.ReactNode;
  checkInCounts: Record<string, number>;
  eventTitle: string;
  totalExpected: number;
}

export default function CheckInListTabWrapper({
  tabs,
  children,
  checkInCounts,
  eventTitle: _eventTitle,
  totalExpected,
}: CheckInListTabWrapperProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.eventDayId ?? "");

  if (tabs.length === 0) {
    return <DraftEventEmptyComponent />;
  }

  const currentDay = tabs.find((d) => d.eventDayId === activeTab);
  const currentDayLabel = currentDay?.label ?? "Day 1";
  const currentCheckedInCount = checkInCounts[activeTab] ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <CheckInListStats
        checkedInCount={currentCheckedInCount}
        eventDayLabel={currentDayLabel}
        totalExpected={totalExpected}
      />

      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="h-9 gap-1 rounded-lg bg-muted p-1">
          {tabs.map((eventDay) => (
            <TabsTrigger
              className="rounded-md px-4 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
              key={eventDay.eventDayId}
              value={eventDay.eventDayId}
            >
              {eventDay.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
