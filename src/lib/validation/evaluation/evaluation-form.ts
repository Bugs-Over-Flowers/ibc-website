import { z } from "zod";

const RATING_SCALE = ["poor", "fair", "good", "veryGood", "excellent"] as const;

export const EvaluationFormSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  name: z
    .string()
    .max(255)
    .optional()
    .transform((v) => v ?? "Anonymous Participant"),
  q1Rating: z.enum(RATING_SCALE),
  q2Rating: z.enum(RATING_SCALE),
  q3Rating: z.enum(RATING_SCALE),
  q4Rating: z.enum(RATING_SCALE),
  q5Rating: z.enum(RATING_SCALE),
  q6Rating: z.enum(RATING_SCALE),
  additionalComments: z.string().max(1000),
  feedback: z.string().max(1000),
});

export type EvaluationFormInput = z.infer<typeof EvaluationFormSchema>;
