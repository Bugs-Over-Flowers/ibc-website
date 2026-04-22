import { z } from "zod";
import {
  eventDateRangeRefinement,
  eventDateRangeRefinementOptions,
  eventTitleSchema,
  facebookLinkServerSchema,
  venueSchema,
} from "./shared";

const baseEditEventSchema = z.object({
  eventId: z.uuid(),
  eventTitle: eventTitleSchema,
  description: z.string().optional(),
  eventStartDate: z.iso.datetime({ local: true }),
  eventEndDate: z.iso.datetime({ local: true }),
  venue: venueSchema,
  facebookLink: facebookLinkServerSchema,
});

export const editDraftEventSchema = baseEditEventSchema.extend({
  registrationFee: z.number().min(0, "Must be at least 0"),
  eventType: z.enum(["public", "private"]).nullable(),
  eventImage: z.array(z.instanceof(File)).optional(),
  eventHeaderUrl: z.url().optional(),
  eventPoster: z.array(z.instanceof(File)).optional(),
  eventPosterUrl: z.string().optional(),
});

export const editPublishedEventSchema = baseEditEventSchema.extend({
  eventType: z.literal("public").optional(),
  eventImage: z.array(z.instanceof(File)).optional(),
  eventHeaderUrl: z.url().optional(),
  eventPoster: z.array(z.instanceof(File)).optional(),
  eventPosterUrl: z.string().optional(),
});

export const editDraftEventServerSchema = baseEditEventSchema
  .extend({
    registrationFee: z.number().min(0),
    eventType: z.enum(["public", "private"]).nullable(),
    eventHeaderUrl: z.url().optional(),
    eventPoster: z.url().optional(),
  })
  .refine(eventDateRangeRefinement, eventDateRangeRefinementOptions);

export const editPublishedEventServerSchema = baseEditEventSchema
  .extend({
    eventType: z.literal("public").optional(),
    eventHeaderUrl: z.url().optional(),
    eventPoster: z.url().optional(),
  })
  .refine(eventDateRangeRefinement, eventDateRangeRefinementOptions);

export type EditDraftEventInput = z.infer<typeof editDraftEventServerSchema>;
export type EditPublishedEventInput = z.infer<
  typeof editPublishedEventServerSchema
>;
