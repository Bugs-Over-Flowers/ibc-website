import { ChevronRight, MoreHorizontal } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
