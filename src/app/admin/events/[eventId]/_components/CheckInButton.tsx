"use client";

import { UserCheck2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AttendanceModal from "../../_components/AttendanceModal";

export default function CheckInButton({ eventId }: { eventId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
      >
        <UserCheck2Icon className="mr-1.5 h-3.5 w-3.5" />
        Check In
      </Button>
      <AttendanceModal
        eventId={eventId}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
}
