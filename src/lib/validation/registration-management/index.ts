/**
 * Registration Management Validation Schemas
 *
 * Barrel export for all validation schemas used in the registration management page.
 *
 * Page: `/admin/events/[eventId]/registration-list`
 *
 * This folder contains schemas for:
 * - Registration list items (Registrations tab)
 * - Participant list items (Participants tab)
 * - Aggregated statistics (Stats section)
 *
 * Organization Pattern: Page-Centric
 * - All schemas for a single page/feature are grouped together
 * - Makes imports cleaner and ownership clearer
 * - Easier to maintain related concerns in one place
 *
 * @example
 * // Import multiple related schemas in one statement
 * import {
 *   RegistrationItemSchema,
 *   ParticipantListItem,
 *   RegistrationListStats
 * } from "@/lib/validation/registration-management";
 */

// Participant List Schemas
export {
  type ParticipantListItem,
  ParticipantListItemSchema,
  ParticipantListRPCSchema,
  ParticipantSchema,
} from "./participant-list-item";
// Registration List Schemas
export {
  RegistrationDataBaseSchema,
  type RegistrationItem,
  RegistrationItemSchema,
  RegistrationListRPCSchema,
} from "./registration-list-item";

// Statistics Schemas
export {
  type RegistrationListStats,
  RegistrationListStatsSchema,
} from "./stats";
