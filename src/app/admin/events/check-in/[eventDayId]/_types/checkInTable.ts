import type { GetCheckInForDateSchema } from "@/lib/validation/qr/standard";

// Extract participant type from the validated schema
export type ParticipantWithCheckIn =
  GetCheckInForDateSchema["participants"][number];

// Flattened row type for the table
export type ParticipantCheckInRow = ParticipantWithCheckIn & {
  // Add parent registration context
  eventId: string;
  registrationId: string;
  identifier: string;
  affiliation: string | null;
};
