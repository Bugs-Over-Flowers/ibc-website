import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";
import { getExtensionFromMimeType } from "@/lib/utils";

/**
 * Uploads company logo file to Supabase storage.
 *
 * @param file - Company logo image file from user
 * @returns Path to uploaded file in storage
 * @throws Error if upload fails
 */
export async function uploadCompanyLogo(file: File): Promise<string> {
  const uuid = uuidv4();
  const supabase = await createClient();

  // Extract file extension from MIME type
  const extension = getExtensionFromMimeType(file.type);
  const filePath = `logo-${uuid}`;

  const { data, error } = await supabase.storage
    .from("logos")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload company logo: ${error.message}`);
  }

  return `${data.path}.${extension}`;
}
