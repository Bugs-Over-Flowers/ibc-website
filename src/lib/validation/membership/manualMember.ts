import { z } from "zod";
import { titleCase } from "@/lib/utils";
import { phoneSchema } from "@/lib/validation/utils";

export const ManualMemberSchema = z
  .object({
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
    faxNumber: z.string().min(1, "Telefax is required"),
    logoImageURL: z
      .string({ message: "Company logo is required" })
      .min(1, "Company logo is required"),
    applicationMemberType: z.enum(["corporate", "personal"]),
    membershipStatus: z.enum(["paid", "unpaid", "cancelled"]),
    firstName: z
      .string({ message: "First name is required" })
      .min(1, "First name is required"),
    lastName: z
      .string({ message: "Last name is required" })
      .min(1, "Last name is required"),
    representativeEmailAddress: z.email("Representative email is required"),
    companyDesignation: z
      .string({ message: "Company designation is required" })
      .min(1, "Company designation is required"),
    birthdate: z.date({ message: "Birthdate is required" }),
    sex: z.enum(["male", "female"]),
    nationality: z
      .string({ message: "Nationality is required" })
      .min(1, "Nationality is required"),
    mailingAddress: z
      .string({ message: "Mailing address is required" })
      .min(1, "Mailing address is required"),
    representativeMobileNumber: phoneSchema,
    representativeLandline: z.string().min(1, "Landline is required"),
    representativeFaxNumber: z.string().min(1, "Telefax is required"),
    companyMemberType: z.enum(["principal", "alternate"]),
  })
  .transform((data) => ({
    ...data,
    companyName: titleCase(data.companyName).trim(),
    firstName: titleCase(data.firstName).trim(),
    lastName: titleCase(data.lastName).trim(),
    nationality: titleCase(data.nationality).trim(),
    companyDesignation:
      data.companyDesignation === data.companyDesignation.toLowerCase()
        ? titleCase(data.companyDesignation).trim()
        : data.companyDesignation.trim(),
  }));

export type ManualMemberInput = z.infer<typeof ManualMemberSchema>;
