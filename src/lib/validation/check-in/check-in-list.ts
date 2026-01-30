import { z } from "zod";

export const CheckInListItemSchema = z.object({
  checkInId: z.uuid(),
  checkInTime: z.iso.datetime({ offset: true }),
  remarks: z.string().nullable(),
  eventDayId: z.uuid(),
  participantId: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  contactNumber: z.string(),
  registrationId: z.uuid(),
  affiliation: z.string(),
  identifier: z.string(),
});

export const CheckInListSchema = z.array(CheckInListItemSchema);

export type CheckInListItem = z.infer<typeof CheckInListItemSchema>;
