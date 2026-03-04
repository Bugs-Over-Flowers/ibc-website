"use client";

import { Ellipsis, Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScanQR } from "../../_hooks/useScanQR";

interface CheckInRegistrationRowActionsProps {
  eventDayId: string;
  eventId: string;
  registrationIdentifier: string;
}

export default function CheckInRegistrationRowActions({
  eventDayId,
  eventId,
  registrationIdentifier,
}: CheckInRegistrationRowActionsProps) {
  const { execute: scanQRData, isPending } = useScanQR({ eventId });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            onClick={(event) => {
              event.stopPropagation();
            }}
            size="icon"
            variant="outline"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Ellipsis />}
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={isPending}
            onClick={(event) => {
              event.stopPropagation();
              scanQRData(registrationIdentifier, eventDayId);
            }}
          >
            <ScanLine />
            Select for Check-In
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
