import { fileTypeFromBuffer } from "file-type";

// Allowed file types for uploads
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

/**
 * Validates file type both by MIME type and actual file content
 * @param file - The file to validate
 * @returns Promise<boolean> - True if file type is allowed
 */
export const validateFileType = async (file: File): Promise<boolean> => {
  try {
    // First check the MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return false;
    }

    // Then validate the actual file content using file-type
    const buffer = await file.arrayBuffer();
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      // For PDFs, file-type might not detect it, so fallback to MIME type check
      return file.type === "application/pdf";
    }

    return ALLOWED_IMAGE_TYPES.includes(fileType.mime);
  } catch {
    return false;
  }
};

/**
 * Synchronous validation for client-side forms (only checks MIME type)
 * @param file - The file to validate
 * @returns boolean - True if MIME type is allowed
 */
export const validateFileTypeMime = (file: File): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(file.type);
};
