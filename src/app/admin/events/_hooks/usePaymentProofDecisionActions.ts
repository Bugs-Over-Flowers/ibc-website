"use client";

import { toast } from "sonner";
import {
  getNextStatus,
  getResultMessage,
  type PaymentProofStatus,
} from "@/app/admin/events/_hooks/paymentProofReviewHelpers";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { updateRegistrationPaymentProofStatus } from "@/server/registration/mutations/updateRegistrationPaymentProofStatus";

interface UsePaymentProofDecisionActionsProps {
  page: "check-in" | "registration-details";
  registrationData: {
    registrationId: string;
    eventTitle: string;
    registrantName: string;
    registrantEmail: string;
  };
  onAcceptAction?: (registrationId: string) => Promise<unknown>;
  onRejectAction?: (registrationId: string) => Promise<unknown>;
  onStatusChange?: (status: PaymentProofStatus) => void;
  onStatusResolved: (status: PaymentProofStatus) => void;
}

export function usePaymentProofDecisionActions({
  page,
  registrationData,
  onAcceptAction,
  onRejectAction,
  onStatusChange,
  onStatusResolved,
}: UsePaymentProofDecisionActionsProps) {
  const { execute: acceptProof, isPending: isAccepting } = useAction(
    tryCatch(async () =>
      onAcceptAction
        ? onAcceptAction(registrationData.registrationId)
        : updateRegistrationPaymentProofStatus({
            page,
            eventTitle: registrationData.eventTitle,
            registrationId: registrationData.registrationId,
            status: "accepted",
            toEmail: registrationData.registrantEmail,
            registrantName: registrationData.registrantName,
          }),
    ),
    {
      onSuccess: (result) => {
        const nextStatus = getNextStatus(result, "accepted");
        onStatusResolved(nextStatus);
        onStatusChange?.(nextStatus);
        toast.success(getResultMessage(result, "Payment proof accepted"));
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  const { execute: rejectProof, isPending: isRejecting } = useAction(
    tryCatch(async () =>
      onRejectAction
        ? onRejectAction(registrationData.registrationId)
        : updateRegistrationPaymentProofStatus({
            page,
            eventTitle: registrationData.eventTitle,
            registrationId: registrationData.registrationId,
            status: "rejected",
            toEmail: registrationData.registrantEmail,
            registrantName: registrationData.registrantName,
          }),
    ),
    {
      onSuccess: (result) => {
        const nextStatus = getNextStatus(result, "rejected");
        onStatusResolved(nextStatus);
        onStatusChange?.(nextStatus);
        toast.success(getResultMessage(result, "Payment proof rejected"));
      },
      onError: (error) => {
        toast.error(error);
      },
    },
  );

  return {
    acceptProof,
    rejectProof,
    isAccepting,
    isRejecting,
  };
}
