"use client";

import { MoreVertical } from "lucide-react";
import { Route } from "next";
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

  const handleAction = () => {
    setIsOpen(false);
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger
        aria-label="Event actions"
        className="rounded-full p-2 transition-colors hover:bg-muted md:rounded-md"
      >
        <MoreVertical size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 md:w-48" sideOffset={10}>
        <ViewDetailsButton eventId={eventId} onAction={handleAction} />
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
