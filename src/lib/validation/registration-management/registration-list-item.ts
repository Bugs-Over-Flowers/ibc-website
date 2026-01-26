/**
 * Registration List Item Validation Schemas
 *
 * Defines validation schemas for individual registration records displayed in the
 * registration management table (admin view).
 *
 * Used in: `/admin/events/[eventId]/registration-list` (Registrations tab)
 *
 * Schema Naming Convention:
 * - `*Schema` = Zod validation schema
 * - `*RPCSchema` = Database RPC response transformer (snake_case → camelCase)
 * - `*BaseSchema` = Shared foundation for extended schemas
 *
 * Pattern: Database → RPC Schema (transform) → Client Schema → TypeScript Type
 */

import { z } from "zod";
import { Constants, type Enums } from "@/lib/supabase/db.types";
import { RegistrationIdentifier } from "@/lib/validation/utils";

//
// Database Enum Constants
// Import enums from generated Supabase types to ensure type safety
//
const PaymentMethod = Constants.public.Enums.PaymentMethod;
const PaymentStatus = Constants.public.Enums.PaymentStatus;

/**
 * Registrant Information (Partial)
 *
 * Basic contact information for the primary registrant.
 * This is a subset of the full participant schema, containing only
 * the essential fields needed for list display.
 *
 * Pattern: Define inline for page-specific needs
 */
const RegistrationListRegistrantSchema = z.object({
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
});

/**
 * Base Registration Schema
 *
 * Contains fields common to ALL registrations regardless of member status.
 * This schema is extended by RegistrationItemSchema using discriminated unions.
 *
 * Key Fields:
 * - registrationId: UUID primary key
 * - affiliation: Organization/company name
 * - registrationDate: ISO 8601 datetime with timezone offset
 * - paymentStatus: Enum (verified, pending, etc.)
 * - paymentMethod: Enum (onsite, gcash, bank_transfer)
 * - registrant: Nested schema with basic contact info
 * - registrationIdentifier: Unique QR code identifier (format: ibc-reg-XXXXXXXX)
 * - people: Total number of participants (≥0)
 *
 * Pattern: Define base schema, extend with discriminated unions for variants
 */
export const RegistrationDataBaseSchema = z.object({
  registrationId: z.uuid(),
  affiliation: z.string(),
  registrationDate: z.iso.datetime({ offset: true }),
  paymentStatus: z.enum(PaymentStatus),
  paymentMethod: z.enum(PaymentMethod),
  registrant: RegistrationListRegistrantSchema,
  registrationIdentifier: RegistrationIdentifier,
  people: z.number().min(0),
});

/**
 * Registration Item (Discriminated Union)
 *
 * Handles two registration types based on member status:
 *
 * 1. Member Registration (isMember: true)
 *    - Has businessMemberId and businessName (nullable for data integrity)
 *
 * 2. Non-Member Registration (isMember: false)
 *    - No business fields (implicitly undefined)
 *
 * Why Discriminated Union?
 * - Type-safe field access: TypeScript narrows types based on `isMember`
 * - Better autocompletion: IDE knows which fields exist after checking `isMember`
 * - Runtime validation: Zod enforces correct field combinations
 *
 * Pattern: Use discriminated unions when data shape varies by a discriminator field
 *
 * @example
 * // TypeScript knows these fields exist after type guard
 * if (registration.isMember) {
 *   console.log(registration.businessName); // ✅ Type-safe
 * }
 */
export const RegistrationItemSchema = z.discriminatedUnion("isMember", [
  RegistrationDataBaseSchema.extend({
    businessMemberId: z.uuid().nullable(),
    businessName: z.string().nullable(),
    isMember: z.literal(true),
  }),
  RegistrationDataBaseSchema.extend({
    isMember: z.literal(false),
  }),
]);

export type RegistrationItem = z.infer<typeof RegistrationItemSchema>;

/**
 * Registration List RPC Response Schema
 *
 * Transforms snake_case database/RPC responses into camelCase client-side data.
 *
 * Pipeline: Database RPC → .pipe() → .transform() → RegistrationItemSchema → Type
 *
 * Why .pipe() + .transform()?
 * - First validates raw database format (snake_case)
 * - Then transforms to client format (camelCase)
 * - Finally validates against RegistrationItemSchema for type safety
 *
 * Pattern: RPC schemas always follow this structure:
 * 1. Define snake_case schema matching database response
 * 2. Use .pipe() to chain validation
 * 3. Use .transform() to convert to camelCase
 * 4. Parse through final client schema for validation
 *
 * @example
 * // Database returns snake_case
 * const dbData = { registration_id: "...", is_member: true };
 * // After validation/transform
 * const clientData = { registrationId: "...", isMember: true };
 */
export const RegistrationListRPCSchema = z
  .object({
    registration_id: z.uuid(),
    affiliation: z.string(),
    registration_date: z.iso.datetime({ offset: true }),
    payment_status: z.string(),
    payment_method: z.string(),
    business_member_id: z.uuid().nullable(),
    business_name: z.string().nullable(),
    is_member: z.boolean(),
    registrant: RegistrationListRegistrantSchema,
    registration_identifier: RegistrationIdentifier,
    people: z.number().min(0),
  })
  .pipe(
    z.transform((val) =>
      RegistrationItemSchema.parse({
        registrationId: val.registration_id,
        affiliation: val.affiliation,
        registrationDate: val.registration_date,
        paymentStatus: val.payment_status as Enums<"PaymentStatus">,
        paymentMethod: val.payment_method as Enums<"PaymentMethod">,
        businessMemberId: val.business_member_id,
        businessName: val.business_name,
        isMember: val.is_member,
        registrant: val.registrant,
        registrationIdentifier: val.registration_identifier,
        people: val.people,
      }),
    ),
  );
