"use client";

import { ChevronRight, Images, MoreHorizontal, QrCodeIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import RegistrationProofDialog from "@/app/admin/events/_components/PaymentProof/RegistrationProofDialog";
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
    paymentMethod: Enums<"PaymentMethod">;
    paymentProofStatus: Enums<"PaymentProofStatus">;
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
  const [paymentProofDialog, setPaymentProofDialog] = useState(false);
  const shouldShowPaymentProofAction = data.paymentMethod === "BPI";

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
                    Registration Details
                  </Link>
                }
              />
            )}

            <DropdownMenuItem onClick={() => setQrcodeDialog(true)}>
              <QrCodeIcon />
              QR Code
            </DropdownMenuItem>

            {shouldShowPaymentProofAction && (
              <DropdownMenuItem onClick={() => setPaymentProofDialog(true)}>
                <Images />
                Review Payment Proof
              </DropdownMenuItem>
            )}
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

      {shouldShowPaymentProofAction && (
        <RegistrationProofDialog
          onOpenChange={setPaymentProofDialog}
          onStatusChange={() => {
            setPaymentProofDialog(false);
          }}
          open={paymentProofDialog}
          paymentProofStatus={data.paymentProofStatus}
          registrationId={data.registrationId}
        />
      )}
    </>
  );
}
