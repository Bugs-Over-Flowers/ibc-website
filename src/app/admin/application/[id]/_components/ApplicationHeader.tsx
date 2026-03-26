"use client";

import { AlertTriangle, CircleCheckBig, History, XCircle } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EditMemberButton } from "@/app/admin/_components/EditMemberButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { Enums } from "@/lib/supabase/db.types";
import { updatePaymentProofStatus } from "@/server/applications/mutations/updatePaymentProofStatus";
import type { getApplicationDetailsById } from "@/server/applications/queries/getApplicationDetailsById";
import ExportPDFButton from "../../_components/ExportPDFButton";
import { PaymentProofModal } from "./PaymentProofModal";

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
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            {application.BusinessMember && (
              <EditMemberButton
                memberId={application.BusinessMember.businessMemberId}
              />
            )}
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Link
                href={
                  `/admin/members/${application.businessMemberId}/history` as Route
                }
              >
                <Button
                  className="border border-border active:scale-95 active:opacity-80"
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
        </div>
      )}
    </div>
  );
}
