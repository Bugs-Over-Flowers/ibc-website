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
      <div className="flex h-[min(50vh,420px)] min-h-72 items-center justify-center rounded-md border text-muted-foreground text-sm sm:h-[420px]">
        Loading payment proof...
      </div>
    );
  }

  if (signedUrl && !isImageError) {
    return (
      <ImageZoom className="h-[min(50vh,420px)] min-h-72 w-full sm:h-[420px]">
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
    <div className="flex h-[min(50vh,420px)] min-h-72 items-center justify-center rounded-md border text-muted-foreground text-sm sm:h-[420px]">
      Unable to load payment proof.
    </div>
  );
}
