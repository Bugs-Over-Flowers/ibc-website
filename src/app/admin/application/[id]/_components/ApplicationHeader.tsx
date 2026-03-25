"use client";

import { AlertTriangle, CircleCheckBig, History, XCircle } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
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
        return "text-status-orange";
    }
  };

  const StatusIcon = getStatusIcon(paymentProofStatus);
  const PERSONAL_REGISTRATION_FEE = 5000;
  const CORPORATE_REGISTRATION_FEE = 10000;
  const membershipTypeLabel =
    application.applicationMemberType === "personal"
      ? "Personal Membership"
      : "Corporate Membership";
  const expectedRegistrationFee =
    application.applicationMemberType === "corporate"
      ? CORPORATE_REGISTRATION_FEE
      : PERSONAL_REGISTRATION_FEE;

  return (
    <div className="space-y-5">
      {/* Main Header Section */}
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-card/80 p-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Company Info */}
        <div className="flex flex-1 items-center gap-4 sm:gap-5">
          <div className="shrink-0">
            {showImage ? (
              <Image
                alt={`${application.companyName} logo`}
                className="h-24 w-24 rounded-xl border border-border/60 bg-muted/20 object-cover p-1 shadow-sm"
                height={96}
                onError={() => setImageError(true)}
                src={application.logoImageURL as string}
                unoptimized
                width={96}
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/30 font-semibold text-4xl text-muted-foreground shadow-sm">
                {application.companyName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="font-bold text-3xl leading-tight">
              {application.companyName}
            </h1>
            <div className="inline-flex w-fit items-center rounded-md border border-border/60 bg-background/70 px-2.5 py-1 text-muted-foreground text-xs">
              Application ID:
              <span className="ml-1 font-semibold text-foreground">
                {application.identifier}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Proof Section */}
        {hasProofImage && (
          <div className="flex shrink-0 flex-col gap-2 lg:items-end">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Payment Proof
            </span>
            <Dialog
              onOpenChange={setIsProofDialogOpen}
              open={isProofDialogOpen}
            >
              <DialogTrigger
                render={
                  <button
                    className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
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
                  className="absolute inset-0 bg-background/85"
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
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1 text-foreground text-xs">
                  Proof
                </span>
              </DialogTrigger>
              <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] overflow-y-auto sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Verify Payment Proof</DialogTitle>
                  <DialogDescription>
                    Review the payment proof and mark it as accepted or
                    rejected.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid items-stretch gap-4 md:grid-cols-2">
                  <div className="flex h-full flex-col gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                    <div className="space-y-2">
                      <span className="font-semibold text-muted-foreground text-xs uppercase">
                        Member Type
                      </span>
                      <Badge
                        className="w-fit bg-primary text-sm"
                        variant="default"
                      >
                        {membershipTypeLabel}
                      </Badge>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        Applicant is being evaluated under this membership
                        category.
                      </p>
                    </div>
                    <div className="space-y-2 border-border/50 border-t pt-3">
                      <span className="font-semibold text-muted-foreground text-xs uppercase">
                        Registration Fee
                      </span>
                      <p className="font-bold text-2xl text-primary">
                        ₱{expectedRegistrationFee.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Expected payment amount for{" "}
                        {membershipTypeLabel.toLowerCase()}.
                      </p>
                    </div>
                    <div className="grid gap-2 rounded-lg border border-border/50 bg-background/60 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Personal fee
                        </span>
                        <span className="font-semibold text-foreground">
                          ₱{PERSONAL_REGISTRATION_FEE.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Corporate fee
                        </span>
                        <span className="font-semibold text-foreground">
                          ₱{CORPORATE_REGISTRATION_FEE.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ImageZoom className="h-[280px] w-full sm:h-[340px] md:h-full md:min-h-[380px]">
                    <Image
                      alt="Payment proof"
                      className="h-full w-full object-contain"
                      fill
                      src={proofImage.path}
                    />
                  </ImageZoom>
                </div>
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
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card/80 p-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-status-green text-sm" variant="default">
              Approved
            </Badge>
            {application.BusinessMember?.identifier && (
              <span className="text-muted-foreground text-sm">
                Member ID:{" "}
                <span className="font-semibold text-foreground">
                  {application.BusinessMember.identifier}
                </span>
              </span>
            )}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={
                `/admin/members/${application.businessMemberId}/history` as Route
              }
            >
              <Button
                className="h-10 w-full rounded-xl border border-border active:scale-95 active:opacity-80 sm:w-auto"
                size="sm"
                variant="outline"
              >
                <History className="mr-2 h-4 w-4" />
                Application History
              </Button>
            </Link>
            <ExportPDFButton application={application} />
          </div>
        </div>
      )}
    </div>
  );
}
