import { ChevronRight, MoreHorizontal } from "lucide-react";
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

interface CheckInRowActionsProps {
  registrationId: string;
}

export default function CheckInRowActions({
  registrationId,
}: CheckInRowActionsProps) {
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
            render={
              <Link
                href={`/admin/events/${eventId}/registration-list/registration/${registrationId}`}
              >
                <ChevronRight />
                View Registration Details
              </Link>
            }
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
