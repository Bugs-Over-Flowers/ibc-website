"use client";

import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/app/admin/events/_components/ConfirmDeleteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AttendanceModal from "../AttendanceModal";
import AttendanceButton from "./AttendanceButton";
import DeleteButton from "./DeleteButton";
import ViewDetailsButton from "./ViewDetailsButton";

interface EventActionsDropdownProps {
  eventId: string;
  status: string;
}

export default function EventActionsDropdown({
  eventId,
  status,
}: EventActionsDropdownProps) {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          aria-label="Event actions"
          className="rounded-full p-2 transition-colors hover:bg-muted md:rounded-md"
        >
          <MoreVertical size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 md:w-48"
          sideOffset={10}
        >
          <ViewDetailsButton eventId={eventId} />
          <AttendanceButton
            handleClick={() => {
              setIsAttendanceModalOpen(true);
            }}
          />
          {status === "draft" && (
            <>
              <DropdownMenuSeparator />
              <DeleteButton
                handleClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
              />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        setIsOpen={setIsAttendanceModalOpen}
      />
      <ConfirmDeleteDialog
        eventId={eventId}
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      />
    </>
  );
}
