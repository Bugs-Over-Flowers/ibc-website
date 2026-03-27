import z from "zod";
import { titleCase } from "@/lib/utils";
import {
  landlineSchema,
  MemberTypeEnum,
  PaymentMethodEnum,
  phoneSchema,
} from "../utils";

export const StandardRegistrationStep1Schema = z.discriminatedUnion("member", [
  z.object({
    member: z.literal(MemberTypeEnum.enum.member),
    businessMemberId: z
      .string("Please select your company / organization / affiliation")
      .min(1, "Please select your company / organization / affiliation"),
  }),
  z.object({
    member: z.literal(MemberTypeEnum.enum.nonmember),
    nonMemberName: z
      .string("Please input your company / organization / affiliation")
      .min(1, "Please input your company / organization / affiliation")
      .max(
        100,
        "Please input a company / organization / affiliation less than 100 characters",
      ),
  }),
]);

export type StandardRegistrationStep1Schema = z.infer<
  typeof StandardRegistrationStep1Schema
>;

export const RegistrantDetailsSchema = z
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
    email: z.email().trim(),
  })
  .transform((data) => ({
    ...data,
    firstName: titleCase(data.firstName).trim(),
    lastName: titleCase(data.lastName).trim(),
  }));

export type RegistrantDetails = z.infer<typeof RegistrantDetailsSchema>;

export const StandardRegistrationStep2Schema = z
  .object({
    registrant: RegistrantDetailsSchema,
    otherParticipants: z.array(RegistrantDetailsSchema).default([]),
  })
  .superRefine((data, ctx) => {
    /**
     * DUPLICATE PARTICIPANT DETECTION ALGORITHM
     *
     * Purpose: Prevent the same person from being registered multiple times
     * in a single registration (either as registrant or other participant).
     *
     * Algorithm:
     * 1. Create composite key: "firstname-lastname-email" (case-insensitive)
     * 2. Store registrant with index -1 (special marker)
     * 3. Store other participants with their array indices (0, 1, 2, ...)
     * 4. If duplicate found, generate user-friendly error message
     *
     * Example:
     * Registrant: John Doe (john@example.com) → index: -1
     * Participant 1: Jane Smith (jane@example.com) → index: 0
     * Participant 2: John Doe (john@example.com) → DUPLICATE!
     * Error: "Duplicate registrant: John Doe, john@example.com is already listed as Principal Registrant"
     *
     * Why index offset (+2 in error message):
     * - Array is 0-indexed: [0, 1, 2]
     * - But users see: "Participant 2, Participant 3, Participant 4"
     * - Offset = +1 for human counting, +1 for principal registrant = +2
     */
    const seen = new Map<string, number>();

    // Helper to generate composite key from participant details
    const getKey = (f: string, l: string, e: string) =>
      `${f.toLowerCase()}-${l.toLowerCase()}-${e.toLowerCase()}`;

    // Add principal registrant with special index -1
    const pKey = getKey(
      data.registrant.firstName,
      data.registrant.lastName,
      data.registrant.email,
    );
    seen.set(pKey, -1);

    // Check each other participant for duplicates
    data.otherParticipants.forEach((participant, index) => {
      const key = getKey(
        participant.firstName,
        participant.lastName,
        participant.email,
      );

      if (seen.has(key)) {
        // biome-ignore lint/style/noNonNullAssertion: seen.has(key) guarantees the value exists
        const duplicateIndex = seen.get(key)!;
        const duplicateLabel =
          duplicateIndex === -1
            ? "Principal Registrant"
            : `Participant ${duplicateIndex + 2}`; // +2 offset explained above

        ctx.addIssue({
          code: "custom",
          message: `Duplicate registrant: ${participant.firstName} ${participant.lastName}, ${participant.email} is already listed as ${duplicateLabel}`,
          path: ["otherParticipants", index],
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
    error: "You must agree to the Terms and Conditions.",
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
  sponsoredRegistrationId: z.string().uuid().optional().nullable(),
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
