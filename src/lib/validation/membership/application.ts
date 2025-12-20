import { z } from "zod";
import { landlineSchema, phoneSchema, telefaxSchema } from "../utils";

export const ApplicationTypeEnum = z.enum(["newMember", "updating", "renewal"]);
export const MembershipPaymentMethodEnum = z.enum(["BPI", "ONSITE"]);
export const CompanyMemberTypeEnum = z.enum(["principal", "alternate"]);
export const ApplicationMemberTypeEnum = z.enum(["corporate", "personal"]);
export const SexEnum = z.enum(["male", "female"]);

export const MembershipApplicationStep1Schema = z.object({
  applicationType: ApplicationTypeEnum,
});

export type MembershipApplicationStep1Schema = z.infer<
  typeof MembershipApplicationStep1Schema
>;

export const ApplicationMemberSchema = z.object({
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
  landline: landlineSchema,
  faxNumber: telefaxSchema,
});

export const MembershipApplicationStep2Schema = z
  .object({
    companyName: z
      .string({ message: "Company name is required" })
      .min(1, "Company name is required"),
    sectorId: z.union([z.string(), z.number()]).refine(
      (val) => {
        const num = typeof val === "string" ? Number.parseInt(val, 10) : val;
        return !Number.isNaN(num) && num > 0;
      },
      { message: "Industry/Sector is required" },
    ),
    companyAddress: z
      .string({ message: "Company address is required" })
      .min(1, "Company address is required"),
    websiteURL: z
      .string({ message: "Company profile is required" })
      .min(1, "Company profile is required"),
    emailAddress: z.email("Email address is required"),
    landline: z.string("Landline is required").min(1, "Landline is required"),
    mobileNumber: phoneSchema,
    faxNumber: z.string("Telefax is required").min(1, "Telefax is required"),
    logoImageURL: z.string().optional(),
    logoImage: z
      .file("Company logo is required")
      .max(1024 * 1024 * 5)
      .optional(),
  })
  .refine(
    (data) => {
      return (
        (!!data.logoImageURL && data.logoImageURL.length > 0) ||
        !!data.logoImage
      );
    },
    { message: "Company logo is required", path: ["logoImage"] },
  );

export type MembershipApplicationStep2Schema = z.infer<
  typeof MembershipApplicationStep2Schema
>;

export const MembershipApplicationStep3Schema = z.object({
  representatives: z
    .array(ApplicationMemberSchema)
    .min(1, "At least one representative is required"),
});

export type MembershipApplicationStep3Schema = z.infer<
  typeof MembershipApplicationStep3Schema
>;

export const MembershipApplicationStep4Schema = z
  .object({
    applicationMemberType: ApplicationMemberTypeEnum,
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

export type MembershipApplicationStep4Schema = z.infer<
  typeof MembershipApplicationStep4Schema
>;

export const MembershipApplicationSchema = z
  .object({
    applicationType: ApplicationTypeEnum,
    applicationMemberType: ApplicationMemberTypeEnum,
    companyName: z.string().min(1, "Company name is required"),
    sectorId: z.number({ message: "Industry/Sector is required" }),
    companyAddress: z.string().min(1, "Company address is required"),
    websiteURL: z.string().min(1, "Company profile is required"),
    emailAddress: z.email("Email address is required"),
    landline: z.string("Landline is required").min(1, "Landline is required"),
    mobileNumber: phoneSchema,
    faxNumber: z.string("Telefax is required").min(1, "Telefax is required"),
    logoImageURL: z
      .string({ message: "Company logo is required" })
      .min(1, "Company logo is required"),
    representatives: z
      .array(ApplicationMemberSchema)
      .min(1, "At least one representative is required"),
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
