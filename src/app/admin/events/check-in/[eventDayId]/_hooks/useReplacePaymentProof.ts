"use client";

import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { replacePaymentProofAndAccept } from "@/server/registration/mutations/replacePaymentProofAndAccept";
import useAttendanceStore from "./useAttendanceStore";

export function useReplacePaymentProof() {
  const scannedData = useAttendanceStore((state) => state.scannedData);
  const setScannedData = useAttendanceStore((state) => state.setScannedData);

  return useAction(tryCatch(replacePaymentProofAndAccept), {
    onSuccess: (data) => {
      if (scannedData) {
        setScannedData({
          ...scannedData,
          paymentProofStatus: "accepted",
          proofImage: scannedData.proofImage
            ? {
                ...scannedData.proofImage,
                path: data.path,
              }
            : null,
        });
      }

      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
}
