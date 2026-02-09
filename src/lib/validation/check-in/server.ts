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

// Update remarks validation schema
export const UpdateCheckInRemarksInput = z.object({
  eventDayId: z.uuid("Invalid event day ID"),
  participants: z
    .array(
      z.object({
        participantId: z.string().uuid("Invalid participant ID"),
        remarks: z
          .string()
          .max(500, "Remark cannot exceed 500 characters")
          .nullable(),
      }),
    )
    .min(1, "At least one participant is required"),
});

export type UpdateCheckInRemarksInput = z.infer<
  typeof UpdateCheckInRemarksInput
>;

export type UpdateCheckInRemarksOutput = {
  updatedCount: number;
};

// Update check-in time validation schema
export const UpdateCheckInTimeInput = z.object({
  checkInId: z.string().uuid("Invalid check-in ID"),
  checkInTime: z.string().datetime("Invalid datetime format"),
  eventDayId: z.string().uuid("Invalid event day ID"),
});

export type UpdateCheckInTimeInput = z.infer<typeof UpdateCheckInTimeInput>;

export type UpdateCheckInTimeOutput = {
  success: boolean;
};
