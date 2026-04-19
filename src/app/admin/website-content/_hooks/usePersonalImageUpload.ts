"use client";

import type { ChangeEvent } from "react";
import { useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type UsePersonalImageUploadOptions = {
  basePath: string;
  onUploaded: (entryKey: string, publicUrl: string) => void;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function usePersonalImageUpload({
  basePath,
  onUploaded,
}: UsePersonalImageUploadOptions) {
  const createImageSelectHandler = useCallback(
    (entryKey: string) => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please select an image.");
        event.target.value = "";
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error("Image too large. Maximum size is 5MB.");
        event.target.value = "";
        return;
      }

      const supabase = await createClient();
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `${basePath}/${entryKey}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("personalimage")
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
      } = supabase.storage.from("personalimage").getPublicUrl(filePath);

      onUploaded(entryKey, publicUrl);
      event.target.value = "";
    },
    [basePath, onUploaded],
  );

  return { createImageSelectHandler };
}
