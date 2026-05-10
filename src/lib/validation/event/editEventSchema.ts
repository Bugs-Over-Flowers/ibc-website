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
  venue: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().optional(),
  ),
  facebookLink: facebookLinkServerSchema,
});

export const editDraftEventSchema = baseEditEventSchema.extend({
  registrationFee: z.number().min(0, "Must be at least 0"),
  eventType: z.enum(["public", "private"]).nullable(),
  venue: z.string().optional(),
  eventImage: z.array(z.instanceof(File)).optional(),
  eventHeaderUrl: z.url().optional(),
  eventPoster: z.array(z.instanceof(File)).optional(),
  eventPosterUrl: z.string().optional(),
});

export const editPublishedEventSchema = baseEditEventSchema.extend({
  eventType: z.literal("public").optional(),
  venue: venueSchema,
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
    venue: venueSchema,
    eventHeaderUrl: z.url().optional(),
    eventPoster: z.url().optional(),
  })
  .refine(eventDateRangeRefinement, eventDateRangeRefinementOptions);

export type EditDraftEventInput = z.infer<typeof editDraftEventServerSchema>;
export type EditPublishedEventInput = z.infer<
  typeof editPublishedEventServerSchema
>;
