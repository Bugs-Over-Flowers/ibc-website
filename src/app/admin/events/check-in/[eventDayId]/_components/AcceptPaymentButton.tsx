"use client";

import { Banknote, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAttendanceStore from "../_hooks/useAttendanceStore";
import { useVerifyPaymentProof } from "../_hooks/useVerifyPaymentProof";

interface AcceptPaymentButtonProps {
  paymentMethod: string;
  paymentProofStatus: string;
  registrationId: string;
  variant?: "default" | "outline" | "ghost";
}

export default function AcceptPaymentButton({
  paymentMethod,
  paymentProofStatus,
  registrationId,
  variant = "outline",
}: AcceptPaymentButtonProps) {
  const setPaymentProofStatus = useAttendanceStore(
    (state) => state.setPaymentProofStatus,
  );
  const { execute, isPending, optimistic } = useVerifyPaymentProof({
    paymentProofStatus: paymentProofStatus as never,
    options: { successMessage: "Onsite payment accepted" },
  });

  if (paymentMethod !== "ONSITE") return null;
  const isEligible = optimistic === "pending" || optimistic === "rejected";
  if (!isEligible) return null;

  return (
    <Button
      className="gap-1.5"
      disabled={isPending}
      onClick={() => {
        setPaymentProofStatus("accepted");
        execute(registrationId);
      }}
      size="sm"
      variant={variant}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Banknote className="size-3.5" />
      )}
      Accept Payment
    </Button>
  );
}
