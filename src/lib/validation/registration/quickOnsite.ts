import { z } from "zod";
import { titleCase } from "@/lib/utils";
import { StandardRegistrationStep1Schema } from "@/lib/validation/registration/standard";
import { landlineSchema, phoneSchema } from "@/lib/validation/utils";

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
    contactNumber: z
      .string("Please input your contact number")
      .refine(
        (data) =>
          z.union([phoneSchema, landlineSchema]).safeParse(data).success,
        {
          error:
            "Contact number must be a valid Philippine phone or landline number",
        },
      ),
    // TODO: Restore stricter email validation if onsite walk-ins require it later.
    email: z.string().trim(),
  })
  .transform((data) => ({
    ...data,
    firstName: titleCase(data.firstName).trim(),
    lastName: titleCase(data.lastName).trim(),
  }));

export const QuickOnsiteStep2Schema = z.object({
  registrant: QuickOnsiteRegistrantSchema,
  otherParticipants: z.array(QuickOnsiteRegistrantSchema).default([]),
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
    // TODO: Restore stricter email validation if onsite walk-ins require it later.
    email: z.email(),
    contactNumber: z
      .string("Please input your contact number")
      .refine(
        (data) =>
          z.union([phoneSchema, landlineSchema]).safeParse(data).success,
        {
          error:
            "Contact number must be a valid Philippine phone or landline number",
        },
      ),
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
  step1: StandardRegistrationStep1Schema,
  step2: QuickOnsiteStep2Schema,
  remark: z.string().max(500, "Remark cannot exceed 500 characters").optional(),
});

export type QuickOnsiteRegistrationInput = z.infer<
  typeof QuickOnsiteRegistrationInputSchema
>;

export const QuickOnsiteRegistrationResultSchema = z.object({
  registrationId: z.uuid(),
  identifier: z.string(),
  checkedInCount: z.number().int().nonnegative(),
});

export type QuickOnsiteRegistrationResult = z.infer<
  typeof QuickOnsiteRegistrationResultSchema
>;
