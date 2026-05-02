import { z } from "zod";

export const IMPORT_REGISTRATIONS_MAX_ROWS = 300;

export const ImportRegistrationRowPayloadSchema = z
  .object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    contact_number: z.string().optional(),
    affiliation: z.string().optional(),
    note: z.string().optional(),
    source_submission_id: z.string().optional(),
    source_submitted_at: z.string().optional(),
  })
  .strip();

export type ImportRegistrationRowPayload = z.infer<
  typeof ImportRegistrationRowPayloadSchema
>;

export const ImportEventRegistrationsInputSchema = z.object({
  eventId: z.uuid("Invalid event ID"),
  dryRun: z.boolean().default(false),
  rows: z
    .array(ImportRegistrationRowPayloadSchema)
    .min(1)
    .max(IMPORT_REGISTRATIONS_MAX_ROWS),
});

export type ImportEventRegistrationsInput = z.infer<
  typeof ImportEventRegistrationsInputSchema
>;

export const ImportEventRegistrationResultStatusSchema = z.enum([
  "would_insert",
  "inserted",
  "invalid",
  "failed",
  "skipped_duplicate",
]);

export const ImportEventRegistrationRowResultSchema = z.object({
  rowNumber: z.number().int().positive(),
  status: ImportEventRegistrationResultStatusSchema,
  sourceSubmissionId: z.string().nullable().optional(),
  registrationId: z.uuid().optional(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

export type ImportEventRegistrationRowResult = z.infer<
  typeof ImportEventRegistrationRowResultSchema
>;

export const ImportEventRegistrationsResultSchema = z.object({
  total: z.number().int().min(0),
  valid: z.number().int().min(0),
  invalid: z.number().int().min(0),
  wouldInsert: z.number().int().min(0),
  inserted: z.number().int().min(0),
  skippedDuplicate: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(ImportEventRegistrationRowResultSchema),
});

export type ImportEventRegistrationsResult = z.infer<
  typeof ImportEventRegistrationsResultSchema
>;
