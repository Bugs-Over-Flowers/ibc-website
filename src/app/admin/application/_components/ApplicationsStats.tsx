"use client";
import { Calendar, CheckCircle, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ApplicationTab } from "./ApplicationsTabs";

interface ApplicationsStatsProps {
  activeTab: ApplicationTab;
  counts: { new: number; pending: number; finished: number };
  onTabChange: (tab: ApplicationTab) => void;
}

const items = [
  {
    tab: "new" as const,
    label: "New Applications",
    icon: Users,
    activeCard:
      "border-[#0F6E56] bg-[#E1F5EE] dark:border-[#5DCAA5] dark:bg-[#085041]",
    activeIconWrap: "bg-[#C0DD97] dark:bg-[#0F6E56]",
    activeIcon: "text-[#27500A] dark:text-[#9FE1CB]",
    activeValue: "text-[#085041] dark:text-[#9FE1CB]",
    activeDot: "bg-[#0F6E56] dark:bg-[#5DCAA5]",
  },
  {
    tab: "pending" as const,
    label: "Pending Interviews",
    icon: Calendar,
    activeCard:
      "border-[#185FA5] bg-[#E6F1FB] dark:border-[#85B7EB] dark:bg-[#0C447C]",
    activeIconWrap: "bg-[#B5D4F4] dark:bg-[#185FA5]",
    activeIcon: "text-[#0C447C] dark:text-[#B5D4F4]",
    activeValue: "text-[#0C447C] dark:text-[#B5D4F4]",
    activeDot: "bg-[#185FA5] dark:bg-[#85B7EB]",
  },
  {
    tab: "finished" as const,
    label: "Finished Meetings",
    icon: CheckCircle,
    activeCard:
      "border-[#854F0B] bg-[#FAEEDA] dark:border-[#EF9F27] dark:bg-[#633806]",
    activeIconWrap: "bg-[#FAC775] dark:bg-[#854F0B]",
    activeIcon: "text-[#633806] dark:text-[#FAC775]",
    activeValue: "text-[#633806] dark:text-[#FAC775]",
    activeDot: "bg-[#854F0B] dark:bg-[#EF9F27]",
  },
];

export default function ApplicationsStats({
  activeTab,
  counts,
  onTabChange,
}: ApplicationsStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map(
        ({
          tab,
          label,
          icon: Icon,
          activeCard,
          activeIconWrap,
          activeIcon,
          activeValue,
          activeDot,
        }) => {
          const isActive = activeTab === tab;
          return (
            <button
              aria-pressed={isActive}
              className="text-left"
              key={tab}
              onClick={() => onTabChange(tab)}
              type="button"
            >
              <Card
                className={cn(
                  "rounded-2xl border-[1.5px] border-border/70 bg-card transition-colors",
                  isActive ? activeCard : "hover:bg-muted/40",
                )}
              >
                <CardContent className="flex flex-col gap-3 px-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg bg-muted",
                        isActive && activeIconWrap,
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          isActive ? activeIcon : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "size-[7px] rounded-full opacity-0 transition-opacity",
                        isActive && `${activeDot} opacity-100`,
                      )}
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-muted-foreground text-xs">
                      {label}
                    </p>
                    <p
                      className={cn(
                        "font-bold text-3xl leading-none tracking-tight",
                        isActive ? activeValue : "text-foreground",
                      )}
                    >
                      {counts[tab]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        },
      )}
    </div>
  );
}
