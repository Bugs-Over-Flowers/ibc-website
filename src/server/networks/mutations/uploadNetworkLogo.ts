"use server";

import {
  NETWORK_LOGO_BUCKET,
  validateNetworkLogoFile,
} from "@/lib/storage/networkLogo";
import { createActionClient } from "@/lib/supabase/server";

export async function uploadNetworkLogo(formData: FormData): Promise<string> {
  const fileValue = formData.get("file");

  if (!(fileValue instanceof File)) {
    throw new Error("No logo file was provided.");
  }

  const validationError = validateNetworkLogoFile(fileValue);
  if (validationError) {
    throw new Error(validationError);
  }

  const actionClient = await createActionClient();

  const {
    data: { user },
    error: authError,
  } = await actionClient.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in to upload a logo.");
  }

  const extensionByMimeType: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
  };
  const extension = extensionByMimeType[fileValue.type] ?? "png";
  const filePath = `network-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await actionClient.storage
    .from(NETWORK_LOGO_BUCKET)
    .upload(filePath, fileValue, {
      contentType: fileValue.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload logo: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = actionClient.storage.from(NETWORK_LOGO_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}
