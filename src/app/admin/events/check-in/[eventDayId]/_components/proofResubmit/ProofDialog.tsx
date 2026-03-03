"use client";

import { useState } from "react";
import PaymentProofReviewDialog from "@/components/payment-proof/PaymentProofReviewDialog";
import { Button } from "@/components/ui/button";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import { replacePaymentProofAndAccept } from "@/server/registration/mutations/replacePaymentProofAndAccept";
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
      allowReject={false}
      allowUpload={false}
      enforcePendingDecision={false}
      initialPaymentProofStatus={paymentProofStatus}
      onAcceptAction={async (id) => {
        const result = await verifyPayment(id);

        if (scannedData) {
          setScannedData({
            ...scannedData,
            paymentProofStatus: "accepted",
          });
        }

        return {
          message: result,
          status: "accepted",
        };
      }}
      onOpenChange={setOpen}
      onProofPathChange={(path) => {
        if (scannedData) {
          setScannedData({
            ...scannedData,
            paymentProofStatus: "accepted",
            proofImage: scannedData.proofImage
              ? {
                  ...scannedData.proofImage,
                  path,
                }
              : null,
          });
        }
      }}
      onReplaceAction={replacePaymentProofAndAccept}
      open={open}
      registrationId={registrationId}
      trigger={<Button>View Payment</Button>}
    />
  );
}
