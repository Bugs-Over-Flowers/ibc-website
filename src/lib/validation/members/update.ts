import { z } from "zod";
import type { Database } from "@/lib/supabase/db.types";
import { phoneSchema } from "../utils";

type MembershipStatusEnum = Database["public"]["Enums"]["MembershipStatus"];

const MEMBERSHIP_STATUS_VALUES = [
  "paid",
  "unpaid",
  "cancelled",
] as const satisfies readonly MembershipStatusEnum[];

const WEBSITE_URL_REGEX =
  /^(https?:\/\/)?((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}(\/[^\s]*)?$/;

export const UpdateMemberSchema = z.object({
  // Identifiers
  memberId: z.uuid(),
  applicationId: z.uuid(),

  // Company Information
  businessName: z.string().min(1, "Company name is required"),
  sectorId: z.coerce.number().min(1, "Sector is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  websiteURL: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) {
        return true;
      }
      return WEBSITE_URL_REGEX.test(value);
    }, "Invalid URL"),

  // Contact Information
  emailAddress: z.email("Invalid email address"),
  landline: z.string().min(1, "Landline is required"),
  faxNumber: z.string().optional(),
  mobileNumber: phoneSchema.optional(),

  // Membership Details
  membershipStatus: z.enum(MEMBERSHIP_STATUS_VALUES).optional(),
  joinDate: z.coerce.date().optional(),
  membershipExpiryDate: z.coerce.date().optional().nullable(),
});

export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
