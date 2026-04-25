import { z } from "zod";
import type { Database } from "@/lib/supabase/db.types";
import { ApplicationMemberBaseSchema } from "../membership/application";
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

  // Representatives (latest application)
  representatives: z
    .array(
      ApplicationMemberBaseSchema.extend({
        applicationMemberId: z.preprocess(
          (value) => (value === "" ? undefined : value),
          z.uuid().optional(),
        ),
      }),
    )
    .length(
      2,
      "Exactly two representatives are required: one principal and one alternate",
    )
    .refine(
      (representatives) => {
        const principalCount = representatives.filter(
          (representative) => representative.companyMemberType === "principal",
        ).length;
        const alternateCount = representatives.filter(
          (representative) => representative.companyMemberType === "alternate",
        ).length;
        return principalCount === 1 && alternateCount === 1;
      },
      {
        message:
          "Exactly two representatives are required: one principal and one alternate",
      },
    ),
});

export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
