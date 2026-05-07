"use client";

import { X } from "lucide-react";
import Image from "next/image";

interface PaymentProofGridProps {
  files?: File[];
  previews?: string[];
  onRemove?: (index: number) => void;
  readOnly?: boolean;
}

export default function PaymentProofGrid({
  files,
  previews,
  onRemove,
  readOnly = false,
}: PaymentProofGridProps) {
  const resolvedPreviews =
    previews ??
    (files ?? []).map((f) =>
      f.type?.startsWith("image/") ? URL.createObjectURL(f) : "",
    );
  const count = files?.length ?? previews?.length ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => {
        const preview = resolvedPreviews[index];
        const fileName = files?.[index]?.name;

        return (
          <div
            className="group relative overflow-hidden rounded-lg border border-border/60 bg-background"
            key={fileName ? `${fileName}-${index}` : `proof-${index}`}
          >
            {preview ? (
              <div className="relative aspect-4/3 w-full">
                <Image
                  alt={`Proof ${index + 1}`}
                  className="object-contain"
                  fill
                  src={preview}
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex aspect-4/3 items-center justify-center p-2 text-muted-foreground text-xs">
                Preview not available
              </div>
            )}
            {!readOnly && onRemove && (
              <button
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onRemove(index)}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <div className="truncate px-1 py-0.5 text-center text-[10px] text-muted-foreground">
              {index + 1}. {fileName ?? `Proof ${index + 1}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
