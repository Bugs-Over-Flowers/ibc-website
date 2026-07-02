"use client";

import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { replacePaymentProofAndAccept } from "@/server/registration/mutations/replacePaymentProofAndAccept";
import useAttendanceStore from "./useAttendanceStore";

export function useReplacePaymentProof() {
  const setPaymentStatus = useAttendanceStore(
    (state) => state.setPaymentStatus,
  );

  return useAction(tryCatch(replacePaymentProofAndAccept), {
    onSuccess: (data) => {
      setPaymentStatus("accepted");

      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
}
