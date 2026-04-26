"use client";

import { ChevronRight, Images, MoreHorizontal, QrCodeIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import PaymentProofReviewDialog from "@/app/admin/events/_components/PaymentProof/PaymentProofReviewDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Enums } from "@/lib/supabase/db.types";
import { verifyPayment } from "@/server/registration/mutations/verifyPayment";
import QRCodeDialog from "./QRCodeDialog";

interface RegistrationRowActionsProps {
  data: {
    registrationIdentifier: string;
    registrationId: string;
    email: string;
    paymentMethod: Enums<"PaymentMethod">;
    paymentProofStatus: Enums<"PaymentProofStatus">;
    affiliation: string;
    registrantName: string;
  };
  eventTitle: string;
  isDetailsPage: boolean;
}

export default function RegistrationRowActions({
  data,
  isDetailsPage,
  eventTitle,
}: RegistrationRowActionsProps) {
  const { eventId } = useParams<{ eventId: string }>();

  const [qrcodeDialog, setQrcodeDialog] = useState(false);
  const [paymentProofDialog, setPaymentProofDialog] = useState(false);
  const shouldShowPaymentProofAction = data.paymentMethod === "BPI";

  return (
    <>
      {isDetailsPage ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-label="Open QR code dialog"
            onClick={() => setQrcodeDialog(true)}
            size="sm"
            variant="outline"
          >
            <QrCodeIcon className="mr-1.5 size-3.5" />
            QR Code
          </Button>

          {shouldShowPaymentProofAction && (
            <Button
              aria-label="Open payment proof review dialog"
              onClick={() => setPaymentProofDialog(true)}
              size="sm"
              variant="outline"
            >
              <Images className="mr-1.5 size-3.5" />
              Review Payment Proof
            </Button>
          )}
        </div>
      ) : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            render={
              <Button
                aria-label="Open registration actions"
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
              {!isDetailsPage && (
                <DropdownMenuItem
                  nativeButton={false}
                  render={
                    <Link
                      href={
                        `/admin/events/${eventId}/registration-list/registration/${data.registrationId}` as Route
                      }
                    >
                      <ChevronRight className="size-3.5" />
                      Registration Details
                    </Link>
                  }
                />
              )}

              <DropdownMenuItem onClick={() => setQrcodeDialog(true)}>
                <QrCodeIcon className="size-3.5" />
                QR Code
              </DropdownMenuItem>

              {shouldShowPaymentProofAction && (
                <DropdownMenuItem onClick={() => setPaymentProofDialog(true)}>
                  <Images className="size-3.5" />
                  Review Payment Proof
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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
        <PaymentProofReviewDialog
          initialPaymentProofStatus={data.paymentProofStatus}
          onAcceptAction={async (id) => {
            const result = await verifyPayment(id);
            return {
              message: result,
              status: "accepted" as const,
            };
          }}
          onOpenChange={setPaymentProofDialog}
          onStatusChange={() => {
            setPaymentProofDialog(false);
          }}
          open={paymentProofDialog}
          page="registration-details"
          registrationData={{
            registrationId: data.registrationId,
            eventTitle,
            registrantName: data.registrantName,
            registrantEmail: data.email,
          }}
        />
      )}
    </>
  );
}
