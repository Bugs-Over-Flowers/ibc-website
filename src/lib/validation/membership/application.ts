import { z } from "zod";
import {
  ImageUploadFileSchema,
  ProfileUploadFileSchema,
} from "@/lib/fileUpload";
import { titleCase } from "@/lib/utils";
import { phoneSchema } from "../utils";

export const ApplicationTypeEnum = z.enum(["newMember", "updating", "renewal"]);
export const MembershipPaymentMethodEnum = z.enum(["BPI", "ONSITE"]);
export const CompanyMemberTypeEnum = z.enum(["principal", "alternate"]);
export const ApplicationMemberTypeEnum = z.enum(["corporate", "personal"]);
export const SexEnum = z.enum(["male", "female"]);

export const MembershipApplicationStep1Schema = z
  .object({
    applicationType: ApplicationTypeEnum,
    businessMemberIdentifier: z.string().optional(),
    existingApplicationMemberType: ApplicationMemberTypeEnum.optional(),
    businessMemberId: z
      .preprocess(
        (value) => (value === "" ? undefined : value),
        z.uuid().optional(),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.applicationType === "renewal" ||
        data.applicationType === "updating") &&
      (!data.businessMemberIdentifier ||
        data.businessMemberIdentifier.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Business Member Identifier is required for renewal and update applications",
        path: ["businessMemberIdentifier"],
      });
    }
  });

export type MembershipApplicationStep1Schema = z.infer<
  typeof MembershipApplicationStep1Schema
>;

export const ApplicationMemberBaseSchema = z.object({
  companyMemberType: CompanyMemberTypeEnum,
  firstName: z
    .string({ message: "First name is required" })
    .min(1, "First name is required"),
  lastName: z
    .string({ message: "Last name is required" })
    .min(1, "Last name is required"),
  emailAddress: z.email("Email is required"),
  companyDesignation: z
    .string({ message: "Company designation is required" })
    .min(1, "Company designation is required"),
  birthdate: z.date({ message: "Birthdate is required" }),
  sex: SexEnum,
  nationality: z
    .string({ message: "Nationality is required" })
    .min(1, "Nationality is required"),
  mailingAddress: z
    .string({ message: "Mailing address is required" })
    .min(1, "Mailing address is required"),
  mobileNumber: phoneSchema,
  landline: z.string().min(1, "Landline is required"),
});

export const ApplicationMemberSchema = ApplicationMemberBaseSchema.transform(
  (data) => {
    // Only apply titleCase to companyDesignation if all letters are lowercase
    const isAllLowercase =
      data.companyDesignation === data.companyDesignation.toLowerCase();
    return {
      ...data,
      firstName: titleCase(data.firstName).trim(),
      lastName: titleCase(data.lastName).trim(),
      companyDesignation: isAllLowercase
        ? titleCase(data.companyDesignation).trim()
        : data.companyDesignation.trim(),
      nationality: titleCase(data.nationality).trim(),
    };
  },
);

export const MembershipApplicationStep2Schema = z
  .object({
    companyName: z
      .string({ message: "Company name is required" })
      .min(1, "Company name is required"),
    sectorId: z
      .string({ message: "Industry/Sector is required" })
      .min(1, "Industry/Sector is required"),
    companyProfileType: z.enum(["file", "website"]),
    companyProfileFile: ProfileUploadFileSchema.optional(),
    websiteURL: z.string().optional(),
    companyAddress: z
      .string({ message: "Company address is required" })
      .min(1, "Company address is required"),
    emailAddress: z.email("Email address is required"),
    landline: z.string().min(1, "Landline is required"),
    mobileNumber: phoneSchema,
    logoImageURL: z.string().optional(),
    logoImage: ImageUploadFileSchema.optional(),
  })
  .refine(
    (data) => {
      return (
        (!!data.logoImageURL && data.logoImageURL.length > 0) ||
        !!data.logoImage
      );
    },
    { message: "Company logo is required", path: ["logoImage"] },
  )
  .superRefine((data, ctx) => {
    if (
      data.companyProfileType === "website" &&
      (!data.websiteURL || !data.websiteURL.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company profile is required",
        path: ["websiteURL"],
      });
    }
    if (
      data.companyProfileType === "file" &&
      (!data.websiteURL || data.websiteURL.trim().length === 0) &&
      !data.companyProfileFile
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company profile file is required",
        path: ["companyProfileFile"],
      });
    }
  })
  .transform((data) => ({
    ...data,
    companyName: titleCase(data.companyName).trim(),
  }));

export type MembershipApplicationStep2Schema = z.infer<
  typeof MembershipApplicationStep2Schema
>;

export const MembershipApplicationStep3Schema = z.object({
  representatives: z
    .array(ApplicationMemberSchema)
    .min(1, "At least one representative is required")
    .max(
      2,
      "Maximum of two representatives allowed: one principal and one alternate",
    ),
});

export type MembershipApplicationStep3Schema = z.infer<
  typeof MembershipApplicationStep3Schema
>;

export const MembershipApplicationStep4Schema = z
  .object({
    applicationMemberType: ApplicationMemberTypeEnum,
    paymentMethod: MembershipPaymentMethodEnum,
    paymentProofUrl: z.string().optional(),
    paymentProof: ImageUploadFileSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.paymentMethod === "BPI" &&
      !data.paymentProofUrl &&
      !data.paymentProof
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Proof of payment is required for online transactions",
        path: ["paymentProof"],
      });
    }
  });

export type MembershipApplicationStep4Schema = z.infer<
  typeof MembershipApplicationStep4Schema
>;

export const MembershipApplicationSchema = z
  .object({
    applicationType: ApplicationTypeEnum,
    applicationMemberType: ApplicationMemberTypeEnum,
    businessMemberId: z.string().optional(),
    companyName: z.string().min(1, "Company name is required"),
    sectorName: z
      .string({ message: "Industry/Sector is required" })
      .min(1, "Industry/Sector is required"),
    companyProfileType: z.enum(["image", "document", "website"]),
    companyAddress: z.string().min(1, "Company address is required"),
    websiteURL: z.string().min(1, "Company profile is required"),
    emailAddress: z.email("Email address is required"),
    landline: z.string("Landline is required").min(1, "Landline is required"),
    mobileNumber: phoneSchema,
    logoImageURL: z
      .string({ message: "Company logo is required" })
      .min(1, "Company logo is required"),
    representatives: z
      .array(ApplicationMemberSchema)
      .min(1, "At least one representative is required")
      .max(
        2,
        "Maximum of two representatives allowed: one principal and one alternate",
      ),
    paymentMethod: MembershipPaymentMethodEnum,
    paymentProofUrl: z.string().optional(),
    paymentProof: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.paymentMethod === "BPI" &&
      !data.paymentProofUrl &&
      !data.paymentProof
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Proof of payment is required for online transactions",
        path: ["paymentProof"],
      });
    }
  });

export type MembershipApplicationInput = z.infer<
  typeof MembershipApplicationSchema
>;
export type ApplicationMemberInput = z.infer<typeof ApplicationMemberSchema>;
