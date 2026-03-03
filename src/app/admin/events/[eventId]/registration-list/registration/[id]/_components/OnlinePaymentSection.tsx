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
import { useOptimisticAction } from "@/hooks/useAction";
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
  registrationId,
  paymentProofStatus,
  getStatusColor,
  proofImageURL,
}: OnlinePaymentSectionProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "accepted" | "rejected" | null
  >(null);

  // Early validation - ensure URL is valid before any rendering
  const validProofImageURL =
    proofImageURL && typeof proofImageURL === "string"
      ? proofImageURL.trim()
      : null;

  const paymentAction = async (
    registration: string,
    nextStatus: "accepted" | "rejected",
  ) => {
    if (nextStatus === "accepted") {
      return verifyPayment(registration);
    }

    return rejectPayment(registration);
  };

  const {
    execute: updatePaymentStatus,
    optimistic: optimisticPaymentProofStatus,
    isPending,
  } = useOptimisticAction(tryCatch(paymentAction), paymentProofStatus, {
    optimisticUpdate: (_prev, _registrationId, nextStatus) => nextStatus,
  });

  const handleStatusChange = async (nextStatus: "accepted" | "rejected") => {
    if (
      isPending ||
      optimisticPaymentProofStatus === nextStatus ||
      (nextStatus === "accepted" &&
        optimisticPaymentProofStatus === "rejected") ||
      (nextStatus === "rejected" && optimisticPaymentProofStatus === "accepted")
    ) {
      // prevent duplicate submissions or conflicting transitions
      if (nextStatus === "rejected") {
        setIsAlertOpen(false);
      }
      return;
    }

    setPendingAction(nextStatus);

    const result = await updatePaymentStatus(registrationId, nextStatus);

    if (!result.success) {
      toast.error(result.error);
      if (nextStatus === "rejected") {
        setIsAlertOpen(false);
      }
    } else {
      toast.success(result.data);
      if (nextStatus === "rejected") {
        setIsAlertOpen(false);
      }
    }

    setPendingAction(null);
  };

  const hasProofImage = Boolean(
    validProofImageURL && validProofImageURL.length > 0,
  );

  const isVerifyPending = isPending && pendingAction === "accepted";
  const isRejectPending = isPending && pendingAction === "rejected";

  return (
    <>
      {hasProofImage && (
        <>
          <ImageZoom className="relative h-96 w-full touch-none select-none">
            <Image
              alt="Proof of Payment Image"
              className="object-contain"
              fill
              src={validProofImageURL as string}
            />
          </ImageZoom>
          <div className="text-neutral-600">click on the image to zoom in</div>
        </>
      )}
      <div>
        <Badge
          className={cn("capitalize", getStatusColor(paymentProofStatus))}
          variant="outline"
        >
          {isVerifyPending ? "Verifying..." : optimisticPaymentProofStatus}
        </Badge>
      </div>
      <div className="flex gap-2">
        {/* Accepted */}
        <Button
          disabled={isPending || optimisticPaymentProofStatus === "accepted"}
          onClick={() => handleStatusChange("accepted")}
        >
          {isVerifyPending
            ? "Verifying..."
            : optimisticPaymentProofStatus === "accepted"
              ? "Verified"
              : "Verify Payment"}
        </Button>
        <AlertDialog onOpenChange={setIsAlertOpen} open={isAlertOpen}>
          {/* Reject Button */}
          <AlertDialogTrigger
            className={buttonVariants({ variant: "destructive" })}
            disabled={isPending || optimisticPaymentProofStatus === "rejected"}
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
                className="bg-red-600 hover:bg-red-700 data-disabled:opacity-50"
                disabled={isRejectPending}
                onClick={(e) => {
                  e.preventDefault();
                  void handleStatusChange("rejected");
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
