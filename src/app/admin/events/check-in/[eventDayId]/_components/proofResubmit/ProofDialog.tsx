"use client";

import { useState } from "react";
import PaymentProofReviewDialog from "@/app/admin/events/_components/PaymentProof/PaymentProofReviewDialog";
import { Button } from "@/components/ui/button";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import { verifyPayment } from "@/server/registration/mutations/verifyPayment";
import useAttendanceStore from "../../_hooks/useAttendanceStore";

interface ProofDialogProps {
  paymentProofStatus: GetCheckInForDateSchema["paymentProofStatus"];
  registrationId: string;
  eventTitle: string;
  registrantEmail: string;
  registrantName: string;
}

export default function ProofDialog({
  paymentProofStatus,
  registrationId,
  eventTitle,
  registrantEmail,
  registrantName,
}: ProofDialogProps) {
  const [open, setOpen] = useState(false);
  const setPaymentProofStatus = useAttendanceStore(
    (state) => state.setPaymentProofStatus,
  );

  return (
    <PaymentProofReviewDialog
      initialPaymentProofStatus={paymentProofStatus}
      onAcceptAction={async (id) => {
        const result = await verifyPayment(id);
        return {
          message: result,
          status: "accepted" as const,
        };
      }}
      onOpenChange={setOpen}
      onStatusChange={(status) => {
        setPaymentProofStatus(status);
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
