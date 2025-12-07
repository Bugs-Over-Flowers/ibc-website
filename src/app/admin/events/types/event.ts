import { z } from "zod";

export const eventSchema = z.object({
  eventId: z.string(),
  eventTitle: z.string(),
  eventHeaderUrl: z.string().nullable(),
  description: z.string().nullable(),
  eventStartDate: z.string().nullable(),
  eventEndDate: z.string().nullable(),
  venue: z.string().nullable(),
  eventType: z.string().nullable(),
  registrationFee: z.number().nullable(),
  updatedAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
});

export type Event = z.infer<typeof eventSchema>;

export type EventWithStatus = Event & {
  computedStatus: "draft" | "published" | "finished";
};
