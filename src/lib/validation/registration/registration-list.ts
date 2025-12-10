import { z } from "zod";
import { Constants, type Enums } from "@/lib/supabase/db.types";

//
// Registration List Table Schemas
//
const PaymentMethod = Constants.public.Enums.PaymentMethod;
const PaymentStatus = Constants.public.Enums.PaymentStatus;

export const ParticipantSchema = z.object({
  participantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  isPrincipal: z.boolean(),
});

export const RegistrationDataBaseSchema = z.object({
  eventId: z.string(),
  registrationId: z.uuid(),
  affiliation: z.string(),
  registrationDate: z.string(),
  paymentStatus: z.enum(PaymentStatus),
  paymentMethod: z.enum(PaymentMethod),
  paymentImagePath: z.string().nullable(),
  principalParticipant: ParticipantSchema.extend({
    isPrincipal: z.literal(true),
  }),
});

export const RegistrationItemSchema = z.discriminatedUnion("isMember", [
  RegistrationDataBaseSchema.extend({
    businessMemberId: z.uuid().nullable(),
    businessName: z.string().nullable(),
    isMember: z.literal(true),
  }),
  RegistrationDataBaseSchema.extend({
    isMember: z.literal(false),
  }),
]);

export type RegistrationItem = z.infer<typeof RegistrationItemSchema>;

// Data from RPC
export const RegistrationListRPCSchema = z
  .object({
    event_id: z.string(),
    registration_id: z.uuid(),
    affiliation: z.string(),
    registration_date: z.string(),
    payment_status: z.string(),
    payment_method: z.string(),
    payment_image_path: z.string().nullable(),
    business_member_id: z.uuid().nullable(),
    business_name: z.string().nullable(),
    is_member: z.boolean(),
    principal_participant: ParticipantSchema.extend({
      isPrincipal: z.literal(true),
    }),
  })
  .pipe(
    z.transform((val) =>
      RegistrationItemSchema.parse({
        eventId: val.event_id,
        registrationId: val.registration_id,
        affiliation: val.affiliation,
        registrationDate: val.registration_date,
        paymentStatus: val.payment_status as Enums<"PaymentStatus">,
        paymentMethod: val.payment_method as Enums<"PaymentMethod">,
        paymentImagePath: val.payment_image_path,
        businessMemberId: val.business_member_id,
        businessName: val.business_name,
        isMember: val.is_member,
        principalParticipant: val.principal_participant,
      }),
    ),
  );

export const RegistrationListStatsSchema = z.object({
  total: z.number().min(0),
  verified: z.number().min(0),
  pending: z.number().min(0),
});

export const RegistrationPageSchema = RegistrationDataBaseSchema.pick({
  registrationId: true,
  affiliation: true,
  registrationDate: true,
  paymentStatus: true,
  paymentMethod: true,
  paymentImagePath: true,
}).extend({
  event: z.object({ eventId: z.uuid(), eventTitle: z.string() }),
  participants: z.array(ParticipantSchema),
});

export type RegistrationPage = z.infer<typeof RegistrationPageSchema>;
