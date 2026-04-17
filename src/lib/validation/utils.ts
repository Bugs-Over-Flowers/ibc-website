import z from "zod";
import { Constants } from "../supabase/db.types";

export const phoneSchema = z
  .string()
  .regex(
    /^(\+63|0)9\d{9}$/,
    "Invalid Philippine Phone Number (e.g. +639XXXXXXXXX or 09XXXXXXXXX)",
  );

// TODO : Need to verify this format
export const telefaxSchema = z
  .string()
  .regex(/^\d{4}-\d{4}$/, "Invalid Telefax Number");

// TODO : Need to verify this format

export const landlineSchema = z
  .string()
  .regex(/\d{5}-\d{4}$/, "Invalid Landline Number");

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
