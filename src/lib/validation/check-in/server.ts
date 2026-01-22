import { z } from "zod";

// Input validation schema

export const CheckInParticipantsInput = z.object({
  eventDayId: z.uuid("Invalid event day ID"),
  participants: z
    .array(
      z.object({
        participantId: z.string().uuid("Invalid participant ID"),
        remarks: z.string().optional(),
      }),
    )
    .min(1, "At least one participant is required"),
});

export type CheckInParticipantsInput = z.infer<typeof CheckInParticipantsInput>;

export type CheckInParticipantsOutput = {
  checkInCount: number;
  message?: string;
};
