"use client";

import { format, isToday } from "date-fns";
import { AlertCircle, CalendarDays, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { getEventDays } from "@/server/events/queries/getEventDays";

type EventDay = Database["public"]["Tables"]["EventDay"]["Row"];

interface AttendanceModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  eventId: string;
}

export default function AttendanceModal({
  isOpen,
  setIsOpen,
  eventId,
}: AttendanceModalProps) {
  const router = useRouter();
  const { execute, data, error, isPending } = useAction(tryCatch(getEventDays));

  const handleExecute = useEffectEvent((isOpen: boolean, eventId: string) => {
    if (isOpen && eventId) execute({ eventId });
  });

  useEffect(() => {
    handleExecute(isOpen, eventId);
  }, [isOpen, eventId]);

  const handleClick = (eventDayId: string) => {
    setIsOpen(false);
    router.push(`/admin/events/check-in/${eventDayId}`);
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent
        className="w-[calc(100vw-1.5rem)] max-w-[54rem] gap-0 overflow-hidden rounded-2xl p-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="font-medium text-base">
              Check attendance
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select a day to check attendance.
            </DialogDescription>
          </div>
          <Link
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted/50"
            href={`/admin/events/${eventId}/check-in-list`}
          >
            View all
            <ChevronRight className="size-3" />
          </Link>
        </div>

        {/* Loading */}
        {isPending && (
          <div className="flex items-center justify-center gap-2.5 py-10 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading event days…
          </div>
        )}

        {/* Error */}
        {error && !isPending && (
          <div className="m-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-destructive text-xs">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {typeof error === "string"
              ? error
              : "Failed to load event days. Please try again."}
          </div>
        )}

        {/* Empty */}
        {data && !isPending && data.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <CalendarDays className="size-8 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              No event days found.
            </p>
          </div>
        )}

        {/* Day list */}
        {data && !isPending && data.length > 0 && (
          <ul className="flex max-h-[50vh] flex-col gap-1.5 overflow-y-auto p-3">
            {data.map((day: EventDay) => {
              const eventDate = new Date(day.eventDate);
              const isEventToday = isToday(eventDate);
              return (
                <li key={day.eventDayId}>
                  <button
                    className={cn(
                      "group w-full rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-border/80 hover:bg-muted/40",
                      isEventToday &&
                        "border-[#85B7EB] bg-[#E6F1FB] dark:border-[#185FA5] dark:bg-[#042C53]",
                    )}
                    onClick={() => handleClick(day.eventDayId)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-medium text-sm",
                              isEventToday
                                ? "text-[#0C447C] dark:text-[#B5D4F4]"
                                : "text-foreground",
                            )}
                          >
                            {day.label}
                          </span>
                          {isEventToday && (
                            <span className="rounded-full bg-[#B5D4F4] px-2 py-0.5 font-medium text-[#0C447C] text-[10px] dark:bg-[#0C447C] dark:text-[#B5D4F4]">
                              Today
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-xs",
                            isEventToday
                              ? "text-[#185FA5] dark:text-[#85B7EB]"
                              : "text-muted-foreground",
                          )}
                        >
                          {format(eventDate, "EEEE, MMMM do, yyyy")}
                        </span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "size-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                          isEventToday
                            ? "text-[#185FA5] dark:text-[#85B7EB]"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
