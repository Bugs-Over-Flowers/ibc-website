import { z } from "zod";
import type { Enums } from "@/lib/supabase/db.types";
import { PaymentStatusEnum } from "../utils";

export const ParticipantSchema = z.object({
  participantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  contactNumber: z.string(),
  isPrincipal: z.boolean(),
});

export const ParticipantListItemSchema = ParticipantSchema.pick({
  participantId: true,
  firstName: true,
  lastName: true,
  email: true,
  contactNumber: true,
}).extend({
  affiliation: z.string(),
  paymentStatus: PaymentStatusEnum,
  registrationDate: z.string(),
  registrationId: z.string(),
});

export type ParticipantListItem = z.infer<typeof ParticipantListItemSchema>;

// Data from RPC

export const ParticipantListRPCSchema = z
  .object({
    participant_id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.email(),
    contact_number: z.string(),
    affiliation: z.string(),
    payment_status: z.string(),
    registration_date: z.string(),
    registration_id: z.string(),
  })
  .pipe(
    z.transform((val) =>
      ParticipantListItemSchema.parse({
        participantId: val.participant_id,
        firstName: val.first_name,
        lastName: val.last_name,
        email: val.email,
        contactNumber: val.contact_number,
        affiliation: val.affiliation,
        paymentStatus: val.payment_status as Enums<"PaymentStatus">,
        registrationDate: val.registration_date,
        registrationId: val.registration_id,
      }),
    ),
  );
