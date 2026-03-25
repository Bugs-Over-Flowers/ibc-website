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
  eventTitle,
  totalExpected,
}: CheckInListTabWrapperProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.eventDayId ?? "");

  if (tabs.length === 0) {
    return <DraftEventEmptyComponent />;
  }

  // Find the current event day label
  const currentEventDay = tabs.find((day) => day.eventDayId === activeTab);
  const currentDayLabel = currentEventDay?.label ?? "Day 1";
  const currentCheckedInCount = checkInCounts[activeTab] ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Section */}
      <CheckInListStats
        checkedInCount={currentCheckedInCount}
        eventDayLabel={currentDayLabel}
        eventTitle={eventTitle}
        totalExpected={totalExpected}
      />

      {/* Tabs */}
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="gap-3">
          {tabs?.map((eventDay) => (
            <TabsTrigger key={eventDay.eventDayId} value={eventDay.eventDayId}>
              {eventDay.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
