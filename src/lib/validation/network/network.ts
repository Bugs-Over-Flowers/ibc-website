import { z } from "zod";

const REQUIRED_TEXT_MAX = 255;
const ABOUT_MAX = 2000;

const requiredText = (label: string, max = REQUIRED_TEXT_MAX) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

const logoUrlSchema = z
  .string()
  .trim()
  .url("Logo URL must be a valid URL")
  .max(2048, "Logo URL is too long")
  .nullable()
  .optional()
  .transform((value) => {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const createNetworkSchema = z.object({
  organization: requiredText("Organization"),
  about: requiredText("About", ABOUT_MAX),
  locationType: requiredText("Location/Type"),
  representativeName: requiredText("Representative name"),
  representativePosition: requiredText("Representative position"),
  logoUrl: logoUrlSchema,
});

export const updateNetworkSchema = createNetworkSchema;

export type CreateNetworkInput = z.infer<typeof createNetworkSchema>;
export type UpdateNetworkInput = z.infer<typeof updateNetworkSchema>;
