"use client";

import { toast } from "sonner";
import {
  getNextStatus,
  getResultMessage,
  type PaymentStatus,
} from "@/app/admin/events/_hooks/paymentProofReviewHelpers";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { updateRegistrationPaymentStatus } from "@/server/registration/mutations/updateRegistrationPaymentStatus";

interface UsePaymentProofDecisionActionsProps {
  registrationData: {
    registrationId: string;
    eventTitle: string;
    registrantName: string;
    registrantEmail: string;
  };
  sendEmailOnReject?: boolean;
  onAcceptAction?: (registrationId: string) => Promise<unknown>;
  onRejectAction?: (registrationId: string) => Promise<unknown>;
  onStatusChange?: (status: PaymentStatus) => void;
  onStatusResolved: (status: PaymentStatus) => void;
}

export function usePaymentProofDecisionActions({
  registrationData,
  sendEmailOnReject,
  onAcceptAction,
  onRejectAction,
  onStatusChange,
  onStatusResolved,
}: UsePaymentProofDecisionActionsProps) {
  const { execute: acceptProof, isPending: isAccepting } = useAction(
    tryCatch(async () =>
      onAcceptAction
        ? onAcceptAction(registrationData.registrationId)
        : updateRegistrationPaymentStatus({
            eventTitle: registrationData.eventTitle,
            registrationId: registrationData.registrationId,
            status: "accepted",
            sendEmail: sendEmailOnReject === true,
            toEmail: registrationData.registrantEmail,
            registrantName: registrationData.registrantName,
          }),
    ),
    {
      onSuccess: (result) => {
        const nextStatus = getNextStatus(result, "accepted");
        onStatusResolved(nextStatus);
        onStatusChange?.(nextStatus);
        toast.success(getResultMessage(result, "Payment proofs accepted"));
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
        : updateRegistrationPaymentStatus({
            eventTitle: registrationData.eventTitle,
            registrationId: registrationData.registrationId,
            status: "rejected",
            sendEmail: sendEmailOnReject === true,
            toEmail: registrationData.registrantEmail,
            registrantName: registrationData.registrantName,
          }),
    ),
    {
      onSuccess: (result) => {
        const nextStatus = getNextStatus(result, "rejected");
        onStatusResolved(nextStatus);
        onStatusChange?.(nextStatus);
        toast.success(getResultMessage(result, "Payment proofs rejected"));
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
