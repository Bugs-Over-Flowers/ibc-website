import { z } from "zod";
import {
  ApplicationMemberSchema,
  MembershipApplicationStep3Schema,
} from "@/lib/validation/membership/application";
import { phoneSchema } from "@/lib/validation/utils";

const LOGO_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export const CreateManualMemberStep1Schema = z.object({
  companyName: z
    .string({ message: "Company name is required" })
    .min(1, "Company name is required"),
  sectorId: z
    .string({ message: "Industry/Sector is required" })
    .min(1, "Industry/Sector is required"),
  companyAddress: z
    .string({ message: "Company address is required" })
    .min(1, "Company address is required"),
  websiteURL: z
    .string({ message: "Company website is required" })
    .min(1, "Company website is required"),
  emailAddress: z.email("Company email is required"),
  landline: z.string().min(1, "Landline is required"),
  mobileNumber: phoneSchema,
  logoImageURL: z.union([
    z
      .file("Company logo is required")
      .max(1024 * 1024 * 5, "File size must be less than 5MB")
      .refine(
        (file) => LOGO_IMAGE_MIME_TYPES.includes(file.type),
        "Only PNG and JPG files are allowed",
      ),
    z.string().min(1, "Company logo is required"),
  ]),
  applicationMemberType: z.enum(["corporate", "personal"]),
  membershipStatus: z.enum(["paid", "unpaid", "cancelled"]),
});

export type CreateManualMemberStep1Input = z.infer<
  typeof CreateManualMemberStep1Schema
>;

export const CreateManualMemberStep2Schema = MembershipApplicationStep3Schema;

export const CreateManualMemberRepresentativeSchema = ApplicationMemberSchema;

export type CreateManualMemberStep2Input = z.infer<
  typeof CreateManualMemberStep2Schema
>;
