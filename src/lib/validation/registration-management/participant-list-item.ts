/**
 * Participant List Item Validation Schemas
 *
 * Defines validation schemas for individual participant records displayed in the
 * registration management table (admin view).
 *
 * Used in: `/admin/events/[eventId]/registration-list` (Participants tab)
 *
 * Schema Naming Convention:
 * - `*Schema` = Zod validation schema
 * - `*RPCSchema` = Database RPC response transformer (snake_case → camelCase)
 *
 * Pattern: Database → RPC Schema (transform) → Client Schema → TypeScript Type
 */

import { z } from "zod";

/**
 * Base Participant Schema
 *
 * Full participant record with all fields.
 * This is the canonical participant shape used throughout the app.
 *
 * Key Fields:
 * - participantId: Unique identifier
 * - firstName/lastName: Full name
 * - email: Contact email (validated)
 * - contactNumber: Phone number
 * - isPrincipal: Whether this is the primary registrant
 *
 * Pattern: Define full schema, use .pick()/.omit() for subsets
 */
export const ParticipantSchema = z.object({
  participantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  contactNumber: z.string(),
  isPrincipal: z.boolean(),
});

/**
 * Participant List Item Schema
 *
 * Extended schema for participant table display with registration context.
 *
 * Extends base participant with:
 * - affiliation: Organization/company from registration
 * - registrationDate: When they registered
 * - registrationId: Link back to parent registration
 *
 * Why .pick() + .extend()?
 * - Reuse existing ParticipantSchema for consistency
 * - Add page-specific fields needed for admin view
 * - Exclude isPrincipal since it's not shown in the list
 *
 * Pattern: Pick needed fields, extend with context-specific data
 */
export const ParticipantListItemSchema = ParticipantSchema.pick({
  participantId: true,
  firstName: true,
  lastName: true,
  email: true,
  contactNumber: true,
}).extend({
  affiliation: z.string(),
  registrationDate: z.string(),
  registrationId: z.string(),
});

export type ParticipantListItem = z.infer<typeof ParticipantListItemSchema>;

/**
 * Participant List RPC Response Schema
 *
 * Transforms snake_case database/RPC responses into camelCase client-side data.
 *
 * Pipeline: Database RPC → .pipe() → .transform() → ParticipantListItemSchema → Type
 *
 * Why .pipe() + .transform()?
 * - First validates raw database format (snake_case)
 * - Then transforms to client format (camelCase)
 * - Finally validates against ParticipantListItemSchema for type safety
 *
 * Pattern: RPC schemas always follow this structure:
 * 1. Define snake_case schema matching database response
 * 2. Use .pipe() to chain validation
 * 3. Use .transform() to convert to camelCase
 * 4. Parse through final client schema for validation
 *
 * @example
 * // Database returns snake_case
 * const dbData = { participant_id: "...", first_name: "John" };
 * // After validation/transform
 * const clientData = { participantId: "...", firstName: "John" };
 */
export const ParticipantListRPCSchema = z
  .object({
    participant_id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.email(),
    contact_number: z.string(),
    affiliation: z.string(),
    registration_date: z.string(),
    registration_id: z.string(),
  })
  .pipe(
    z.transform((val) =>
      ParticipantListItemSchema.parse({
        participantId: val.participant_id,
        firstName: val.first_name,
        lastName: val.last_name,
        email: val.email,
        contactNumber: val.contact_number,
        affiliation: val.affiliation,
        registrationDate: val.registration_date,
        registrationId: val.registration_id,
      }),
    ),
  );
