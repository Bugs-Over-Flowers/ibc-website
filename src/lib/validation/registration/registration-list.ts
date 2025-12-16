import { z } from "zod";
import { Constants, type Enums } from "@/lib/supabase/db.types";
import { ParticipantSchema } from "../participant/participant-list";
import { RegistrationIdentifier } from "../qr/standard";

//
// Registration List Table Schemas
//
const PaymentMethod = Constants.public.Enums.PaymentMethod;
const PaymentStatus = Constants.public.Enums.PaymentStatus;

const RegistrationListRegistrantSchema = ParticipantSchema.pick({
  email: true,
  firstName: true,
  lastName: true,
});

export const RegistrationDataBaseSchema = z.object({
  registrationId: z.uuid(),
  affiliation: z.string(),
  registrationDate: z.iso.datetime({ local: true }),
  paymentStatus: z.enum(PaymentStatus),
  paymentMethod: z.enum(PaymentMethod),
  registrant: RegistrationListRegistrantSchema,
  registrationIdentifer: RegistrationIdentifier,
  people: z.number().min(0),
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
    registration_id: z.uuid(),
    affiliation: z.string(),
    registration_date: z.iso.datetime({ local: true }),
    payment_status: z.string(),
    payment_method: z.string(),
    business_member_id: z.uuid().nullable(),
    business_name: z.string().nullable(),
    is_member: z.boolean(),
    registrant: RegistrationListRegistrantSchema,
    registration_identifier: RegistrationIdentifier,
    people: z.number().min(0),
  })
  .pipe(
    z.transform((val) =>
      RegistrationItemSchema.parse({
        registrationId: val.registration_id,
        affiliation: val.affiliation,
        registrationDate: val.registration_date,
        paymentStatus: val.payment_status as Enums<"PaymentStatus">,
        paymentMethod: val.payment_method as Enums<"PaymentMethod">,
        businessMemberId: val.business_member_id,
        businessName: val.business_name,
        isMember: val.is_member,
        registrant: val.registrant,
        registrationIdentifer: val.registration_identifier,
        people: val.people,
      }),
    ),
  );

export const RegistrationListStatsSchema = z.object({
  totalRegistrations: z.number().min(0),
  verifiedRegistrations: z.number().min(0),
  pendingRegistrations: z.number().min(0),
  totalParticipants: z.number().min(0),
});

export type RegistrationListStats = z.infer<typeof RegistrationListStatsSchema>;

export const RegistrationPageSchema = RegistrationDataBaseSchema.pick({
  registrationId: true,
  affiliation: true,
  registrationDate: true,
  paymentStatus: true,
  paymentMethod: true,
  paymentImagePath: true,
}).extend({
  isMember: z.boolean(),
  event: z.object({ eventId: z.uuid(), eventTitle: z.string() }),
  participants: z.array(ParticipantSchema),
});

export type RegistrationPage = z.infer<typeof RegistrationPageSchema>;
