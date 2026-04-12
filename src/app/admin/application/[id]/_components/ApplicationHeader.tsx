"use client";

import { History } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { updatePaymentProofStatus } from "@/server/applications/mutations/updatePaymentProofStatus";
import type { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";
import ExportPDFButton from "../../_components/ExportPDFButton";
import { PaymentProofModal } from "../../_components/PaymentProofModal";

interface ApplicationHeaderProps {
  application: Awaited<ReturnType<typeof getApplicationDetailsById>>;
}

export function ApplicationHeader({ application }: ApplicationHeaderProps) {
  const [imageError, setImageError] = useState(false);
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
      <div className="mt-3 flex flex-col gap-6 rounded-xl border border-border bg-card/80 p-6 lg:flex-row lg:items-start lg:justify-between">
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
          <PaymentProofModal
            expectedRegistrationFee={expectedRegistrationFee}
            isDecisionLocked={isDecisionLocked}
            isUpdatingStatus={isUpdatingStatus}
            membershipTypeLabel={membershipTypeLabel}
            onDecision={handleDecision}
            paymentProofStatus={paymentProofStatus}
            proofImagePath={proofImage.path}
          />
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
