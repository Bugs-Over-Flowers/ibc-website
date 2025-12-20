"use client";
import { ChevronRight, MoreHorizontal, QrCodeIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Enums } from "@/lib/supabase/db.types";
import QRCodeDialog from "./QRCodeDialog";

interface RegistrationRowActionsProps {
  data: {
    registrationIdentifier: string;
    registrationId: string;
    email: string;
    paymentStatus: Enums<"PaymentStatus">;
    proofOfPaymentImageURL?: string;
    affiliation: string;
  };
  isDetailsPage: boolean;
}

export default function RegistrationRowActions({
  data,
  isDetailsPage,
}: RegistrationRowActionsProps) {
  const { eventId } = useParams<{ eventId: string }>();

  const [qrcodeDialog, setQrcodeDialog] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={"w-46"}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {!isDetailsPage && (
              <DropdownMenuItem
                nativeButton={false}
                render={
                  <Link
                    href={
                      `/admin/events/${eventId}/registration-list/registration/${data.registrationId}` as Route
                    }
                  >
                    <ChevronRight />
                    View Registration Details
                  </Link>
                }
              />
            )}

            <DropdownMenuItem onClick={() => setQrcodeDialog(true)}>
              <QrCodeIcon />
              QR Code
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <QRCodeDialog
        affiliation={data.affiliation}
        email={data.email}
        eventId={eventId}
        open={qrcodeDialog}
        registrationId={data.registrationId}
        registrationIdentifier={data.registrationIdentifier}
        setOpen={setQrcodeDialog}
      />
    </>
  );
}
