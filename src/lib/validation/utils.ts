import { z } from "zod";
import { Constants } from "../supabase/db.types";

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

export const PaymentStatusEnum = z.enum(Constants.public.Enums.PaymentStatus);
