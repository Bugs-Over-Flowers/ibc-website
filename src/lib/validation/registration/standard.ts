import z from "zod";
import { phoneSchema } from "../utils";

export const StandardRegistrationStep1Schema = z
  .object({
    member: z
      .union([z.literal("member"), z.literal("nonmember")])
      .default("member"),
    nonMemberName: z.optional(z.string()),
    businessMemberId: z.optional(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.member === "member") {
      if (!data.businessMemberId) {
        ctx.addIssue({
          code: "custom",
          message: "Business member is required",
          path: ["businessMemberId"],
        });
      }
    } else {
      if (!data.nonMemberName) {
        ctx.addIssue({
          code: "custom",
          message: "Name is required",
          path: ["nonMemberName"],
        });
      }
    }
  });
export type StandardRegistrationStep1Schema = z.infer<
  typeof StandardRegistrationStep1Schema
>;

export const RegistrantDetailsSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  contactNumber: phoneSchema,
  email: z.email(),
});

export const StandardRegistrationStep2Schema = z.object({
  principalRegistrant: RegistrantDetailsSchema,
  otherRegistrants: z.array(RegistrantDetailsSchema).optional(),
});

export type StandardRegistrationStep2Schema = z.infer<
  typeof StandardRegistrationStep2Schema
>;

export const StandardRegistrationStep3Schema = z
  .object({
    paymentMethod: z.union([z.literal("online"), z.literal("onsite")]),
    paymentProofs: z.array(z.url()).optional(),
  })
  .superRefine(({ paymentMethod, paymentProofs }, ctx) => {
    if (paymentMethod === "online" && paymentProofs?.length === 0) {
      // add error if there is no proofs
      ctx.addIssue({
        code: "custom",
        message: "Payment proofs are required",
        path: ["paymentProofs"],
      });
    }

    if (
      paymentMethod === "onsite" &&
      paymentProofs &&
      paymentProofs?.length > 0
    ) {
      // remove payment proofs
      ctx.value.paymentProofs = [];
    }
  });

export type StandardRegistrationStep3Schema = z.infer<
  typeof StandardRegistrationStep3Schema
>;

export const StandardRegistrationSchema = z.object({
  step1: StandardRegistrationStep1Schema,
  step2: StandardRegistrationStep2Schema,
  step3: StandardRegistrationStep3Schema,
});

export type StandardRegistrationSchema = z.infer<
  typeof StandardRegistrationSchema
>;
