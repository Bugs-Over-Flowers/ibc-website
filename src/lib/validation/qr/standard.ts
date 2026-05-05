import z from "zod";
import { PaymentProofStatusEnum } from "../utils";

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

const RawCheckInForDateSchema = z.object({
  event: z.object({
    eventId: z.string(),
  }),
  registrationId: z.string(),
  nonMemberName: z.string().nullable(),
  registrationDate: z.string(),
  paymentMethod: z.enum(["BPI", "ONSITE"]),
  identifier: z.string(),
  paymentProofStatus: PaymentProofStatusEnum,
  businessMember: z
    .object({
      businessName: z.string(),
    })
    .nullable(),
  participants: z.array(
    z.object({
      email: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      participantId: z.string(),
      isPrincipal: z.boolean(),
      contactNumber: z.string(),
      checkIn: z.array(CheckInSchema),
    }),
  ),
  proofImage: z.array(
    z.object({
      path: z.string(),
      proofImageId: z.string(),
      orderIndex: z.number().optional(),
    }),
  ),
});

const ProofImageSchema = z.object({
  path: z.string(),
  proofImageId: z.string(),
  orderIndex: z.number().optional(),
});

export const normalizeCheckInForEventDay = (
  rawData: unknown,
  eventDayId: string,
) => {
  const parsed = RawCheckInForDateSchema.parse(rawData);

  return {
    ...parsed,
    paymentProofStatus: parsed.paymentProofStatus,
    participants: parsed.participants.map((participant) => ({
      ...participant,
      checkIn: participant.checkIn.filter(
        (item) => item.eventDayId === eventDayId,
      ),
    })),
    proofImage: parsed.proofImage,
  };
};

export const GetCheckInForDateSchema = z
  .object({
    event: z.object({
      eventId: z.string(),
    }),
    registrationId: z.string(),
    nonMemberName: z.string().nullable(),
    registrationDate: z.string(),
    paymentMethod: z.enum(["BPI", "ONSITE"]),
    identifier: z.string(),
    paymentProofStatus: PaymentProofStatusEnum,
    businessMember: z
      .object({
        businessName: z.string(),
      })
      .nullable(),
    participants: z.array(ParticipantWithCheckInSchema),
    proofImage: z.array(ProofImageSchema),
  })
  .transform((data) => ({
    ...data,
    affiliation: data.businessMember?.businessName || data.nonMemberName,
    businessMember: undefined,
    nonMemberName: undefined,
  }));

export type GetCheckInForDateSchema = z.infer<typeof GetCheckInForDateSchema>;

export const GetParticipantCheckInForDateSchema = z
  .object({
    participant: z.object({
      participantId: z.string(),
      participantIdentifier: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      contactNumber: z.string(),
      isPrincipal: z.boolean(),
    }),
    registration: z.object({
      registrationId: z.string(),
      identifier: z.string(),
      paymentMethod: z.enum(["BPI", "ONSITE"]),
      paymentProofStatus: PaymentProofStatusEnum,
      registrationDate: z.string(),
      note: z.string().nullable(),
      businessMember: z
        .object({
          businessName: z.string(),
        })
        .nullable(),
      nonMemberName: z.string().nullable(),
    }),
    event: z.object({
      eventId: z.string(),
      eventTitle: z.string().optional(),
    }),
    checkIn: z
      .array(
        z.object({
          checkInId: z.string(),
          checkInTime: z.string(),
          eventDayId: z.string(),
          remarks: z.string().nullable(),
        }),
      )
      .default([]),
    proofImages: z.array(ProofImageSchema).default([]),
  })
  .transform((data) => ({
    ...data,
    affiliation:
      data.registration.businessMember?.businessName ||
      data.registration.nonMemberName,
  }));

export type GetParticipantCheckInForDateSchema = z.infer<
  typeof GetParticipantCheckInForDateSchema
>;
