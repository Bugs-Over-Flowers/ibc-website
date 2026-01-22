import { Ellipsis } from "lucide-react";
import { useState } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ParticipantCheckInRow } from "../_types/checkInTable";

interface CheckInItemActionsProps {
  participant: ParticipantCheckInRow;
}

export default function CheckInItemActions({
  participant,
}: CheckInItemActionsProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
        <DropdownMenuGroup>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              Actions
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
            >
              Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuGroup>
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

function StopPropagationButton({
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) {
  return (
    <Button
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        props.onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
}
