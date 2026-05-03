"use client";

import {
  ChevronRight,
  Clock,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
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
import ViewRemarkDialog from "./ViewRemarkDialog";

interface CheckInRowActionsProps {
  checkInId: string;
  registrationId: string;
  checkInTime: string;
  eventDayId: string;
  remarks: string | null;
  participantName: string;
}

export default function CheckInRowActions({
  checkInId,
  registrationId,
  checkInTime,
  eventDayId,
  remarks,
  participantName,
}: CheckInRowActionsProps) {
  const { eventId } = useParams<{ eventId: string }>();

  const [isEditOpen, setEditOpen] = useState(false);
  const [isRemarkEditOpen, setRemarkEditOpen] = useState(false);

  const hasRemark = remarks !== null && remarks.length > 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Open check-in row actions"
              size="icon-sm"
              variant="ghost"
            />
          }
        >
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
              onClick={() => {
                setRemarkEditOpen(true);
              }}
            >
              <MessageSquare />
              {hasRemark ? "Edit Remark" : "Add Remark"}
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
      <ViewRemarkDialog
        checkInId={checkInId}
        editOnOpen
        onOpenChange={setRemarkEditOpen}
        open={isRemarkEditOpen}
        participantName={participantName}
        remarks={remarks}
      />
    </>
  );
}
