import { z } from "zod";
import { CreateNetworkStep1Schema } from "@/lib/validation/network/createNetwork";

const REQUIRED_TEXT_MAX = 255;
const ABOUT_MAX = 2000;

const requiredText = (label: string, max = REQUIRED_TEXT_MAX) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

const logoUrlSchema = CreateNetworkStep1Schema.shape.logoUrl.transform(
  (value, ctx) => {
    if (value instanceof File) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Upload logo first before saving network.",
      });

      return z.NEVER;
    }

    if (!value || value === "") {
      return null;
    }

    return value;
  },
);

export const createNetworkSchema = CreateNetworkStep1Schema.extend({
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
