import { z } from "zod";

const RATING_SCALE = ["poor", "fair", "good", "veryGood", "excellent"] as const;

export const EvaluationFormSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  name: z
    .string()
    .max(255)
    .optional()
    .transform((v) => {
      if (v == null || v.trim() === "") {
        return "Anonymous Participant";
      }
      return v.trim();
    }),
  q1Rating: z.enum(RATING_SCALE),
  q2Rating: z.enum(RATING_SCALE),
  q3Rating: z.enum(RATING_SCALE),
  q4Rating: z.enum(RATING_SCALE),
  q5Rating: z.enum(RATING_SCALE),
  q6Rating: z.enum(RATING_SCALE),
  additionalComments: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  feedback: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

export type EvaluationFormInput = z.infer<typeof EvaluationFormSchema>;
