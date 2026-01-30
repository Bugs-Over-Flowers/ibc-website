import { ChevronRight, MoreHorizontal } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ParticipantRowActionsProps {
  registrationId: string;
}

export default function ParticipantRowActions({
  registrationId,
}: ParticipantRowActionsProps) {
  const { eventId } = useParams<{ eventId: string }>();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"w-46"}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
  );
}
