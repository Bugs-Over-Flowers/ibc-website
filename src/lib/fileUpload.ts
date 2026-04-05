export const IMAGE_UPLOAD_ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
} as const;

export const IMAGE_UPLOAD_ACCEPT_ATTR = "image/png,image/jpeg,image/jpg";

export const IMAGE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024;

const IMAGE_UPLOAD_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

export function isValidImageUploadFile(file: File): boolean {
  return (
    IMAGE_UPLOAD_MIME_TYPES.has(file.type) && file.size <= IMAGE_UPLOAD_MAX_SIZE
  );
}
