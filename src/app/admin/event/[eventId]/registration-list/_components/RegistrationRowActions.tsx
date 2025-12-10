import {
  Check,
  ChevronRight,
  MoreHorizontal,
  QrCodeIcon,
  X,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Enums } from "@/lib/supabase/db.types";

interface RegistrationRowActionsProps {
  data: {
    registrationId: string;
    email: string;
    eventId: string;
    paymentStatus: Enums<"PaymentStatus">;
  };
}

export default function RegistrationRowActions({
  data,
}: RegistrationRowActionsProps) {
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
              `/admin/event/${data.eventId}/registration-list/registration/${data.registrationId}` as Route,
            )
          }
        >
          <ChevronRight />
          View Details
        </DropdownMenuItem>

        <DropdownMenuItem>
          <QrCodeIcon />
          Reissue QR Code
        </DropdownMenuItem>

        {data.paymentStatus === "pending" && (
          <DropdownMenuItem>
            <Check />
            Verify Payment
          </DropdownMenuItem>
        )}
        {data.paymentStatus === "verified" && (
          <DropdownMenuItem>
            <X />
            Mark as Unpaid
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
