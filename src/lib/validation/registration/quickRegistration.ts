import { z } from "zod";
import { titleCase } from "@/lib/utils";
import {
  StandardRegistrationStep1Schema,
  SubmitRegistrationResponseSchema,
} from "@/lib/validation/registration/standard";

export const QuickOnsiteRegistrantSchema = z
  .object({
    id: z.string().default(() => crypto.randomUUID()),
    firstName: z
      .string("Please input your first name")
      .min(2, "First name must be at least 2 characters")
      .max(100),
    lastName: z
      .string("Please input your last name")
      .min(2, "Last name must be at least 2 characters")
      .max(100),
    contactNumber: z.string("Please input your contact number").trim(),
    email: z.email().trim(),
  })
  .transform((data) => ({
    ...data,
    firstName: titleCase(data.firstName).trim(),
    lastName: titleCase(data.lastName).trim(),
  }));

export const QuickOnsiteRegistrationSchema = z.object({
  registrant: QuickOnsiteRegistrantSchema,
});

export const QuickOnsiteRegistrationFormSchema = z
  .object({
    member: z.enum(["member", "nonmember"]),
    businessMemberId: z.string().optional(),
    nonMemberName: z.string().optional(),
    firstName: z
      .string("Please input your first name")
      .min(2, "First name must be at least 2 characters")
      .max(100),
    lastName: z
      .string("Please input your last name")
      .min(2, "Last name must be at least 2 characters")
      .max(100),
    email: z.email(),
    contactNumber: z.string("Please input your contact number").trim(),
    remark: z
      .string()
      .max(500, "Remark cannot exceed 500 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.member === "member" && !data.businessMemberId) {
      ctx.addIssue({
        code: "custom",
        message: "Please select your company / organization / affiliation",
        path: ["businessMemberId"],
      });
    }

    if (data.member === "nonmember" && !data.nonMemberName?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Please input your company / organization / affiliation",
        path: ["nonMemberName"],
      });
    }
  });

export type QuickOnsiteRegistrationForm = z.infer<
  typeof QuickOnsiteRegistrationFormSchema
>;

export const QuickOnsiteRegistrationInputSchema = z.object({
  eventDayId: z.uuid("Invalid event day ID"),
  eventId: z.uuid("Invalid event ID"),
  memberDetails: StandardRegistrationStep1Schema,
  registrant: QuickOnsiteRegistrantSchema,
  remark: z.string().max(500, "Remark cannot exceed 500 characters").optional(),
});

export type QuickOnsiteRegistrationInput = z.infer<
  typeof QuickOnsiteRegistrationInputSchema
>;

export const QuickOnsiteRegistrationResultSchema = z.object({
  rpcResults: SubmitRegistrationResponseSchema,
  identifier: z.string(),
});

export type QuickOnsiteRegistrationResult = z.infer<
  typeof QuickOnsiteRegistrationResultSchema
>;
