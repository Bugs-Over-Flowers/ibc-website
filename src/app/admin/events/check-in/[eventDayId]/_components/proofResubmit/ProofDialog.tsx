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
}

export default function ProofDialog({
  paymentProofStatus,
  registrationId,
}: ProofDialogProps) {
  const [open, setOpen] = useState(false);
  const scannedData = useAttendanceStore((state) => state.scannedData);
  const setScannedData = useAttendanceStore((state) => state.setScannedData);

  return (
    <PaymentProofReviewDialog
      enforcePendingDecision={false}
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
        if (scannedData) {
          setScannedData({ ...scannedData, paymentProofStatus: status });
        }
      }}
      open={open}
      registrationId={registrationId}
      trigger={<Button>View Payment</Button>}
    />
  );
}
