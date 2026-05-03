"use client";

import { ChevronRight, MoreHorizontal, QrCode } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ParticipantQRCodeDialog } from "./ParticipantQRCodeDialog";

interface ParticipantRowActionsProps {
  registrationId: string;
  affiliation: string;
  participantIdentifier?: string;
  participantName?: string;
  email?: string;
}

export default function ParticipantRowActions({
  registrationId,
  participantIdentifier,
  participantName,
  email,
  affiliation,
}: ParticipantRowActionsProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Open participant actions"
              className="size-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
              size="sm"
              variant="ghost"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem
              nativeButton={false}
              render={
                <Link
                  href={
                    `/admin/events/${eventId}/registration-list/registration/${registrationId}` as Route
                  }
                >
                  <ChevronRight className="size-3.5" />
                  Registration Details
                </Link>
              }
            />
            {participantIdentifier && (
              <DropdownMenuItem onClick={() => setQrOpen(true)}>
                <QrCode className="size-3.5" />
                Show QR Code
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {participantIdentifier && (
        <ParticipantQRCodeDialog
          affiliation={affiliation}
          email={email ?? ""}
          onOpenChange={setQrOpen}
          open={qrOpen}
          participantIdentifier={participantIdentifier}
          participantName={participantName ?? ""}
        />
      )}
    </>
  );
}
