"use client";

import { BarChart, CheckCircle, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CheckInListStatsProps {
  eventTitle: string;
  eventDayLabel: string;
  totalExpected: number;
  checkedInCount: number;
}

export default function CheckInListStats({
  eventTitle: _eventTitle,
  eventDayLabel,
  totalExpected,
  checkedInCount,
}: CheckInListStatsProps) {
  const percentage =
    totalExpected > 0 ? Math.round((checkedInCount / totalExpected) * 100) : 0;

  return (
    <div className="flex w-full flex-col justify-between gap-2 md:gap-4 lg:flex-row">
      {[
        {
          label: "Expected Participants",
          data: totalExpected,
          className: "text-blue-600",
          icon: <Users2 />,
        },
        {
          label: `Checked In (${eventDayLabel})`,
          data: checkedInCount,
          className: "text-green-600",
          icon: <CheckCircle />,
        },
        {
          label: "Attendance Rate",
          data: `${percentage}%`,
          className: "text-purple-600",
          icon: <BarChart />,
        },
      ].map(({ label, data, className, icon }) => (
        <Card className="h-36 w-full" key={label}>
          <CardContent className="flex h-full flex-col justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-medium text-lg">{label}</h3>
            </div>
            <p className={cn("font-medium text-lg", className)}>{data}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
