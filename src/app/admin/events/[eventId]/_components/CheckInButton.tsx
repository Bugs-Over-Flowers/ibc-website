"use client";

import { UserCheck2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AttendanceModal from "../../_components/AttendanceModal";

interface CheckInButtonProps {
  eventId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export default function CheckInButton({
  eventId,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: CheckInButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen =
    isControlled && onOpenChange ? onOpenChange : setInternalOpen;

  return (
    <>
      {!hideTrigger && (
        <Button
          className={"w-full"}
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
        >
          <UserCheck2Icon className="mr-1.5 h-3.5 w-3.5" />
          Check In
        </Button>
      )}
      <AttendanceModal
        eventId={eventId}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
}
