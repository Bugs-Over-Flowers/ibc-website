import z from "zod";

const baseEventSchema = z.object({
  eventTitle: z.string().min(5, "Title must at least be 5 characters"),
  description: z.string().or(z.undefined()), // Allow empty string for draft
  eventStartDate: z.date({
    message: "Event start date is required",
  }),
  eventEndDate: z.date().or(z.undefined()), // Matches Date | undefined
  venue: z.string().or(z.undefined()), // Allow empty string for draft
  registrationFee: z.number().or(z.undefined()), // Allow 0 or any number for draft
  eventImage: z.array(z.instanceof(File)).or(z.undefined()), // Allow empty array for draft
});

const publishBaseEventSchema = z.object({
  eventTitle: z.string().min(5, "Title must at least be 5 characters"),
  description: z.string(),
  eventStartDate: z.date({
    message: "Event start date is required",
  }),
  eventEndDate: z.date({
    message: "Event end date is required",
  }),
  venue: z.string().min(5, "Venue must be 5 characters"),
  registrationFee: z.number().min(0, "Must at least be at least 0"),
  eventImage: z
    .array(z.instanceof(File))
    .min(1, "At least 1 image is required"),
});

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

const draftObj = baseEventSchema.extend({
  eventType: z.literal(null),
});

const publicObj = publishBaseEventSchema.extend({
  eventType: z.literal("public"),
});

const privateObj = publishBaseEventSchema.extend({
  eventType: z.literal("private"),
});

export const draftEventSchema = draftObj.refine(
  dateRefinement,
  dateRefinementOptions,
);

export const publishEventSchema = z
  .union([publicObj, privateObj])
  .refine(
    (data) => data.eventEndDate >= data.eventStartDate,
    dateRefinementOptions,
  );

export const draftEventServerSchema = baseEventSchema
  .extend({
    eventType: z.literal(null),
    eventImage: z.string().url().optional().nullable(),
  })
  .refine(dateRefinement, dateRefinementOptions);

export const publishEventServerSchema = publishBaseEventSchema
  .extend({
    eventType: z.enum(["public", "private"]),
    eventImage: z.string().url(),
  })
  .refine(
    (data) => data.eventEndDate >= data.eventStartDate,
    dateRefinementOptions,
  );

export const createEventSchema = z
  .discriminatedUnion("eventType", [draftObj, publicObj, privateObj])
  .refine(dateRefinement, dateRefinementOptions);

export type DraftEventInput = z.input<typeof draftEventServerSchema>;
export type PublishEventInput = z.input<typeof publishEventServerSchema>;
