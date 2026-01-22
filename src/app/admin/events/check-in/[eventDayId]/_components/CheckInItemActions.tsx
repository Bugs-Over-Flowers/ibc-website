import { ChevronRightIcon, Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StopPropagationButton } from "@/components/StopPropagationButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
              onClick={(e) => {
                e.stopPropagation();
              }}
              variant={"outline"}
            >
              <Ellipsis />
            </Button>
          }
        />
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>More</DropdownMenuLabel>
            <Separator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
            >
              <ChevronRightIcon />
              Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  `/admin/events/${eventId}/registration-list/registration/${registrationId}`,
                );
              }}
            >
              <ChevronRightIcon />
              View Registration Details
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ParticipantDetailsDialog
        contactNumber={participant.contactNumber}
        email={participant.email}
        fullName={`${participant.firstName} ${participant.lastName}`}
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
      />
    </>
  );
}

interface ParticipantDetailsDialogProps {
  email: string;
  fullName: string;
  contactNumber: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function ParticipantDetailsDialog({
  email,
  fullName,
  contactNumber,
  isOpen,
  setIsOpen,
}: ParticipantDetailsDialogProps) {
  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>{fullName}</DialogTitle>
        <Card>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="font-medium">Email</h4>
                <p className="text-muted-foreground text-sm">{email}</p>
              </div>
              <div>
                <h4 className="font-medium">Contact Number</h4>
                <p className="text-muted-foreground text-sm">{contactNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <DialogFooter>
          <DialogClose
            render={
              <StopPropagationButton variant={"outline"}>
                Close
              </StopPropagationButton>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
