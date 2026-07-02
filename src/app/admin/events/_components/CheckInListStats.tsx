"use client";

import { BarChart3, CheckCircle2, Users2 } from "lucide-react";

interface CheckInListStatsProps {
  eventDayLabel: string;
  totalExpected: number;
  checkedInCount: number;
}

export default function CheckInListStats({
  eventDayLabel,
  totalExpected,
  checkedInCount,
}: CheckInListStatsProps) {
  const percentage =
    totalExpected > 0 ? Math.round((checkedInCount / totalExpected) * 100) : 0;
  const remaining = totalExpected - checkedInCount;

  const stats = [
    {
      label: "Expected participants",
      icon: Users2,
      value: totalExpected.toLocaleString(),
      sub: "Total registered for this event",
      valueClass: "",
    },
    {
      label: `Checked in - ${eventDayLabel}`,
      icon: CheckCircle2,
      value: checkedInCount.toLocaleString(),
      sub: `${percentage}% attendance rate`,
      valueClass: "text-[#27500A] dark:text-[#9FE1CB]",
      progress: percentage,
    },
    {
      label: `Attendance rate - ${eventDayLabel}`,
      icon: BarChart3,
      value: `${percentage}%`,
      sub: `${remaining} participant${remaining !== 1 ? "s" : ""} yet to check in`,
      valueClass: "text-[#185FA5] dark:text-[#85B7EB]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {stats.map(({ label, icon: Icon, value, sub, valueClass, progress }) => (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4"
          key={label}
        >
          <div className="flex items-center gap-1.5 font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
            <Icon className="size-3.5" />
            {label}
          </div>
          <div>
            <p className={`font-medium text-3xl leading-none ${valueClass}`}>
              {value}
            </p>
            {progress !== undefined && (
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#639922] transition-all dark:bg-[#97C459]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <p className="mt-1.5 text-muted-foreground text-xs">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
