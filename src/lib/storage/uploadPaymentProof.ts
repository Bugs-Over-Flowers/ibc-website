import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";

/**
 * Uploads payment proof file to Supabase storage.
 *
 * This function handles the complete payment proof upload process:
 * 1. Generates a unique UUID to prevent filename collisions
 * 2. Uploads the file to the 'paymentproofs' bucket
 * 3. Constructs the final path with the correct file extension
 *
 * @param file - Payment proof image file from user
 * @returns Path to uploaded file in storage (format: "{prefix}-{uuid}")
 * @throws Error if upload fails
 *
 * @example
 * const path = await uploadPaymentProof(imageFile, { prefix: "reg" });
 * // Returns: "reg-abc123-def456"
 */
export async function uploadPaymentProof(
  file: File,
  options?: { prefix?: "reg" | "app" },
): Promise<string> {
  const uuid = uuidv4();
  const supabase = await createClient();
  const prefix = options?.prefix ?? "reg";
  const filePath = `${prefix}-${uuid}`;

  const { data, error } = await supabase.storage
    .from("paymentproofs")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload payment proof: ${error.message}`);
  }

  return data.path;
}
