import z from "zod";

// Schema for editing events - varies based on event status
const baseEditEventSchema = z.object({
  eventId: z.uuid(),
  eventTitle: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  eventStartDate: z.iso.datetime({ local: true }),
  eventEndDate: z.iso.datetime({ local: true }),
  venue: z.string().min(1, "Venue is required"),
});

// Draft events can edit everything
export const editDraftEventSchema = baseEditEventSchema.extend({
  registrationFee: z.number().min(0, "Must be at least 0"),
  eventType: z.enum(["public", "private"]).nullable(),
  eventImage: z.array(z.instanceof(File)).optional(),
  eventHeaderUrl: z.url().optional(),
});

// Published events can only edit limited fields
export const editPublishedEventSchema = baseEditEventSchema.extend({
  eventImage: z.array(z.instanceof(File)).optional(),
  eventHeaderUrl: z.url().optional(),
});

// Server schemas (after image upload, eventImage becomes URL string)
export const editDraftEventServerSchema = baseEditEventSchema
  .extend({
    registrationFee: z.number().min(0),
    eventType: z.enum(["public", "private"]).nullable(),
    eventHeaderUrl: z.url().optional(),
  })
  .refine((data) => data.eventEndDate >= data.eventStartDate, {
    message: "Event end date must be after start date",
    path: ["eventEndDate"],
  });

export const editPublishedEventServerSchema = baseEditEventSchema
  .extend({
    eventHeaderUrl: z.url().optional(),
  })
  .refine((data) => data.eventEndDate >= data.eventStartDate, {
    message: "Event end date must be after start date",
    path: ["eventEndDate"],
  });

export type EditDraftEventInput = z.infer<typeof editDraftEventServerSchema>;
export type EditPublishedEventInput = z.infer<
  typeof editPublishedEventServerSchema
>;
