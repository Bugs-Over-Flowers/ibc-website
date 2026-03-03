"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  convertFileToDataUrl,
  getNextStatus,
  getResultMessage,
  getResultPath,
  type PaymentProofStatus,
} from "@/app/admin/events/_hooks/paymentProofReviewHelpers";
import tryCatch from "@/lib/server/tryCatch";
import { replacePaymentProofAndAccept } from "@/server/registration/mutations/replacePaymentProofAndAccept";

interface UseReplacePaymentProofActionProps {
  registrationId: string;
  onReplaceAction?: (input: {
    registrationId: string;
    imageDataUrl: string;
  }) => Promise<unknown>;
  onStatusChange?: (status: PaymentProofStatus) => void;
  onProofPathChange?: (path: string) => void;
  onStatusResolved: (status: PaymentProofStatus) => void;
  onCompleted: () => void;
}

export function useReplacePaymentProofAction({
  registrationId,
  onReplaceAction,
  onStatusChange,
  onProofPathChange,
  onStatusResolved,
  onCompleted,
}: UseReplacePaymentProofActionProps) {
  const [isReplacing, setIsReplacing] = useState(false);

  const handleReplaceAndAccept = async (selectedFile: File | null) => {
    if (!selectedFile) {
      toast.error("No image selected");
      return;
    }

    setIsReplacing(true);

    try {
      const imageDataUrl = await convertFileToDataUrl(selectedFile);
      const result = await tryCatch(
        onReplaceAction
          ? onReplaceAction({ registrationId, imageDataUrl })
          : replacePaymentProofAndAccept({ registrationId, imageDataUrl }),
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const nextStatus = getNextStatus(result.data, "accepted");
      onStatusResolved(nextStatus);
      onStatusChange?.(nextStatus);

      const path = getResultPath(result.data);
      if (path) {
        onProofPathChange?.(path);
      }

      toast.success(getResultMessage(result.data, "Payment proof replaced"));
      onCompleted();
    } catch {
      toast.error("Failed to process selected image");
    } finally {
      setIsReplacing(false);
    }
  };

  return {
    isReplacing,
    handleReplaceAndAccept,
  };
}
