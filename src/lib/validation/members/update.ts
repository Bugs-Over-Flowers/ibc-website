import { z } from "zod";
import { phoneSchema } from "@/lib/validation/utils";

export const UpdateMemberSchema = z.object({
  // Identifiers
  memberId: z.string().uuid(),
  applicationId: z.string().uuid(),

  // Company Information
  businessName: z.string().min(1, "Company name is required"),
  sectorId: z.coerce.number().min(1, "Sector is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  websiteURL: z.string().url("Invalid URL").optional().or(z.literal("")),

  // Contact Information
  emailAddress: z.string().email("Invalid email address"),
  landline: z.string().min(1, "Landline is required"),
  faxNumber: z.string().optional(),
  mobileNumber: phoneSchema.optional(),

  // Membership Details
  membershipStatus: z
    .enum(["paid", "unpaid", "cancelled", "expired", "pending"])
    .optional(), // Adjust based on DB enum
  joinDate: z.coerce.date().optional(),
  membershipExpiryDate: z.coerce.date().optional().nullable(),
});

export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
