import { z } from "zod";
import { titleCase } from "@/lib/utils";
import { ApplicationMemberSchema } from "@/lib/validation/membership/application";
import { phoneSchema } from "@/lib/validation/utils";

export const ManualMemberSchema = z
  .object({
    companyName: z
      .string({ message: "Company name is required" })
      .min(1, "Company name is required"),
    sectorId: z
      .string({ message: "Industry/Sector is required" })
      .min(1, "Industry/Sector is required"),
    companyProfileType: z.enum(["image", "document", "website"]),
    companyAddress: z
      .string({ message: "Company address is required" })
      .min(1, "Company address is required"),
    websiteURL: z.string().optional(),
    emailAddress: z.email("Company email is required"),
    landline: z.string().min(1, "Landline is required"),
    mobileNumber: phoneSchema,
    logoImageURL: z
      .string({ message: "Company logo is required" })
      .min(1, "Company logo is required"),
    applicationMemberType: z.enum(["corporate", "personal"]),
    membershipStatus: z.enum(["paid", "unpaid", "cancelled"]),
    representatives: z
      .array(ApplicationMemberSchema)
      .min(1, "At least one representative is required")
      .max(
        2,
        "Maximum of two representatives allowed: one principal and one alternate",
      ),
  })
  .transform((data) => ({
    ...data,
    companyName: titleCase(data.companyName).trim(),
  }));

export type ManualMemberInput = z.infer<typeof ManualMemberSchema>;
