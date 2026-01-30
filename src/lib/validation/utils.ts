import { z } from "zod";
import { Constants } from "../supabase/db.types";

export const phoneSchema = z
  .string()
  .regex(/^(\+63|0)?9\d{9}$/, "Invalid Philippine Phone Number");

// TODO : Need to verify this format
export const telefaxSchema = z
  .string()
  .regex(/^\d{4}-\d{4}$/, "Invalid Telefax Number");

// TODO : Need to verify this format

export const landlineSchema = z
  .string()
  .regex(/^0\d{4}-\d{4}$/, "Invalid Landline Number");

export const MemberTypeEnum = z.enum(["member", "nonmember"]);

export const PaymentMethodEnum = z.enum(["online", "onsite"]);

export const PaymentStatusEnum = z.enum(Constants.public.Enums.PaymentStatus);
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
