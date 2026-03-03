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
      <ImageZoom className="h-[420px] w-full">
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
    <div className="flex h-[420px] items-center justify-center rounded-md border text-muted-foreground text-sm">
      No preview available.
    </div>
  );
}
