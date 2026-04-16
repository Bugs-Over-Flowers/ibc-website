"use client";

import { AlertTriangle, Eye } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { updatePaymentProofStatus } from "@/server/applications/mutations/updatePaymentProofStatus";
import type { getApplications } from "@/server/applications/queries/getApplications";
import { useSelectedApplicationsStore } from "../_store/useSelectedApplicationsStore";
import { toPascalCaseWithSpaces } from "../_utils/formatters";
import { PaymentProofModal } from "./PaymentProofModal";

interface ApplicationsTableRowProps {
  application: Awaited<ReturnType<typeof getApplications>>[number];
  showContact?: boolean;
}

function formatAppliedDate(dateValue: string): string {
  const isoDate = dateValue.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return `${isoDate.slice(8, 10)}/${isoDate.slice(5, 7)}/${isoDate.slice(0, 4)}`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(dateValue));
}

function getApplicationTypeColor(type: string): {
  borderColor: string;
  textColor: string;
} {
  switch (type) {
    case "newMember":
      return {
        borderColor: "border-status-green",
        textColor: "text-status-green",
      };
    case "updating":
      return {
        borderColor: "border-status-yellow",
        textColor: "text-status-yellow",
      };
    case "renewal":
      return {
        borderColor: "border-status-blue",
        textColor: "text-status-blue",
      };
    default:
      return {
        borderColor: "border-muted",
        textColor: "text-muted-foreground",
      };
  }
}

export function ApplicationsTableRow({
  application,
  showContact = true,
}: ApplicationsTableRowProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  // Ensure Zustand store state is only used after hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isSelected = useSelectedApplicationsStore((state) =>
    state.isSelected(application.applicationId),
  );
  const toggleSelection = useSelectedApplicationsStore(
    (state) => state.toggleSelection,
  );
  const { borderColor, textColor } = getApplicationTypeColor(
    application.applicationType,
  );
  const paymentProofStatus = application.paymentProofStatus ?? "pending";
  const isPaymentProofPending =
    application.paymentMethod === "BPI" && paymentProofStatus === "pending";
  const isSelectionDisabled = isPaymentProofPending;
  const formattedAppliedDate = formatAppliedDate(application.applicationDate);

  const proofImage = application.ProofImage?.[0];
  const hasProofImage = !!proofImage;

  const { execute: updateProofStatus, isPending: isUpdatingStatus } = useAction(
    tryCatch(updatePaymentProofStatus),
    {
      onSuccess: () => {
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
    <TableRow
      className={isHydrated && isSelected ? "bg-primary/5" : ""}
      key={application.applicationId}
    >
      <TableCell className="w-12">
        <Checkbox
          aria-label={`Select ${application.companyName}`}
          checked={isSelected}
          disabled={isSelectionDisabled}
          onCheckedChange={() => {
            if (isSelectionDisabled) return;
            toggleSelection(application.applicationId);
          }}
        />
      </TableCell>
      <TableCell
        className={showContact ? "w-[22%] font-medium" : "w-[24%] font-medium"}
      >
        <div className="flex items-center gap-2">
          {isPaymentProofPending && hasProofImage && (
            <PaymentProofModal
              expectedRegistrationFee={expectedRegistrationFee}
              isDecisionLocked={paymentProofStatus !== "pending"}
              isUpdatingStatus={isUpdatingStatus}
              membershipTypeLabel={membershipTypeLabel}
              onDecision={handleDecision}
              paymentProofStatus={paymentProofStatus}
              proofImagePath={proofImage.path}
              trigger={
                <button
                  aria-label="Check payment proof"
                  className="inline-flex size-[18px] items-center justify-center rounded-full bg-status-orange/10 text-status-red transition-colors hover:bg-status-red/20"
                  title="Check Payment Proof"
                  type="button"
                >
                  <AlertTriangle className="size-3" />
                </button>
              }
            />
          )}
          <span>{application.companyName}</span>
        </div>
      </TableCell>
      <TableCell
        className={showContact ? "w-[24%] max-w-56" : "w-[34%] max-w-64"}
      >
        <div className="line-clamp-2 truncate text-sm">
          {application.Sector?.sectorName}
        </div>
      </TableCell>
      <TableCell className={showContact ? "w-[14%]" : "w-[16%]"}>
        <Badge
          className={`${borderColor} ${textColor} text-xs`}
          variant="outline"
        >
          {toPascalCaseWithSpaces(application.applicationType)}
        </Badge>
      </TableCell>
      {showContact && (
        <TableCell className="w-[20%]">
          <div className="text-sm">
            <div>{application.emailAddress}</div>
            <div className="text-muted-foreground">
              {application.mobileNumber}
            </div>
          </div>
        </TableCell>
      )}
      <TableCell
        className={`${showContact ? "w-[10%]" : "w-[14%]"} font-mono text-muted-foreground text-xs`}
      >
        {formattedAppliedDate}
      </TableCell>
      <TableCell
        className={`${showContact ? "w-[10%]" : "w-[12%]"} pr-4 text-right`}
      >
        <Button
          aria-label={`Open application ${application.companyName}`}
          className="ml-auto size-8 p-0 active:scale-95 active:opacity-80 dark:hover:bg-muted"
          size="sm"
          variant="outline"
        >
          <Link
            href={`/admin/application/${application.applicationId}` as Route}
            title={`Open application ${application.companyName}`}
          >
            <Eye className="size-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
