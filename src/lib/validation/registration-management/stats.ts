/**
 * Registration Management Statistics Schemas
 *
 * Defines validation schemas for aggregated statistics displayed in the
 * registration management dashboard.
 *
 * Used in: `/admin/events/[eventId]/registration-list` (Stats section)
 *
 * These schemas validate computed metrics from the database that summarize
 * registration and participant data for the event.
 *
 * Pattern: Separate schema for aggregated/computed data
 */

import { z } from "zod";

/**
 * Registration List Statistics Schema
 *
 * Aggregated metrics for the registration management dashboard.
 *
 * Provides overview of:
 * - Total registration count
 * - Breakdown by payment status (verified vs pending)
 * - Total participant count across all registrations
 *
 * Why Separate Schema?
 * - Stats are computed/aggregated data, not individual records
 * - Different shape than list items (numbers vs objects)
 * - Used in different component (stats display vs table)
 * - May evolve independently (e.g., add charts, export formats)
 *
 * Pattern: Create dedicated schemas for aggregated metrics
 *
 * @example
 * // Used to validate RPC function returning stats
 * const stats = RegistrationListStatsSchema.parse(dbResponse);
 * // { totalRegistrations: 45, verifiedRegistrations: 30, ... }
 */
export const RegistrationListStatsSchema = z.object({
  totalRegistrations: z.number().min(0),
  verifiedRegistrations: z.number().min(0),
  pendingRegistrations: z.number().min(0),
  totalParticipants: z.number().min(0),
});

export type RegistrationListStats = z.infer<typeof RegistrationListStatsSchema>;
