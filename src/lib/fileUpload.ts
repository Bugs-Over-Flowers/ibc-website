import { z } from "zod";

export const IMAGE_UPLOAD_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const IMAGE_UPLOAD_ALLOWED_MIME_TYPE_SET = new Set(
  IMAGE_UPLOAD_ALLOWED_MIME_TYPES,
);

export const IMAGE_UPLOAD_ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

export const IMAGE_UPLOAD_ACCEPT_ATTR = "image/png,image/jpeg,.png,.jpg,.jpeg";

export const IMAGE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024;

export const ImageUploadFileSchema = z
  .file()
  .max(IMAGE_UPLOAD_MAX_SIZE, "File size must be less than 5MB")
  .refine(
    (file) => IMAGE_UPLOAD_ALLOWED_MIME_TYPE_SET.has(file.type),
    "Only PNG, JPG, and JPEG files are allowed.",
  );

export type ImageUploadFile = z.infer<typeof ImageUploadFileSchema>;

export function isValidImageUploadFile(file: File): boolean {
  return ImageUploadFileSchema.safeParse(file).success;
}
