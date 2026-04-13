import { ChevronRight, MoreHorizontal, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StopPropagationButton } from "@/components/StopPropagationButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ParticipantCheckInRow } from "../_types/checkInTable";

interface CheckInItemActionsProps {
  participant: Pick<
    ParticipantCheckInRow,
    "firstName" | "lastName" | "email" | "contactNumber"
  >;
  eventId: string;
  registrationId: string;
}

export default function CheckInItemActions({
  participant,
  eventId,
  registrationId,
}: CheckInItemActionsProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
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
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
            >
              <User className="size-3.5" />
              Participant details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/admin/events/${eventId}/registration-list/registration/${registrationId}`,
                );
              }}
            >
              <ChevronRight className="size-3.5" />
              View registration
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog onOpenChange={setIsDetailsOpen} open={isDetailsOpen}>
        <DialogContent className="max-w-sm gap-0 p-0" showCloseButton={false}>
          <div className="border-b px-5 py-4">
            <DialogTitle className="font-medium text-base">
              {participant.firstName} {participant.lastName}
            </DialogTitle>
          </div>
          <div className="flex flex-col gap-3 px-5 py-4">
            <div>
              <p className="mb-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                Email
              </p>
              <p className="text-sm">{participant.email}</p>
            </div>
            <div>
              <p className="mb-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                Contact number
              </p>
              <p className="text-sm">{participant.contactNumber}</p>
            </div>
          </div>
          <DialogFooter className="justify-end border-t px-5 py-3">
            <DialogClose
              render={
                <StopPropagationButton size="sm" variant="outline">
                  Close
                </StopPropagationButton>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
