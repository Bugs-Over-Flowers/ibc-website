import * as jose from "jose";
import {
  RegistrationCheckInQRCodeDecodedSchema,
  RegistrationCheckInQRCodeEncodedSchema,
} from "@/lib/validation/qr/standard";
import { getDecodedQRSecret } from "../queries";
export const decryptRegistrationQR = async (encodedString: string) => {
  // validate the input data
  const parsedData = RegistrationCheckInQRCodeEncodedSchema.parse({
    encodedString,
  });

  // get key
  const decodedKey = getDecodedQRSecret();

  const { payload } = await jose.jwtDecrypt(
    parsedData.encodedString,
    decodedKey,
  );
  const parsedPayload = RegistrationCheckInQRCodeDecodedSchema.parse(payload);

  return parsedPayload;
};
