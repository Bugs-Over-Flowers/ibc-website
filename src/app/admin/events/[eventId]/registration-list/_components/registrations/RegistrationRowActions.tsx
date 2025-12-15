"use client";
import { ChevronRight, MoreHorizontal, QrCodeIcon } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Enums } from "@/lib/supabase/db.types";
import QRCodeDialog from "./QRCodeDialog";

interface RegistrationRowActionsProps {
  data: {
    registrationId: string;
    email: string;
    eventId: string;
    paymentStatus: Enums<"PaymentStatus">;
    proofOfPaymentImageURL?: string;
  };
  isDetailsPage: boolean;
}

export default function RegistrationRowActions({
  data,
  isDetailsPage,
}: RegistrationRowActionsProps) {
  const router = useRouter();

  const [qrcodeDialog, setQrcodeDialog] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {!isDetailsPage && (
            <DropdownMenuItem
              onSelect={() =>
                router.push(
                  `/admin/event/${data.eventId}/registration-list/registration/${data.registrationId}` as Route,
                )
              }
            >
              <ChevronRight />
              View Registration Details
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setQrcodeDialog(true)}>
            <QrCodeIcon />
            QR Code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <QRCodeDialog
        email={data.email}
        eventId={data.eventId}
        open={qrcodeDialog}
        registrationId={data.registrationId}
        setOpen={setQrcodeDialog}
      />
    </>
  );
}
