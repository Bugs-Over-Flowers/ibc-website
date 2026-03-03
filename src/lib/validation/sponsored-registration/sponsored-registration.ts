import { z } from "zod";

// Shared base validation rules
const sponsoredRegistrationBase = {
  sponsoredBy: z
    .string()
    .min(1, "Sponsor name is required")
    .max(255, "Sponsor name too long"),
  feeDeduction: z
    .number()
    .min(0, "Fee deduction cannot be negative")
    .max(1500, "Fee deduction cannot exceed ₱1500"),
  maxSponsoredGuests: z
    .number()
    .int("Must be a whole number")
    .positive("Must be at least 1 guest"),
};

// Form schema (with coercion for form inputs)
export const createSRFormSchema = z.object({
  eventId: z.string().min(1, "Please select an event"),
  ...sponsoredRegistrationBase,
  feeDeduction: z.coerce.number().min(0).max(1500),
  maxSponsoredGuests: z.coerce.number().int().positive(),
});

// Server-side schema (stricter validation)
export const createSRSchema = z.object({
  eventId: z.string().uuid("Invalid Event ID format"),
  ...sponsoredRegistrationBase,
});

export type CreateSRInput = z.infer<typeof createSRSchema>;
