import { z } from "zod";
import {
  eventDateRangeRefinement,
  eventDateRangeRefinementOptions,
  eventEndDateSchema,
  eventStartDateSchema,
  eventTitleSchema,
  facebookLinkClientSchema,
  facebookLinkServerSchema,
  venueSchema,
} from "./shared";

const draftEventClientSchema = z.object({
  eventTitle: eventTitleSchema,
  description: z.string(),
  eventStartDate: eventStartDateSchema,
  eventEndDate: eventEndDateSchema,
  venue: z.string(),
  registrationFee: z.number().optional(),
  eventImage: z.array(z.instanceof(File)).optional(),
  eventPoster: z.array(z.instanceof(File)).min(1, "Poster image is required"),
  eventType: z.literal(null),
  facebookLink: facebookLinkClientSchema,
});

const publishedEventClientSchema = z.object({
  eventTitle: eventTitleSchema,
  description: z.string().min(1, "Description is required"),
  eventStartDate: eventStartDateSchema.refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    { message: "Event start date must be today or in the future" },
  ),
  eventEndDate: eventEndDateSchema,
  venue: venueSchema,
  registrationFee: z.number().min(0, "Registration fee must be at least 0"),
  eventImage: z
    .array(z.instanceof(File))
    .min(1, "At least 1 image is required"),
  eventPoster: z.array(z.instanceof(File)).min(1, "Poster image is required"),
  facebookLink: facebookLinkClientSchema,
});

const publicEventClientSchema = publishedEventClientSchema.extend({
  eventType: z.literal("public"),
});

const privateEventClientSchema = publishedEventClientSchema.extend({
  eventType: z.literal("private"),
});

export const createEventSchema = z
  .discriminatedUnion("eventType", [
    draftEventClientSchema,
    publicEventClientSchema,
    privateEventClientSchema,
  ])
  .refine(eventDateRangeRefinement, eventDateRangeRefinementOptions);

export const draftEventServerSchema = z
  .object({
    eventTitle: eventTitleSchema,
    description: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z.string().optional(),
    ),
    eventStartDate: eventStartDateSchema,
    eventEndDate: eventEndDateSchema.optional(),
    venue: z.preprocess(
      (val) => (val === "" ? undefined : val),
      venueSchema.optional(),
    ),
    registrationFee: z.number().optional(),
    eventImage: z.string().url().optional().nullable(),
    eventPoster: z.string().url({ message: "Poster image is required" }),
    eventType: z.literal(null),
    facebookLink: facebookLinkServerSchema,
  })
  .refine(eventDateRangeRefinement, eventDateRangeRefinementOptions);

export const publishEventServerSchema = z
  .object({
    eventTitle: eventTitleSchema,
    description: z.string().min(1, "Description is required"),
    eventStartDate: eventStartDateSchema,
    eventEndDate: eventEndDateSchema,
    venue: venueSchema,
    registrationFee: z.number().min(0, "Registration fee must be at least 0"),
    eventImage: z.string().url(),
    eventPoster: z.string().url({ message: "Poster image is required" }),
    eventType: z.enum(["public", "private"]),
    facebookLink: facebookLinkServerSchema,
  })
  .refine(eventDateRangeRefinement, eventDateRangeRefinementOptions);

export type DraftEventInput = z.input<typeof draftEventServerSchema>;
export type PublishEventInput = z.input<typeof publishEventServerSchema>;
