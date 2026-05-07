import { z } from "zod";
import { ImageUploadFileSchema } from "@/lib/fileUpload";

const REQUIRED_TEXT_MAX = 255;
const ABOUT_MAX = 2000;

const requiredText = (label: string, max = REQUIRED_TEXT_MAX) =>
  z
    .string({ message: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

export const CreateNetworkStep1Schema = z.object({
  organization: requiredText("Organization"),
  about: requiredText("About", ABOUT_MAX),
  locationType: requiredText("Location/Type"),
  representativeName: requiredText("Representative name"),
  representativePosition: requiredText("Representative position"),
  logoUrl: z.union([
    ImageUploadFileSchema,
    z
      .string()
      .trim()
      .url("Logo URL must be a valid URL")
      .max(2048, "Logo URL is too long"),
    z.literal(""),
    z.null(),
  ]),
});

export type CreateNetworkStep1Input = z.infer<typeof CreateNetworkStep1Schema>;
