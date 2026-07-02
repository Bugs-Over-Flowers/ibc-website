"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useOptimisticAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";
import { verifyPayment } from "@/server/registration/mutations/verifyPayment";
import useAttendanceStore from "./useAttendanceStore";

interface UseVerifyPaymentProofOptions {
  successMessage?: string;
}

interface UseVerifyPaymentProofProps {
  paymentProofStatus: GetCheckInForDateSchema["paymentProofStatus"];
  options?: UseVerifyPaymentProofOptions;
}

export function useVerifyPaymentProof({
  paymentProofStatus,
  options,
}: UseVerifyPaymentProofProps) {
  const router = useRouter();
  const setPaymentProofStatus = useAttendanceStore(
    (state) => state.setPaymentProofStatus,
  );
  const successMessage = options?.successMessage ?? "Payment accepted";

  return useOptimisticAction(tryCatch(verifyPayment), paymentProofStatus, {
    optimisticUpdate: (_prev, _registrationId) => "accepted" as const,
    onSuccess: () => {
      setPaymentProofStatus("accepted");
      router.refresh();
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
}
