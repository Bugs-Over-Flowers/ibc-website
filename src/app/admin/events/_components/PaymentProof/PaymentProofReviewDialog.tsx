"use client";

import {
  CheckCircle2,
  Clock,
  CreditCard,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import PaymentProofEditPanel from "@/app/admin/events/_components/PaymentProof/PaymentProofEditPanel";
import { usePaymentProofDecisionActions } from "@/app/admin/events/_hooks/usePaymentProofDecisionActions";
import { usePaymentProofSignedUrlAction } from "@/app/admin/events/_hooks/usePaymentProofSignedUrlAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";

type PaymentProofStatus = Enums<"PaymentProofStatus">;

interface PaymentProofReviewDialogProps {
  page: "check-in" | "registration-details";
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  registrationData: {
    registrationId: string;
    eventTitle: string;
    registrantName: string;
    registrantEmail: string;
  };
  initialPaymentProofStatus: PaymentProofStatus;
  trigger?: React.ReactElement;
  onAcceptAction?: (registrationId: string) => Promise<unknown>;
  onRejectAction?: (registrationId: string) => Promise<unknown>;
  onStatusChange?: (status: PaymentProofStatus) => void;
}

function getStatusConfig(status: PaymentProofStatus) {
  switch (status) {
    case "accepted":
      return {
        className: "border-green-200 bg-green-50 text-green-700",
        icon: <CheckCircle2 className="size-3" />,
      };
    case "rejected":
      return {
        className: "border-red-200 bg-red-50 text-red-700",
        icon: <XCircle className="size-3" />,
      };
    default:
      return {
        className: "border-yellow-200 bg-yellow-50 text-yellow-700",
        icon: <Clock className="size-3" />,
      };
  }
}

export default function PaymentProofReviewDialog({
  page,
  open,
  onOpenChange,
  registrationData,
  initialPaymentProofStatus,
  trigger,
  onAcceptAction,
  onRejectAction,
  onStatusChange,
}: PaymentProofReviewDialogProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [paymentProofStatus, setPaymentProofStatus] = useState(
    initialPaymentProofStatus,
  );

  const {
    proofs: signedProofs,
    isFetchingSignedUrl,
    refetchSignedUrls,
  } = usePaymentProofSignedUrlAction({
    open,
    registrationId: registrationData.registrationId,
  });

  const { acceptProof, rejectProof, isAccepting, isRejecting } =
    usePaymentProofDecisionActions({
      page,
      registrationData,
      onAcceptAction,
      onRejectAction,
      onStatusChange,
      onStatusResolved: setPaymentProofStatus,
    });

  const isAnyActionPending = isFetchingSignedUrl || isAccepting || isRejecting;
  const isDecisionLocked = paymentProofStatus !== "pending";
  const statusConfig = getStatusConfig(paymentProofStatus);

  const handleOpenChangeWrapper = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMode("view");
    }
    onOpenChange?.(nextOpen);
  };

  return (
    <Dialog onOpenChange={handleOpenChangeWrapper} open={open}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent
        className="flex w-[95vw] flex-col p-4 sm:max-w-3xl sm:p-6"
        outsideScroll
      >
        <div className="space-y-3 pr-8">
          <DialogTitle className="flex items-center gap-2 font-medium text-base">
            <CreditCard className="size-4 text-muted-foreground" />
            Proof of Payment
          </DialogTitle>
          <div className="flex flex-col gap-1.5">
            <Badge
              className={cn(
                "flex w-fit items-center gap-1.5 capitalize",
                statusConfig.className,
              )}
              variant="outline"
            >
              {statusConfig.icon}
              {paymentProofStatus}
            </Badge>
          </div>
        </div>

        <div className="py-4">
          {mode === "edit" ? (
            <PaymentProofEditPanel
              initialProofs={signedProofs}
              onApproveAfterSave={async () => {
                refetchSignedUrls();
                onOpenChange?.(false);
              }}
              onClose={() => setMode("view")}
              onProofsSaved={refetchSignedUrls}
              registrationId={registrationData.registrationId}
            />
          ) : (
            <div className="space-y-4">
              {signedProofs.length > 0 ? (
                <Carousel className="mx-auto w-full max-w-sm">
                  <CarouselContent>
                    {signedProofs.map((proof, index) => (
                      <CarouselItem key={proof.proofImageId}>
                        <div className="space-y-2">
                          <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/20 p-2">
                            <ImageZoom className="relative h-80 w-full touch-none select-none rounded-lg bg-background">
                              <Image
                                alt={`Proof ${index + 1}`}
                                className="object-contain"
                                fill
                                src={proof.signedUrl}
                              />
                            </ImageZoom>
                          </div>
                          <p className="text-center text-muted-foreground text-xs">
                            {index + 1} of {signedProofs.length} - Click to zoom
                          </p>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {signedProofs.length > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                      <CarouselPrevious className="static translate-x-0 translate-y-0" />
                      <CarouselNext className="static translate-x-0 translate-y-0" />
                    </div>
                  )}
                </Carousel>
              ) : isFetchingSignedUrl ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                  Loading proof image...
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                  No proof of payment uploaded yet.
                </div>
              )}
            </div>
          )}
        </div>

        {mode === "view" && (
          <DialogFooter className="mt-1 flex-wrap gap-2 border-t pt-4 max-sm:*:w-full">
            <Button
              disabled={isAnyActionPending}
              onClick={() => handleOpenChangeWrapper(false)}
              variant="outline"
            >
              <X className="size-3.5" />
              Close
            </Button>
            <Button
              disabled={isAnyActionPending}
              onClick={() => setMode("edit")}
              variant="outline"
            >
              <Upload className="size-3.5" />
              Edit proofs
            </Button>
            <Button
              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
              disabled={isAnyActionPending || isDecisionLocked}
              onClick={() => rejectProof()}
              variant="outline"
            >
              <XCircle className="size-3.5" />
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              className="bg-green-700 hover:bg-green-800"
              disabled={isAnyActionPending || isDecisionLocked}
              onClick={() => acceptProof()}
            >
              <CheckCircle2 className="size-3.5" />
              {isAccepting ? "Accepting..." : "Accept"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
