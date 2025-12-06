import z from "zod";
import { phoneSchema } from "../utils";

export const StandardRegistrationStep1Schema = z
  .object({
    member: z
      .union([z.literal("member"), z.literal("nonmember")])
      .default("member"),
    nonMemberName: z.string(),
    businessMemberId: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.member === "member") {
      if (data.businessMemberId === "") {
        // require business member id if member
        ctx.addIssue({
          code: "custom",
          message: "Business member is required",
          path: ["businessMemberId"],
        });
      }
    } else {
      if (data.nonMemberName === "") {
        // require name if non-member
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

export const StandardRegistrationStep2Schema = z
  .object({
    principalRegistrant: RegistrantDetailsSchema,
    otherRegistrants: z.optional(z.array(RegistrantDetailsSchema)),
  })
  .superRefine((data, ctx) => {
    const seen = new Map<string, number>();

    // Add principal registrant to the map first with index -1 to indicate it's the principal
    const principalKey = `${data.principalRegistrant.firstName.toLowerCase()}-${data.principalRegistrant.lastName.toLowerCase()}`;
    seen.set(principalKey, -1);

    // check if there is a possible duplicate person inputted
    if (data.otherRegistrants && data.otherRegistrants.length > 0) {
      data.otherRegistrants.forEach((registrant, index) => {
        const key = `${registrant.firstName.toLowerCase()}-${registrant.lastName.toLowerCase()}`;
        if (seen.has(key)) {
          // biome-ignore lint/style/noNonNullAssertion: seen.has(key) run
          const duplicateOfIndex = seen.get(key)!;
          const duplicateOfLabel =
            duplicateOfIndex === -1
              ? "Principal Registrant"
              : `Participant ${duplicateOfIndex + 2}`;
          ctx.addIssue({
            code: "custom",
            message: `There is a duplicate registrant with the same first name and last name (${duplicateOfLabel} and Participant ${index + 2})`,
            path: ["otherRegistrants", index],
          });
        }
        seen.set(key, index);
      });
    }
  });

export type StandardRegistrationStep2Schema = z.infer<
  typeof StandardRegistrationStep2Schema
>;

export const StandardRegistrationStep3Schema = z
  .object({
    paymentMethod: z.union([z.literal("online"), z.literal("onsite")]),
    paymentProof: z.file().optional(),
  })
  .superRefine(({ paymentMethod, paymentProof }, ctx) => {
    if (paymentMethod === "online" && !paymentProof) {
      // add error if there is no proof
      ctx.addIssue({
        code: "custom",
        message: "Payment proof is required when paying online.",
        path: ["paymentProof"],
      });
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
