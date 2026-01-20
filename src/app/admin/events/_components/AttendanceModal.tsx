import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEventDayFetchContext } from "../_hooks/useEventDayFetchContext";

interface AttendanceModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function AttendanceModal({
  isOpen,
  setIsOpen,
}: AttendanceModalProps) {
  const { getAllEventDaysByEventId } = useEventDayFetchContext();
  const eventDays = use(getAllEventDaysByEventId);
  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent>
        <DialogTitle>Check Attendance</DialogTitle>
        <DialogDescription>
          Please select a day to check attendance.
        </DialogDescription>
        <ul className="flex flex-col gap-3">
          {eventDays.map((day) => (
            <Link
              href={`/admin/events/check-in/${day.eventDayId}`}
              key={day.eventDayId}
            >
              <Button
                className={"flex h-full w-full flex-col gap-2 py-3"}
                variant={"outline"}
              >
                <div className="text-lg">{day.label}</div>
                <div>{day.eventDate}</div>
              </Button>
            </Link>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
