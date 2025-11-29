// src/lib/validation.ts
import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^(\+63|0)?9\d{9}$/, "Invalid Philippine phone number");

export const emailSchema = z.email("Invalid email address");

export const requiredString = z.string().min(1, "Required");

export const optionalString = z.string().optional().or(z.literal(""));
