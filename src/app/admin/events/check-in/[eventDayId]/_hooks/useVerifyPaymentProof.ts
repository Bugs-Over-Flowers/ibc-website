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
  paymentStatus: GetCheckInForDateSchema["paymentStatus"];
  options?: UseVerifyPaymentProofOptions;
}

export function useVerifyPaymentProof({
  paymentStatus,
  options,
}: UseVerifyPaymentProofProps) {
  const router = useRouter();
  const setPaymentStatus = useAttendanceStore(
    (state) => state.setPaymentStatus,
  );
  const successMessage = options?.successMessage ?? "Payment accepted";

  return useOptimisticAction(tryCatch(verifyPayment), paymentStatus, {
    optimisticUpdate: (_prev, _registrationId) => "accepted" as const,
    onSuccess: () => {
      setPaymentStatus("accepted");
      router.refresh();
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(error);
    },
  });
}
