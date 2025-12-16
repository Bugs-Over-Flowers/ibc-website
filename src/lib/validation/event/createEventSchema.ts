import z from "zod";

const baseEventSchema = z.object({
  eventTitle: z.string().min(5, "Title must atleast be 5 characters"),
  description: z.string(),
  eventStartDate: z
    .string()
    .pipe(z.coerce.date({ message: "Event start date is required" })),
  eventEndDate: z
    .string()
    .pipe(z.coerce.date({ message: "event end date is required" })),
  venue: z.string().min(5, "Venue must atleast be 5 characters"),
  registrationFee: z.number().min(0, "Must atleast be atleast 0"),
  eventImage: z
    .array(z.instanceof(File))
    .min(1, "At least 1 image is required"),
});

const dateRefinement = (data: { eventStartDate: Date; eventEndDate: Date }) =>
  data.eventEndDate >= data.eventStartDate;

const dateRefinementOptions = {
  message: "Event end date must be after start date",
  path: ["eventEndDate"],
};

const draftObj = baseEventSchema.extend({
  eventType: z.literal(null),
});

const publicObj = baseEventSchema.extend({
  eventType: z.literal("public"),
});

const privateObj = baseEventSchema.extend({
  eventType: z.literal("private"),
});

export const draftEventSchema = draftObj.refine(
  dateRefinement,
  dateRefinementOptions,
);

export const publishEventSchema = z
  .union([publicObj, privateObj])
  .refine(dateRefinement, dateRefinementOptions);

export const draftEventServerSchema = baseEventSchema
  .extend({
    eventType: z.literal(null),
    eventImage: z.string().url(),
  })
  .refine(dateRefinement, dateRefinementOptions);

export const publishEventServerSchema = baseEventSchema
  .extend({
    eventType: z.enum(["public", "private"]),
    eventImage: z.string().url(),
  })
  .refine(dateRefinement, dateRefinementOptions);

const createEventSchema = z
  .discriminatedUnion("eventType", [draftObj, publicObj, privateObj])
  .refine(dateRefinement, dateRefinementOptions);

export default createEventSchema;
