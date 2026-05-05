"use client";

import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { replacePaymentProofAndAccept } from "@/server/registration/mutations/replacePaymentProofAndAccept";
import useAttendanceStore from "./useAttendanceStore";

export function useReplacePaymentProof() {
  const setPaymentProofStatus = useAttendanceStore(
    (state) => state.setPaymentProofStatus,
  );

  return useAction(tryCatch(replacePaymentProofAndAccept), {
    onSuccess: (data) => {
      setPaymentProofStatus("accepted");

      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
}
