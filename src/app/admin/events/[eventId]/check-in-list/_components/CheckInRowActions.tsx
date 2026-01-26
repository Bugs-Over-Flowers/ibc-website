"use client";

import { ChevronRight, Clock, MoreHorizontal } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditCheckInTimeDialog from "./EditCheckInTimeDialog";

interface CheckInRowActionsProps {
  checkInId: string;
  registrationId: string;
  checkInTime: string;
  eventDayId: string;
}

export default function CheckInRowActions({
  checkInId,
  registrationId,
  checkInTime,
  eventDayId,
}: CheckInRowActionsProps) {
  const { eventId } = useParams<{ eventId: string }>();

  const [isEditOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setEditOpen(true);
              }}
            >
              <Clock />
              Edit Check-In Time
            </DropdownMenuItem>
            <DropdownMenuItem
              nativeButton={false}
              render={
                <Link
                  href={
                    `/admin/events/${eventId}/registration-list/registration/${registrationId}` as Route
                  }
                >
                  <ChevronRight />
                  Registration Details
                </Link>
              }
            />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditCheckInTimeDialog
        checkInId={checkInId}
        currentTime={checkInTime}
        eventDayId={eventDayId}
        isOpen={isEditOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
