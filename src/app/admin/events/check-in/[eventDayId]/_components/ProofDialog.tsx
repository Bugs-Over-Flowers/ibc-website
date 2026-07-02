"use client";

import { useState } from "react";
import PaymentProofReviewDialog from "@/app/admin/events/_components/PaymentProof/PaymentProofReviewDialog";
import { Button } from "@/components/ui/button";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import { useVerifyPaymentProof } from "../_hooks/useVerifyPaymentProof";

interface ProofDialogProps {
  paymentStatus: GetCheckInForDateSchema["paymentStatus"];
  registrationId: string;
  eventTitle: string;
  registrantEmail: string;
  registrantName: string;
  onAfterAccept?: () => void | Promise<void>;
}

export default function ProofDialog({
  paymentStatus,
  registrationId,
  eventTitle,
  registrantEmail,
  registrantName,
  onAfterAccept,
}: ProofDialogProps) {
  const [open, setOpen] = useState(false);
  const setPaymentStatus = useAttendanceStore(
    (state) => state.setPaymentStatus,
  );
  const { execute } = useVerifyPaymentProof({
    paymentStatus,
    options: { successMessage: "Payment accepted" },
  });

  return (
    <PaymentProofReviewDialog
      initialPaymentStatus={paymentStatus}
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
        setPaymentStatus(status);
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
