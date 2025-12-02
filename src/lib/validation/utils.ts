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
