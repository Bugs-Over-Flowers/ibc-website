import z from "zod";
import { PaymentStatusEnum } from "../utils";

const CheckInSchema = z.object({
  remarks: z.string().nullable(),
  checkInId: z.string(),
  eventDayId: z.string(),
  checkInTime: z.string(),
});

const ParticipantWithCheckInSchema = z.object({
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  participantId: z.string(),
  isPrincipal: z.boolean(),
  contactNumber: z.string(),
  checkIn: z.array(CheckInSchema).transform((arr) => {
    if (arr.length > 1) {
      throw new Error(
        "Multiple check-ins found for a single participant. Data integrity issue.",
      );
    }
    return arr.length > 0 ? arr[0] : null;
  }),
});

export const GetCheckInForDateSchema = z
  .object({
    registrationId: z.string(),
    nonMemberName: z.string().nullable(),
    registrationDate: z.string(),
    paymentMethod: z.enum(["BPI", "ONSITE"]),
    identifier: z.string(),
    paymentStatus: PaymentStatusEnum,
    businessMember: z
      .object({
        businessName: z.string(),
      })
      .nullable(),
    participants: z.array(ParticipantWithCheckInSchema),
  })
  .transform((data) => ({
    ...data,
    affiliation: data.businessMember?.businessName || data.nonMemberName,
    businessMember: undefined,
    nonMemberName: undefined,
  }));

export type GetCheckInForDateSchema = z.infer<typeof GetCheckInForDateSchema>;
