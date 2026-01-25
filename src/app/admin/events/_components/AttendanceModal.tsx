"use client";

import { formatDate } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Database } from "@/lib/supabase/db.types";
import { getEventDays } from "@/server/events/actions/getEventDays";

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

  // Fetch event days when modal opens (no tryCatch - getEventDays already returns ServerFunctionResult)
  const { execute, data, error, isPending } = useAction(tryCatch(getEventDays));

  // Fetch data when modal opens or eventId changes
  useEffect(() => {
    if (isOpen && eventId) {
      execute({ eventId });
    }
  }, [isOpen, eventId, execute]);

  const handleClick = (eventDayId: string) => {
    setIsOpen(false);
    router.push(`/admin/events/check-in/${eventDayId}`);
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Check Attendance</DialogTitle>
        <DialogDescription>
          Please select a day to check attendance.
        </DialogDescription>

        {isPending && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !isPending && (
          <DialogDescription className="text-destructive">
            {typeof error === "string" ? error : "Failed to load event days"}
          </DialogDescription>
        )}

        {data && !isPending && (
          <ul className="flex h-full flex-col gap-3">
            {data.map((day: EventDay) => (
              <Button
                className={"flex h-20 flex-col gap-2"}
                key={day.eventDayId}
                onClick={() => handleClick(day.eventDayId)}
                variant={"outline"}
              >
                <div className="text-lg">{day.label}</div>
                <div>{formatDate(day.eventDate, "EEEE, MMMM do, yyyy")}</div>
              </Button>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
