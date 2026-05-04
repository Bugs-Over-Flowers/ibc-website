"use client";

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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { rejectPayment } from "@/server/registration/mutations/rejectPayment";
import { verifyPayment } from "@/server/registration/mutations/verifyPayment";
import getStatusColor from "../../_utils/getStatusColor";

type OnlinePaymentSectionProps = {
  paymentProofStatus: Enums<"PaymentProofStatus">;
  proofImageURLs?: Array<{ proofImageId: string; signedUrl: string }>;
  registrationId: string;
};

export default function OnlinePaymentSection({
  registrationId,
  paymentProofStatus,
  proofImageURLs,
}: OnlinePaymentSectionProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [sendEmailOnReject, setSendEmailOnReject] = useState(true);
  const [pendingAction, setPendingAction] = useState<
    "accepted" | "rejected" | null
  >(null);

  const handleAlertOpenChange = (nextOpen: boolean) => {
    setIsAlertOpen(nextOpen);
    if (nextOpen) {
      setSendEmailOnReject(true);
    }
  };

  const paymentAction = async (
    registration: string,
    nextStatus: "accepted" | "rejected",
  ) => {
    if (nextStatus === "accepted") {
      return verifyPayment(registration);
    }

    return rejectPayment(registration, { sendEmail: sendEmailOnReject });
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

  const urls = proofImageURLs ?? [];

  return (
    <div className="space-y-4">
      {urls.length > 0 && (
        <div className="space-y-2">
          <Carousel className="mx-auto w-full max-w-sm">
            <CarouselContent>
              {urls.map((item, index) => (
                <CarouselItem key={item.proofImageId}>
                  <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-2">
                    <ImageZoom className="relative h-80 w-full touch-none select-none rounded-lg bg-background">
                      <Image
                        alt={`Proof of Payment ${index + 1}`}
                        className="object-contain"
                        fill
                        src={item.signedUrl}
                      />
                    </ImageZoom>
                  </div>
                  <p className="mt-1 text-center text-muted-foreground text-xs">
                    {index + 1} of {urls.length} — Click image to zoom
                  </p>
                </CarouselItem>
              ))}
            </CarouselContent>
            {urls.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <CarouselPrevious className="static translate-x-0 translate-y-0" />
                <CarouselNext className="static translate-x-0 translate-y-0" />
              </div>
            )}
          </Carousel>
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

        <AlertDialog onOpenChange={handleAlertOpenChange} open={isAlertOpen}>
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
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {optimisticPaymentProofStatus === "pending" && (
              <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm">
                <Checkbox
                  checked={sendEmailOnReject}
                  disabled={isRejectPending}
                  id="send-email-on-reject"
                  onCheckedChange={(checked) =>
                    setSendEmailOnReject(checked === true)
                  }
                />
                <label
                  className="cursor-pointer select-none text-muted-foreground"
                  htmlFor="send-email-on-reject"
                >
                  Send rejection email
                </label>
              </div>
            )}
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
                {isRejectPending
                  ? "Rejecting..."
                  : sendEmailOnReject
                    ? "Reject & Email"
                    : "Reject Without Email"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
