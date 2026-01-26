import { z } from "zod";

export const scheduleMeetingSchema = z.object({
  applicationIds: z.array(z.string()),
  interviewDate: z.string().min(1, "Interview date is required"),
  interviewVenue: z
    .string()
    .min(3, "Interview venue is required (min. 3 characters)"),
  customMessage: z.string(),
});

export type ScheduleMeetingInput = z.infer<typeof scheduleMeetingSchema>;
