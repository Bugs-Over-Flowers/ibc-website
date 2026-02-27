import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { useAction, useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { rejectPayment } from "@/server/registration/mutations/rejectPayment";
import { verifyPayment } from "@/server/registration/mutations/verifyPayment";

type OnlinePaymentSectionProps = {
  paymentProofStatus: Enums<"PaymentProofStatus">;
  getStatusColor: (status: string) => string;
  proofImageURL?: string | null;
  registrationId: string;
};

export default function OnlinePaymentSection({
  paymentProofStatus,
  getStatusColor,
  proofImageURL,
  registrationId,
}: OnlinePaymentSectionProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Early validation - ensure URL is valid before any rendering
  const validProofImageURL =
    proofImageURL && typeof proofImageURL === "string"
      ? proofImageURL.trim()
      : null;

  const {
    execute: verify,
    optimistic: optimisticPaymentProofStatus,
    isPending: isVerifyPending,
  } = useOptimisticAction(tryCatch(verifyPayment), paymentProofStatus, {
    optimisticUpdate: (_prev) => "accepted",
    onSuccess: (msg) => {
      toast.success(msg);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: reject, isPending: isRejectPending } = useAction(
    tryCatch(rejectPayment),
    {
      onSuccess: (msg) => {
        toast.success(msg);
        setIsAlertOpen(false);
      },
      onError: (error) => {
        toast.error(error);
        setIsAlertOpen(false);
      },
    },
  );

  const hasProofImage = Boolean(
    validProofImageURL && validProofImageURL.length > 0,
  );

  const isPending = isVerifyPending || isRejectPending;

  return (
    <>
      {hasProofImage && validProofImageURL ? (
        <>
          <ImageZoom className="relative h-96 w-full touch-none select-none">
            <Image
              alt="Proof of Payment Image"
              className="object-contain"
              fill
              src={validProofImageURL}
            />
          </ImageZoom>
          <div className="text-neutral-600">click on the image to zoom in</div>
        </>
      ) : null}
      <div>
        <Badge
          className={cn(
            "capitalize",
            getStatusColor(optimisticPaymentProofStatus),
          )}
          variant="outline"
        >
          {isVerifyPending
            ? "Verifying..."
            : isRejectPending
              ? "Rejecting..."
              : optimisticPaymentProofStatus}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button
          disabled={
            isPending ||
            optimisticPaymentProofStatus === "accepted" ||
            optimisticPaymentProofStatus === "rejected"
          }
          onClick={() => verify(registrationId)}
        >
          {isVerifyPending
            ? "Verifying..."
            : optimisticPaymentProofStatus === "accepted"
              ? "Verified"
              : "Verify Payment"}
        </Button>
        <AlertDialog onOpenChange={setIsAlertOpen} open={isAlertOpen}>
          <AlertDialogTrigger
            className={buttonVariants({ variant: "destructive" })}
            disabled={
              isPending ||
              optimisticPaymentProofStatus === "rejected" ||
              optimisticPaymentProofStatus === "accepted"
            }
          >
            {isRejectPending
              ? "Rejecting..."
              : optimisticPaymentProofStatus === "rejected"
                ? "Rejected"
                : "Reject Payment"}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Payment?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this payment proof? This action
                cannot be undone and the user will be notified via email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 data-[disabled]:opacity-50"
                disabled={isRejectPending}
                onClick={(e) => {
                  e.preventDefault();
                  reject(registrationId);
                }}
              >
                {isRejectPending ? "Rejecting..." : "Reject"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
