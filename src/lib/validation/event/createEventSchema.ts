import { z } from "zod";

// Date refinement for comparing start and end dates
const dateRefinement = (data: {
  eventStartDate: Date;
  eventEndDate?: Date;
}) => {
  if (!data.eventEndDate) return true;
  return data.eventEndDate >= data.eventStartDate;
};

const dateRefinementOptions = {
  message: "Event end date must be after start date",
  path: ["eventEndDate"],
};

// Draft Event Schema (client-side form)
// Only eventTitle and eventStartDate are required
const draftEventClientSchema = z.object({
  eventTitle: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string(),
  eventStartDate: z.date({
    message: "Event start date is required",
  }),
  eventEndDate: z.date({
    message: "Event end date is required",
  }),
  venue: z.string(),
  registrationFee: z.number().optional(),
  eventImage: z.array(z.instanceof(File)).optional(),
  eventType: z.literal(null),
});

// Published Event Schema (client-side form)
// All fields are required
const publishedEventClientSchema = z.object({
  eventTitle: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(1, "Description is required"),
  eventStartDate: z.date({
    message: "Event start date is required",
  }),
  eventEndDate: z.date({
    message: "Event end date is required",
  }),
  venue: z.string().min(5, "Venue must be at least 5 characters"),
  registrationFee: z.number().min(0, "Registration fee must be at least 0"),
  eventImage: z
    .array(z.instanceof(File))
    .min(1, "At least 1 image is required"),
});

// Public event client schema
const publicEventClientSchema = publishedEventClientSchema.extend({
  eventType: z.literal("public"),
});

// Private event client schema
const privateEventClientSchema = publishedEventClientSchema.extend({
  eventType: z.literal("private"),
});

// Combined client-side schema with discriminated union
export const createEventSchema = z
  .discriminatedUnion("eventType", [
    draftEventClientSchema,
    publicEventClientSchema,
    privateEventClientSchema,
  ])
  .refine(dateRefinement, dateRefinementOptions);

// Server-side schemas
// Draft Event Server Schema
export const draftEventServerSchema = z
  .object({
    eventTitle: z.string().min(5, "Title must be at least 5 characters"),
    description: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().optional(),
    ),
    eventStartDate: z.date({
      message: "Event start date is required",
    }),
    eventEndDate: z.date().optional(),
    venue: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().optional(),
    ),
    registrationFee: z.number().optional(),
    eventImage: z.string().url().optional().nullable(),
    eventType: z.literal(null),
  })
  .refine(dateRefinement, dateRefinementOptions);

// Published Event Server Schema
export const publishEventServerSchema = z
  .object({
    eventTitle: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(1, "Description is required"),
    eventStartDate: z.date({
      message: "Event start date is required",
    }),
    eventEndDate: z.date({
      message: "Event end date is required",
    }),
    venue: z.string().min(5, "Venue must be at least 5 characters"),
    registrationFee: z.number().min(0, "Registration fee must be at least 0"),
    eventImage: z.string().url(),
    eventType: z.enum(["public", "private"]),
  })
  .refine(dateRefinement, dateRefinementOptions);

export type DraftEventInput = z.input<typeof draftEventServerSchema>;
export type PublishEventInput = z.input<typeof publishEventServerSchema>;
