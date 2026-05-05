import z from "zod";
import { Constants } from "../supabase/db.types";

// Accepts:
//   +63 9XX XXX XXXX  — mobile with country code
//   09XXXXXXXXX        — mobile local
//   XXX-XXXX           — landline 7-digit
//   XXXX-XXXX          — landline 8-digit
//   0XXX-XXX-XXXX      — landline with 3-digit area code
//   02-XXXX-XXXX       — landline with 2-digit area code
export const phoneOrLandlineSchema = z
  .string()
  .regex(
    /^(\+63\s?9\d{2}\s?\d{3}\s?\d{4}|09\d{9}|\d{3}-\d{4}|\d{4}-\d{4}|0\d{2,3}-\d{3}-\d{4}|02-\d{4}-\d{4})$/,
    "Invalid phone or landline number",
  );

// DEPRECATED — use phoneOrLandlineSchema instead
// export const phoneSchema = z
//   .string()
//   .regex(
//     /^(\+63|0)9\d{9}$/,
//     "Invalid Philippine Phone Number (e.g. +639XXXXXXXXX or 09XXXXXXXXX)",
//   );

// DEPRECATED — use phoneOrLandlineSchema instead
// export const landlineSchema = z
//   .string()
//   .regex(/\d{5}-\d{4}$/, "Invalid Landline Number");

export const MemberTypeEnum = z.enum(["member", "nonmember"]);

export const PaymentMethodEnum = z.enum(["online", "onsite"]);

const PAYMENT_PROOF_STATUSES = Constants.public.Enums.PaymentProofStatus;

export const PaymentProofStatusEnum = z.enum(PAYMENT_PROOF_STATUSES);

export const PaymentProofStatusFilterOptions = [
  "all",
  ...PAYMENT_PROOF_STATUSES,
] as const;

export const PaymentProofStatusFilterEnum = z.enum(
  PaymentProofStatusFilterOptions,
);

export const Base64_32BitString = z
  .string()
  .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/, {
    error: "Invalid base64 string",
  });

export const RegistrationIdentifier = z
  .string()
  .regex(/^ibc-reg-[a-zA-Z0-9]{8}$/);

export type RegistrationIdentifier = z.infer<typeof RegistrationIdentifier>;

export const createRegistrationIdentifier = () => {
  const token = crypto.randomUUID();
  return RegistrationIdentifier.parse(`ibc-reg-${token.slice(0, 8)}`);
};

export const ParticipantIdentifier = z
  .string()
  .regex(/^ibc-par-[a-zA-Z0-9]{8}$/);

export type ParticipantIdentifier = z.infer<typeof ParticipantIdentifier>;

export const createParticipantIdentifier = () => {
  const token = crypto.randomUUID();
  return ParticipantIdentifier.parse(`ibc-par-${token.slice(0, 8)}`);
};
