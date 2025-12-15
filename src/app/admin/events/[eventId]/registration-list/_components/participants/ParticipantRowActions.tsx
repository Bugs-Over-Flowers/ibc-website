import { ChevronRight, MoreHorizontal } from "lucide-react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() =>
            router.push(
              `/admin/event/${eventId}/registration-list/registration/${registrationId}` as Route,
            )
          }
        >
          <ChevronRight />
          View Registration Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
