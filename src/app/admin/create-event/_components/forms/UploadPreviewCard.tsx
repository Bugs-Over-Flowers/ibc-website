"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type UploadPreviewCardProps = {
  label: string;
  file: File | null;
  aspectClass: string;
  className?: string;
};

export default function UploadPreviewCard({
  label,
  file,
  aspectClass,
  className,
}: UploadPreviewCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <div className={cn("flex h-full flex-col gap-2", className)}>
      <p className="font-medium text-sm">{label}</p>
      <div className="flex-1">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-lg border bg-muted/20 sm:aspect-auto sm:h-full sm:min-h-[280px]",
            aspectClass,
          )}
        >
          {previewUrl ? (
            <Image
              alt={label}
              className="object-cover"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              src={previewUrl}
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
              No new image selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
