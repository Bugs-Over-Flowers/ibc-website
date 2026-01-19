"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ParticipantsButtonProps {
  eventId: string;
  onAction: () => void;
}

export default function ParticipantsButton({
  eventId,
  onAction,
}: ParticipantsButtonProps) {
  const router = useRouter();

  const handleViewParticipants = () => {
    router.push(`/admin/events/${eventId}/registration-list?tab=participants`);
    if (onAction) onAction();
  };

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={handleViewParticipants}
    >
      <Users className="mr-2 h-4 w-4" />
      <span>View Participants</span>
    </DropdownMenuItem>
  );
}
