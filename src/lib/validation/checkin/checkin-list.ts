import z from "zod";

// Schemas for check in page
const RegistrationCheckInListRegistrationDetailsSchema = z.object({
  registrationId: z.string(),
  affiliation: z.string(),
});

export const RegistrationCheckInEventDetails = z.object({
  venue: z.string(),
  eventId: z.string(),
  eventTitle: z.string(),
  eventStartDate: z.iso.date(),
  eventEndDate: z.iso.date(),
});

export const ParticipantCheckInItemSchema = z.object({
  email: z.email(),
  lastName: z.string(),
  checkedIn: z.boolean(),
  firstName: z.string(),
  isPrincipal: z.boolean(),
  contactNumber: z.string(),
  participantId: z.string(),
  registrationId: z.string(),
});

export type ParticipantCheckInItem = z.infer<
  typeof ParticipantCheckInItemSchema
>;

export const ParticipantCheckInEventDay = z.object({
  label: z.string(),
  eventId: z.string(),
  eventDate: z.iso.date(),
  eventDayId: z.string(),
});

export const RegistrationCheckInDataSchema = z.object({
  registrationDetails: RegistrationCheckInListRegistrationDetailsSchema,
  eventDetails: RegistrationCheckInEventDetails,
  checkInList: z.array(ParticipantCheckInItemSchema),
  eventDays: z.array(ParticipantCheckInEventDay),
  allIsCheckedIn: z.boolean(),
  isEventDay: z.boolean(),
});

export type RegistrationCheckInData = z.infer<
  typeof RegistrationCheckInDataSchema
>;

export const RegistrationCheckInListRPCSchema = z
  .object({
    registration_details: RegistrationCheckInListRegistrationDetailsSchema,
    event_details: RegistrationCheckInEventDetails,
    check_in_list: z.array(ParticipantCheckInItemSchema),
    event_days: z.array(ParticipantCheckInEventDay),
    all_is_checked_in: z.boolean(),
    is_event_day: z.boolean(),
  })
  .pipe(
    z.transform((val) =>
      RegistrationCheckInDataSchema.parse({
        registrationDetails: val.registration_details,
        eventDetails: val.event_details,
        checkInList: val.check_in_list,
        eventDays: val.event_days,
        allIsCheckedIn: val.all_is_checked_in,
        isEventDay: val.is_event_day,
      }),
    ),
  );

// Schemas for check in list

const CheckInStats = z.object({
  totalExpectedParticipants: z.number(),
});

const CheckInItemSchema = ParticipantCheckInItemSchema.pick({
  email: true,
  lastName: true,
  firstName: true,
  contactNumber: true,
  participantId: true,
  registrationId: true,
}).extend({
  checkInId: z.string(),
  checkedInAt: z.iso.datetime({ local: true }),
  eventDayId: z.string(),
  affiliation: z.string(),
});

export type CheckInItem = z.infer<typeof CheckInItemSchema>;

export const CheckInListEventDayDetailsSchema = ParticipantCheckInEventDay.pick(
  {
    label: true,
    eventDate: true,
    eventDayId: true,
  },
);

export type CheckInListEventDayDetails = z.infer<
  typeof CheckInListEventDayDetailsSchema
>;

export const CheckInListPageSchema = z.object({
  stats: CheckInStats,
  checkIns: CheckInItemSchema.array(),
  eventDays: CheckInListEventDayDetailsSchema.array(),
});
