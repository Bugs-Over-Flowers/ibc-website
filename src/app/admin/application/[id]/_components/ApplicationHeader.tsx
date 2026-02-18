"use client";

import { AlertTriangle, CircleCheckBig, XCircle } from "lucide-react";
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
        return CircleCheckBig;
      case "rejected":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const getStatusClasses = (status: Enums<"PaymentProofStatus">) => {
    switch (status) {
      case "accepted":
        return "text-status-green";
      case "rejected":
        return "text-status-red";
      default:
        return "text-status-red";
    }
  };

  const StatusIcon = getStatusIcon(paymentProofStatus);

  return (
    <div className="space-y-6">
      {/* Main Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        {/* Company Info */}
        <div className="flex flex-1 flex-row items-center gap-6">
          <div className="shrink-0">
            {showImage ? (
              <Image
                alt={`${application.companyName} logo`}
                className="rounded-lg object-cover shadow-sm"
                height={100}
                onError={() => setImageError(true)}
                src={application.logoImageURL as string}
                unoptimized
                width={100}
              />
            ) : (
              <div className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-lg border-2 border-gray-300 bg-gray-100 font-semibold text-4xl text-gray-600 shadow-sm">
                {application.companyName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-1">
            <h1 className="font-bold text-3xl leading-tight">
              {application.companyName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Application ID:{" "}
              <span className="font-medium">{application.identifier}</span>
            </p>
          </div>
        </div>

        {/* Payment Proof Section */}
        {hasProofImage && (
          <div className="flex flex-col gap-2">
            <Dialog
              onOpenChange={setIsProofDialogOpen}
              open={isProofDialogOpen}
            >
              <DialogTrigger
                render={
                  <button
                    className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border-2 bg-muted/30 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                    type="button"
                  />
                }
              >
                <Image
                  alt="Payment proof"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  fill
                  src={proofImage.path}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-background/50"
                />
                <span
                  className={cn(
                    "absolute inset-0 flex -translate-y-4 items-center justify-center",
                    getStatusClasses(paymentProofStatus),
                  )}
                >
                  <span className="rounded-full p-1.5 shadow-lg">
                    <StatusIcon className="h-10 w-10" />
                  </span>
                </span>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1 font-medium text-foreground/80 text-sm">
                  Payment Proof
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
          </div>
        )}
      </div>

      {/* Approval Status Section */}
      {application.businessMemberId && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-status-green text-sm" variant="default">
              Approved
            </Badge>
            {application.BusinessMember?.identifier && (
              <span className="text-muted-foreground text-sm">
                Member ID:
                <span className="font-medium text-foreground">
                  {application.BusinessMember.identifier}
                </span>
              </span>
            )}
          </div>
          <div className="w-full sm:w-auto">
            <ExportPDFButton application={application} />
          </div>
        </div>
      )}
    </div>
  );
}
