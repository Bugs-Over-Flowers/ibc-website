import { z } from "zod";

const ratingEnum = z.enum(["poor", "fair", "good", "veryGood", "excellent"]);

// export const EvaluationFormSchema

export const EvaluationFormSchema = z
  .object({
    eventId: z.string(),
    name: z.string().default(""),

    q1Rating: ratingEnum.nullable(),
    q2Rating: ratingEnum.nullable(),
    q3Rating: ratingEnum.nullable(),
    q4Rating: ratingEnum.nullable(),
    q5Rating: ratingEnum.nullable(),
    q6Rating: ratingEnum.nullable(),

    feedback: z.string().optional(),
    additionalComments: z.string().optional(),
  })
  .refine(
    (data) =>
      data.q1Rating !== null &&
      data.q2Rating !== null &&
      data.q3Rating !== null &&
      data.q4Rating !== null &&
      data.q5Rating !== null &&
      data.q6Rating !== null,
    {
      message: "All ratings are required",
    },
  );

export type EvaluationFormData = z.infer<typeof EvaluationFormSchema>;
