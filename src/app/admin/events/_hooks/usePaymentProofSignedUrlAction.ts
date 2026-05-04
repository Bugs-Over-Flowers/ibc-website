"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { getPaymentProofSignedUrl } from "@/server/registration/queries/getPaymentProofSignedUrl";

interface UsePaymentProofSignedUrlActionProps {
  open: boolean;
  registrationId: string;
}

export type SignedProof = {
  proofImageId: string;
  signedUrl: string;
  orderIndex: number;
  path: string;
};

export function usePaymentProofSignedUrlAction({
  open,
  registrationId,
}: UsePaymentProofSignedUrlActionProps) {
  const [proofs, setProofs] = useState<SignedProof[]>([]);
  const [isSignedUrlImageError, setIsSignedUrlImageError] = useState(false);

  const { execute: fetchSignedUrl, isPending: isFetchingSignedUrl } = useAction(
    tryCatch(getPaymentProofSignedUrl),
    {
      onSuccess: ({ proofs: nextProofs }) => {
        setProofs(nextProofs);
        setIsSignedUrlImageError(false);
      },
      onError: (error) => {
        setProofs([]);
        setIsSignedUrlImageError(false);
        toast.error(error);
      },
      persist: true,
    },
  );

  const fetchSignedUrlRef = useRef(fetchSignedUrl);
  useEffect(() => {
    fetchSignedUrlRef.current = fetchSignedUrl;
  }, [fetchSignedUrl]);

  const refetchSignedUrls = useCallback(() => {
    setProofs([]);
    setIsSignedUrlImageError(false);
    fetchSignedUrlRef.current({ registrationId });
  }, [registrationId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchSignedUrlRef.current({ registrationId });
  }, [open, registrationId]);

  return {
    proofs,
    isSignedUrlImageError,
    setIsSignedUrlImageError,
    isFetchingSignedUrl,
    refetchSignedUrls,
  };
}
