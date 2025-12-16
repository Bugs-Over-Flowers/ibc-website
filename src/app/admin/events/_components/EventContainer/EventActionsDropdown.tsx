"use client";

import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "./DeleteButton";
import QrButton from "./QrButton";
import ViewDetailsButton from "./ViewDetailsButton";

interface EventActionsDropdownProps {
  eventId: string;
  status: string;
}

export default function EventActionsDropdown({
  eventId,
  status,
}: EventActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleAction = () => {
    setIsOpen(false);
  };

  const handleEventDetails = () => {
    router.push(`/admin/events/${eventId}`);
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Event actions"
          className="rounded-full p-2 transition-colors hover:bg-muted md:rounded-md"
          type="button"
        >
          <MoreVertical size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 md:w-48" sideOffset={10}>
        <ViewDetailsButton eventId={eventId} onAction={handleEventDetails} />
        <QrButton eventId={eventId} onAction={handleAction} />
        {status === "draft" && (
          <>
            <DropdownMenuSeparator />
            <DeleteButton id={eventId} onAction={handleAction} />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
