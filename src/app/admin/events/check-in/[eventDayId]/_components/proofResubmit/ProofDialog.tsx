"use client";

import RegistrationProofDialog from "@/components/payment-proof/RegistrationProofDialog";
import { Button } from "@/components/ui/button";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import useAttendanceStore from "../../_hooks/useAttendanceStore";

interface ProofDialogProps {
  paymentProofStatus: GetCheckInForDateSchema["paymentProofStatus"];
  registrationId: string;
}

export default function ProofDialog({
  paymentProofStatus,
  registrationId,
}: ProofDialogProps) {
  const scannedData = useAttendanceStore((state) => state.scannedData);
  const setScannedData = useAttendanceStore((state) => state.setScannedData);

  return (
    <RegistrationProofDialog
      onStatusChange={(status) => {
        if (scannedData) {
          setScannedData({ ...scannedData, paymentProofStatus: status });
        }
      }}
      paymentProofStatus={paymentProofStatus}
      registrationId={registrationId}
      trigger={<Button>View Payment</Button>}
    />
  );
}
