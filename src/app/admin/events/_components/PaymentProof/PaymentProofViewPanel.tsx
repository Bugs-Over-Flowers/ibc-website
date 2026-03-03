"use client";

import Image from "next/image";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";

interface PaymentProofViewPanelProps {
  signedUrl: string | null;
  isFetchingSignedUrl: boolean;
  isImageError: boolean;
  onImageError: () => void;
}

export default function PaymentProofViewPanel({
  signedUrl,
  isFetchingSignedUrl,
  isImageError,
  onImageError,
}: PaymentProofViewPanelProps) {
  if (isFetchingSignedUrl) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
        Loading payment proof...
      </div>
    );
  }

  if (signedUrl && !isImageError) {
    return (
      <ImageZoom className="h-[420px] w-full">
        <Image
          alt="Proof of Payment"
          className="h-full w-full object-contain"
          fill
          onError={onImageError}
          src={signedUrl}
        />
      </ImageZoom>
    );
  }

  return (
    <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
      Unable to load payment proof.
    </div>
  );
}
