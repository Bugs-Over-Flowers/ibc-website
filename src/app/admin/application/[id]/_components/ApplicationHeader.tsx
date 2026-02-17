"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { cn } from "@/lib/utils";
import { updatePaymentProofStatus } from "@/server/applications/mutations/updatePaymentProofStatus";
import type { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";
import ExportPDFButton from "../../_components/ExportPDFButton";

interface ApplicationHeaderProps {
  application: Awaited<ReturnType<typeof getApplicationDetailsById>>;
}

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
  const [paymentProofStatus, setPaymentProofStatus] = useState<
    Enums<"PaymentProofStatus">
  >(application.paymentProofStatus ?? "pending");
  const router = useRouter();
  const showImage = application.logoImageURL && !imageError;
  const proofImage = application.ProofImage?.[0];
  const hasProofImage = !!proofImage;
  const isDecisionLocked = paymentProofStatus !== "pending";

  const { execute: updateProofStatus, isPending: isUpdatingStatus } = useAction(
    tryCatch(updatePaymentProofStatus),
    {
      onSuccess: (data) => {
        setPaymentProofStatus(data.status);
        setIsProofDialogOpen(false);
        router.refresh();
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const handleDecision = (status: "accepted" | "rejected") => {
    updateProofStatus({
      applicationId: application.applicationId,
      status,
    });
  };

  const getStatusIcon = (status: Enums<"PaymentProofStatus">) => {
    switch (status) {
      case "accepted":
        return CheckCircle2;
      case "rejected":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const getStatusClasses = (status: Enums<"PaymentProofStatus">) => {
    switch (status) {
      case "accepted":
        return "bg-status-green/15 text-status-green";
      case "rejected":
        return "bg-status-red/15 text-status-red";
      default:
        return "bg-status-red/15 text-status-red";
    }
  };

  const StatusIcon = getStatusIcon(paymentProofStatus);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col justify-end">
          <h1 className="font-bold text-3xl">{application.companyName}</h1>
          <p className="mt-1 text-muted-foreground">
            Application ID: {application.identifier}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-4">
          {hasProofImage && (
            <Dialog
              onOpenChange={setIsProofDialogOpen}
              open={isProofDialogOpen}
            >
              <DialogTrigger
                render={
                  <button
                    className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/30"
                    type="button"
                  />
                }
              >
                <Image
                  alt="Payment proof"
                  className="h-full w-full object-cover"
                  fill
                  src={proofImage.path}
                />
                <span
                  className={cn(
                    "absolute top-2 right-2 rounded-full p-1 shadow-sm",
                    getStatusClasses(paymentProofStatus),
                  )}
                >
                  <StatusIcon className="h-4 w-4" />
                </span>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Verify Payment Proof</DialogTitle>
                  <DialogDescription>
                    Review the payment proof and mark it as accepted or
                    rejected.
                  </DialogDescription>
                </DialogHeader>
                <ImageZoom className="h-[420px] w-full">
                  <Image
                    alt="Payment proof"
                    className="h-full w-full object-contain"
                    fill
                    src={proofImage.path}
                  />
                </ImageZoom>
                <DialogFooter>
                  <Button
                    disabled={isUpdatingStatus || isDecisionLocked}
                    onClick={() => handleDecision("rejected")}
                    variant="outline"
                  >
                    {isUpdatingStatus ? "Saving..." : "Reject"}
                  </Button>
                  <Button
                    disabled={isUpdatingStatus || isDecisionLocked}
                    onClick={() => handleDecision("accepted")}
                  >
                    {isUpdatingStatus ? "Saving..." : "Accept"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <div className="shrink-0">
            {showImage ? (
              <Image
                alt={`${application.companyName} logo`}
                height={100}
                onError={() => setImageError(true)}
                src={application.logoImageURL as string}
                unoptimized
                width={100}
              />
            ) : (
              <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 font-semibold text-4xl text-gray-600">
                {application.companyName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {application.businessMemberId && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Badge className="bg-status-green text-sm" variant="default">
              Approved
            </Badge>
            {application.BusinessMember?.identifier && (
              <span className="text-muted-foreground text-sm">
                Member ID: {application.BusinessMember.identifier}
              </span>
            )}
          </div>
          <div>
            <ExportPDFButton application={application} />
          </div>
        </div>
      )}
    </>
  );
}
