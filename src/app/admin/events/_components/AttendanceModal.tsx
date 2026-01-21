import { formatDate } from "date-fns";
import { useRouter } from "next/navigation";
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

  const router = useRouter();

  const handleClick = (eventDayId: string) => {
    setIsOpen(false);
    router.push(`/admin/events/check-in/${eventDayId}`);
  };
  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent>
        <DialogTitle>Check Attendance</DialogTitle>
        <DialogDescription>
          Please select a day to check attendance.
        </DialogDescription>
        <ul className="flex h-full flex-col gap-3">
          {eventDays.map((day) => (
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
      </DialogContent>
    </Dialog>
  );
}
