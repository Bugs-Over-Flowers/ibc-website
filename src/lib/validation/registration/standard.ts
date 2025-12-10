import z from "zod";
import { MemberTypeEnum, PaymentMethodEnum, phoneSchema } from "../utils";

export const StandardRegistrationStep1Schema = z.discriminatedUnion("member", [
  z.object({
    member: z.literal(MemberTypeEnum.enum.member),
    businessMemberId: z.string().min(1),
  }),
  z.object({
    member: z.literal(MemberTypeEnum.enum.nonmember),
    nonMemberName: z.string().min(2).max(100),
  }),
]);

export type StandardRegistrationStep1Schema = z.infer<
  typeof StandardRegistrationStep1Schema
>;

export const RegistrantDetailsSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  contactNumber: phoneSchema,
  email: z.email(),
});

export const StandardRegistrationStep2Schema = z
  .object({
    principalRegistrant: RegistrantDetailsSchema,
    otherRegistrants: z.array(RegistrantDetailsSchema).default([]),
  })
  .superRefine((data, ctx) => {
    // Logic remains mostly the same, just slightly cleaner map usage
    const seen = new Map<string, number>();

    // Helper to generate key
    const getKey = (f: string, l: string, e: string) =>
      `${f.toLowerCase()}-${l.toLowerCase()}-${e.toLowerCase()}`;

    // Add principal
    const pKey = getKey(
      data.principalRegistrant.firstName,
      data.principalRegistrant.lastName,
      data.principalRegistrant.email,
    );
    seen.set(pKey, -1);

    data.otherRegistrants.forEach((registrant, index) => {
      const key = getKey(
        registrant.firstName,
        registrant.lastName,
        registrant.email,
      );

      if (seen.has(key)) {
        // biome-ignore lint/style/noNonNullAssertion: seen.has(key) run
        const duplicateIndex = seen.get(key)!;
        const duplicateLabel =
          duplicateIndex === -1
            ? "Principal Registrant"
            : `Participant ${duplicateIndex + 2}`; // +2 because 0-index + principal

        ctx.addIssue({
          code: "custom",
          message: `Duplicate registrant: ${registrant.firstName} ${registrant.lastName}, ${registrant.email} is already listed as ${duplicateLabel}`,
          path: ["otherRegistrants", index],
        });
      } else {
        seen.set(key, index);
      }
    });
  });

export type StandardRegistrationStep2Schema = z.infer<
  typeof StandardRegistrationStep2Schema
>;

export const StandardRegistrationStep3Schema = z.discriminatedUnion(
  "paymentMethod",
  [
    z
      .object({
        paymentMethod: z.literal(PaymentMethodEnum.enum.online),
        paymentProof: z
          .file()
          .max(1024 * 1024 * 5)
          .optional(),
      })
      .refine((data) => data.paymentProof !== undefined, {
        message: "Payment proof is required for online payment.",
        path: ["paymentProof"],
      }),
    z.object({
      paymentMethod: z.literal(PaymentMethodEnum.enum.onsite),
    }),
  ],
);

export type StandardRegistrationStep3Schema = z.infer<
  typeof StandardRegistrationStep3Schema
>;

export const StandardRegistrationStep4Schema = z.object({
  termsAndConditions: z.boolean().refine((val) => val, {
    error: "You must agree to the terms and conditions.",
  }),
});

export type StandardRegistrationStep4Schema = z.infer<
  typeof StandardRegistrationStep4Schema
>;

export const StandardRegistrationSchema = z.object({
  step1: StandardRegistrationStep1Schema,
  step2: StandardRegistrationStep2Schema,
  step3: StandardRegistrationStep3Schema,
  step4: StandardRegistrationStep4Schema,
});

export type StandardRegistrationSchema = z.infer<
  typeof StandardRegistrationSchema
>;

export const ServerRegistrationSchema = z.object({
  eventId: z.uuid(),
  step1: StandardRegistrationStep1Schema,
  step2: StandardRegistrationStep2Schema,
  step4: StandardRegistrationStep4Schema,
  step3: z.discriminatedUnion("paymentMethod", [
    z.object({
      paymentMethod: z.literal("online"),
      path: z.string(),
    }),
    z.object({
      paymentMethod: z.literal("onsite"),
    }),
  ]),
});

export type ServerRegistrationSchema = z.infer<typeof ServerRegistrationSchema>;
