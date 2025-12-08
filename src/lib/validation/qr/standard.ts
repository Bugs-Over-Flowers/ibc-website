import z from "zod";
import { decryptRegistrationQR } from "@/server/attendance/actions/decryptRegistrationQR";
import { encryptRegistrationQR } from "@/server/attendance/actions/encryptRegistrationQR";

export const RegistrationCheckInQRCodeDecodedSchema = z.object({
  email: z.email(),
  registrationId: z.string(),
  eventId: z.string().min(1),
});

export type RegistrationCheckInQRCodeDecodedData = z.infer<
  typeof RegistrationCheckInQRCodeDecodedSchema
>;
export const RegistrationCheckInQRCodeEncodedSchema = z.object({
  encodedString: z.string(),
});

export type RegistrationCheckInQRCodeEncodedData = z.infer<
  typeof RegistrationCheckInQRCodeEncodedSchema
>;
export const RegistrationCheckInQRCodec = z.codec(
  RegistrationCheckInQRCodeEncodedSchema,
  RegistrationCheckInQRCodeDecodedSchema,
  {
    decode: async ({ encodedString }) => {
      const decoded = await decryptRegistrationQR(encodedString);
      return decoded;
    },
    encode: async (data) => {
      const encodedString = await encryptRegistrationQR(data);

      return encodedString;
    },
  },
);

export const DecodedRegistrationCheckInCodec = z.codec(
  RegistrationCheckInQRCodeDecodedSchema,
  z.string(),
  {
    decode: (obj) => {
      return `IBC-${obj.eventId}-|rid:${obj.registrationId}-|em:${obj.email}`;
    },
    encode: (ibcString) => {
      const [eventId, registrationId, email] = ibcString.split("-|");
      return {
        eventId: eventId.split("-")[1],
        email: email.split(":")[1],
        registrationId: registrationId.split(":")[1],
      };
    },
  },
);
