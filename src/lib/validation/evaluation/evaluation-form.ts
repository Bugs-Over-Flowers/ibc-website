import { z } from "zod";

const ratingEnum = z.enum(["poor", "fair", "good", "veryGood", "excellent"]);

// export const EvaluationFormSchema

export const EvaluationFormSchema = z
  .object({
    eventId: z.string(),
    name: z.string().default(""),

    q1Rating: ratingEnum,
    q2Rating: ratingEnum,
    q3Rating: ratingEnum,
    q4Rating: ratingEnum,
    q5Rating: ratingEnum,
    q6Rating: ratingEnum,

    feedback: z.string().optional(),
    additionalComments: z.string().optional(),
  })
  .refine(
    (data) =>
      data.q1Rating &&
      data.q2Rating &&
      data.q3Rating &&
      data.q4Rating &&
      data.q5Rating &&
      data.q6Rating,
    {
      message: "All ratings are required",
    },
  );

export type EvaluationFormData = z.infer<typeof EvaluationFormSchema>;
