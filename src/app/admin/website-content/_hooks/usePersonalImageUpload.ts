"use client";

import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ImageUploadFileSchema } from "@/lib/fileUpload";
import { removePersonalImages } from "@/lib/storage/personalImage";
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
  oldImageUrl: string | null;
};

type UploadedImageMap = Record<string, string>;

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
            const oldImageUrl =
              next.get(entryKey)?.oldImageUrl ??
              getOldImageUrl?.(entryKey) ??
              null;
            next.set(entryKey, { entryKey, file, previewUrl, oldImageUrl });
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
    [basePath, bucketName, onUploaded, deferred, getOldImageUrl],
  );

  const uploadPendingImages = useCallback(async () => {
    if (pendingUploads.size === 0) {
      return {} as UploadedImageMap;
    }

    const supabase = await createClient();
    const uploadPromises: Promise<{ entryKey: string; success: boolean }>[] =
      [];
    const uploadedImages: UploadedImageMap = {};

    for (const [entryKey, { file, oldImageUrl }] of pendingUploads) {
      uploadPromises.push(
        (async () => {
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
            return { entryKey, success: false };
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from(bucketName).getPublicUrl(filePath);

          // Update with actual public URL (replaces preview URL)
          onUploaded(entryKey, publicUrl);
          uploadedImages[entryKey] = publicUrl;

          if (
            oldImageUrl &&
            !oldImageUrl.startsWith("blob:") &&
            !oldImageUrl.startsWith("data:") &&
            oldImageUrl.trim().length > 0
          ) {
            const { error: deleteError } = await removePersonalImages(
              supabase,
              [oldImageUrl],
            );

            if (deleteError) {
              console.warn(
                `Failed to delete old image for ${entryKey}:`,
                deleteError.message,
              );
            }
          }

          return { entryKey, success: true };
        })(),
      );
    }

    const results = await Promise.all(uploadPromises);
    const successfulEntryKeys = results
      .filter((result) => result.success)
      .map((result) => result.entryKey);

    // Keep failed uploads in state so users can retry them.
    if (successfulEntryKeys.length > 0) {
      setPendingUploads((prev) => {
        const next = new Map(prev);
        for (const entryKey of successfulEntryKeys) {
          next.delete(entryKey);
        }
        return next;
      });
    }

    return uploadedImages;
  }, [pendingUploads, basePath, bucketName, onUploaded]);

  return {
    createImageSelectHandler,
    uploadPendingImages,
  };
}
