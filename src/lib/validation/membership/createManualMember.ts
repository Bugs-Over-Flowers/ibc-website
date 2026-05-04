import { z } from "zod";
import {
  ImageUploadFileSchema,
  ProfileUploadFileSchema,
} from "@/lib/fileUpload";
import {
  ApplicationMemberSchema,
  MembershipApplicationStep3Schema,
} from "@/lib/validation/membership/application";
import { phoneSchema } from "@/lib/validation/utils";

export const CreateManualMemberStep1Schema = z
  .object({
    companyName: z
      .string({ message: "Company name is required" })
      .min(1, "Company name is required"),
    sectorId: z
      .string({ message: "Industry/Sector is required" })
      .min(1, "Industry/Sector is required"),
    companyProfileType: z.enum(["file", "website"]),
    companyProfileFile: ProfileUploadFileSchema.optional(),
    companyAddress: z
      .string({ message: "Company address is required" })
      .min(1, "Company address is required"),
    websiteURL: z.string().optional(),
    emailAddress: z.email("Company email is required"),
    landline: z.string().min(1, "Landline is required"),
    mobileNumber: phoneSchema,
    logoImageURL: z.union([
      ImageUploadFileSchema,
      z.string().min(1, "Company logo is required"),
    ]),
    applicationMemberType: z.enum(["corporate", "personal"]),
    membershipStatus: z.enum(["paid", "unpaid", "cancelled"]),
  })
  .refine(
    (data) => {
      if (data.companyProfileType === "website") {
        return !!data.websiteURL && data.websiteURL.trim().length > 0;
      }
      return true;
    },
    { message: "Company profile is required", path: ["websiteURL"] },
  )
  .refine(
    (data) => {
      if (data.companyProfileType === "file") {
        return !!data.companyProfileFile;
      }
      return true;
    },
    {
      message: "Company profile file is required",
      path: ["companyProfileFile"],
    },
  );

export type CreateManualMemberStep1Input = z.infer<
  typeof CreateManualMemberStep1Schema
>;

export const CreateManualMemberStep2Schema = MembershipApplicationStep3Schema;

export const CreateManualMemberRepresentativeSchema = ApplicationMemberSchema;

export type CreateManualMemberStep2Input = z.infer<
  typeof CreateManualMemberStep2Schema
>;
