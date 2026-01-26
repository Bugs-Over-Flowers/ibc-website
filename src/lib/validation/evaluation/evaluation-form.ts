import { z } from "zod";

const ratingEnum = z.enum(["poor", "fair", "good", "veryGood", "excellent"]);

export const EvaluationFormSchema = z
  .object({
    eventId: z.string(),
    name: z.string().optional().or(z.literal("")),

    q1Rating: ratingEnum.or(z.literal("")),
    q2Rating: ratingEnum.or(z.literal("")),
    q3Rating: ratingEnum.or(z.literal("")),
    q4Rating: ratingEnum.or(z.literal("")),
    q5Rating: ratingEnum.or(z.literal("")),
    q6Rating: ratingEnum.or(z.literal("")),

    feedback: z.string().optional().or(z.literal("")),
    additionalComments: z.string().optional().or(z.literal("")),
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
