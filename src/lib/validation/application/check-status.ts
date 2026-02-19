import { z } from "zod";

export const checkApplicationStatusSchema = z.object({
  identifier: z.string().min(1, "Application identifier is required").trim(),
});

export type CheckApplicationStatusInput = z.infer<
  typeof checkApplicationStatusSchema
>;
