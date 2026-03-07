"use client";

import Image from "next/image";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";

interface PaymentProofPreviewPanelProps {
  previewUrl: string | null;
}

export default function PaymentProofPreviewPanel({
  previewUrl,
}: PaymentProofPreviewPanelProps) {
  if (previewUrl) {
    return (
      <ImageZoom className="h-[min(50vh,420px)] min-h-72 w-full sm:h-[420px]">
        <Image
          alt="Selected proof of payment"
          className="h-full w-full object-contain"
          fill
          src={previewUrl}
        />
      </ImageZoom>
    );
  }

  return (
    <div className="flex h-[min(50vh,420px)] min-h-72 items-center justify-center rounded-md border text-muted-foreground text-sm sm:h-[420px]">
      No preview available.
    </div>
  );
}
