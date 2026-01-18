import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";
import { getExtensionFromMimeType } from "@/lib/utils";

/**
 * Uploads payment proof file to Supabase storage.
 *
 * This function handles the complete payment proof upload process:
 * 1. Generates a unique UUID to prevent filename collisions
 * 2. Uploads the file to the 'paymentProofs' bucket
 * 3. Constructs the final path with the correct file extension
 *
 * @param file - Payment proof image file from user
 * @returns Path to uploaded file in storage (format: "reg-{uuid}.{extension}")
 * @throws Error if upload fails
 *
 * @example
 * const path = await uploadPaymentProof(imageFile);
 * // Returns: "reg-abc123-def456.jpeg"
 */
export async function uploadPaymentProof(file: File): Promise<string> {
  const uuid = uuidv4();
  const supabase = await createClient();

  console.log(file);

  // Extract file extension from MIME type (e.g., "image/jpeg" → "jpeg")
  const extension = getExtensionFromMimeType(file.type);
  const filePath = `reg-${uuid}`;

  const { data, error } = await supabase.storage
    .from("paymentproofs")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  console.log(error);

  if (error) {
    throw new Error(`Failed to upload payment proof: ${error.message}`);
  }

  return `${data.path}.${extension}`;
}
