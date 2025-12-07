import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^(\+63|0)?9\d{9}$/, "Invalid Philippine phone number");

export const telefaxSchema = z
  .string()
  .regex(/^\d{4}-\d{4}$/, "Invalid telefax number");

export const landlineSchema = z
  .string()
  .regex(/^0\d{4}-\d{4}$/, "Invalid landline number");

export const MemberTypeEnum = z.enum(["member", "nonmember"]);

export const PaymentMethodEnum = z.enum(["online", "onsite"]);

export const Base64_32BitString = z
  .string()
  .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/, {
    error: "Invalid base64 string of length 32",
  });
