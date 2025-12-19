"use client";

import { formatDate } from "date-fns";
import { type ReactNode, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  CheckInItem,
  CheckInListEventDayDetails,
} from "@/lib/validation/checkin/checkin-list";

interface AttendanceTabsProps {
  eventDays: CheckInListEventDayDetails[];
  totalParticipants: number;
  checkIns: CheckInItem[];
  children: ReactNode;
}

export default function AttendanceTabs({
  eventDays,
  checkIns,
  totalParticipants,
  children,
}: AttendanceTabsProps) {
  const [currentDay, setCurrentDay] = useState(eventDays[0].label);

  const activeDay = () => eventDays.find((day) => day.label === currentDay);

  const activeDayDate = () =>
    eventDays.find((day) => day.label === currentDay)?.eventDate || "";

  // 2. Calculate daily check-ins efficiently
  const dailyCount = () => {
    if (!activeDay) return 0;
    return checkIns.filter((c) => c.eventDayId === activeDay()?.eventDayId)
      .length;
  };

  const checkInPercentage = () => {
    if (totalParticipants === 0) return "0%";
    return `${((dailyCount() / totalParticipants) * 100).toFixed(2)}%`;
  };

  if (eventDays.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">No event days scheduled.</div>
    );
  }
  return (
    <Tabs
      className="space-y-2 pt-3"
      defaultValue={eventDays[0].label}
      onValueChange={setCurrentDay}
      value={currentDay}
    >
      <TabsList>
        {eventDays.map((eventDay) => (
          <TabsTrigger key={eventDay.eventDayId} value={eventDay.label}>
            {eventDay.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-lg">Check-In Summary</h3>
          <p>
            Check ins for {currentDay} (
            {formatDate(activeDayDate(), "MMM. d, yyyy")})
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="font-bold text-2xl">
                {dailyCount()}
                <span className="pl-3 text-neutral-400 text-sm">
                  {checkInPercentage()}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Checked in for {currentDay}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="font-bold text-2xl">{totalParticipants}</div>
              <p className="text-muted-foreground text-xs">
                Total Expected Participants
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      {children}
    </Tabs>
  );
}
