"use client";

import { Logs } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface RegistrationsButtonProps {
  eventId: string;
  onAction: () => void;
}

export default function RegistrationsButton({
  eventId,
  onAction,
}: RegistrationsButtonProps) {
  const router = useRouter();

  const handleViewRegistrations = () => {
    router.push(`/admin/events/${eventId}/registration-list?tab=registrations`);
    if (onAction) onAction();
  };

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={handleViewRegistrations}
    >
      <Logs className="mr-2 h-4 w-4" />
      <span>View Registrations</span>
    </DropdownMenuItem>
  );
}
