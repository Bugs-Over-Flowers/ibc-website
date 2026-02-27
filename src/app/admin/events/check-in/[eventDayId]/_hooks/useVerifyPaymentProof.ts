"use client";

import { toast } from "sonner";
import { useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import { verifyPayment } from "@/server/registration/mutations/verifyPayment";
import useAttendanceStore from "./useAttendanceStore";

interface UseVerifyPaymentProofProps {
  paymentProofStatus: GetCheckInForDateSchema["paymentProofStatus"];
}

export function useVerifyPaymentProof({
  paymentProofStatus,
}: UseVerifyPaymentProofProps) {
  const scannedData = useAttendanceStore((state) => state.scannedData);
  const setScannedData = useAttendanceStore((state) => state.setScannedData);

  return useOptimisticAction(tryCatch(verifyPayment), paymentProofStatus, {
    optimisticUpdate: (_prev, _registrationId) => "accepted" as const,
    onSuccess: () => {
      if (scannedData) {
        setScannedData({
          ...scannedData,
          paymentProofStatus: "accepted",
        });
      }

      toast.success("Payment proof accepted");
    },
    onError: (error) => {
      toast.error(error);
    },
  });
}
