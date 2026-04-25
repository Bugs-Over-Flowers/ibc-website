"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/useAction";
import tryCatch from "@/lib/server/tryCatch";
import { getPaymentProofSignedUrl } from "@/server/registration/queries/getPaymentProofSignedUrl";

interface UsePaymentProofSignedUrlActionProps {
  open: boolean;
  registrationId: string;
}

export function usePaymentProofSignedUrlAction({
  open,
  registrationId,
}: UsePaymentProofSignedUrlActionProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isSignedUrlImageError, setIsSignedUrlImageError] = useState(false);

  const { execute: fetchSignedUrl, isPending: isFetchingSignedUrl } = useAction(
    tryCatch(getPaymentProofSignedUrl),
    {
      onSuccess: ({ signedUrl: nextSignedUrl }) => {
        setSignedUrl(nextSignedUrl);
        setIsSignedUrlImageError(false);
      },
      onError: (error) => {
        setSignedUrl(null);
        setIsSignedUrlImageError(false);
        toast.error(error);
      },
      persist: true,
    },
  );

  const fetchSignedUrlRef = useRef(fetchSignedUrl);
  useEffect(() => {
    fetchSignedUrlRef.current = fetchSignedUrl;
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setSignedUrl(null);
    setIsSignedUrlImageError(false);
    fetchSignedUrlRef.current({ registrationId });
  }, [open, registrationId]);

  return {
    signedUrl,
    isSignedUrlImageError,
    setIsSignedUrlImageError,
    isFetchingSignedUrl,
  };
}
