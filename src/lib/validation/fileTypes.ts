import { fileTypeFromBuffer } from "file-type";
import {
  IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
  ImageUploadFileSchema,
} from "@/lib/fileUpload";

/**
 * Validates file type both by MIME type and actual file content
 * @param file - The file to validate
 * @returns Promise<boolean> - True if file type is allowed
 */
export const validateFileType = async (file: File): Promise<boolean> => {
  try {
    // First check the MIME type and size via the shared Zod schema
    if (!ImageUploadFileSchema.safeParse(file).success) {
      return false;
    }

    // Then validate the actual file content using file-type
    const buffer = await file.arrayBuffer();
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      return false;
    }

    return IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(
      fileType.mime as (typeof IMAGE_UPLOAD_ALLOWED_MIME_TYPES)[number],
    );
  } catch {
    return false;
  }
};
