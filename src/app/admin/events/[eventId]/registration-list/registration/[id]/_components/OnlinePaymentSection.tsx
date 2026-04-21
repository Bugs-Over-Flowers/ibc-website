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
  proofImageURL?: string;
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

  const isVerifyPending = isPending && pendingAction === "accepted";
  const isRejectPending = isPending && pendingAction === "rejected";
  const statusBadgeLabel = isVerifyPending
    ? "Verifying..."
    : optimisticPaymentProofStatus === "pending"
      ? "Pending Review"
      : optimisticPaymentProofStatus === "accepted"
        ? "Accepted"
        : "Rejected";

  return (
    <div className="space-y-4">
      {proofImageURL && (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-2">
            <ImageZoom className="relative h-80 w-full touch-none select-none rounded-lg bg-background">
              <Image
                alt="Proof of Payment Image"
                className="object-contain"
                fill
                src={proofImageURL}
              />
            </ImageZoom>
          </div>
          <p className="text-muted-foreground text-xs">
            Click image to zoom in.
          </p>
        </div>
      )}

      <div className="flex items-center">
        <Badge
          className={cn(
            "capitalize",
            getStatusColor(optimisticPaymentProofStatus),
          )}
          variant="outline"
        >
          {statusBadgeLabel}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          className="min-w-24"
          disabled={
            isPending ||
            optimisticPaymentProofStatus === "accepted" ||
            optimisticPaymentProofStatus === "rejected"
          }
          onClick={() => handleStatusChange("accepted")}
          size="sm"
        >
          {isVerifyPending ? "Verifying..." : "Accept"}
        </Button>

        <AlertDialog onOpenChange={setIsAlertOpen} open={isAlertOpen}>
          <AlertDialogTrigger
            className={cn(
              buttonVariants({ size: "sm", variant: "destructive" }),
              "min-w-24",
            )}
            disabled={
              isPending ||
              optimisticPaymentProofStatus === "rejected" ||
              optimisticPaymentProofStatus === "accepted"
            }
          >
            {isRejectPending ? "Rejecting..." : "Reject"}
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
    </div>
  );
}
