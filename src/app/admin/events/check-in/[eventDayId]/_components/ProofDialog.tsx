"use client";

import { useState } from "react";
import PaymentProofReviewDialog from "@/app/admin/events/_components/PaymentProof/PaymentProofReviewDialog";
import { Button } from "@/components/ui/button";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import { useVerifyPaymentProof } from "../_hooks/useVerifyPaymentProof";

interface ProofDialogProps {
  paymentProofStatus: GetCheckInForDateSchema["paymentProofStatus"];
  registrationId: string;
  eventTitle: string;
  registrantEmail: string;
  registrantName: string;
  onAfterAccept?: () => void | Promise<void>;
}

export default function ProofDialog({
  paymentProofStatus,
  registrationId,
  eventTitle,
  registrantEmail,
  registrantName,
  onAfterAccept,
}: ProofDialogProps) {
  const [open, setOpen] = useState(false);
  const setPaymentProofStatus = useAttendanceStore(
    (state) => state.setPaymentProofStatus,
  );
  const { execute } = useVerifyPaymentProof({
    paymentProofStatus,
    options: { successMessage: "Payment accepted" },
  });

  return (
    <PaymentProofReviewDialog
      initialPaymentProofStatus={paymentProofStatus}
      onAcceptAction={async (id) => {
        await execute(id);
        if (onAfterAccept) {
          await onAfterAccept();
        }
        return {
          message: "Updated successfully",
          status: "accepted" as const,
        };
      }}
      onOpenChange={setOpen}
      onStatusChange={(status) => {
        setPaymentProofStatus(status);
        return status;
      }}
      open={open}
      page="check-in"
      registrationData={{
        registrationId,
        eventTitle,
        registrantEmail,
        registrantName,
      }}
      trigger={<Button>View Payment</Button>}
    />
  );
}
