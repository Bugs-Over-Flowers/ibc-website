"use client";

import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ImageUploadFileSchema } from "@/lib/fileUpload";
import { createClient } from "@/lib/supabase/client";

type UsePersonalImageUploadOptions = {
  basePath: string;
  onUploaded: (entryKey: string, publicUrl: string) => void;
  bucketName?: string;
  deferred?: boolean;
  getOldImageUrl?: (entryKey: string) => string | undefined;
};

type PendingUpload = {
  entryKey: string;
  file: File;
  previewUrl: string;
};

export function usePersonalImageUpload({
  basePath,
  onUploaded,
  bucketName = "personalimage",
  deferred = false,
  getOldImageUrl,
}: UsePersonalImageUploadOptions) {
  const [pendingUploads, setPendingUploads] = useState<
    Map<string, PendingUpload>
  >(new Map());

  const createImageSelectHandler = useCallback(
    (entryKey: string) => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const validationResult = ImageUploadFileSchema.safeParse(file);
      if (!validationResult.success) {
        toast.error(
          validationResult.error.issues[0]?.message ??
            "Invalid file. Please select a PNG, JPG, or JPEG image up to 5MB.",
        );
        event.target.value = "";
        return;
      }

      if (deferred) {
        // Store file locally and use a data URL for preview so we avoid blob: URLs.
        const reader = new FileReader();
        reader.onload = () => {
          const previewUrl =
            typeof reader.result === "string" ? reader.result : "";

          setPendingUploads((prev) => {
            const next = new Map(prev);
            next.set(entryKey, { entryKey, file, previewUrl });
            return next;
          });

          // Update state to show preview (doesn't trigger upload)
          onUploaded(entryKey, previewUrl);
        };
        reader.readAsDataURL(file);
        event.target.value = "";
        return;
      }

      // Original immediate upload behavior
      const supabase = await createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `${basePath}/${entryKey}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        toast.error(`Image upload failed: ${uploadError.message}`);
        event.target.value = "";
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      onUploaded(entryKey, publicUrl);
      event.target.value = "";
    },
    [basePath, bucketName, onUploaded, deferred],
  );

  const uploadPendingImages = useCallback(async () => {
    if (pendingUploads.size === 0) {
      return;
    }

    const supabase = await createClient();
    const uploadPromises: Promise<void>[] = [];

    // Helper to extract file path from public URL
    const extractFilePathFromUrl = (publicUrl: string): string | null => {
      try {
        const url = new URL(publicUrl);
        // URL format: https://....supabase.co/storage/v1/object/public/personalimage/path/to/file
        const pathMatch = url.pathname.match(
          /\/storage\/v1\/object\/public\/[^/]+\/(.*)/,
        );
        return pathMatch ? pathMatch[1] : null;
      } catch {
        return null;
      }
    };

    for (const [entryKey, { file }] of pendingUploads) {
      uploadPromises.push(
        (async () => {
          // Delete old image if it exists
          if (getOldImageUrl) {
            const oldImageUrl = getOldImageUrl(entryKey);
            if (
              oldImageUrl &&
              !oldImageUrl.startsWith("blob:") &&
              oldImageUrl.trim().length > 0
            ) {
              const oldFilePath = extractFilePathFromUrl(oldImageUrl);
              if (oldFilePath) {
                const { error: deleteError } = await supabase.storage
                  .from(bucketName)
                  .remove([oldFilePath]);

                if (deleteError) {
                  console.warn(
                    `Failed to delete old image for ${entryKey}:`,
                    deleteError.message,
                  );
                  // Continue with upload even if delete fails
                }
              }
            }
          }

          const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
          const filePath = `${basePath}/${entryKey}-${crypto.randomUUID()}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
              contentType: file.type,
              upsert: false,
            });

          if (uploadError) {
            toast.error(
              `Image upload failed for ${entryKey}: ${uploadError.message}`,
            );
            return;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from(bucketName).getPublicUrl(filePath);

          // Update with actual public URL (replaces preview URL)
          onUploaded(entryKey, publicUrl);
        })(),
      );
    }

    await Promise.all(uploadPromises);
    // Clear pending uploads after successful upload
    setPendingUploads(new Map());
  }, [pendingUploads, basePath, bucketName, onUploaded, getOldImageUrl]);

  return {
    createImageSelectHandler,
    uploadPendingImages,
    pendingUploads: pendingUploads.size > 0,
  };
}
